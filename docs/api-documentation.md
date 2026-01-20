# API CRUD Documentation - Generic Controller

Esta documentación describe los endpoints CRUD del controlador genérico que maneja operaciones dinámicas sobre diferentes módulos de la aplicación.

## Arquitectura General

La API utiliza un sistema de **módulos dinámicos** donde el nombre del módulo se extrae automáticamente de la URL. Por ejemplo:
- `/users` → módulo `User`
- `/companies` → módulo `Company`
- `/people` → módulo `People` (caso especial)

Todos los endpoints requieren autenticación mediante JWT en el header `Authorization: Bearer <token>`, excepto donde se indique lo contrario.

---

## 📝 POST - Crear Registro (postOne)

### Endpoint
```
POST /{module}
```

### Descripción
Crea un nuevo registro en el módulo especificado. Soporta subida de archivos, campos computados con plantillas ETA, y validaciones específicas por módulo.

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data  # Si incluye archivos
Content-Type: application/json     # Solo datos
```

### Características Principales

#### 1. Subida de Archivos
- Soporta múltiples archivos simultáneamente
- Los archivos se suben automáticamente a Google Cloud Storage
- Se generan URLs públicas que se almacenan en el campo `files`

#### 2. Campos Computados
- Campos que se calculan automáticamente usando plantillas ETA
- Soporta contadores automáticos con `$inc(identifier)`
- Configurados en la metadata del módulo

#### 3. Validaciones Automáticas
- **Encriptación de passwords**: Automática con bcrypt si existe el campo `password`
- **Campos de usuario**: Se añaden automáticamente `userId`, `userName`, `lastUserId`, `lastUserName`
- **Validaciones específicas**: Para módulos como `Segment`, `Webhook`

### Request Body
```json
{
  "name": "Nombre del registro",
  "email": "email@example.com",
  "password": "password123",  // Se encripta automáticamente
  "customField": "valor",
  // ... otros campos según el módulo
}
```

### Response Success (201)
```json
{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nombre del registro",
    "email": "email@example.com",
    "files": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "url": "https://storage.googleapis.com/bucket/file.jpg"
      }
    ],
    "userId": "507f1f77bcf86cd799439013",
    "userName": "John Doe",
    "createdAt": "2023-10-27T10:00:00Z",
    "updatedAt": "2023-10-27T10:00:00Z"
  },
  "error": false,
  "message": ""
}
```

### Response Error (400)
```json
{
  "status": 400,
  "data": [],
  "error": true,
  "message": "Error in computed field has no name"
}
```

### Casos Especiales por Módulo

#### Webhook
```json
{
  "event-data": {
    "recipient": "user@example.com",
    "event": "delivered"
  }
}
```
- Los datos de `event-data` se mueven al nivel raíz
- Se añade automáticamente `expireIn` (3 días) y `status: "active"`

#### Segment
```json
{
  "model": "User",
  "filter": { "age": { "$gte": 18 } },
  "type": "dynamic"
}
```
- Crea vista dinámica en MongoDB si `type != "aggregate"`
- Genera pipeline de agregación automáticamente

### Ejemplo de Uso

#### Con archivos (multipart/form-data)
```bash
curl -X POST "http://localhost:3000/users" \
  -H "Authorization: Bearer eyJ..." \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "file=@profile.jpg"
```

#### Solo datos (application/json)
```bash
curl -X POST "http://localhost:3000/users" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

---

## 📝 POST - Creación Masiva (postAll)

### Endpoint
```
POST /{module}/bulk
```

### Descripción
Crea múltiples registros simultáneamente en el módulo especificado. Utiliza `insertMany` de MongoDB para operaciones eficientes en lote.

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
Array de objetos con los datos de los registros a crear:

