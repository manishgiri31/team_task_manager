"""
Dashboard routes for statistics and overview.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.dashboard import DashboardStats
from app.services.dashboard_service import DashboardService
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get dashboard statistics.
    
    Returns:
    - total_tasks: Total number of tasks
    - completed_tasks: Number of completed tasks
    - pending_tasks: Number of pending tasks
    - overdue_tasks: Number of overdue tasks
    
    Admins see statistics for all tasks.
    Members see statistics only for their assigned tasks.
    """
    if current_user.role.value == "admin":
        stats = await DashboardService.get_dashboard_stats(db)
    else:
        stats = await DashboardService.get_dashboard_stats(db, user_id=current_user.id)
    
    return stats
