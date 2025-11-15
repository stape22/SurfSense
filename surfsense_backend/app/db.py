from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from enum import Enum

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    ARRAY,
    JSON,
    TIMESTAMP,
    Boolean,
    Column,
    Enum as SQLAlchemyEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, relationship

from app.config import config
from app.retriver.chunks_hybrid_search import ChucksHybridSearchRetriever
from app.retriver.documents_hybrid_search import DocumentHybridSearchRetriever

if config.AUTH_TYPE == "GOOGLE":
    from fastapi_users.db import SQLAlchemyBaseOAuthAccountTableUUID

DATABASE_URL = config.DATABASE_URL


class DocumentType(str, Enum):
    EXTENSION = "EXTENSION"
    CRAWLED_URL = "CRAWLED_URL"
    FILE = "FILE"
    SLACK_CONNECTOR = "SLACK_CONNECTOR"
    NOTION_CONNECTOR = "NOTION_CONNECTOR"
    YOUTUBE_VIDEO = "YOUTUBE_VIDEO"
    GITHUB_CONNECTOR = "GITHUB_CONNECTOR"
    LINEAR_CONNECTOR = "LINEAR_CONNECTOR"
    DISCORD_CONNECTOR = "DISCORD_CONNECTOR"
    JIRA_CONNECTOR = "JIRA_CONNECTOR"
    CONFLUENCE_CONNECTOR = "CONFLUENCE_CONNECTOR"
    CLICKUP_CONNECTOR = "CLICKUP_CONNECTOR"
    GOOGLE_CALENDAR_CONNECTOR = "GOOGLE_CALENDAR_CONNECTOR"
    GOOGLE_GMAIL_CONNECTOR = "GOOGLE_GMAIL_CONNECTOR"
    AIRTABLE_CONNECTOR = "AIRTABLE_CONNECTOR"
    LUMA_CONNECTOR = "LUMA_CONNECTOR"
    ELASTICSEARCH_CONNECTOR = "ELASTICSEARCH_CONNECTOR"


class SearchSourceConnectorType(str, Enum):
    SERPER_API = "SERPER_API"  # NOT IMPLEMENTED YET : DON'T REMEMBER WHY : MOST PROBABLY BECAUSE WE NEED TO CRAWL THE RESULTS RETURNED BY IT
    TAVILY_API = "TAVILY_API"
    SEARXNG_API = "SEARXNG_API"
    LINKUP_API = "LINKUP_API"
    BAIDU_SEARCH_API = "BAIDU_SEARCH_API"  # Baidu AI Search API for Chinese web search
    SLACK_CONNECTOR = "SLACK_CONNECTOR"
    NOTION_CONNECTOR = "NOTION_CONNECTOR"
    GITHUB_CONNECTOR = "GITHUB_CONNECTOR"
    LINEAR_CONNECTOR = "LINEAR_CONNECTOR"
    DISCORD_CONNECTOR = "DISCORD_CONNECTOR"
    JIRA_CONNECTOR = "JIRA_CONNECTOR"
    CONFLUENCE_CONNECTOR = "CONFLUENCE_CONNECTOR"
    CLICKUP_CONNECTOR = "CLICKUP_CONNECTOR"
    GOOGLE_CALENDAR_CONNECTOR = "GOOGLE_CALENDAR_CONNECTOR"
    GOOGLE_GMAIL_CONNECTOR = "GOOGLE_GMAIL_CONNECTOR"
    AIRTABLE_CONNECTOR = "AIRTABLE_CONNECTOR"
    LUMA_CONNECTOR = "LUMA_CONNECTOR"
    ELASTICSEARCH_CONNECTOR = "ELASTICSEARCH_CONNECTOR"


class ChatType(str, Enum):
    QNA = "QNA"


