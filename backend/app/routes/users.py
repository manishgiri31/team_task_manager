"""
User directory routes (admin-only).
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_admin
from app.models.user import User
from app.schemas.user import UserPublicSummary
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("", response_model=list[UserPublicSummary])
async def list_users(
    q: str | None = Query(
        None,
        max_length=100,
        description="Optional search on name or email (case-insensitive substring)",
    ),
    limit: int = Query(
        200,
        ge=1,
        le=500,
        description="Maximum number of users to return",
    ),
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    List users visible to admins (id, name, email only).

    Supports optional search and a capped result size.
    """
    users = await UserService.list_users_public_summary(db, search=q, limit=limit)
    return [UserPublicSummary.model_validate(u) for u in users]
