
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

# -------------------------------
# 1. Normalizador principal
# -------------------------------
def parsear_fecha(texto_fecha: str) -> str:
    """
    Detecta y normaliza fechas en múltiples formatos:
    - Fechas OCR tipo '21 MAY 2025', '0 3 SFP 2025'
    - Fechas numéricas: 21/05/2025, 2025-05-21, etc.

    Devuelve 'DD-MM-YYYY' o "" si falla.
    """

    if not texto_fecha or not isinstance(texto_fecha, str):
        return ""

    original = texto_fecha.strip().upper()

    # ---------------------------------------------------------
    # 1. Intento de parseo numérico (21/05/2025, 2025-05-21, etc.)
    # ---------------------------------------------------------
    # Reemplazar ., - y espacios por /
    num_clean = re.sub(r"[\.\-\s]+", "/", original)

    # Patrones soportados en numérico
    formatos_numericos = [
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%d/%m/%y",
    ]

    for fmt in formatos_numericos:
        try:
            dt = datetime.strptime(num_clean, fmt)
            # descartar días inválidos detectados como 00
            if dt.day == 0:
                continue
            return dt.strftime("%d-%m-%Y")
        except:
            pass

    # ---------------------------------------------------------
    # 2. Intento OCR tipo "21 MAY 2025"
    # ---------------------------------------------------------
    texto = original

    # Unir números separados: "0 3" → "03"
    texto = re.sub(r"(?<=\d)\s+(?=\d)", "", texto)

    # Diccionario de meses incluyendo errores comunes OCR
    meses = {
        'ENE': '01', 'JAN': '01',
        'FEB': '02',
        'MAR': '03',
        'ABR': '04', 'APR': '04',
        'MAY': '05', 'MAI': '05',
        'JUN': '06',
        'JUL': '07',
        'AGO': '08', 'AUG': '08',
        'SEP': '09', 'SET': '09', 'SFP': '09', 'SEPT': '09',
        'OCT': '10',
        'NOV': '11',
        'DIC': '12', 'DEC': '12'
    }

    patron = re.search(r"(\d{1,3})\s*([A-Z]{3,})\s*(\d{4})", texto)
    if patron:
        dia, mes_txt, anio = patron.groups()

        # descartar día > 31
        if int(dia) > 31:
            return ""

        # identificar mes
        mes_num = ""
        for k, v in meses.items():
            if k in mes_txt:
                mes_num = v
                break

        if not mes_num:
            return ""

        dia = dia.zfill(2)
        return f"{dia}-{mes_num}-{anio}"

    return ""

# -------------------------------
# 2. Función final para elegir la fecha más reciente
# -------------------------------
def extraer_fecha_emision(data_json: list) -> dict:
    """
    Recibe una lista de dicts con fechas_emision y devuelve:
    { "fecha_emision": "YYYY-MM-DD" }
    """

    fechas_validas = []

    for item in data_json:
        if item.get("type_") != "fecha_emision":
            continue

        fecha_raw = item.get("mention_text", "")
        normalizada = parsear_fecha(fecha_raw)

        if not normalizada:
            continue

        try:
            dt = datetime.strptime(normalizada, "%d-%m-%Y")
            fechas_validas.append(dt)
        except:
            pass

    if not fechas_validas:
        return {"fecha_emision": ""}

    fecha_final = max(fechas_validas)
    return {"fecha_emision": fecha_final.strftime("%Y-%m-%d")}

# save process result
def save_results_to_json(result, output_folder="./dataResults", base_name="output"):
    """
    Save API results to a JSON file in a specified folder.

    Args:
        resultados: Data returned from the API (dict, list, or serializable object)
        output_folder (str): Path to output folder
        base_name (str): Base name for the output file

    Returns:
        str: Full path of the saved file
    """

    # 1. Crear carpeta si no existe
    os.makedirs(output_folder, exist_ok=True)

    # 2. Nombre dinámico del archivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{base_name}_{timestamp}.json"

    file_path = os.path.join(output_folder, filename)

    # 3. Convertir resultados a algo serializable
    try:
        serializable_data = json.loads(json.dumps(result, default=str))
    except Exception as e:
        raise ValueError(f"Error converting results to JSON-serializable format: {e}")

    # 4. Guardar como JSON
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(serializable_data, f, ensure_ascii=False, indent=2)

    print("Archivo guardado en:", file_path)
    return file_path
