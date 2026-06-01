from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderItem


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[Order]:
        return (
            self.db.query(Order)
            .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
            .order_by(Order.id.desc())
            .all()
        )

    def get(self, order_id: int) -> Order | None:
        return (
            self.db.query(Order)
            .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
            .filter(Order.id == order_id)
            .first()
        )
