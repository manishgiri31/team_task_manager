"""
User service for business logic related to user operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.utils.auth import get_password_hash


class UserService:
    """Service class for user operations."""
    
    @staticmethod
    async def create_user(user_data: UserCreate, db: AsyncSession) -> User:
        """
        Create a new user.
        
        Args:
            user_data: User creation data
            db: Database session
            
        Returns:
            User: The created user
            
        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            role=UserRole.MEMBER  # Default role
        )
        
        db.add(new_user)
        await db.flush()
        await db.refresh(new_user)
        
        return new_user
    
    @staticmethod
    async def get_user_by_email(email: str, db: AsyncSession) -> User | None:
        """
        Get user by email.
        
        Args:
            email: User email
            db: Database session
            
        Returns:
            User: The user if found, None otherwise
        """
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_id(user_id: int, db: AsyncSession) -> User | None:
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            User: The user if found, None otherwise
        """
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_users_public_summary(
        db: AsyncSession,
        *,
        search: str | None = None,
        limit: int = 200,
    ) -> list[User]:
        """
        List users for admin UI (id, name, email only in response schema).

        Args:
            db: Database session
            search: Optional case-insensitive substring for name or email
            limit: Max rows (clamped 1–500)

        Returns:
            Users ordered by name ascending.
        """
        cap = max(1, min(limit, 500))
        stmt = select(User).order_by(User.name.asc()).limit(cap)
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    User.name.ilike(term),
                    User.email.ilike(term),
                )
            )
        result = await db.execute(stmt)
        return list(result.scalars().all())
