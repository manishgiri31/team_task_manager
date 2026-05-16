"""
Task service for business logic related to task operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException, status
from typing import List
from app.models.task import Task, TaskStatus
from app.models.project import Project, ProjectMember
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    """Service class for task operations."""
    
    @staticmethod
    async def create_task(task_data: TaskCreate, creator_id: int, db: AsyncSession) -> Task:
        """
        Create a new task.
        
        Args:
            task_data: Task creation data
            creator_id: ID of the user creating the task
            db: Database session
            
        Returns:
            Task: The created task
            
        Raises:
            HTTPException: If project doesn't exist or assigned user not a member
        """
        # Check project exists (membership checks below still apply for assignee)
        result = await db.execute(select(Project.id).where(Project.id == task_data.project_id))
        if result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # If task is assigned, verify the user is a project member
        if task_data.assigned_to:
            result = await db.execute(
                select(ProjectMember).where(
                    and_(
                        ProjectMember.project_id == task_data.project_id,
                        ProjectMember.user_id == task_data.assigned_to
                    )
                )
            )
            is_member = result.scalar_one_or_none()
            
            if not is_member:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assigned user is not a member of this project"
                )
        
        # Create task
        new_task = Task(
            title=task_data.title,
            description=task_data.description,
            status=TaskStatus.TODO,
            priority=task_data.priority,
            due_date=task_data.due_date,
            project_id=task_data.project_id,
            assigned_to=task_data.assigned_to,
            created_by=creator_id
        )
        
        db.add(new_task)
        await db.flush()
        await db.refresh(new_task)
        
        return new_task
    
    @staticmethod
    async def get_all_tasks(db: AsyncSession, user_id: int | None = None, project_id: int | None = None) -> List[Task]:
        """
        Get all tasks. Can filter by user or project.
        
        Args:
            db: Database session
            user_id: Optional user ID to filter by assigned tasks
            project_id: Optional project ID to filter by project
            
        Returns:
            List[Task]: List of tasks
        """
        query = select(Task)
        
        if user_id:
            query = query.where(Task.assigned_to == user_id)
        
        if project_id:
            query = query.where(Task.project_id == project_id)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_task_by_id(task_id: int, db: AsyncSession) -> Task | None:
        """
        Get task by ID.
        
        Args:
            task_id: Task ID
            db: Database session
            
        Returns:
            Task: The task if found, None otherwise
        """
        result = await db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_task(task_id: int, task_data: TaskUpdate, user_id: int, user_role: str, db: AsyncSession) -> Task:
        """
        Update a task. Admins can update all fields, members can only update status.
        
        Args:
            task_id: Task ID
            task_data: Task update data
            user_id: ID of the user updating the task
            user_role: Role of the user (admin/member)
            db: Database session
            
        Returns:
            Task: The updated task
            
        Raises:
            HTTPException: If task not found or permission denied
        """
        task = await TaskService.get_task_by_id(task_id, db)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Members can only update status and only if assigned to them
        if user_role == "member":
            if task.assigned_to != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update tasks assigned to you"
                )
            
            # Members can only update status
            if task_data.status:
                task.status = task_data.status
        else:
            # Admins can update all fields
            update_data = task_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(task, field, value)
        
        await db.flush()
        await db.refresh(task)
        
        return task
    
    @staticmethod
    async def delete_task(task_id: int, db: AsyncSession) -> None:
        """
        Delete a task (admin only).
        
        Args:
            task_id: Task ID
            db: Database session
            
        Raises:
            HTTPException: If task not found
        """
        task = await TaskService.get_task_by_id(task_id, db)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        await db.delete(task)
