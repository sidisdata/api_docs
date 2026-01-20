import os
from typing import Optional
from google.api_core.client_options import ClientOptions
from google.cloud import documentai  # type: ignore
import json
from datetime import datetime
import pypdf
import re
import unicodedata
import uuid
from dateutil.relativedelta import relativedelta

def process_document_sample(
    project_id: str,
    location: str,
    processor_id: str,
    file_path: str,
    mime_type: str,
    field_mask: Optional[str] = None,
    processor_version_id: Optional[str] = None,
) -> None:
    # You must set the `api_endpoint` if you use a location other than "us".
    opts = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")

    client = documentai.DocumentProcessorServiceClient(client_options=opts)

    if processor_version_id:
        # The full resource name of the processor version, e.g.:
        # `projects/{project_id}/locations/{location}/processors/{processor_id}/processorVersions/{processor_version_id}`
        name = client.processor_version_path(
            project_id, location, processor_id, processor_version_id
        )
    else:
        # The full resource name of the processor, e.g.:
        # `projects/{project_id}/locations/{location}/processors/{processor_id}`
        name = client.processor_path(project_id, location, processor_id)

    # Read the file into memory
    with open(file_path, "rb") as image:
        image_content = image.read()

    # Load binary data
    raw_document = documentai.RawDocument(content=image_content, mime_type=mime_type)

    # For more information: https://cloud.google.com/document-ai/docs/reference/rest/v1/ProcessOptions
    # Optional: Additional configurations for processing.
    # Configuración de opciones de procesamiento.
    # Por defecto, si no se especifica individual_page_selector,
    # Document AI procesará todas las páginas del documento.
    process_options = documentai.ProcessOptions()

    # Si tienes otras configuraciones que sí quieres aplicar, irían aquí.
    # Por ejemplo:
    # process_options = documentai.ProcessOptions(
    #     skip_human_review=True # Solo si deseas omitir la revisión humana
    # )

    # ...

    request = documentai.ProcessRequest(
        name=name,
        raw_document=raw_document,
        field_mask=field_mask,
        process_options=process_options, # Asegúrate de pasar tu objeto process_options
    )


    result = client.process_document(request=request)

    # For a full list of `Document` object attributes, reference this page:
    # https://cloud.google.com/document-ai/docs/reference/rest/v1/Document
    document = result.document

    # Read the text recognition output from the processor
    #print("The document contains the following text:")
    #print(document.text)
    #print(document.entities)  #campos y valores definidos a extraer en el procesador

    return document

def extract_entities(document):
    entities = document.entities
        # Extract only desired fields from the entity objects
    data = [
        {k: getattr(e, k) for k in ["type_", "mention_text", "confidence"]}
        for e in entities
    ]

    return data

def normalizar_fecha(fecha_str):
    """
    Parsea fechas en múltiples formatos y maneja años de 2 dígitos.
    Ej: '04-03-97' -> 1997-03-04
    """
    if not fecha_str or not isinstance(fecha_str, str):
        return None
    
    try:
        # Limpieza básica
        texto = fecha_str.upper().replace(" DE ", " ").replace(" DEL ", " ").strip()
        
        # Mapeo de meses español -> numérico
        meses = {
            'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
            'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
            'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12',
            'ENE': '01', 'FEB': '02', 'MAR': '03', 'ABR': '04',
            'JUN': '06', 'JUL': '07', 'AGO': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DIC': '12'
        }
        
        for nombre, numero in meses.items():
            if nombre in texto:
                texto = texto.replace(nombre, numero)
                break 
        
        # Formatos soportados
        formatos = [
            "%d %m %Y", "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d.%m.%Y",
            "%d-%m-%y", "%d/%m/%y" # Soporte para años de 2 dígitos
        ]
        
        for fmt in formatos:
            try:
                dt = datetime.strptime(texto, fmt).date()
                # Corrección de siglo para años de 2 dígitos (ej. 97 -> 1997)
                # Si el año detectado es mayor al año actual + 2, asumimos siglo pasado
                if dt.year > datetime.now().year + 2:
                     dt = dt.replace(year=dt.year - 100)
                return dt
            except ValueError:
                continue
        return None
    except Exception:
        return None

def extraer_anios_regla_estricta(texto_validez):
    """
    Busca explícitamente menciones numéricas de años.
    Si encuentra -> Retorna el número.
    Si NO encuentra (por cualquier razón) -> Retorna DEFAULT_YEARS (2).
    """
    if not texto_validez:
        return 2 #DEFAULT_YEARS

    texto_upper = texto_validez.upper()

    # Regex para buscar patrones como: "(05) AÑOS", "5 AÑOS", "CINCO (5) AÑOS"
    # Prioridad 1: Número entre paréntesis seguido de AÑOS -> (2) AÑOS
    match = re.search(r'\((\d+)\)\s*AÑOS?', texto_upper)
    
    # Prioridad 2: Número dígito suelto seguido de AÑOS -> 2 AÑOS
    if not match:
        match = re.search(r'\b(\d+)\s*AÑOS?', texto_upper)
    
    if match:
        return int(match.group(1))
    
    # Regla: Si no se menciona el tiempo de validez, se asume como dos años
    return 2 #DEFAULT_YEARS

def procesar_documento_racda(entradas):
    try:
        # Estructura base
        resultado = {
            "expiration_date": "nda",
            "validity_period": 2, # Default numérico
            "issuance_date": None,
            "is_valid": False
        }

        if not entradas or not isinstance(entradas, list):
            return resultado

        # Convertir lista a diccionario
        datos = {item.get('type_'): item.get('mention_text') for item in entradas if isinstance(item, dict)}

        # 1. Procesar Fecha de Emisión (Issuance)
        fecha_emision_obj = normalizar_fecha(datos.get('issuance_date'))
        if fecha_emision_obj:
            resultado['issuance_date'] = fecha_emision_obj.strftime('%Y-%m-%d')

        # 2. Procesar Periodo de Validez (Validity)
        texto_raw = datos.get('validity_period', "")
        anios_validez = extraer_anios_regla_estricta(texto_raw)
        
        # Asignamos el valor entero a la salida
        resultado['validity_period'] = anios_validez

        # 3. Calcular Expiración y Validez
        fecha_hoy = datetime.now().date()

        if fecha_emision_obj:
            # Cálculo: Emisión + Años detectados (o default 2)
            fecha_exp = fecha_emision_obj + relativedelta(years=anios_validez)
            
            resultado['expiration_date'] = fecha_exp.strftime('%Y-%m-%d')
            resultado['is_valid'] = fecha_exp >= fecha_hoy
        else:
            # Regla: El campo expiration_date debe contener fecha SALVO no exista issuance_date
            resultado['expiration_date'] = 'nda'
            resultado['is_valid'] = False

        return resultado

    except Exception as e:
        return {"error": str(e)}
