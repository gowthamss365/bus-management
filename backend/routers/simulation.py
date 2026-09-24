from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import asyncio
import random
from datetime import datetime

import models
from database import get_db, engine, SessionLocal

router = APIRouter(prefix="/api/simulation", tags=["simulation"])

simulation_running = False

async def simulation_loop():
    global simulation_running
    while simulation_running:
        async with SessionLocal() as db:
            result = await db.execute(select(models.Bus).where(models.Bus.status == models.BusStatusEnum.ON_ROUTE))
            buses = result.scalars().all()
            
            for bus in buses:
                # Update GPS location slightly
                bus.latitude += random.uniform(-0.001, 0.001)
                bus.longitude += random.uniform(-0.001, 0.001)
                
                # Update occupancy simulation occasionally
                if random.random() < 0.2:
                    change = random.randint(-3, 3)
                    trip_result = await db.execute(select(models.Trip).where(models.Trip.bus_id == bus.id, models.Trip.status == models.TripStatusEnum.ACTIVE))
                    trip = trip_result.scalars().first()
                    if trip:
                        trip.passenger_count = max(0, min(60, trip.passenger_count + change))
                        # Record occupancy change
                        occ_pct = trip.passenger_count / 60.0
                        crowd = models.CrowdLevelEnum.LOW
                        if occ_pct > 0.9:
                            crowd = models.CrowdLevelEnum.CRITICAL
                        elif occ_pct > 0.75:
                            crowd = models.CrowdLevelEnum.HIGH
                        elif occ_pct > 0.5:
                            crowd = models.CrowdLevelEnum.MEDIUM
                            
                        occ = models.OccupancyRecord(
                            bus_id=bus.id,
                            trip_id=trip.id,
                            passenger_count=trip.passenger_count,
                            capacity=60,
                            occupancy_percentage=occ_pct * 100,
                            crowd_level=crowd,
                            source=models.SourceEnum.SIMULATION
                        )
                        db.add(occ)
            
            await db.commit()
        await asyncio.sleep(5)  # Update every 5 seconds

@router.post("/start")
async def start_simulation(background_tasks: BackgroundTasks):
    global simulation_running
    if not simulation_running:
        simulation_running = True
        background_tasks.add_task(simulation_loop)
        return {"message": "Simulation started"}
    return {"message": "Simulation is already running"}

@router.post("/stop")
async def stop_simulation():
    global simulation_running
    simulation_running = False
    return {"message": "Simulation stopped"}
