"""
Task routes with role-based access control.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.task import TaskCreate, TaskResponse, TaskDetail, TaskUpdate
from app.services.task_service import TaskService
from app.dependencies.auth import get_current_user, get_current_admin
from app.models.user import User
from app.models.task import Task

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new task (Admin only).
    
    - **title**: Task title
    - **description**: Optional task description
    - **priority**: Task priority (low, medium, high)
    - **due_date**: Optional due date
    - **project_id**: ID of the project
    - **assigned_to**: Optional ID of user to assign task to
    
    Admin can create tasks and assign them to project members.
    """
    new_task = await TaskService.create_task(task_data, current_user.id, db)
    return TaskResponse.model_validate(new_task)


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all tasks.
    
    - Admins can see all tasks
    - Members can only see tasks assigned to them
    """
    if current_user.role.value == "admin":
        tasks = await TaskService.get_all_tasks(db)
    else:
        tasks = await TaskService.get_all_tasks(db, user_id=current_user.id)
    
    return [TaskResponse.model_validate(task) for task in tasks]


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a task.
    
    - Admins can update all fields of any task
    - Members can only update the status of tasks assigned to them
    """
    updated_task = await TaskService.update_task(
        task_id,
        task_data,
        current_user.id,
        current_user.role.value,
        db
    )
    return TaskResponse.model_validate(updated_task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a task (Admin only).
    
    Admin can delete any task.
    """
    await TaskService.delete_task(task_id, db)
