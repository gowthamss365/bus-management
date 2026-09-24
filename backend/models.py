from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class RoleEnum(str, enum.Enum):
    PASSENGER = "PASSENGER"
    DRIVER = "DRIVER"
    MANAGER = "MANAGER"

class DriverStatusEnum(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    OFF_DUTY = "OFF_DUTY"
    EMERGENCY = "EMERGENCY"

class BusStatusEnum(str, enum.Enum):
    ON_ROUTE = "ON_ROUTE"
    IDLE = "IDLE"
    DELAYED = "DELAYED"
    OVERCROWDED = "OVERCROWDED"
    EMERGENCY = "EMERGENCY"
    RESERVE = "RESERVE"
    MAINTENANCE = "MAINTENANCE"

class TripStatusEnum(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DELAYED = "DELAYED"

class CrowdLevelEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class SourceEnum(str, enum.Enum):
    UTC = "UTC"
    COMPUTER_VISION = "COMPUTER_VISION"
    MANUAL = "MANUAL"
    SIMULATION = "SIMULATION"

class EmergencyTypeEnum(str, enum.Enum):
    SOS = "SOS"
    ACCIDENT = "ACCIDENT"
    MEDICAL = "MEDICAL"
    VEHICLE_FAILURE = "VEHICLE_FAILURE"
    OTHER = "OTHER"

class EmergencyStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

class AllocationTypeEnum(str, enum.Enum):
    NORMAL = "NORMAL"
    EXTRA = "EXTRA"
    FESTIVAL = "FESTIVAL"
    EMERGENCY = "EMERGENCY"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(RoleEnum))
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    passenger_profile = relationship("Passenger", back_populates="user", uselist=False)
    driver_profile = relationship("Driver", back_populates="user", uselist=False)

class Passenger(Base):
    __tablename__ = "passengers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    utc_card_id = Column(Integer, ForeignKey("utc_cards.id"), nullable=True)
    total_trips = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="passenger_profile")
    utc_card = relationship("UTCCard", back_populates="passenger")

class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    driver_code = Column(String, unique=True, index=True)
    license_number = Column(String)
    assigned_bus_id = Column(Integer, ForeignKey("buses.id"), nullable=True)
    status = Column(Enum(DriverStatusEnum), default=DriverStatusEnum.AVAILABLE)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="driver_profile")
    assigned_bus = relationship("Bus", foreign_keys=[assigned_bus_id])
    trips = relationship("Trip", back_populates="driver")

