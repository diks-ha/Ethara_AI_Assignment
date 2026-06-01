from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.repositories.orders import OrderRepository
from app.schemas.order import OrderCreate


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)

    def list_orders(self):
        return self.repo.list()

    def get_order(self, order_id: int):
        order = self.repo.get(order_id)
        if not order:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
        return order

    def create_order(self, payload: OrderCreate):
        if not self.db.get(Customer, payload.customer_id):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")

        requested = {}
        for item in payload.products:
            requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

        products = self.db.query(Product).filter(Product.id.in_(requested.keys())).with_for_update().all()
        products_by_id = {product.id: product for product in products}
        missing = set(requested) - set(products_by_id)
        if missing:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"Products not found: {sorted(missing)}")

        total = Decimal("0")
        try:
            order = Order(customer_id=payload.customer_id, total_amount=0)
            self.db.add(order)
            self.db.flush()

            for product_id, quantity in requested.items():
                product = products_by_id[product_id]
                if product.quantity_in_stock < quantity:
                    raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Insufficient stock for SKU {product.sku}")
                product.quantity_in_stock -= quantity
                line_price = Decimal(product.price)
                total += line_price * quantity
                self.db.add(OrderItem(order_id=order.id, product_id=product.id, quantity=quantity, price=line_price))

            order.total_amount = total
            self.db.commit()
            return self.get_order(order.id)
        except Exception:
            self.db.rollback()
            raise

    def delete_order(self, order_id: int):
        order = self.get_order(order_id)
        self.db.delete(order)
        self.db.commit()
