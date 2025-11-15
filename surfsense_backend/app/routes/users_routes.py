"""
Custom user routes for account verification and debugging.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import User, get_async_session
from app.users import current_active_user, get_user_manager
from fastapi_users import BaseUserManager
from fastapi_users.db import SQLAlchemyUserDatabase

logger = logging.getLogger(__name__)

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.get("/users/check-email")
async def check_email_exists(
    email: str = Query(..., description="Email address to check"),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(current_active_user),
):
    """
    Check if an email address is already registered.
    Only accessible to authenticated users for debugging purposes.
    """
    try:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        logger.info(f"Email check requested by user {current_user.id} for email: {email}")

        return {
            "email": email,
            "exists": user is not None,
            "is_active": user.is_active if user else None,
            "is_verified": user.is_verified if user else None,
        }
    except Exception as e:
        logger.error(f"Error checking email existence: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check email: {str(e)}",
        ) from e


@router.post("/auth/forgot-password-debug")
async def forgot_password_debug(
    request_data: ForgotPasswordRequest,
    request: Request,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Debug endpoint for forgot password that always shows the token.
    This wraps the fastapi-users forgot_password functionality.
    """
    try:
        # Find user by email
        result = await session.execute(
            select(User).where(User.email == request_data.email)
        )
        user = result.scalar_one_or_none()

        if not user:
            logger.warning(f"Password reset requested for non-existent email: {request_data.email}")
            print("=" * 80)
            print(f"⚠️  Password reset requested for email: {request_data.email}")
            print("   Email not found in database (returning 202 for security)")
            print("=" * 80)
            # Return 202 Accepted even if user doesn't exist (security best practice)
            return {"status": "accepted"}

        # Get user manager and call forgot_password
        async for user_manager in get_user_manager(SQLAlchemyUserDatabase(session, User)):
            token = await user_manager.forgot_password(user, request)
            
            logger.info(f"Password reset token generated for user {user.id} ({user.email})")
            print("=" * 80)
            print(f"🔑 PASSWORD RESET TOKEN for user {user.email}:")
            print(f"   {token}")
            print("=" * 80)
            
            return {"status": "accepted", "token": token}  # Include token for debugging
    except Exception as e:
        logger.error(f"Error in forgot_password_debug: {e}", exc_info=True)
        print(f"ERROR in forgot_password_debug: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process password reset: {str(e)}",
        ) from e

