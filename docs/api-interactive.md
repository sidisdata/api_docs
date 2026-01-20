# API Interactiva - Controlador Genérico

import { ApiConfigProvider } from '@site/src/components/ApiConfig.js';
import ApiConfig from '@site/src/components/ApiConfig.js';
import ApiEndpoint from '@site/src/components/ApiEndpoint.js';

<ApiConfigProvider>

Esta documentación describe los endpoints CRUD del controlador genérico que maneja operaciones dinámicas sobre diferentes módulos de la aplicación.

<ApiConfig />

## Endpoints Disponibles

Todos los endpoints siguientes utilizarán automáticamente la configuración que estableciste arriba. Puedes probar cada endpoint directamente desde esta documentación.

## POST - Crear Registro (postOne)

<ApiEndpoint
  method="POST"
  endpoint="/{module}"
  title="Crear Registro"
  description="Crea un nuevo registro en el módulo especificado. Soporta subida de archivos, campos computados con plantillas ETA, y validaciones específicas por módulo."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo (ej: users, companies, people)"
    }
  ]}
  requestBody={`{
  "name": "Nombre del registro",
  "email": "email@example.com",
  "password": "password123",
  "customField": "valor"
}`}
  responseExample={{
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
  }}
/>

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

---

## POST - Creación Masiva (postAll)

<ApiEndpoint
  method="POST"
  endpoint="/{module}/bulk"
  title="Creación Masiva"
  description="Crea múltiples registros simultáneamente en el módulo especificado. Utiliza insertMany de MongoDB para operaciones eficientes en lote."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo (ej: users, segments, companies)"
    }
  ]}
  requestBody={`[
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
    "module": "Lead",
    "model": "People"
  },
  {
    "name": "Segmento Ventas",
    "description": "Segmento para equipo de ventas",
    "status": "inactive",
    "type": "sales",
    "module": "Lead",
    "model": "People"
  }
]`}
  responseExample={{
    "statusCode": 200,
    "data": [
      {
        "_id": "6912202f957eabd669612bed",
        "name": "Segmento Marketing",
        "description": "Segmento para campañas de marketing",
        "status": "active",
        "createdAt": "2025-11-10T17:26:07.269Z",
        "updatedAt": "2025-11-10T17:26:07.269Z"
      }
    ],
    "error": false,
    "msg": ""
  }}
/>

---

## GET - Listar Registros (getAll)

<ApiEndpoint
  method="GET"
  endpoint="/{module}"
  title="Listar Registros"
  description="Obtiene una lista paginada de registros con soporte para filtros, agregaciones, permisos CASL y exportación."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo (ej: users, companies, people)"
    }
  ]}
  queryParams={[
    {
      name: "limit",
      description: "Máximo de registros (default: 1000)",
      example: "50"
    },
    {
      name: "skip",
      description: "Registros a omitir (default: 0)",
      example: "100"
    },
    {
      name: "aggregate",
      description: "Pipeline de agregación MongoDB (JSON)",
      example: '[{"$match":{"age":{"$gte":18}}}]'
    },
    {
      name: "export",
      description: "Iniciar exportación en background",
      example: "true"
    },
    {
      name: "format",
      description: "Formato de exportación (json/csv)",
      example: "csv"
    }
  ]}
  responseExample={{
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
  }}
/>

---

## GET - Obtener Registro Individual (getOne)

<ApiEndpoint
  method="GET"
  endpoint="/{module}/{id}"
  title="Obtener Registro Individual"
  description="Obtiene un registro específico por su ID, con soporte para agregaciones y descarga directa."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    },
    {
      name: "id",
      required: true,
      description: "ObjectId del registro"
    }
  ]}
  queryParams={[
    {
      name: "aggregate",
      description: "Pipeline de agregación",
      example: '[{"$lookup":{"from":"roles","localField":"roleId","foreignField":"_id","as":"role"}}]'
    },
    {
      name: "export",
      description: "Exportar este registro",
      example: "true"
    },
    {
      name: "download",
      description: "Descargar archivo asociado",
      example: "true"
    }
  ]}
  responseExample={{
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
  }}
/>

---

## PUT - Actualizar Registro Individual

<ApiEndpoint
  method="PUT"
  endpoint="/{module}/{id}"
  title="Actualizar Registro"
  description="Actualiza un registro específico por su ID."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    },
    {
      name: "id",
      required: true,
      description: "ObjectId del registro a actualizar"
    }
  ]}
  requestBody={`{
  "name": "Nuevo nombre",
  "email": "nuevo@email.com",
  "status": "active"
}`}
  responseExample={{
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
  }}
/>

---

## PUT - Actualización Masiva por Claves

