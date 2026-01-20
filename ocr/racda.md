# Procesador racda
## Configuración procesador

project_id = "118235508616"
location = "eu"
processor_id = "5e5a697bbe13ea7f" #racda_dates
mime_type = "application/pdf"

## uso:
### 1. llamar al procesador

result = process_document_sample(
    project_id,
    location,
    processor_id,
    file_path,
    mime_type,
    #field_mask,
    #processor_version_id,
)

### 2. extraer las entidades
result_entities = extract_entities(result)

### 3. procesar el resultado
result = procesar_documento_racda(result_entities)

## Ejemplos de la salida

{
  "expiration_date": "2027-06-09",
  "validity_period": 2,
  "issuance_date": "2025-06-09",
  "is_valid": true
}
