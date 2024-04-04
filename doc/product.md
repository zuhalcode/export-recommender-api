# Product API Spec

## Get Products

Endpoint : GET /api/products

Response Body :

```json
{
  "message": "Retrieve products successfully",
  "count": 21317,
  "data": {
    "products": [
      {
        "hscode": "0201",
        "name": "bamboo",
        "desc": "Edible fruit and nuts; peel of citrus fruit"
      },
      {
        "hscode": "0201",
        "name": "bamboo",
        "desc": "Edible fruit and nuts; peel of citrus fruit"
      }
    ]
  }
}
```

## Get Product By Id

Endpoint : GET /api/products/:id

Response Body :

```json
{
  "message": "Retrieve products successfully",
  "count": 1,
  "data": {
    "product": {
      "hscode": "0201",
      "name": "bamboo",
      "desc": "Edible fruit and nuts; peel of citrus fruit"
    }
  }
}
```

## Create Product

Endpoint : POST /api/products

Response Body :

```json
{
  "message": "Product created successfully",
  "count": 21317,
  "data": {
    "products": [
      {
        "name": "bamboo",
        "hscode": "0201",
        "desc": "Edible fruit and nuts; peel of citrus fruit"
      },
      {
        "name": "bamboo",
        "hscode": "0201",
        "desc": "Edible fruit and nuts; peel of citrus fruit"
      }
    ]
  }
}
```
