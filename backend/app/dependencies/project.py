"""
Project access control dependencies.
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectMember
from app.dependencies.auth import get_current_user


async def get_project_member_or_admin(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Project:
    """
    Dependency to check if user is a project member or admin.
    """

    # Admins can access any project
    if current_user.role.value == "admin":

        result = await db.execute(
            select(Project)
            .options(
                selectinload(Project.tasks),
                selectinload(Project.members),
            )
            .where(Project.id == project_id)
        )

        project = result.scalar_one_or_none()

        if project is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        return project

    # Check if user is a project member
    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        )
    )

    membership = result.scalar_one_or_none()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project"
        )

    # Load project with eager-loaded relationships (no lazy IO in async route)
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.tasks),
            selectinload(Project.members),
        )
        .where(Project.id == project_id)
    )

    project = result.scalar_one_or_none()

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project