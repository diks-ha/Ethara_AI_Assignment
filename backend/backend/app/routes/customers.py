from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerRead
from app.services.customers import CustomerService

router = APIRouter()


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return CustomerService(db).create_customer(payload)


@router.get("", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db)):
    return CustomerService(db).list_customers()


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return CustomerService(db).get_customer(customer_id)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    CustomerService(db).delete_customer(customer_id)
