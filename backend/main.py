from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# DB
from database import Base, engine

# ROUTES
from routes import auth_routes, employee_routes, department_routes


# ================= APP =================
app = FastAPI()


# ================= DATABASE =================
Base.metadata.create_all(bind=engine)


# ================= ROOT ROUTE =================
@app.get("/")
def home():
    return {"message": "Employee Management API Running 🚀"}


# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= ROUTES =================
app.include_router(auth_routes.router)
app.include_router(employee_routes.router)
app.include_router(department_routes.router)  # 🔥 FIXED