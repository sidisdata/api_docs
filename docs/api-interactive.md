---
id: api-interactive
title: API Interactiva
sidebar_position: 3
---

# API Interactiva - Controlador Genérico

Esta documentación describe los endpoints CRUD del controlador genérico que maneja operaciones dinámicas sobre diferentes módulos de la aplicación.

## Endpoints Disponibles

Los siguientes endpoints están disponibles para interactuar con la API SIDIS:

## POST - Crear Registro

### Endpoint
```
POST /{module}
```

### Descripción
Crea un nuevo registro en el módulo especificado. Soporta subida de archivos, campos computados con plantillas ETA, y validaciones específicas por módulo.

### Parámetros de Path
- **module** (string, requerido): Nombre del módulo (ej: users, companies, people)

### Cuerpo de la Petición
```json
{
  "name": "Nombre del registro",
  "email": "email@example.com",
  "password": "password123",
  "customField": "valor"
}
```

### Respuesta de Ejemplo
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

## GET - Obtener Registros

### Endpoint
```
GET /{module}
```

### Descripción
Obtiene registros del módulo especificado con soporte para paginación, filtros, ordenamiento y población de referencias.

### Parámetros de Query
- **page** (number): Número de página (default: 1)
- **limit** (number): Registros por página (default: 10, max: 100)
- **sort** (string): Campo para ordenar (ej: "name", "-createdAt")
- **populate** (string): Campos a poblar (ej: "user,files")

### Respuesta de Ejemplo
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
}
```

## GET - Obtener Registro por ID

### Endpoint
```
GET /{module}/{id}
```

### Descripción
Obtiene un registro específico por su ID con posibilidad de poblar referencias.

### Parámetros de Path
- **module** (string, requerido): Nombre del módulo
- **id** (string, requerido): ID del registro

### Respuesta de Ejemplo
```json
{
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
}
```

## PUT - Actualizar Registro

### Endpoint
```
PUT /{module}/{id}
```

### Descripción
Actualiza completamente un registro existente.

### Parámetros de Path
- **module** (string, requerido): Nombre del módulo
- **id** (string, requerido): ID del registro a actualizar

### Cuerpo de la Petición
```json
{
  "name": "Nuevo nombre",
  "email": "nuevo@example.com",
  "customField": "nuevo valor"
}
```

### Respuesta de Ejemplo
```json
{
  "status": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nuevo nombre",
    "email": "nuevo@example.com",
    "customField": "nuevo valor",
    "updatedAt": "2023-10-27T11:00:00Z"
  },
  "error": false,
  "message": ""
}
```

## DELETE - Eliminar Registro

### Endpoint
```
DELETE /{module}/{id}
```

### Descripción
Elimina un registro específico por su ID.

### Parámetros de Path
- **module** (string, requerido): Nombre del módulo
- **id** (string, requerido): ID del registro a eliminar

### Respuesta de Ejemplo
```json
{
  "status": 200,
  "data": {
    "deleted": true,
    "deletedId": "507f1f77bcf86cd799439011"
  },
  "error": false,
  "message": "Registro eliminado exitosamente"
}
```

## Características Principales

- **CRUD Completo**: Operaciones Create, Read, Update, Delete
- **Dinámico**: Funciona con cualquier módulo configurado
- **Validación**: Validaciones específicas por módulo
- **Paginación**: Soporte completo para paginación
- **Filtros**: Capacidades avanzadas de filtrado
- **Archivos**: Soporte para subida y manejo de archivos
- **Referencias**: Población automática de referencias entre colecciones
- **Plantillas**: Campos computados con plantillas ETA
- **Seguridad**: Autenticación y autorización por roles