class Bus(Base):
    __tablename__ = "buses"
    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String, unique=True, index=True)
    bus_type = Column(String)
    capacity = Column(Integer, default=60)
    status = Column(Enum(BusStatusEnum), default=BusStatusEnum.IDLE)
    current_route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    current_driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    speed = Column(Float, default=0.0)
    direction = Column(Float, nullable=True)
    current_stop_id = Column(Integer, ForeignKey("stops.id"), nullable=True)
    next_stop_id = Column(Integer, ForeignKey("stops.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    route = relationship("Route", back_populates="buses")
    gps_locations = relationship("GPSLocation", back_populates="bus")
    occupancy_records = relationship("OccupancyRecord", back_populates="bus")
    passenger_counts = relationship("PassengerCount", back_populates="bus")
    trips = relationship("Trip", back_populates="bus")

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    route_number = Column(String, unique=True, index=True)
    route_name = Column(String)
    start_location = Column(String)
    destination = Column(String)
    distance_km = Column(Float)
    estimated_duration = Column(Integer) # minutes
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    stops = relationship("Stop", back_populates="route", order_by="Stop.stop_order")
    buses = relationship("Bus", back_populates="route")

class Stop(Base):
    __tablename__ = "stops"
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"))
    stop_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    stop_order = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    route = relationship("Route", back_populates="stops")

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    route_id = Column(Integer, ForeignKey("routes.id"))
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    status = Column(Enum(TripStatusEnum), default=TripStatusEnum.SCHEDULED)
    passenger_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    bus = relationship("Bus", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    route = relationship("Route")

class GPSLocation(Base):
    __tablename__ = "gps_locations"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    speed = Column(Float)
    direction = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    bus = relationship("Bus", back_populates="gps_locations")

class OccupancyRecord(Base):
    __tablename__ = "occupancy_records"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    passenger_count = Column(Integer)
    capacity = Column(Integer)
    occupancy_percentage = Column(Float)
    crowd_level = Column(Enum(CrowdLevelEnum))
    source = Column(Enum(SourceEnum))
    timestamp = Column(DateTime, default=datetime.utcnow)

    bus = relationship("Bus", back_populates="occupancy_records")

class PassengerCount(Base):
    __tablename__ = "passenger_counts"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    entered = Column(Integer, default=0)
    exited = Column(Integer, default=0)
    current_count = Column(Integer)
    source = Column(Enum(SourceEnum))
    timestamp = Column(DateTime, default=datetime.utcnow)

    bus = relationship("Bus", back_populates="passenger_counts")

class UTCCard(Base):
    __tablename__ = "utc_cards"
    id = Column(Integer, primary_key=True, index=True)
    card_number = Column(String, unique=True, index=True)
    balance = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    passenger = relationship("Passenger", back_populates="utc_card", uselist=False)
    transactions = relationship("UTCTransaction", back_populates="card")

class UTCTransaction(Base):
    __tablename__ = "utc_transactions"
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("utc_cards.id"))
    transaction_type = Column(String) # RECHARGE, FARE, REFUND, BOARDING
    amount = Column(Float)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    card = relationship("UTCCard", back_populates="transactions")

class EmergencyEvent(Base):
    __tablename__ = "emergency_events"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    passenger_count = Column(Integer)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    emergency_type = Column(Enum(EmergencyTypeEnum))
    message = Column(String, nullable=True)
    status = Column(Enum(EmergencyStatusEnum), default=EmergencyStatusEnum.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    bus = relationship("Bus")
    driver = relationship("Driver")

class FestivalEvent(Base):
    __tablename__ = "festival_events"
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String)
    event_date = Column(DateTime)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    location = Column(String)
    expected_crowd = Column(Integer)
    status = Column(String, default="PLANNED")
    created_at = Column(DateTime, default=datetime.utcnow)

    routes = relationship("FestivalRoute", back_populates="festival")

class FestivalRoute(Base):
    __tablename__ = "festival_routes"
    id = Column(Integer, primary_key=True, index=True)
    festival_id = Column(Integer, ForeignKey("festival_events.id"))
    route_id = Column(Integer, ForeignKey("routes.id"))
    normal_demand = Column(Integer)
    predicted_demand = Column(Integer)
    current_buses = Column(Integer)
    required_buses = Column(Integer)
    extra_buses = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    festival = relationship("FestivalEvent", back_populates="routes")
    route = relationship("Route")

class FleetAllocation(Base):
    __tablename__ = "fleet_allocations"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    route_id = Column(Integer, ForeignKey("routes.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    allocation_type = Column(Enum(AllocationTypeEnum))
    festival_id = Column(Integer, ForeignKey("festival_events.id"), nullable=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    bus = relationship("Bus")
    route = relationship("Route")
    driver = relationship("Driver")

class DemandPrediction(Base):
    __tablename__ = "demand_predictions"
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"))
    prediction_time = Column(DateTime)
    predicted_passengers = Column(Integer)
    predicted_occupancy = Column(Float)
    required_buses = Column(Integer)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class CrowdRecommendation(Base):
    __tablename__ = "crowd_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    passenger_id = Column(Integer, ForeignKey("passengers.id"))
    route_id = Column(Integer, ForeignKey("routes.id"))
    recommended_bus_id = Column(Integer, ForeignKey("buses.id"))
    crowd_level = Column(Enum(CrowdLevelEnum))
    occupancy_percentage = Column(Float)
    eta_minutes = Column(Integer)
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    alert_type = Column(String)
    title = Column(String)
    message = Column(String)
    severity = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(String)
    type = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