```json
[
  {
    "name": "Segmento Marketing",
    "description": "Segmento para campañas de marketing",
    "status": "active",
    "filter": {
      "condition": "$and",
      "rules": [
        {
          "field": "email",
          "operator": "$eq",
          "value": "user@example.com"
        }
      ]
    },
    "expireIn": "2024-12-31T23:59:59.999Z",
    "type": "marketing",
    "project": {
      "name": "$name",
      "lastName": "$lastName",
      "email": "$email",
      "vat": "$vat"
    },
    "module": "Lead",
    "model": "People"
  },
  {
    "name": "Segmento Ventas",
    "description": "Segmento para equipo de ventas",
    "status": "inactive",
    "filter": {
      "condition": "$or",
      "rules": [
        {
          "field": "score",
          "operator": "$gte",
          "value": 80
        }
      ]
    },
    "type": "sales",
    "module": "Lead",
    "model": "People"
  }
]
```

### Características Principales
- **Inserción masiva**: Utiliza `insertMany` para alta eficiencia
- **Validación automática**: Aplica las mismas validaciones que POST individual
- **Transaccional**: Si un registro falla, se detiene la operación
- **Auditoría**: Registra la operación completa en los logs

### Response Success (200)
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "6912202f957eabd669612bed",
      "name": "Segmento Marketing",
      "description": "Segmento para campañas de marketing",
      "status": "active",
      "filter": {
        "condition": "$and",
        "rules": [
          {
            "field": "email",
            "operator": "$eq",
            "value": "user@example.com"
          }
        ]
      },
      "expireIn": "2024-12-31T23:59:59.999Z",
      "type": "marketing",
      "project": {
        "name": "$name",
        "lastName": "$lastName",
        "email": "$email",
        "vat": "$vat"
      },
      "module": "Lead",
      "model": "People",
      "createdAt": "2025-11-10T17:26:07.269Z",
      "updatedAt": "2025-11-10T17:26:07.269Z",
      "__v": 0,
      "id": "6912202f957eabd669612bed"
    },
    {
      "_id": "6912202f957eabd669612bee",
      "name": "Segmento Ventas",
      "description": "Segmento para equipo de ventas",
      "status": "inactive",
      "filter": {
        "condition": "$or",
        "rules": [
          {
            "field": "score",
            "operator": "$gte",
            "value": 80
          }
        ]
      },
      "type": "sales",
      "module": "Lead",
      "model": "People",
      "createdAt": "2025-11-10T17:26:07.269Z",
      "updatedAt": "2025-11-10T17:26:07.269Z",
      "__v": 0,
      "id": "6912202f957eabd669612bee"
    }
  ],
  "error": false,
  "msg": ""
}
```

### Response Error (400)
```json
{
  "statusCode": 400,
  "data": [],
  "error": true,
  "msg": "Validation error: Email is required"
}
```

### Casos Especiales por Módulo

#### Segmentos (Segments)
```json
[
  {
    "name": "Segmento A",
    "model": "People",
    "filter": {
      "condition": "$and",
      "rules": [
        {
          "field": "age",
          "operator": "$gte",
          "value": 18
        }
      ]
    },
    "project": {
      "name": "$name",
      "email": "$email"
    },
    "type": "dynamic"
  }
]
```
- Cada segmento creará su vista dinámica correspondiente en MongoDB
- Se generarán pipelines de agregación automáticamente
- Se asignará `expireIn` automático si no se especifica

#### Usuarios (Users)
```json
[
  {
    "name": "Usuario 1",
    "email": "user1@example.com",
    "password": "password123",
    "rolName": "admin"
  },
  {
    "name": "Usuario 2", 
    "email": "user2@example.com",
    "password": "password456",
    "rolName": "user"
  }
]
```
- Los passwords se encriptan automáticamente con bcrypt
- Se asigna `roleId` automáticamente basado en `rolName`
- Se generan códigos QR para 2FA automáticamente

### Ventajas de Creación Masiva
1. **Rendimiento**: Hasta 10x más rápido que múltiples POST individuales
2. **Transaccional**: Garantiza consistencia de datos
3. **Menos overhead**: Una sola conexión a base de datos
4. **Logging consolidado**: Un solo registro de auditoría por operación

### Limitaciones
- **Tamaño máximo**: Recomendado máximo 1000 registros por request
- **Memoria**: Procesa todo el array en memoria
- **Fallo total**: Si un registro falla, toda la operación se revierte
- **Sin archivos**: No soporta upload de archivos (usar POST individual)

### Ejemplo de Uso

#### Creación masiva de segmentos
```bash
curl -X POST "http://localhost:3000/segments/bulk" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Segmento Jóvenes",
      "filter": {"condition":"$and","rules":[{"field":"age","operator":"$lt","value":30}]},
      "model": "People",
      "type": "marketing"
    },
    {
      "name": "Segmento Seniors", 
      "filter": {"condition":"$and","rules":[{"field":"age","operator":"$gte","value":60}]},
      "model": "People",
      "type": "marketing"
    }
  ]'
