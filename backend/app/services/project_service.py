"""
Project service for business logic related to project operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from typing import List
from app.models.project import Project, ProjectMember
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectMemberCreate


class ProjectService:
    """Service class for project operations."""
    
    @staticmethod
    async def create_project(project_data: ProjectCreate, creator_id: int, db: AsyncSession) -> Project:
        """
        Create a new project.
        
        Args:
            project_data: Project creation data
            creator_id: ID of the user creating the project
            db: Database session
            
        Returns:
            Project: The created project
        """
        new_project = Project(
            title=project_data.title,
            description=project_data.description,
            created_by=creator_id
        )
        
        db.add(new_project)
        await db.flush()
        await db.refresh(new_project)
        
        # Add creator as a project member
        member = ProjectMember(project_id=new_project.id, user_id=creator_id)
        db.add(member)
        
        return new_project
    
    @staticmethod
    async def get_all_projects(db: AsyncSession, user_id: int | None = None) -> List[Project]:
        """
        Get all projects. If user_id provided, only return projects where user is a member.
        
        Args:
            db: Database session
            user_id: Optional user ID to filter by membership
            
        Returns:
            List[Project]: List of projects
        """
        if user_id:
            # Get projects where user is a member
            result = await db.execute(
                select(Project)
                .join(
                    ProjectMember,
                    ProjectMember.project_id == Project.id,
                )
                .where(ProjectMember.user_id == user_id)
                .distinct()
            )
        else:
            # Get all projects (admin only)
            result = await db.execute(select(Project))
        
        return result.scalars().all()
    
    @staticmethod
    async def get_project_by_id(project_id: int, db: AsyncSession) -> Project | None:
        """
        Get project by ID.
        
        Args:
            project_id: Project ID
            db: Database session
            
        Returns:
            Project: The project if found, None otherwise
        """
        result = await db.execute(select(Project).where(Project.id == project_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def add_project_member(project_id: int, member_data: ProjectMemberCreate, db: AsyncSession) -> ProjectMember:
        """
        Add a member to a project.
        
        Args:
            project_id: Project ID
            member_data: Member creation data
            db: Database session
            
        Returns:
            ProjectMember: The created project member
            
        Raises:
            HTTPException: If project doesn't exist or user already a member
        """
        # Check if project exists
        project = await ProjectService.get_project_by_id(project_id, db)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Check if user is already a member
        result = await db.execute(
            select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == member_data.user_id
            )
        )
        existing_member = result.scalar_one_or_none()
        
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this project"
            )
        
        # Add member
        new_member = ProjectMember(project_id=project_id, user_id=member_data.user_id)
        db.add(new_member)
        await db.flush()
        await db.refresh(new_member)
        
        return new_member
    
    @staticmethod
    async def get_project_members(project_id: int, db: AsyncSession) -> List[int]:
        """
        Get all member IDs for a project.
        
        Args:
            project_id: Project ID
            db: Database session
            
        Returns:
            List[int]: List of user IDs
        """
        result = await db.execute(
            select(ProjectMember.user_id).where(ProjectMember.project_id == project_id)
        )
        return [row[0] for row in result.all()]