class LiteLLMProvider(str, Enum):
    """
    Enum for LLM providers supported by LiteLLM.
    """

    OPENAI = "OPENAI"
    ANTHROPIC = "ANTHROPIC"
    GROQ = "GROQ"
    COHERE = "COHERE"
    HUGGINGFACE = "HUGGINGFACE"
    AZURE_OPENAI = "AZURE_OPENAI"
    GOOGLE = "GOOGLE"
    AWS_BEDROCK = "AWS_BEDROCK"
    OLLAMA = "OLLAMA"
    MISTRAL = "MISTRAL"
    TOGETHER_AI = "TOGETHER_AI"
    OPENROUTER = "OPENROUTER"
    REPLICATE = "REPLICATE"
    PALM = "PALM"
    VERTEX_AI = "VERTEX_AI"
    ANYSCALE = "ANYSCALE"
    PERPLEXITY = "PERPLEXITY"
    DEEPINFRA = "DEEPINFRA"
    AI21 = "AI21"
    NLPCLOUD = "NLPCLOUD"
    ALEPH_ALPHA = "ALEPH_ALPHA"
    PETALS = "PETALS"
    COMETAPI = "COMETAPI"
    # Chinese LLM Providers (OpenAI-compatible)
    DEEPSEEK = "DEEPSEEK"
    ALIBABA_QWEN = "ALIBABA_QWEN"
    MOONSHOT = "MOONSHOT"
    ZHIPU = "ZHIPU"
    CUSTOM = "CUSTOM"


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    @declared_attr
    def created_at(cls):  # noqa: N805
        return Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            default=lambda: datetime.now(UTC),
            index=True,
        )


class BaseModel(Base):
    __abstract__ = True
    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, index=True)


class Chat(BaseModel, TimestampMixin):
    __tablename__ = "chats"

    type = Column(SQLAlchemyEnum(ChatType), nullable=False)
    title = Column(String, nullable=False, index=True)
    initial_connectors = Column(ARRAY(String), nullable=True)
    messages = Column(JSON, nullable=False)

    search_space_id = Column(
        Integer, ForeignKey("searchspaces.id", ondelete="CASCADE"), nullable=False
    )
    search_space = relationship("SearchSpace", back_populates="chats")


class Document(BaseModel, TimestampMixin):
    __tablename__ = "documents"

    title = Column(String, nullable=False, index=True)
    document_type = Column(SQLAlchemyEnum(DocumentType), nullable=False)
    document_metadata = Column(JSON, nullable=True)

    content = Column(Text, nullable=False)
    content_hash = Column(String, nullable=False, index=True, unique=True)
    unique_identifier_hash = Column(String, nullable=True, index=True, unique=True)
    embedding = Column(Vector(config.embedding_model_instance.dimension))

    search_space_id = Column(
        Integer, ForeignKey("searchspaces.id", ondelete="CASCADE"), nullable=False
    )
    search_space = relationship("SearchSpace", back_populates="documents")
    chunks = relationship(
        "Chunk", back_populates="document", cascade="all, delete-orphan"
    )


