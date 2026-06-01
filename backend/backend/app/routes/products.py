from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services.products import ProductService

router = APIRouter()


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return ProductService(db).create_product(payload)


@router.get("", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db)):
    return ProductService(db).list_products()


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return ProductService(db).get_product(product_id)


@router.put("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    return ProductService(db).update_product(product_id, payload)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    ProductService(db).delete_product(product_id)
