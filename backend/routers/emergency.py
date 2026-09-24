from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import models
import schemas
from database import get_db
from deps import get_current_active_user

router = APIRouter(prefix="/api/emergency", tags=["emergency"])

@router.post("/sos", response_model=schemas.EmergencyEventResponse)
async def activate_sos(event: schemas.EmergencyEventCreate, current_user: models.User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != models.RoleEnum.DRIVER:
        raise HTTPException(status_code=403, detail="Only drivers can activate SOS")
        
    result = await db.execute(select(models.Driver).where(models.Driver.user_id == current_user.id))
    driver = result.scalars().first()
    
    emergency = models.EmergencyEvent(
        bus_id=event.bus_id,
        driver_id=driver.id,
        latitude=event.latitude,
        longitude=event.longitude,
        passenger_count=event.passenger_count,
        route_id=event.route_id,
        emergency_type=event.emergency_type,
        message=event.message,
        status=models.EmergencyStatusEnum.ACTIVE
    )
    db.add(emergency)
    
    # Update bus status
    bus_result = await db.execute(select(models.Bus).where(models.Bus.id == event.bus_id))
    bus = bus_result.scalars().first()
    if bus:
        bus.status = models.BusStatusEnum.EMERGENCY
        
    await db.commit()
    await db.refresh(emergency)
    
    # In a real app, this would trigger WebSockets to Manager OCC
    return emergency
