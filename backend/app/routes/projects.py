"""
Project routes with role-based access control.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectDetail,
    ProjectMemberCreate,
    ProjectMemberResponse,
)
from app.services.project_service import ProjectService
from app.dependencies.auth import get_current_user, get_current_admin
from app.dependencies.project import get_project_member_or_admin
from app.models.user import User
from app.models.project import Project, ProjectMember

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new project (Admin only).

    - title: Project title
    - description: Optional project description
    """

    new_project = await ProjectService.create_project(
        project_data,
        current_user.id,
        db
    )

    response = ProjectResponse.model_validate(new_project)

    response.members_count = 1
    response.tasks_count = 0

    return response


@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all projects.

    - Admins can see all projects
    - Members can only see projects they are members of
    """

    query = (
        select(Project)
        .options(
            selectinload(Project.tasks),
            selectinload(Project.members)
        )
    )

    if current_user.role.value != "admin":
        query = (
            query.join(
                ProjectMember,
                ProjectMember.project_id == Project.id,
            )
            .where(ProjectMember.user_id == current_user.id)
            .distinct()
        )

    result = await db.execute(query)

    projects = result.scalars().unique().all()

    response_list = []

    for project in projects:
        response = ProjectResponse.model_validate(project)

        # Counts from selectinload collections (async-safe; no lazy IO)
        response.members_count = len(project.members)
        response.tasks_count = len(project.tasks)

        response_list.append(response)

    return response_list


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(
    project: Project = Depends(get_project_member_or_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get project details by ID.

    - Admins can access any project
    - Members can only access projects they belong to
    """

    member_ids = await ProjectService.get_project_members(
        project.id,
        db
    )

    response = ProjectDetail.model_validate(project)

    response.members = member_ids
    response.members_count = len(member_ids)
    response.tasks_count = len(project.tasks)

    return response


@router.post(
    "/{project_id}/members",
    response_model=ProjectMemberResponse,
    status_code=status.HTTP_201_CREATED
)
async def add_project_member(
    project_id: int,
    member_data: ProjectMemberCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a member to a project (Admin only).

    - user_id: ID of the user to add
    """

    new_member = await ProjectService.add_project_member(
        project_id,
        member_data,
        db
    )

    return ProjectMemberResponse.model_validate(new_member)