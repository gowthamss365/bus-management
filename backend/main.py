from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, buses, routes, utc, emergency, manager, simulation, driver

app = FastAPI(title="Transit OS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # For prototype only: Create all tables on startup
        # In a real app, use Alembic strictly
        await conn.run_sync(models.Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"message": "Welcome to Transit OS API"}

app.include_router(auth.router)
app.include_router(buses.router)
app.include_router(routes.router)
app.include_router(utc.router)
app.include_router(emergency.router)
app.include_router(manager.router)
app.include_router(simulation.router)
app.include_router(driver.router)
