from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, BusStatusEnum, DriverStatusEnum, TripStatusEnum, CrowdLevelEnum, EmergencyTypeEnum, EmergencyStatusEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# Base Models
class BusBase(BaseModel):
    bus_number: str
    bus_type: str
    capacity: int = 60
    status: BusStatusEnum

class BusResponse(BusBase):
    id: int
    current_route_id: Optional[int]
    current_driver_id: Optional[int]
    latitude: Optional[float]
    longitude: Optional[float]
    speed: float
    direction: Optional[float]
    current_stop_id: Optional[int]
    next_stop_id: Optional[int]

    class Config:
        from_attributes = True

class RouteBase(BaseModel):
    route_number: str
    route_name: str
    start_location: str
    destination: str
    distance_km: float
    estimated_duration: int

class RouteResponse(RouteBase):
    id: int
    status: str

    class Config:
        from_attributes = True

class StopResponse(BaseModel):
    id: int
    route_id: int
    stop_name: str
    latitude: float
    longitude: float
    stop_order: int

    class Config:
        from_attributes = True

class EmergencyEventCreate(BaseModel):
    bus_id: int
    latitude: float
    longitude: float
    passenger_count: int
    route_id: Optional[int] = None
    emergency_type: EmergencyTypeEnum
    message: Optional[str] = None

class EmergencyEventResponse(EmergencyEventCreate):
    id: int
    driver_id: int
    status: EmergencyStatusEnum
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UTCCardResponse(BaseModel):
    id: int
    card_number: str
    balance: float
    status: str

    class Config:
        from_attributes = True
        
class UTCRechargeRequest(BaseModel):
    amount: float

class DashboardStats(BaseModel):
    total_fleet: int
    active_buses: int
    passengers_today: int
    average_occupancy: float
    delayed_buses: int
    demand_spikes: int

class TripBase(BaseModel):
    bus_id: int
    driver_id: int
    route_id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: TripStatusEnum
    passenger_count: int = 0

class TripResponse(TripBase):
    id: int
    created_at: datetime
    driver_name: Optional[str] = None
    route: Optional[str] = None

    class Config:
        from_attributes = True
