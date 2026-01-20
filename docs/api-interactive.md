---
id: api-interactive
title: API Interactiva
sidebar_position: 3
---

import { ApiConfigProvider } from '@site/src/components/ApiConfig.js';
import ApiConfig from '@site/src/components/ApiConfig.js';
import ApiEndpoint from '@site/src/components/ApiEndpoint.js';

<ApiConfigProvider>

# API Interactiva - Controlador Genérico

Esta documentación te permite probar la API de SIDIS de forma interactiva, similar a Swagger UI. Configura tu URL base y token JWT una vez, y luego prueba todos los endpoints directamente desde aquí.

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
  responseExample={`{
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
}`}
/>

## GET - Obtener Todos los Registros (getAll)

<ApiEndpoint
  method="GET"
  endpoint="/{module}"
  title="Obtener Registros"
  description="Obtiene registros del módulo especificado con soporte para paginación, filtros, ordenamiento y población de referencias."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo a consultar"
    }
  ]}
  queryParams={[
    {
      name: "page",
      description: "Número de página (default: 1)",
      example: "1"
    },
    {
      name: "limit",
      description: "Registros por página (default: 10, max: 100)",
      example: "10"
    },
    {
      name: "sort",
      description: "Campo para ordenar (ej: 'name', '-createdAt')",
      example: "name"
    },
    {
      name: "populate",
      description: "Campos a poblar (ej: 'user,files')",
      example: "user"
    },
    {
      name: "search",
      description: "Término de búsqueda",
      example: "john"
    }
  ]}
  responseExample={`{
  "status": 200,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-10-27T10:00:00Z"
    }
  ],
  "pagination": {
    "totalDocs": 1,
    "limit": 10,
    "totalPages": 1,
    "page": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "error": false,
  "message": ""
}`}
/>

## GET - Obtener Registro por ID (getOne)

<ApiEndpoint
  method="GET"
  endpoint="/{module}/{id}"
  title="Obtener Registro por ID"
  description="Obtiene un registro específico por su ID con posibilidad de poblar referencias."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    },
    {
      name: "id",
      required: true,
      description: "ID del registro"
    }
  ]}
  queryParams={[
    {
      name: "populate",
      description: "Campos a poblar (ej: 'user,files')",
      example: "user"
    }
  ]}
  responseExample={`{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "files": [],
    "createdAt": "2023-10-27T10:00:00Z",
    "updatedAt": "2023-10-27T10:00:00Z"
  },
  "error": false,
  "message": ""
}`}
/>

## PUT - Actualizar Registro Completo (updateOne)

<ApiEndpoint
  method="PUT"
  endpoint="/{module}/{id}"
  title="Actualizar Registro Completo"
  description="Actualiza completamente un registro existente. Reemplaza todos los campos."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    },
    {
      name: "id",
      required: true,
      description: "ID del registro a actualizar"
    }
  ]}
  requestBody={`{
  "name": "Nuevo nombre",
  "email": "nuevo@example.com",
  "customField": "nuevo valor"
}`}
  responseExample={`{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nuevo nombre",
    "email": "nuevo@example.com",
    "customField": "nuevo valor",
    "lastUserId": "507f1f77bcf86cd799439013",
    "lastUserName": "John Doe",
    "updatedAt": "2023-10-27T11:00:00Z"
  },
  "error": false,
  "message": ""
}`}
/>

## PATCH - Actualizar Parcialmente (updatePartial)

<ApiEndpoint
  method="PATCH"
  endpoint="/{module}/{id}"
  title="Actualizar Parcialmente"
  description="Actualiza solo los campos específicos de un registro existente."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo"
    },
    {
      name: "id",
      required: true,
      description: "ID del registro a actualizar"
    }
  ]}
  requestBody={`{
  "name": "Solo actualizo el nombre"
}`}
  responseExample={`{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Solo actualizo el nombre",
    "email": "email@example.com",
    "lastUserId": "507f1f77bcf86cd799439013",
    "lastUserName": "John Doe",
    "updatedAt": "2023-10-27T11:00:00Z"
  },
  "error": false,
  "message": ""
}`}
/>

## DELETE - Eliminar Registro (deleteOne)

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
      description: "ID del registro a eliminar"
    }
  ]}
  responseExample={`{
  "status": 200,
  "data": {
    "deleted": true,
    "deletedId": "507f1f77bcf86cd799439011"
  },
  "error": false,
  "message": "Registro eliminado exitosamente"
}`}
/>

## POST - Exportar Datos (export)

<ApiEndpoint
  method="POST"
  endpoint="/{module}/export"
  title="Exportar Datos"
  description="Exporta registros en formato CSV o JSON con filtros personalizados."
  pathParams={[
    {
      name: "module",
      required: true,
      description: "Nombre del módulo a exportar"
    }
  ]}
  queryParams={[
    {
      name: "format",
      description: "Formato de exportación (json/csv)",
      example: "csv"
    }
  ]}
  requestBody={`{
  "filters": {
    "createdAt": {
      "$gte": "2023-01-01",
      "$lte": "2023-12-31"
    }
  },
  "fields": ["name", "email", "createdAt"]
}`}
  responseExample={`{
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
  "message": "Exportación completada exitosamente"
}`}
/>

## Características Principales

### 🔧 Configuración Interactiva
- **URL Base configurable**: Prueba contra diferentes entornos
- **Autenticación JWT**: Configura tu token una vez para todos los endpoints
- **Persistencia**: La configuración se mantiene mientras navegas

### 🚀 Funcionalidad Avanzada
- **CRUD Completo**: Operaciones Create, Read, Update, Delete
- **Dinámico**: Funciona con cualquier módulo configurado
- **Validación**: Validaciones específicas por módulo
- **Paginación**: Soporte completo para paginación y filtros
- **Archivos**: Soporte para subida y manejo de archivos
- **Referencias**: Población automática de referencias entre colecciones
- **Plantillas**: Campos computados con plantillas ETA
- **Exportación**: CSV y JSON con filtros personalizados

### 📱 Interface Intuitiva
- **Pruebas en vivo**: Ejecuta llamadas reales a tu API
- **Generación de cURL**: Copia comandos para usar en terminal
- **Respuestas reales**: Ve las respuestas de tu API en tiempo real
- **Editor JSON**: Interface amigable para request bodies
- **Parámetros dinámicos**: Path y query parameters configurables

</ApiConfigProvider>