class Chunk(BaseModel, TimestampMixin):
    __tablename__ = "chunks"

    content = Column(Text, nullable=False)
    embedding = Column(Vector(config.embedding_model_instance.dimension))

    document_id = Column(
        Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    document = relationship("Document", back_populates="chunks")


class Podcast(BaseModel, TimestampMixin):
    __tablename__ = "podcasts"

    title = Column(String, nullable=False, index=True)
    podcast_transcript = Column(JSON, nullable=False, default={})
    file_location = Column(String(500), nullable=False, default="")

    search_space_id = Column(
        Integer, ForeignKey("searchspaces.id", ondelete="CASCADE"), nullable=False
    )
    search_space = relationship("SearchSpace", back_populates="podcasts")


class SearchSpace(BaseModel, TimestampMixin):
    __tablename__ = "searchspaces"

    name = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)

    user_id = Column(
        UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    user = relationship("User", back_populates="search_spaces")

    documents = relationship(
        "Document",
        back_populates="search_space",
        order_by="Document.id",
        cascade="all, delete-orphan",
    )
    podcasts = relationship(
        "Podcast",
        back_populates="search_space",
        order_by="Podcast.id",
        cascade="all, delete-orphan",
    )
    chats = relationship(
        "Chat",
        back_populates="search_space",
        order_by="Chat.id",
        cascade="all, delete-orphan",
    )
    logs = relationship(
        "Log",
        back_populates="search_space",
        order_by="Log.id",
        cascade="all, delete-orphan",
    )
    search_source_connectors = relationship(
        "SearchSourceConnector",
        back_populates="search_space",
        order_by="SearchSourceConnector.id",
        cascade="all, delete-orphan",
    )
    llm_configs = relationship(
        "LLMConfig",
        back_populates="search_space",
        order_by="LLMConfig.id",
        cascade="all, delete-orphan",
    )
    user_preferences = relationship(
        "UserSearchSpacePreference",
        back_populates="search_space",
        cascade="all, delete-orphan",
    )


class SearchSourceConnector(BaseModel, TimestampMixin):
    __tablename__ = "search_source_connectors"
    __table_args__ = (
        UniqueConstraint(
            "search_space_id",
            "user_id",
            "connector_type",
            name="uq_searchspace_user_connector_type",
        ),
    )

    name = Column(String(100), nullable=False, index=True)
    connector_type = Column(SQLAlchemyEnum(SearchSourceConnectorType), nullable=False)
    is_indexable = Column(Boolean, nullable=False, default=False)
    last_indexed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    config = Column(JSON, nullable=False)

    # Periodic indexing fields
    periodic_indexing_enabled = Column(Boolean, nullable=False, default=False)
    indexing_frequency_minutes = Column(Integer, nullable=True)
    next_scheduled_at = Column(TIMESTAMP(timezone=True), nullable=True)

    search_space_id = Column(
        Integer, ForeignKey("searchspaces.id", ondelete="CASCADE"), nullable=False
    )
    search_space = relationship(
        "SearchSpace", back_populates="search_source_connectors"
    )

    user_id = Column(
        UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )


class LLMConfig(BaseModel, TimestampMixin):
    __tablename__ = "llm_configs"

    name = Column(String(100), nullable=False, index=True)
    # Provider from the enum
    provider = Column(SQLAlchemyEnum(LiteLLMProvider), nullable=False)
    # Custom provider name when provider is CUSTOM
    custom_provider = Column(String(100), nullable=True)
    # Just the model name without provider prefix
    model_name = Column(String(100), nullable=False)
    # API Key should be encrypted before storing
    api_key = Column(String, nullable=False)
    api_base = Column(String(500), nullable=True)

    language = Column(String(50), nullable=True, default="English")

    # For any other parameters that litellm supports
    litellm_params = Column(JSON, nullable=True, default={})

    search_space_id = Column(
        Integer, ForeignKey("searchspaces.id", ondelete="CASCADE"), nullable=False
    )
    search_space = relationship("SearchSpace", back_populates="llm_configs")


class UserSearchSpacePreference(BaseModel, TimestampMixin):
    __tablename__ = "user_search_space_preferences"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "search_space_id",
            name="uq_user_searchspace",
        ),
    )

    user_id = Column(
        UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    search_space_id = Column(
        Integer, ForeignKey("searchspaces.id", ondelete="CASCADE"), nullable=False
    )

    # User-specific LLM preferences for this search space
    long_context_llm_id = Column(
        Integer, ForeignKey("llm_configs.id", ondelete="SET NULL"), nullable=True
    )
    fast_llm_id = Column(
        Integer, ForeignKey("llm_configs.id", ondelete="SET NULL"), nullable=True
    )
    strategic_llm_id = Column(
        Integer, ForeignKey("llm_configs.id", ondelete="SET NULL"), nullable=True
    )

    # Future RBAC fields can be added here
    # role = Column(String(50), nullable=True)  # e.g., 'owner', 'editor', 'viewer'
    # permissions = Column(JSON, nullable=True)

    user = relationship("User", back_populates="search_space_preferences")
    search_space = relationship("SearchSpace", back_populates="user_preferences")

    long_context_llm = relationship(
        "LLMConfig", foreign_keys=[long_context_llm_id], post_update=True
    )
    fast_llm = relationship("LLMConfig", foreign_keys=[fast_llm_id], post_update=True)
    strategic_llm = relationship(
        "LLMConfig", foreign_keys=[strategic_llm_id], post_update=True
    )


class Log(BaseModel, TimestampMixin):
    __tablename__ = "logs"

    level = Column(SQLAlchemyEnum(LogLevel), nullable=False, index=True)
    status = Column(SQLAlchemyEnum(LogStatus), nullable=False, index=True)
    message = Column(Text, nullable=False)
    source = Column(
        String(200), nullable=True, index=True
    )  # Service/component that generated the log
    log_metadata = Column(JSON, nullable=True, default={})  # Additional context data

    search_space_id = Column(
        Integer, ForeignKey("searchspaces.id", ondelete="CASCADE"), nullable=False
    )
    search_space = relationship("SearchSpace", back_populates="logs")


if config.AUTH_TYPE == "GOOGLE":

    class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
        pass

    class User(SQLAlchemyBaseUserTableUUID, Base):
        oauth_accounts: Mapped[list[OAuthAccount]] = relationship(
            "OAuthAccount", lazy="joined"
        )
        search_spaces = relationship("SearchSpace", back_populates="user")
        search_space_preferences = relationship(
            "UserSearchSpacePreference",
            back_populates="user",
            cascade="all, delete-orphan",
        )

        # Page usage tracking for ETL services
        pages_limit = Column(Integer, nullable=False, default=500, server_default="500")
        pages_used = Column(Integer, nullable=False, default=0, server_default="0")

else:

    class User(SQLAlchemyBaseUserTableUUID, Base):
        search_spaces = relationship("SearchSpace", back_populates="user")
        search_space_preferences = relationship(
            "UserSearchSpacePreference",
            back_populates="user",
            cascade="all, delete-orphan",
        )

        # Page usage tracking for ETL services
        pages_limit = Column(Integer, nullable=False, default=500, server_default="500")
        pages_used = Column(Integer, nullable=False, default=0, server_default="0")


engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def setup_indexes():
    async with engine.begin() as conn:
        # Create indexes
        # Document Summary Indexes
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS document_vector_index ON documents USING hnsw (embedding public.vector_cosine_ops)"
            )
        )
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS document_search_index ON documents USING gin (to_tsvector('english', content))"
            )
        )
        # Document Chuck Indexes
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS chucks_vector_index ON chunks USING hnsw (embedding public.vector_cosine_ops)"
            )
        )
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS chucks_search_index ON chunks USING gin (to_tsvector('english', content))"
            )
        )


