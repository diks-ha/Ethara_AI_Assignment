def create_product(client, sku="SKU-1", quantity=5, price="12.50"):
    return client.post("/products", json={"product_name": "Widget", "sku": sku, "price": price, "quantity_in_stock": quantity}).json()


def create_customer(client):
    return client.post("/customers", json={"full_name": "Ava Stone", "email": "ava@example.com", "phone_number": "+15550001"}).json()


def test_customer_crud_and_unique_email(client):
    customer = create_customer(client)
    assert customer["email"] == "ava@example.com"
    assert client.post("/customers", json={"full_name": "Ava Stone", "email": "ava@example.com"}).status_code == 409
    assert client.get(f"/customers/{customer['id']}").status_code == 200
    assert client.delete(f"/customers/{customer['id']}").status_code == 204


def test_order_reduces_inventory_and_calculates_total(client):
    customer = create_customer(client)
    product = create_product(client, quantity=5, price="10.00")
    response = client.post("/orders", json={"customer_id": customer["id"], "products": [{"product_id": product["id"], "quantity": 3}]})
    assert response.status_code == 201
    assert response.json()["total_amount"] == "30.00"
    assert client.get(f"/products/{product['id']}").json()["quantity_in_stock"] == 2


def test_order_rejects_insufficient_stock(client):
    customer = create_customer(client)
    product = create_product(client, quantity=1)
    response = client.post("/orders", json={"customer_id": customer["id"], "products": [{"product_id": product["id"], "quantity": 2}]})
    assert response.status_code == 400
    assert client.get(f"/products/{product['id']}").json()["quantity_in_stock"] == 1
