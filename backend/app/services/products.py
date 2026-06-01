from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.products import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)

    def list_products(self):
        return self.repo.list()

    def get_product(self, product_id: int):
        product = self.repo.get(product_id)
        if not product:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        return product

    def create_product(self, payload: ProductCreate):
        if self.repo.get_by_sku(payload.sku):
            raise HTTPException(status.HTTP_409_CONFLICT, "SKU already exists")
        return self.repo.create(payload)

    def update_product(self, product_id: int, payload: ProductUpdate):
        product = self.get_product(product_id)
        if payload.sku and payload.sku != product.sku and self.repo.get_by_sku(payload.sku):
            raise HTTPException(status.HTTP_409_CONFLICT, "SKU already exists")
        return self.repo.update(product, payload)

    def delete_product(self, product_id: int):
        self.repo.delete(self.get_product(product_id))
