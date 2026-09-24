from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import models
import schemas
from database import get_db
from deps import get_current_active_user

router = APIRouter(prefix="/api/driver", tags=["driver"])

@router.get("/active-trip", response_model=schemas.TripResponse)
async def get_active_trip(current_user: models.User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != models.RoleEnum.DRIVER:
        raise HTTPException(status_code=403, detail="Only drivers can access active trips")
        
    result = await db.execute(select(models.Driver).where(models.Driver.user_id == current_user.id))
    driver = result.scalars().first()
    
    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")
        
    trip_result = await db.execute(
        select(models.Trip).where(
            (models.Trip.driver_id == driver.id) & 
            (models.Trip.status == models.TripStatusEnum.ACTIVE)
        )
    )
    trip = trip_result.scalars().first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="No active trip found")
        
    route_result = await db.execute(select(models.Route).where(models.Route.id == trip.route_id))
    route_obj = route_result.scalars().first()
    
    return {
        "id": trip.id,
        "bus_id": trip.bus_id,
        "driver_id": trip.driver_id,
        "route_id": trip.route_id,
        "start_time": trip.start_time,
        "end_time": trip.end_time,
        "status": trip.status,
        "passenger_count": trip.passenger_count,
        "created_at": trip.created_at,
        "driver_name": current_user.name,
        "route": route_obj.route_name if route_obj else str(trip.route_id)
    }
