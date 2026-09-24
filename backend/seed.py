import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import engine, Base, SessionLocal
from models import (
    User, Passenger, Driver, Bus, Route, Stop, Trip, UTCCard, 
    RoleEnum, BusStatusEnum, DriverStatusEnum, TripStatusEnum,
)
from auth import get_password_hash

from sqlalchemy import text

async def seed_db():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("TRUNCATE TABLE users, buses, drivers, routes, trips, stops, passengers, utc_cards CASCADE;"))
        except Exception as e:
            print("Truncate failed, maybe tables don't exist:", e)
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        hashed_pw = get_password_hash("password123")
        
        # 1. Users
        manager_user = User(name="Manager Admin", email="manager@transit.local", password_hash=hashed_pw, role=RoleEnum.MANAGER)
        driver_user = User(name="John Driver", email="driver@transit.local", password_hash=hashed_pw, role=RoleEnum.DRIVER)
        passenger_user = User(name="Jane Passenger", email="passenger@transit.local", password_hash=hashed_pw, role=RoleEnum.PASSENGER)
        
        db.add_all([manager_user, driver_user, passenger_user])
        await db.commit()
        
        # 2. Profiles (Driver, Passenger)
        driver_profile = Driver(user_id=driver_user.id, driver_code="DRV-001", license_number="DL-123456", status=DriverStatusEnum.ON_TRIP)
        passenger_profile = Passenger(user_id=passenger_user.id)
        
        db.add_all([driver_profile, passenger_profile])
        await db.commit()
        
        # 3. UTC Card
        utc_card = UTCCard(card_number="UTC-1000-2000", balance=500.0)
        db.add(utc_card)
        await db.commit()
        
        passenger_profile.utc_card_id = utc_card.id
        await db.commit()
        
        # 4. Routes & Stops
        route1 = Route(route_number="108", route_name="City Center to Airport", start_location="City Center", destination="Airport T3", distance_km=25.0, estimated_duration=60)
        db.add(route1)
        await db.commit()
        
        stop1 = Stop(route_id=route1.id, stop_name="City Center Hub", latitude=12.9716, longitude=77.5946, stop_order=1)
        stop2 = Stop(route_id=route1.id, stop_name="Airport T3", latitude=13.1989, longitude=77.7068, stop_order=2)
        db.add_all([stop1, stop2])
        await db.commit()
        
        # 5. Buses
        bus1 = Bus(bus_number="KA-01-F-1234", bus_type="Volvo AC", capacity=60, status=BusStatusEnum.ON_ROUTE, current_route_id=route1.id, current_driver_id=driver_profile.id, latitude=12.9716, longitude=77.5946, speed=45.0, direction=90.0, next_stop_id=stop2.id)
        bus2 = Bus(bus_number="KA-01-F-5678", bus_type="Non-AC", capacity=50, status=BusStatusEnum.IDLE)
        db.add_all([bus1, bus2])
        await db.commit()
        
        driver_profile.assigned_bus_id = bus1.id
        await db.commit()
        
        # 6. Active Trip
        active_trip = Trip(
            bus_id=bus1.id,
            driver_id=driver_profile.id,
            route_id=route1.id,
            start_time=datetime.utcnow(),
            status=TripStatusEnum.ACTIVE,
            passenger_count=15
        )
        db.add(active_trip)
        await db.commit()
        
        print("Database seeded successfully with all relationships!")

if __name__ == "__main__":
    asyncio.run(seed_db())
