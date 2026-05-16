"""
Pydantic schemas for Task model.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.task import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    """Base task schema."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    """Schema for task creation."""
    project_id: int
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    """Schema for task update."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: int
    status: TaskStatus
    project_id: int
    assigned_to: Optional[int]
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class TaskDetail(TaskResponse):
    """Schema for task detail with project info."""
    project_title: Optional[str] = None
    assigned_to_name: Optional[str] = None
    
    class Config:
        from_attributes = True
