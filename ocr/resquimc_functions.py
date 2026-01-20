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


## procesa todas las pagaginas, devuelve el objeto document, es el llamado principal a la api
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
