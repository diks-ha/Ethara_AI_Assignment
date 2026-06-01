from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.models import customer, order, product  # noqa: F401
from app.routes import customers, health, orders, products, stats


settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="Production-ready inventory and order management API.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            settings.frontend_url,
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
        ],
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(products.router, prefix="/products", tags=["products"])
    app.include_router(customers.router, prefix="/customers", tags=["customers"])
    app.include_router(orders.router, prefix="/orders", tags=["orders"])
    app.include_router(stats.router, prefix="/stats", tags=["stats"])
    return app


app = create_app()


@app.on_event("startup")
def on_startup() -> None:
    if settings.environment == "development":
        Base.metadata.create_all(bind=engine)
