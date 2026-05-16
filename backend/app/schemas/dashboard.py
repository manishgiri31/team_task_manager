"""
Pydantic schemas for Dashboard responses.
"""
from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Schema for dashboard statistics."""
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
