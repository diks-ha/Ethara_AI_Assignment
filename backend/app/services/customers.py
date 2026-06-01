from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.customers import CustomerRepository
from app.schemas.customer import CustomerCreate


class CustomerService:
    def __init__(self, db: Session):
        self.repo = CustomerRepository(db)

    def list_customers(self):
        return self.repo.list()

    def get_customer(self, customer_id: int):
        customer = self.repo.get(customer_id)
        if not customer:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
        return customer

    def create_customer(self, payload: CustomerCreate):
        if self.repo.get_by_email(payload.email):
            raise HTTPException(status.HTTP_409_CONFLICT, "Email already exists")
        return self.repo.create(payload)

    def delete_customer(self, customer_id: int):
        self.repo.delete(self.get_customer(customer_id))