```

#### Creación masiva de usuarios
```bash
curl -X POST "http://localhost:3000/users/bulk" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Admin User",
      "email": "admin@company.com",
      "password": "secure123",
      "rolName": "admin"
    },
    {
      "name": "Regular User",
      "email": "user@company.com", 
      "password": "user123",
      "rolName": "user"
    }
  ]'
```

### Mejores Prácticas
1. **Validar antes**: Verificar datos localmente antes del envío
2. **Lotes pequeños**: Usar máximo 100-500 registros por request
3. **Manejo de errores**: Implementar retry logic para fallos temporales
4. **Monitoring**: Supervisar tiempo de respuesta y memoria
5. **Backup**: Hacer backup antes de operaciones masivas importantes

---

## 📋 GET - Listar Registros (getAll)

### Endpoint
```
GET /{module}
```

### Descripción
Obtiene una lista paginada de registros con soporte para filtros, agregaciones, permisos CASL y exportación.

### Query Parameters
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `limit` | number | Máximo de registros (default: 1000) | `?limit=50` |
| `skip` | number | Registros a omitir (default: 0) | `?skip=100` |
| `aggregate` | string | Pipeline de agregación MongoDB (JSON) | `?aggregate=[{"$match":{"age":{"$gte":18}}}]` |
| `export` | boolean | Iniciar exportación en background | `?export=true&format=csv` |
| `format` | string | Formato de exportación (json/csv) | `?format=csv` |
| `download` | boolean | Descargar archivo directamente | `?download=true` |

### Sistema de Permisos (CASL)
- Aplica automáticamente filtros basados en el rol del usuario
- Campos accesibles determinados por permisos del rol
- Retorna error 403 si no tiene permisos

### Agregaciones Dinámicas
Soporta pipelines complejos de MongoDB:
```json
[
  { "$match": { "status": "active" } },
  { "$group": { "_id": "$category", "count": { "$sum": 1 } } },
  { "$sort": { "count": -1 } }
]
```

### Response Success (200)
```json
{
  "status": 200,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-10-27T10:00:00Z"
    }
  ],
  "error": false,
  "message": "",
  "total": 0,
  "count": 1
}
```

### Exportación
Cuando `export=true`:
- Inicia proceso en background
- Retorna confirmación inmediata
- El archivo se genera asincrónicamente
- Envía email de notificación al completar

```json
{
  "status": 200,
  "data": { "module": "users" },
  "error": false,
  "message": "Export Started"
}
```

### Ejemplo de Uso
```bash
# Listar con paginación
curl "http://localhost:3000/users?limit=10&skip=0" \
  -H "Authorization: Bearer eyJ..."

# Con agregación
curl "http://localhost:3000/users?aggregate=[{\"$match\":{\"status\":\"active\"}}]" \
  -H "Authorization: Bearer eyJ..."

# Exportar a CSV
curl "http://localhost:3000/users?export=true&format=csv&name=usuarios_activos" \
  -H "Authorization: Bearer eyJ..."
