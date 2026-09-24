from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/routes", tags=["routes"])

@router.get("/", response_model=List[schemas.RouteResponse])
async def get_all_routes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Route))
    routes = result.scalars().all()
    return routes

@router.get("/{route_id}/stops", response_model=List[schemas.StopResponse])
async def get_route_stops(route_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Stop).where(models.Stop.route_id == route_id).order_by(models.Stop.stop_order))
    stops = result.scalars().all()
    return stops
