"""
Custom user routes for account verification and debugging.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import User, get_async_session
from app.users import current_active_user

logger = logging.getLogger(__name__)

router = APIRouter()


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