```

---

## 🔍 GET - Obtener Registro Individual (getOne)

### Endpoint
```
GET /{module}/{id}
```

### Descripción
Obtiene un registro específico por su ID, con soporte para agregaciones y descarga directa.

### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | string | ObjectId del registro |

### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `aggregate` | string | Pipeline de agregación |
| `export` | boolean | Exportar este registro |
| `download` | boolean | Descargar archivo asociado |

### Response Success (200)
```json
{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "files": [
      {
        "url": "https://storage.googleapis.com/bucket/file.jpg"
      }
    ],
    "createdAt": "2023-10-27T10:00:00Z",
    "updatedAt": "2023-10-27T10:00:00Z"
  },
  "error": false,
  "message": ""
}
```

### Características Especiales
- **Seguridad**: El campo `password` se elimina automáticamente de la respuesta
- **Descarga directa**: Si `download=true` y el registro tiene `url`, descarga el archivo
- **Agregaciones**: Aplica el pipeline y añade automáticamente match por ID

### Ejemplo de Uso
```bash
# Obtener registro simple
curl "http://localhost:3000/users/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJ..."

# Con agregación
curl "http://localhost:3000/users/507f1f77bcf86cd799439011?aggregate=[{\"$lookup\":{\"from\":\"roles\",\"localField\":\"roleId\",\"foreignField\":\"_id\",\"as\":\"role\"}}]" \
  -H "Authorization: Bearer eyJ..."

# Descargar archivo asociado
curl "http://localhost:3000/files/507f1f77bcf86cd799439011?download=true" \
  -H "Authorization: Bearer eyJ..."
```

---

## ✏️ PUT - Actualizar Registros

### 1. PUT Individual (updateOne)

#### Endpoint
```
PUT /{module}/{id}
```

#### Descripción
Actualiza un registro específico por su ID.

#### Request Body
```json
{
  "name": "Nuevo nombre",
  "email": "nuevo@email.com",
  "status": "active"
}
```

#### Características Especiales
- **Encriptación automática**: Si incluye `password`, se encripta con bcrypt
- **Campos de auditoría**: Actualiza automáticamente `lastUserId` y `lastUserName`
- **Campos protegidos**: Ignora `createdAt` y `updatedAt`
- **Segmentos**: Si es módulo `Segment`, recrea la vista dinámica

#### Response Success (200)
```json
{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nuevo nombre",
    "lastUserId": "507f1f77bcf86cd799439013",
    "lastUserName": "Admin User",
    "updatedAt": "2023-10-27T11:00:00Z"
  },
  "error": false,
  "message": ""
}
```

### 2. PUT Masivo por Claves (updateAll)

#### Endpoint
```
PUT /{module}?keys=field1,field2&newEnt=true
```

#### Descripción
Actualiza múltiples registros basándose en claves de identificación únicas.

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `keys` | string | Campos clave separados por coma |
| `newEnt` | boolean | Crear si no existe (upsert) |
| `push` | string | Campos a agregar a arrays |

#### Request Body
```json
[
  {
    "email": "user1@example.com",
    "name": "Updated User 1",
    "age": 25
  },
  {
    "email": "user2@example.com", 
    "name": "Updated User 2",
    "age": 30
  }
]
```

#### Funcionamiento
1. Usa los campos en `keys` para identificar registros existentes
2. Si `newEnt=true`, crea registros que no existan
3. Si especifica `push`, agrega elementos a arrays en lugar de reemplazar

### 3. PUT por IDs (updateMany)

#### Endpoint
```
PUT /{module}/bulk
```

#### Request Body
```json
{
  "ids": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ],
  "data": {
    "status": "active",
    "updatedBy": "admin"
  }
}
```

#### Descripción
Actualiza múltiples registros específicos por sus IDs con los mismos datos.

### Ejemplo de Uso
```bash
# Actualización individual
curl -X PUT "http://localhost:3000/users/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo Nombre","status":"active"}'

# Actualización masiva por email
curl -X PUT "http://localhost:3000/users?keys=email&newEnt=true" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '[{"email":"user1@test.com","name":"User One"}]'

