from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import models
import schemas
from database import get_db
from deps import get_current_active_user
from datetime import datetime

router = APIRouter(prefix="/api/utc", tags=["utc"])

@router.get("/card", response_model=schemas.UTCCardResponse)
async def get_utc_card(current_user: models.User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != models.RoleEnum.PASSENGER:
        raise HTTPException(status_code=403, detail="Only passengers have UTC cards")
        
    result = await db.execute(select(models.Passenger).where(models.Passenger.user_id == current_user.id))
    passenger = result.scalars().first()
    
    if not passenger or not passenger.utc_card_id:
        raise HTTPException(status_code=404, detail="UTC Card not found")
        
    result = await db.execute(select(models.UTCCard).where(models.UTCCard.id == passenger.utc_card_id))
    card = result.scalars().first()
    return card

@router.post("/recharge")
async def recharge_utc(request: schemas.UTCRechargeRequest, current_user: models.User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    # Simulating recharge
    result = await db.execute(select(models.Passenger).where(models.Passenger.user_id == current_user.id))
    passenger = result.scalars().first()
    
    result = await db.execute(select(models.UTCCard).where(models.UTCCard.id == passenger.utc_card_id))
    card = result.scalars().first()
    
    card.balance += request.amount
    
    transaction = models.UTCTransaction(
        card_id=card.id,
        transaction_type="RECHARGE",
        amount=request.amount,
        timestamp=datetime.utcnow()
    )
    db.add(transaction)
    await db.commit()
    return {"message": "Recharge successful", "new_balance": card.balance}
