import argparse
import random
from decimal import Decimal

from sqlalchemy import func

from app.database import Base, SessionLocal, engine
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services.orders import OrderService


PRODUCT_ADJECTIVES = [
    "Compact",
    "Premium",
    "Eco",
    "Smart",
    "Industrial",
    "Portable",
    "Advanced",
    "Essential",
    "Wireless",
    "Ergonomic",
]
PRODUCT_NOUNS = [
    "Scanner",
    "Keyboard",
    "Monitor",
    "Router",
    "Tablet",
    "Docking Station",
    "Barcode Printer",
    "Label Roll",
    "Inventory Bin",
    "Thermal Sensor",
]
FIRST_NAMES = [
    "Aarav",
    "Ava",
    "Diya",
    "Ethan",
    "Isha",
    "Kabir",
    "Mia",
    "Noah",
    "Priya",
    "Rohan",
    "Sara",
    "Vihaan",
]
LAST_NAMES = [
    "Kapoor",
    "Stone",
    "Mehta",
    "Sharma",
    "Patel",
    "Rao",
    "Fernandez",
    "Brooks",
    "Morgan",
    "Iyer",
]
SEED_EMAIL_DOMAIN = "inventoryops-demo.com"
OLD_SEED_EMAIL_DOMAIN = "seed.inventoryops.local"
LOW_STOCK_TARGET = 12


def money(value: float) -> Decimal:
    return Decimal(str(round(value, 2)))


def seed_products(db, target_count: int) -> list[Product]:
    products = db.query(Product).filter(Product.sku.like("SAMPLE-%")).order_by(Product.id).all()
    existing = {product.sku for product in products}

    for index in range(1, target_count + 1):
        sku = f"SAMPLE-{index:04d}"
        if sku in existing:
            continue
        adjective = PRODUCT_ADJECTIVES[index % len(PRODUCT_ADJECTIVES)]
        noun = PRODUCT_NOUNS[index % len(PRODUCT_NOUNS)]
        db.add(
            Product(
                product_name=f"{adjective} {noun}",
                sku=sku,
                price=money(random.uniform(8.5, 899.99)),
                quantity_in_stock=random.randint(8, 120),
            )
        )

    db.commit()
    return db.query(Product).filter(Product.sku.like("SAMPLE-%")).order_by(Product.id).all()


def seed_customers(db, target_count: int) -> list[Customer]:
    repair_old_seed_emails(db)
    customers = db.query(Customer).filter(Customer.email.like(f"%@{SEED_EMAIL_DOMAIN}")).order_by(Customer.id).all()
    existing = {customer.email for customer in customers}

    for index in range(1, target_count + 1):
        first_name = FIRST_NAMES[index % len(FIRST_NAMES)]
        last_name = LAST_NAMES[index % len(LAST_NAMES)]
        email = f"sample.customer.{index:04d}@{SEED_EMAIL_DOMAIN}"
        if email in existing:
            continue
        db.add(
            Customer(
                full_name=f"{first_name} {last_name}",
                email=email,
                phone_number=f"+1555{index:06d}",
            )
        )

    db.commit()
    return db.query(Customer).filter(Customer.email.like(f"%@{SEED_EMAIL_DOMAIN}")).order_by(Customer.id).all()


def count_sample_orders(db) -> int:
    return (
        db.query(func.count(Order.id))
        .join(Customer, Order.customer_id == Customer.id)
        .filter(Customer.email.like(f"%@{SEED_EMAIL_DOMAIN}"))
        .scalar()
        or 0
    )


def repair_old_seed_emails(db) -> None:
    old_customers = db.query(Customer).filter(Customer.email.like(f"%@{OLD_SEED_EMAIL_DOMAIN}")).all()
    for customer in old_customers:
        local_part = customer.email.split("@", 1)[0]
        customer.email = f"{local_part}@{SEED_EMAIL_DOMAIN}"
    if old_customers:
        db.commit()


def seed_orders(db, target_count: int, customers: list[Customer], products: list[Product]) -> int:
    created = 0
    service = OrderService(db)
    current_count = count_sample_orders(db)

    for _ in range(max(target_count - current_count, 0)):
        available_products = [product for product in products if product.quantity_in_stock > 4]
        if not available_products:
            break

        line_count = random.randint(1, 4)
        selected_products = random.sample(available_products, min(line_count, len(available_products)))
        payload = OrderCreate(
            customer_id=random.choice(customers).id,
            products=[
                OrderItemCreate(product_id=product.id, quantity=random.randint(1, min(3, product.quantity_in_stock)))
                for product in selected_products
            ],
        )
        service.create_order(payload)
        created += 1

    return created


def seed_low_stock_products(db, products: list[Product], target_count: int = LOW_STOCK_TARGET) -> int:
    low_stock_levels = [0, 1, 2, 3, 4, 5]
    sample_products = sorted(products, key=lambda product: product.id)[:target_count]

    for index, product in enumerate(sample_products):
        product.quantity_in_stock = low_stock_levels[index % len(low_stock_levels)]

    db.commit()
    return len(sample_products)


def run_seed(products: int, customers: int, orders: int) -> dict[str, int]:
    random.seed(42)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        product_rows = seed_products(db, products)
        customer_rows = seed_customers(db, customers)
        created_orders = seed_orders(db, orders, customer_rows, product_rows)
        low_stock_count = seed_low_stock_products(db, product_rows)
        return {
            "sample_products": len(product_rows),
            "sample_customers": len(customer_rows),
            "sample_orders": count_sample_orders(db),
            "sample_low_stock_products": low_stock_count,
            "orders_created_now": created_orders,
        }
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed sample inventory, customers, and orders.")
    parser.add_argument("--products", type=int, default=70)
    parser.add_argument("--customers", type=int, default=40)
    parser.add_argument("--orders", type=int, default=40)
    args = parser.parse_args()

    result = run_seed(args.products, args.customers, args.orders)
    print(
        "Seed complete: "
        f"{result['sample_products']} products, "
        f"{result['sample_customers']} customers, "
        f"{result['sample_orders']} orders "
        f"and {result['sample_low_stock_products']} low-stock products "
        f"({result['orders_created_now']} new orders)."
    )


if __name__ == "__main__":
    main()