# Actualización por IDs
curl -X PUT "http://localhost:3000/users/bulk" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"ids":["507f...","508f..."],"data":{"status":"inactive"}}'
```

---

## 🗑️ DELETE - Eliminar Registros

### 1. DELETE Individual (deleteOne)

#### Endpoint
```
DELETE /{module}/{id}
```

#### Descripción
Elimina un registro específico por su ID.

#### Response Success (200)
```json
{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Registro eliminado",
    // ... datos del registro eliminado
  },
  "error": false,
  "message": ""
}
```

#### Características Especiales
- **Segmentos**: Si es módulo `Segment`, también elimina la colección/vista dinámica
- **Auditoría**: Registra la eliminación en el historial de logs

### 2. DELETE Masivo (deleteMany)

#### Endpoint  
```
PUT /{module}/delete
```

#### Request Body
```json
[
  "507f1f77bcf86cd799439011",
  "507f1f77bcf86cd799439012",
  "507f1f77bcf86cd799439013"
]
```

#### Descripción
Elimina múltiples registros por sus IDs.

#### Response Success (200)
```json
{
  "status": 200,
  "data": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012", 
    "507f1f77bcf86cd799439013"
  ],
  "error": true,
  "message": "success"
}
```

### Ejemplo de Uso
```bash
# Eliminar individual
curl -X DELETE "http://localhost:3000/users/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJ..."

# Eliminar múltiples
curl -X PUT "http://localhost:3000/users/delete" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '["507f1f77bcf86cd799439011","507f1f77bcf86cd799439012"]'
```

---

## 📁 Endpoints de Importación

### 1. Subir Archivo de Importación (importFile)

#### Endpoint
```
PUT /{module}/upload
PUT /{module}/files  
```

#### Descripción
Sube un archivo (CSV/Excel) al servidor para posterior procesamiento.

#### Request (multipart/form-data)
```http
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <archivo.csv>
importId: <id_opcional>
```

#### Response Success (200)
```json
{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "url": "/mnt/sidisbanking/crm/imports/507f1f77bcf86cd799439011.csv",
    "createdAt": "2023-10-27T10:00:00Z",
    "updatedAt": "2023-10-27T10:00:00Z"
  },
  "error": false
}
```

### 2. Procesar Datos de Importación (importData)

#### Endpoint
```
PUT /{module}/file?config=<importId>&format=<csv|xlsx>&keys=field1,field2
```

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `config` | string | ID de configuración de mapeo |
| `format` | string | Formato del archivo (csv/xlsx) |
| `keys` | string | Campos clave para upsert |

#### Descripción
Procesa el archivo subido y mapea los campos según la configuración.

#### Proceso
1. Lee el archivo CSV/Excel del servidor
2. Aplica mapeo de campos según configuración
3. Ejecuta upsert masivo en la base de datos
4. Retorna estadísticas de importación

### 3. Importación FTP (importFTP)

#### Endpoint
```
PUT /{module}/ftp
```

#### Request Body (multipart/form-data)
```http
file: <archivo>
host: ftp.example.com
user: usuario
password: contraseña
```

#### Descripción
Sube un archivo directamente a un servidor FTP externo.

### Ejemplo de Uso
```bash
# Subir archivo
curl -X PUT "http://localhost:3000/users/upload" \
  -H "Authorization: Bearer eyJ..." \
  -F "file=@users.csv"

# Procesar importación  
curl -X PUT "http://localhost:3000/users/file?config=507f...&format=csv&keys=email" \
  -H "Authorization: Bearer eyJ..." \
  -F "file=@users.csv"

# Subir a FTP
curl -X PUT "http://localhost:3000/users/ftp" \
  -H "Authorization: Bearer eyJ..." \
  -F "file=@backup.csv" \
  -F "host=ftp.example.com" \
  -F "user=ftpuser" \
  -F "password=secret"