<ApiEndpoint
  method="PUT"
  endpoint="/{module}"
  title="Actualización Masiva"
  description="Actualiza múltiples registros basándose en claves de identificación únicas."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    }
  ]}
  queryParams={[
    {
      name: "keys",
      description: "Campos clave separados por coma",
      example: "email,vat"
    },
    {
      name: "newEnt",
      description: "Crear si no existe (upsert)",
      example: "true"
    },
    {
      name: "push",
      description: "Campos a agregar a arrays",
      example: "tags,categories"
    }
  ]}
  requestBody={`[
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
]`}
  responseExample={{
    "status": 200,
    "data": "Bulk update completed",
    "error": false,
    "message": "2 records updated"
  }}
/>

---

## PUT - Actualización por IDs

<ApiEndpoint
  method="PUT"
  endpoint="/{module}/bulk"
  title="Actualizar por IDs"
  description="Actualiza múltiples registros específicos por sus IDs con los mismos datos."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    }
  ]}
  requestBody={`{
  "ids": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ],
  "data": {
    "status": "active",
    "updatedBy": "admin"
  }
}`}
  responseExample={{
    "status": 200,
    "data": "Bulk update completed",
    "error": false,
    "message": "2 records updated successfully"
  }}
/>

---

## DELETE - Eliminar Registro Individual

<ApiEndpoint
  method="DELETE"
  endpoint="/{module}/{id}"
  title="Eliminar Registro"
  description="Elimina un registro específico por su ID."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    },
    {
      name: "id",
      required: true,
      description: "ObjectId del registro a eliminar"
    }
  ]}
  responseExample={{
    "status": 200,
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Registro eliminado"
    },
    "error": false,
    "message": ""
  }}
/>

---

## DELETE - Eliminación Masiva

<ApiEndpoint
  method="PUT"
  endpoint="/{module}/delete"
  title="Eliminación Masiva"
  description="Elimina múltiples registros por sus IDs."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    }
  ]}
  requestBody={`[
  "507f1f77bcf86cd799439011",
  "507f1f77bcf86cd799439012",
  "507f1f77bcf86cd799439013"
]`}
  responseExample={{
    "status": 200,
    "data": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012", 
      "507f1f77bcf86cd799439013"
    ],
    "error": false,
    "message": "success"
  }}
/>

---

## Endpoints de Importación

### Subir Archivo de Importación

<ApiEndpoint
  method="PUT"
  endpoint="/{module}/upload"
  title="Subir Archivo"
  description="Sube un archivo (CSV/Excel) al servidor para posterior procesamiento."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    }
  ]}
  headers={{
    "Content-Type": "multipart/form-data"
  }}
  responseExample={{
    "status": 200,
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "url": "/mnt/sidisbanking/crm/imports/507f1f77bcf86cd799439011.csv",
      "createdAt": "2023-10-27T10:00:00Z",
      "updatedAt": "2023-10-27T10:00:00Z"
    },
    "error": false
  }}
/>

### Procesar Importación

<ApiEndpoint
  method="PUT"
  endpoint="/{module}/file"
  title="Procesar Importación"
  description="Procesa el archivo subido y mapea los campos según la configuración."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    }
  ]}
  queryParams={[
    {
      name: "config",
      description: "ID de configuración de mapeo",
      example: "507f1f77bcf86cd799439011"
    },
    {
      name: "format",
      description: "Formato del archivo (csv/xlsx)",
      example: "csv"
    },
    {
      name: "keys",
      description: "Campos clave para upsert",
      example: "email,vat"
    }
  ]}
  responseExample={{
    "status": 200,
    "data": "Import completed",
    "error": false,
    "message": "1500 records processed successfully"
  }}
/>

---

## Endpoints de Exportación

### Exportación Masiva

<ApiEndpoint
  method="GET"
  endpoint="/{module}/export"
  title="Exportar Datos"
  description="Exporta grandes volúmenes de datos en background con paginación automática."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    }
  ]}
  queryParams={[
    {
      name: "aggregate",
      description: "Pipeline de filtros",
      example: '[{"$match":{"status":"active"}}]'
    },
    {
      name: "fields",
      description: "Campos a incluir",
      example: "name,email,createdAt"
    },
    {
      name: "format",
      description: "Formato (json/csv)",
      example: "csv"
    }
  ]}
  responseExample={{
    "status": 200,
    "data": { "module": "users" },
    "error": false,
    "message": "Export Started"
  }}
/>

### Descargar Archivo

<ApiEndpoint
  method="GET"
  endpoint="/{module}/download"
  title="Descargar Archivo"
  description="Descarga directa de archivos generados por exportaciones."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    }
  ]}
  queryParams={[
    {
      name: "url",
      description: "Ruta del archivo a descargar",
      example: "/path/to/export.csv"
    }
  ]}
/>

---

## Sistema de Autenticación y Permisos

### JWT Token
Todos los endpoints (excepto algunos GET públicos) requieren JWT en el header `Authorization: Bearer <token>`.

### Roles y Permisos CASL
- **Filtrado automático**: Los datos se filtran según permisos del rol
- **Campos accesibles**: Solo campos permitidos en respuestas  
- **Operaciones**: Create, Read, Update, Delete controladas por rol

---

## Manejo de Errores

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

</ApiConfigProvider>