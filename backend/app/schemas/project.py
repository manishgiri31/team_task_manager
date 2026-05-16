"""
Pydantic schemas for Project and ProjectMember models.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class ProjectBase(BaseModel):
    """Base project schema."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Schema for project creation."""
    pass


class ProjectMemberCreate(BaseModel):
    """Schema for adding member to project."""
    user_id: int


class ProjectResponse(ProjectBase):
    """Schema for project response."""
    id: int
    created_by: int
    created_at: datetime
    members_count: int = 0
    tasks_count: int = 0
    
    class Config:
        from_attributes = True


class ProjectDetail(ProjectResponse):
    """Schema for project detail with members."""
    members: List[int] = []
    
    class Config:
        from_attributes = True


class ProjectMemberResponse(BaseModel):
    """Schema for project member response."""
    id: int
    project_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
