"""
Suite de pruebas automatizadas para verificar todos los requisitos de la EFI.
"""

from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["sistema"] == "Ferretería Industrial API"
    assert "/docs" in data["documentacion_swagger"]
    print("[OK] test_root pasado")


def test_openapi_docs():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "Ferretería Industrial API" in schema["info"]["title"]
    # Verificar que los endpoints documentan el error 404
    paths = schema["paths"]
    assert "404" in paths["/categorias/{categoria_id}"]["get"]["responses"]
    assert "404" in paths["/proveedores/{proveedor_id}"]["get"]["responses"]
    assert "404" in paths["/productos/{producto_id}"]["get"]["responses"]
    print("[OK] test_openapi_docs y 404 documentados pasado")


def test_categorias_crud():
    # 1. Create
    cat_payload = {
        "nombre": "Categoría Test EFI",
        "descripcion": "Descripción de prueba para test",
    }
    res_create = client.post("/categorias/", json=cat_payload)
    assert res_create.status_code == 201
    cat_id = res_create.json()["id"]

    # 2. Read All (paginado)
    res_list = client.get("/categorias/?page=1&size=5")
    assert res_list.status_code == 200
    data_list = res_list.json()
    assert "items" in data_list
    assert "total" in data_list
    assert data_list["page"] == 1

    # 3. Read One (nested)
    res_get = client.get(f"/categorias/{cat_id}")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["id"] == cat_id
    assert "productos" in data_get

    # 4. Update
    res_update = client.patch(
        f"/categorias/{cat_id}",
        json={"descripcion": "Descripción actualizada"},
    )
    assert res_update.status_code == 200
    assert res_update.json()["descripcion"] == "Descripción actualizada"

    # 5. Delete
    res_delete = client.delete(f"/categorias/{cat_id}")
    assert res_delete.status_code == 200

    # 404 Not Found
    res_not_found = client.get(f"/categorias/{cat_id}")
    assert res_not_found.status_code == 404
    print("[OK] test_categorias_crud pasado")


def test_proveedores_crud():
    # 1. Create
    prov_payload = {
        "nombre": "Proveedor Test EFI",
        "cuit": "30-99999999-9",
        "email": "test@proveedor.com",
        "telefono": "+54 11 0000-0000",
        "direccion": "Calle Falsa 123",
    }
    res_create = client.post("/proveedores/", json=prov_payload)
    assert res_create.status_code == 201
    prov_id = res_create.json()["id"]

    # 2. Read All (paginado)
    res_list = client.get("/proveedores/?page=1&size=5")
    assert res_list.status_code == 200
    assert "items" in res_list.json()

    # 3. Read One (nested)
    res_get = client.get(f"/proveedores/{prov_id}")
    assert res_get.status_code == 200
    assert "productos" in res_get.json()

    # 4. Update
    res_update = client.patch(
        f"/proveedores/{prov_id}",
        json={"email": "nuevo_email@proveedor.com"},
    )
    assert res_update.status_code == 200
    assert res_update.json()["email"] == "nuevo_email@proveedor.com"

    # 5. Delete
    res_delete = client.delete(f"/proveedores/{prov_id}")
    assert res_delete.status_code == 200

    # 404 Not Found
    res_not_found = client.get(f"/proveedores/{prov_id}")
    assert res_not_found.status_code == 404
    print("[OK] test_proveedores_crud pasado")


def test_productos_crud():
    # Primero obtenemos una categoría y un proveedor existentes
    res_cat = client.get("/categorias/?page=1&size=1").json()
    cat_id = res_cat["items"][0]["id"]

    res_prov = client.get("/proveedores/?page=1&size=1").json()
    prov_id = res_prov["items"][0]["id"]

    # 1. Create
    prod_payload = {
        "nombre": "Cinta Métrica Profesional 5m",
        "codigo_barra": "7799999000111",
        "descripcion": "Cinta de acero de 5 metros con traba",
        "precio": 7500.0,
        "stock": 40,
        "stock_minimo": 8,
        "categoria_id": cat_id,
        "proveedor_id": prov_id,
    }
    res_create = client.post("/productos/", json=prod_payload)
    assert res_create.status_code == 201
    prod_id = res_create.json()["id"]

    # 2. Read All (paginado)
    res_list = client.get("/productos/?page=1&size=5")
    assert res_list.status_code == 200
    assert "items" in res_list.json()

    # 3. Read One (nested)
    res_get = client.get(f"/productos/{prod_id}")
    assert res_get.status_code == 200
    prod_data = res_get.json()
    assert prod_data["id"] == prod_id
    assert prod_data["categoria"] is not None
    assert prod_data["categoria"]["id"] == cat_id
    assert prod_data["proveedor"] is not None
    assert prod_data["proveedor"]["id"] == prov_id

    # 4. Update
    res_update = client.patch(
        f"/productos/{prod_id}",
        json={"precio": 8200.0, "stock": 45},
    )
    assert res_update.status_code == 200
    assert res_update.json()["precio"] == 8200.0
    assert res_update.json()["stock"] == 45

    # 5. Delete
    res_delete = client.delete(f"/productos/{prod_id}")
    assert res_delete.status_code == 200

    # 404 Not Found
    res_not_found = client.get(f"/productos/{prod_id}")
    assert res_not_found.status_code == 404
    print("[OK] test_productos_crud pasado")


if __name__ == "__main__":
    test_root()
    test_openapi_docs()
    test_categorias_crud()
    test_proveedores_crud()
    test_productos_crud()
    print("\n¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!")
