"""
Dashboard service for business logic related to dashboard statistics.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.models.task import Task, TaskStatus
from app.schemas.dashboard import DashboardStats


class DashboardService:
    """Service class for dashboard operations."""
    
    @staticmethod
    async def get_dashboard_stats(db: AsyncSession, user_id: int | None = None) -> DashboardStats:
        """
        Get dashboard statistics.
        
        Args:
            db: Database session
            user_id: Optional user ID to filter by assigned tasks
            
        Returns:
            DashboardStats: Dashboard statistics
        """
        query = select(Task)
        
        if user_id:
            query = query.where(Task.assigned_to == user_id)
        
        result = await db.execute(query)
        tasks = result.scalars().all()
        
        # Calculate statistics
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == TaskStatus.DONE])
        pending_tasks = len([t for t in tasks if t.status != TaskStatus.DONE])
        
        # Calculate overdue tasks (not done and due date passed)
        now = datetime.now(timezone.utc)
        overdue_tasks = 0
        for t in tasks:
            if t.status == TaskStatus.DONE or t.due_date is None:
                continue
            due = t.due_date
            if due.tzinfo is None:
                due = due.replace(tzinfo=timezone.utc)
            else:
                due = due.astimezone(timezone.utc)
            if due < now:
                overdue_tasks += 1
        
        return DashboardStats(
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            pending_tasks=pending_tasks,
            overdue_tasks=overdue_tasks
        )
