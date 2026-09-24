from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/manager", tags=["manager"])

@router.get("/analytics", response_model=schemas.DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    total_fleet = await db.scalar(select(func.count()).select_from(models.Bus))
    active_buses = await db.scalar(select(func.count()).select_from(models.Bus).where(models.Bus.status == models.BusStatusEnum.ON_ROUTE))
    delayed_buses = await db.scalar(select(func.count()).select_from(models.Bus).where(models.Bus.status == models.BusStatusEnum.DELAYED))
    
    # Simplified average occupancy
    avg_occ = await db.scalar(select(func.avg(models.OccupancyRecord.occupancy_percentage)))
    
    # Sum passengers from active trips today
    passengers_today = await db.scalar(select(func.sum(models.Trip.passenger_count)))
    
    return schemas.DashboardStats(
        total_fleet=total_fleet or 0,
        active_buses=active_buses or 0,
        passengers_today=passengers_today or 0,
        average_occupancy=avg_occ or 0.0,
        delayed_buses=delayed_buses or 0,
        demand_spikes=3  # Mock for now
    )