async def create_db_and_tables():
    """Create database tables and extensions. Handles connection errors gracefully."""
    import logging
    logger = logging.getLogger(__name__)
    
    # Log database connection info (mask password)
    db_url_display = DATABASE_URL
    if "@" in db_url_display:
        parts = db_url_display.split("@")
        if ":" in parts[0]:
            user_pass = parts[0].split("://")[1] if "://" in parts[0] else parts[0]
            if ":" in user_pass:
                user, _ = user_pass.split(":", 1)
                db_url_display = db_url_display.replace(f":{user_pass.split(':')[1]}", ":****")
    
    logger.info(f"Connecting to database: {db_url_display}")
    
    try:
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(Base.metadata.create_all)
        await setup_indexes()
        logger.info("Database tables and extensions created successfully")
    except OSError as e:
        # Extract port from error or DATABASE_URL
        port = "unknown"
        if "5433" in str(e) or "5432" in str(e):
            port = "5433" if "5433" in str(e) else "5432"
        elif "@" in DATABASE_URL:
            try:
                host_part = DATABASE_URL.split("@")[1].split("/")[0]
                if ":" in host_part:
                    port = host_part.split(":")[1]
            except:
                pass
        
        error_msg = (
            f"Failed to connect to PostgreSQL on port {port}.\n"
            f"Error: {e}\n\n"
            f"Troubleshooting steps:\n"
            f"1. Check if PostgreSQL is running: netstat -an | findstr \":{port}\"\n"
            f"2. Verify DATABASE_URL in .env file points to correct port\n"
            f"3. Start PostgreSQL if not running:\n"
            f"   - Docker: docker compose up -d postgres\n"
            f"   - Windows Service: net start postgresql-x64-16\n"
            f"4. Default PostgreSQL port is 5432, but your config shows port {port}\n"
            f"5. Check DATABASE_URL format: postgresql+asyncpg://user:password@host:port/database"
        )
        logger.error(error_msg)
        raise ConnectionError(error_msg) from e
    except Exception as e:
        error_msg = (
            f"Database initialization failed: {e}\n"
            f"DATABASE_URL configured: {bool(DATABASE_URL)}\n"
            f"Check your DATABASE_URL environment variable."
        )
        logger.error(error_msg, exc_info=True)
        raise


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


if config.AUTH_TYPE == "GOOGLE":

    async def get_user_db(session: AsyncSession = Depends(get_async_session)):
        yield SQLAlchemyUserDatabase(session, User, OAuthAccount)

else:

    async def get_user_db(session: AsyncSession = Depends(get_async_session)):
        yield SQLAlchemyUserDatabase(session, User)


async def get_chucks_hybrid_search_retriever(
    session: AsyncSession = Depends(get_async_session),
):
    return ChucksHybridSearchRetriever(session)


async def get_documents_hybrid_search_retriever(
    session: AsyncSession = Depends(get_async_session),
):
    return DocumentHybridSearchRetriever(session)
