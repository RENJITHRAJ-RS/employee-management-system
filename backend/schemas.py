from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ======================
# 👤 USER SCHEMAS
# ======================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# ======================
# 🏢 DEPARTMENT SCHEMAS
# ======================

class DepartmentBase(BaseModel):
    name: str


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        from_attributes = True


# ======================
# 👨‍💼 EMPLOYEE SCHEMAS
# ======================

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    age: int
    salary: float


# 🔥 CREATE → Send department IDs
class EmployeeCreate(EmployeeBase):
    department_ids: List[int]


# 🔥 UPDATE → Optional fields (VERY IMPORTANT)
class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    salary: Optional[float] = None
    department_ids: Optional[List[int]] = None


# 🔥 RESPONSE → Show department names
class EmployeeOut(EmployeeBase):
    id: int
    departments: List[DepartmentOut]

    class Config:
        from_attributes = True