# Procesador racda
## Configuración procesador

project_id = "118235508616"
location = "eu"
processor_id = "ad9e090e085b08a3" # resquimic
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



## Ejemplos de la salida

[
  {
    "type_": "anclaje_sustancias_controladas",
    "mention_text": "PARA OPERAR Y TRANSPORTAR LAS SIGUIENTES SUSTANCIAS QUÍMICAS:",
    "confidence": 0.7736481428146362
  },
  {
    "type_": "fecha_solicitud",
    "mention_text": "17/07/2025",
    "confidence": 0.9994369149208069
  },
  {
    "type_": "sustancias_controladas",
    "mention_text": "",
    "confidence": 1.0
  },
  {
    "type_": "vigencia_desde",
    "mention_text": "27/09/2025",
    "confidence": 0.9999967813491821
  },
  {
    "type_": "vigencia_etiqueta",
    "mention_text": "Válida por doce (12) meses",
    "confidence": 0.9999912977218628
  },
  {
    "type_": "vigencia_etiqueta_desde",
    "mention_text": "DESDE:",
    "confidence": 0.9999920129776001
  },
  {
    "type_": "vigencia_etiqueta_hasta",
    "mention_text": "HASTA:",
    "confidence": 0.9999986886978149
  },
  {
    "type_": "vigencia_hasta",
    "mention_text": "26/09/2026",
    "confidence": 0.9999971389770508
  }
]

