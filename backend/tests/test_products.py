def test_product_crud_and_unique_sku(client):
    payload = {"product_name": "Laptop", "sku": "LAP-001", "price": "999.99", "quantity_in_stock": 10}
    created = client.post("/products", json=payload)
    assert created.status_code == 201
    product_id = created.json()["id"]

    assert client.post("/products", json=payload).status_code == 409
    assert client.get(f"/products/{product_id}").json()["sku"] == "LAP-001"

    updated = client.put(f"/products/{product_id}", json={"quantity_in_stock": 8})
    assert updated.status_code == 200
    assert updated.json()["quantity_in_stock"] == 8

    assert client.delete(f"/products/{product_id}").status_code == 204
