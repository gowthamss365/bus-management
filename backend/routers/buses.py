from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

import models
import schemas
from database import get_db
from deps import get_current_active_user

router = APIRouter(prefix="/api/buses", tags=["buses"])

@router.get("/live", response_model=List[schemas.BusResponse])
async def get_live_buses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Bus).where(models.Bus.status != models.BusStatusEnum.MAINTENANCE))
    buses = result.scalars().all()
    return buses

@router.get("/{bus_id}", response_model=schemas.BusResponse)
async def get_bus(bus_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Bus).where(models.Bus.id == bus_id))
    bus = result.scalars().first()
    return bus
