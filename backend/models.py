from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

# =========================================
# 🔗 ASSOCIATION TABLE (Many-to-Many)
# =========================================

employee_department = Table(
    "employee_department",
    Base.metadata,
    Column("employee_id", Integer, ForeignKey("employees.id"), primary_key=True),
    Column("department_id", Integer, ForeignKey("departments.id"), primary_key=True)
)

# =========================================
# 👤 USER TABLE
# =========================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))

    # One-to-Many → User → Employees
    employees = relationship("Employee", back_populates="owner", cascade="all, delete")


# =========================================
# 👨‍💼 EMPLOYEE TABLE
# =========================================

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    age = Column(Integer)
    salary = Column(Float)

    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationship with User
    owner = relationship("User", back_populates="employees")

    # 🔥 Many-to-Many → Employee ↔ Department
    departments = relationship(
        "Department",
        secondary=employee_department,
        back_populates="employees"
    )


# =========================================
# 🏢 DEPARTMENT TABLE
# =========================================

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)

    # 🔥 Many-to-Many → Department ↔ Employee
    employees = relationship(
        "Employee",
        secondary=employee_department,
        back_populates="departments"
    )