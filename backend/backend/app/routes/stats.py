from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.stats import DashboardStats

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    low_stock = db.query(Product).filter(Product.quantity_in_stock <= 5).order_by(Product.quantity_in_stock.asc()).all()
    return {
        "total_products": db.query(Product).count(),
        "total_customers": db.query(Customer).count(),
        "total_orders": db.query(Order).count(),
        "low_stock_products": low_stock,
    }
