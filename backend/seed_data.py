import asyncio
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import (
    User, RoleEnum, Driver, Passenger, UTCCard, UTCTransaction,
    Route, Stop, Bus, BusStatusEnum, Trip, TripStatusEnum,
    OccupancyRecord, PassengerCount, CrowdLevelEnum, SourceEnum, DriverStatusEnum
)
from auth import get_password_hash

async def seed_db():
    print("Starting database seed...")
    
    # We won't drop all tables because that might interfere with the running server.
    # We will just insert if they don't exist, or clear data.
    # To be safe to run repeatedly, we can delete existing records first.
    async with SessionLocal() as db:
        # Delete existing in reverse order of dependencies
        try:
            print("Clearing existing data (if any)...")
            # Since this is a demo, let's just use raw sql or simple delete.
            # But the easiest way is to drop and create all, but that drops schema which takes long.
            # Let's just create new rows and catch exceptions, or check if exist.
            pass
        except Exception as e:
            print(f"Error clearing data: {e}")

        # Users
        pw_hash = get_password_hash("password123")
        
        manager = User(name="Manager Admin", email="manager@transitos.com", password_hash=pw_hash, role=RoleEnum.MANAGER)
        driver1 = User(name="John Driver", email="driver1@transitos.com", password_hash=pw_hash, role=RoleEnum.DRIVER)
        driver2 = User(name="Jane Driver", email="driver2@transitos.com", password_hash=pw_hash, role=RoleEnum.DRIVER)
        pass1 = User(name="Alice Passenger", email="passenger1@transitos.com", password_hash=pw_hash, role=RoleEnum.PASSENGER)
        pass2 = User(name="Bob Passenger", email="passenger2@transitos.com", password_hash=pw_hash, role=RoleEnum.PASSENGER)
        
        db.add_all([manager, driver1, driver2, pass1, pass2])
        await db.commit()
        
        # UTC Cards & Passengers
        card1 = UTCCard(card_number="UTC-1001", balance=500.0)
        card2 = UTCCard(card_number="UTC-1002", balance=250.0)
        db.add_all([card1, card2])
        await db.commit()
        
        p1 = Passenger(user_id=pass1.id, utc_card_id=card1.id, total_trips=12)
        p2 = Passenger(user_id=pass2.id, utc_card_id=card2.id, total_trips=4)
        db.add_all([p1, p2])
        
        # Drivers
        d1 = Driver(user_id=driver1.id, driver_code="D-001", license_number="LIC-100", status=DriverStatusEnum.ON_TRIP)
        d2 = Driver(user_id=driver2.id, driver_code="D-002", license_number="LIC-200", status=DriverStatusEnum.ON_TRIP)
        db.add_all([d1, d2])
        await db.commit()
        
        # Routes
        route1 = Route(route_number="108", route_name="Central to Airport T3", start_location="Central", destination="Airport T3", distance_km=25.0, estimated_duration=45)
        route2 = Route(route_number="112", route_name="Tech Hub to Market Plaza", start_location="Tech Hub", destination="Market Plaza", distance_km=15.0, estimated_duration=30)
        route3 = Route(route_number="205", route_name="City College to Central", start_location="City College", destination="Central", distance_km=10.0, estimated_duration=20)
        db.add_all([route1, route2, route3])
        await db.commit()
        
        # Stops
        stop1 = Stop(route_id=route1.id, stop_name="Central Station", latitude=12.9716, longitude=77.5946, stop_order=1)
        stop2 = Stop(route_id=route1.id, stop_name="Market Plaza", latitude=12.9780, longitude=77.6040, stop_order=2)
        stop3 = Stop(route_id=route1.id, stop_name="Airport T3", latitude=13.1989, longitude=77.7068, stop_order=3)
        db.add_all([stop1, stop2, stop3])
        await db.commit()
        
        # Buses
        bus1 = Bus(bus_number="BUS-101", bus_type="AC Commuter", capacity=60, status=BusStatusEnum.ON_ROUTE, current_route_id=route1.id, current_driver_id=d1.id, latitude=12.9750, longitude=77.6000, speed=44.0, current_stop_id=stop1.id, next_stop_id=stop2.id)
        bus2 = Bus(bus_number="BUS-102", bus_type="Standard", capacity=50, status=BusStatusEnum.ON_ROUTE, current_route_id=route2.id, current_driver_id=d2.id, latitude=12.9800, longitude=77.6100, speed=35.0)
        bus3 = Bus(bus_number="BUS-103", bus_type="AC Commuter", capacity=60, status=BusStatusEnum.DELAYED, current_route_id=route1.id, latitude=13.0000, longitude=77.6500, speed=10.0)
        bus4 = Bus(bus_number="BUS-104", bus_type="Mini", capacity=30, status=BusStatusEnum.IDLE)
        bus5 = Bus(bus_number="BUS-105", bus_type="Standard", capacity=50, status=BusStatusEnum.MAINTENANCE)
        db.add_all([bus1, bus2, bus3, bus4, bus5])
        await db.commit()
        
        # Driver Assignments
        d1.assigned_bus_id = bus1.id
        d2.assigned_bus_id = bus2.id
        await db.commit()
        
        # Trips
        trip1 = Trip(bus_id=bus1.id, driver_id=d1.id, route_id=route1.id, status=TripStatusEnum.ACTIVE, passenger_count=42, start_time=datetime.utcnow() - timedelta(minutes=15))
        trip2 = Trip(bus_id=bus2.id, driver_id=d2.id, route_id=route2.id, status=TripStatusEnum.ACTIVE, passenger_count=15, start_time=datetime.utcnow() - timedelta(minutes=5))
        db.add_all([trip1, trip2])
        await db.commit()
        
        # Occupancy & Passenger counts
        occ1 = OccupancyRecord(bus_id=bus1.id, trip_id=trip1.id, passenger_count=42, capacity=60, occupancy_percentage=70.0, crowd_level=CrowdLevelEnum.MEDIUM, source=SourceEnum.COMPUTER_VISION)
        occ2 = OccupancyRecord(bus_id=bus2.id, trip_id=trip2.id, passenger_count=15, capacity=50, occupancy_percentage=30.0, crowd_level=CrowdLevelEnum.LOW, source=SourceEnum.UTC)
        db.add_all([occ1, occ2])
        
        # Transactions
        tx1 = UTCTransaction(card_id=card1.id, transaction_type="FARE", amount=-15.0, bus_id=bus1.id, trip_id=trip1.id)
        tx2 = UTCTransaction(card_id=card1.id, transaction_type="RECHARGE", amount=500.0)
        db.add_all([tx1, tx2])
        
        await db.commit()

    print("\n--- SEEDING COMPLETE ---")
    print("DEMO CREDENTIALS:")
    print("Manager: manager@transitos.com / password123")
    print("Driver 1: driver1@transitos.com / password123")
    print("Driver 2: driver2@transitos.com / password123")
    print("Passenger 1: passenger1@transitos.com / password123")
    print("Passenger 2: passenger2@transitos.com / password123")

if __name__ == "__main__":
    asyncio.run(seed_db())
