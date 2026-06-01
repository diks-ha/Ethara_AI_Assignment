from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus
from app.schemas.customer import CustomerRead
from app.schemas.product import ProductRead


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    products: list[OrderItemCreate] = Field(min_length=1)


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: Decimal
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime
    customer: CustomerRead
    items: list[OrderItemRead]

    model_config = ConfigDict(from_attributes=True)
