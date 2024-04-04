# Trademap API Spec

## Scrape Hscode

Endpoint : GET /api/trademap/scrape/hscode

Response Body :

```json
{
  "message": "Hscode scraped successfully",
  "count": 21317,
  "data": {
    "scraped_data": [
      {
        "hscode": "08",
        "name": "Edible fruit and nuts; peel of citrus fruit",
        "url": "https://www.trademap.org/"
      },
      {
        "hscode": "07",
        "name": "Edible vegetables and certain roots and tubers",
        "url": "https://www.trademap.org/"
      }
    ]
  }
}
```

## Scrape Importer

Endpoint : GET /api/scrape/importer

Response Body :

```json
{
  "message": "Importer scraped successfully",
  "count": 23671821,
  "data": {
    "scraped_data": [
      {
        "name": "indonesia",
        "trade_balance": "41284921",
        "quantity_imported": "41284921",
        "value_imported": "41284921",
        "unit_value": "41284921",
        "quantity_unit": "tons"
      },
      {
        "name": "malaysia",
        "trade_balance": "41284921",
        "quantity_imported": "41284921",
        "value_imported": "41284921",
        "quantity_unit": "tons"
      }
    ]
  }
}
```

## Scrape Exporter

Endpoint : GET /api/scrape/importer

Response Body :

```json
{
  "message": "Exporter scraped successfully",
  "count": 12368921,
  "data": {
    "scraped_data": [
      {
        "importer_id": 5,
        "name": "china",
        "tradeBalance": "-197,246",
        "quantityImported": "51,810",
        "valueImported": "274,773",
        "unitValue": "5,303"
      },
      {
        "importer_id": 5,
        "name": "canada",
        "tradeBalance": "-49,064",
        "quantityImported": "60",
        "valueImported": "49,064",
        "unitValue": "817,733"
      }
    ]
  }
}
```

## Get Trademap

Endpoint : GET /api/trademap
Response Body :

```json
[
  {
    "message": "Trademap data created successfully",
    "count": 36183,
    "data": {
      "trademap": [
        {
          "hscode": "08",
          "name": "Edible fruit and nuts; peel of citrus fruit",
          "url": "https://www.trademap.org/"
        },
        {
          "hscode": "07",
          "name": "Edible vegetables and certain roots and tubers",
          "url": "https://www.trademap.org/"
        }
      ]
    }
  }
]
```

## Create Trademap

Endpoint : POST /api/trademap

Response Body :

```json
[
  {
    "message": "Trademap data created successfully",
    "data": { "count": 36183 }
  }
]
```

## Create Importer

Endpoint : POST /api/importer

Response Body :

```json
[
  {
    "message": "Importer data created successfully",
    "data": { "count": 36183 }
  }
]
```

## Create Exporter

Endpoint : POST /api/trademap

Response Body :

```json
[
  {
    "message": "Exporter data created successfully",
    "data": { "count": 36183 }
  }
]
```
