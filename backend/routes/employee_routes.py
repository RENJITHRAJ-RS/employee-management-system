from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Employee, User, Department
from schemas import EmployeeCreate, EmployeeOut, EmployeeUpdate
from auth import get_current_user

router = APIRouter()

# ======================
# DB DEPENDENCY
# ======================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ======================
# ✅ GET EMPLOYEES
# ======================
@router.get("/employees", response_model=list[EmployeeOut])
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Employee).filter(
        Employee.user_id == current_user.id
    ).all()


# ======================
# ✅ ADD EMPLOYEE
# ======================
@router.post("/employees", response_model=EmployeeOut)
def add_employee(
    emp: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🔥 Validate departments
    departments = db.query(Department).filter(
        Department.id.in_(emp.department_ids)
    ).all()

    if len(departments) != len(emp.department_ids):
        raise HTTPException(status_code=400, detail="Invalid department IDs")

    new_emp = Employee(
        name=emp.name,
        email=emp.email,
        phone=emp.phone,
        age=emp.age,
        salary=emp.salary,
        user_id=current_user.id
    )

    new_emp.departments = departments

    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    return new_emp


# ======================
# ✅ UPDATE EMPLOYEE
# ======================
@router.put("/employees/{id}", response_model=EmployeeOut)
def update_employee(
    id: int,
    emp: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(
        Employee.id == id,
        Employee.user_id == current_user.id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # 🔥 Partial update
    if emp.name is not None:
        employee.name = emp.name
    if emp.email is not None:
        employee.email = emp.email
    if emp.phone is not None:
        employee.phone = emp.phone
    if emp.age is not None:
        employee.age = emp.age
    if emp.salary is not None:
        employee.salary = emp.salary

    # 🔥 Update departments
    if emp.department_ids is not None:
        departments = db.query(Department).filter(
            Department.id.in_(emp.department_ids)
        ).all()

        if len(departments) != len(emp.department_ids):
            raise HTTPException(status_code=400, detail="Invalid department IDs")

        employee.departments = departments

    db.commit()
    db.refresh(employee)

    return employee


# ======================
# ✅ DELETE EMPLOYEE
# ======================
@router.delete("/employees/{id}")
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp = db.query(Employee).filter(
        Employee.id == id,
        Employee.user_id == current_user.id
    ).first()

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(emp)
    db.commit()

    return {"message": "Employee deleted successfully"}