```

---

## 📊 Endpoints de Exportación

### 1. Exportación Masiva (exportAll)

#### Endpoint
```
GET /{module}/export?aggregate=<pipeline>&fields=<campos>&format=<formato>
```

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `aggregate` | string | Pipeline de filtros |
| `fields` | string | Campos a incluir |
| `format` | string | Formato (json/csv) |

#### Descripción
Exporta grandes volúmenes de datos en background con paginación automática.

#### Proceso
1. Procesa datos en lotes de 1000 registros
2. Genera archivo progresivamente
3. Actualiza progreso en tiempo real
4. Envía notificación email al completar

### 2. Descargar Archivo (download)

#### Endpoint
```
GET /{module}/download?url=<ruta_archivo>
```

#### Descripción
Descarga directa de archivos generados por exportaciones.

### Ejemplo de Uso
```bash
# Exportar usuarios activos a CSV
curl "http://localhost:3000/users/export?aggregate=[{\"$match\":{\"status\":\"active\"}}]&format=csv" \
  -H "Authorization: Bearer eyJ..."

# Descargar archivo
curl "http://localhost:3000/users/download?url=/path/to/export.csv" \
  -H "Authorization: Bearer eyJ..."
```

---

## 🔐 Sistema de Autenticación y Permisos

### JWT Token
Todos los endpoints (excepto algunos GET públicos) requieren JWT:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles y Permisos CASL
- **Filtrado automático**: Los datos se filtran según permisos del rol
- **Campos accesibles**: Solo campos permitidos en respuestas
- **Operaciones**: Create, Read, Update, Delete controladas por rol

### Casos Especiales
- **Token de desarrollo**: Existe un token hardcoded para testing
- **Descarga pública**: `?download=true` permite acceso sin token
- **Usuarios anónimos**: Rol "anonymous" para usuarios no autenticados

---

## 📝 Logging y Auditoría

### Historia de Cambios
Todos los endpoints registran automáticamente:
- **Datos modificados**: Antes y después del cambio
- **Usuario**: Quién realizó la acción
- **Timestamp**: Cuándo ocurrió
- **Acción**: POST, PUT, DELETE, GET
- **Módulo**: En qué entidad

### Modelo de Log
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "data": { /* datos del registro */ },
  "filter": "507f1f77bcf86cd799439011",
  "action": "PUT", 
  "module": "User",
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Admin User"
  },
  "createdAt": "2023-10-27T10:00:00Z"
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP
- **200**: Operación exitosa
- **201**: Registro creado
- **400**: Error de validación o datos inválidos
- **401**: Token no válido o faltante
- **403**: Sin permisos para la operación
- **500**: Error interno del servidor

### Formato de Respuesta de Error
```json
{
  "status": 400,
  "data": [],
  "error": true, 
  "message": "Descripción detallada del error"
}
```

### Errores Comunes
- **"no Token"**: Falta header Authorization
- **"Invalid Token"**: JWT malformado o expirado
- **"ForbiddenError"**: Sin permisos CASL para la operación
- **"Error in computed field has no name"**: Campo computado mal configurado

---

## 🚀 Ejemplos de Integración

### JavaScript/Axios
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Crear usuario
const newUser = await api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123'
});

// Listar con filtros
const users = await api.get('/users', {
  params: {
    limit: 10,
    aggregate: JSON.stringify([
      { $match: { status: 'active' } }
    ])
  }
});

// Actualizar
const updated = await api.put(`/users/${userId}`, {
  name: 'Jane Doe',
  status: 'inactive'
});

// Eliminar
await api.delete(`/users/${userId}`);
```

### cURL Scripts
```bash
#!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
BASE_URL="http://localhost:3000"

# Crear registro
curl -X POST "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Listar con paginación
curl "$BASE_URL/users?limit=5&skip=0" \
  -H "Authorization: Bearer $TOKEN"

# Exportar datos
curl "$BASE_URL/users?export=true&format=csv" \
  -H "Authorization: Bearer $TOKEN"
```

---

Esta documentación cubre todos los aspectos principales de la API CRUD. Para casos específicos o módulos particulares, consulta la configuración del módulo correspondiente o contacta al equipo de desarrollo.