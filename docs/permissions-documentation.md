---
id: permissions-documentation
title: Documentación de Permisos
sidebar_position: 4
---

# 🔐 Documentación de Permisos SIDIS API

## 📋 Índice

- [Introducción](#introducción)
- [Estructura de Roles](#estructura-de-roles)
- [Tipos de Acciones](#tipos-de-acciones)
- [Permisos a Nivel de Campos](#permisos-a-nivel-de-campos)
- [Ejemplos de Configuración](#ejemplos-de-configuración)
- [Casos de Uso Avanzados](#casos-de-uso-avanzados)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

El sistema SIDIS API utiliza **CASL (Conditional Access Subscription Language)** para manejo granular de permisos. Esto permite control fino sobre:

- **Qué puede hacer** cada usuario (create, read, update, delete)
- **En qué módulos/recursos** puede hacerlo (People, Payments, etc.)
- **Qué campos específicos** puede ver o editar
- **Bajo qué condiciones** puede acceder (filtros dinámicos)

---

## 🏗️ Estructura de Roles

### Esquema Base de un Rol

```json
{
  "_id": "...",
  "name": "role_name",
  "permissions": [
    {
      "action": ["read", "create", "update"],
      "subject": ["People"],
      "fields": {
        "read": ["name", "email", "phone", "id"],
        "create": ["name", "email", "phone"],
        "update": ["name", "phone"]
      },
      "condition": {
        "userId": "{{_id}}"
      },
      "aggregation": {
        "userId": "{{_id}}"
      },
      "inverted": false
    }
  ]
}
```

### Propiedades de Permisos

| Propiedad | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `action` | Array | Acciones permitidas | ✅ |
| `subject` | Array | Módulos/recursos afectados | ✅ |
| `fields` | Object/Array | Campos específicos por acción | ❌ |
| `condition` | Object | Condiciones para READ/UPDATE/DELETE | ❌ |
| `aggregation` | Object | Filtros para agregaciones | ❌ |
| `inverted` | Boolean | Si es una regla de negación | ❌ |

---

## 🎭 Tipos de Acciones

### Acciones Básicas

```json
{
  "action": ["manage"]  // Acceso total (incluye todo)
}
```

```json
{
  "action": ["read"]    // Solo lectura
}
```

```json
{
  "action": ["create"]  // Solo creación
}
```

```json
{
  "action": ["update"]  // Solo actualización
}
```

```json
{
  "action": ["delete"]  // Solo eliminación
}
```

### Acciones Especiales

```json
{
  "action": ["softDelete"]  // Eliminación lógica
}
```

### Combinaciones

```json
{
  "action": ["read", "create", "update"]  // Múltiples acciones
}
```

---

## 🔍 Permisos a Nivel de Campos

### Formato por Acción (Recomendado)

Permite **diferentes campos para cada operación**:

```json
{
  "action": ["read", "create", "update"],
  "subject": ["People"],
  "fields": {
    "read": ["name", "email", "phone", "id", "createdAt"],
    "create": ["name", "email", "phone"],
    "update": ["name", "phone"]
  }
}
```

**Resultado:**
- **GET** `/people` → Solo retorna: `name`, `email`, `phone`, `id`, `createdAt`
- **POST** `/people` → Solo acepta: `name`, `email`, `phone`
- **PATCH** `/people/:id` → Solo acepta: `name`, `phone`

### Formato Unified (Alternativo)

**Mismos campos para todas las operaciones**:

```json
{
  "action": ["read", "create", "update"],
  "subject": ["People"],
  "fields": ["name", "email", "phone"]
}
```

### Campos Excluidos

Use el prefijo `!` para **excluir campos específicos**:

```json
{
  "action": ["read"],
  "subject": ["User"],
  "fields": ["!password", "!secretKey"]
}
```

### Mapeo de Campos Especiales

| Campo en Permiso | Campo en MongoDB | Descripción |
|-------------------|------------------|-------------|  
| `id` | `_id` | ID del documento |
| `!password` | `password: 0` | Excluir contraseña |
| `createdAt` | `createdAt` | Fecha de creación |

---

## 📝 Ejemplos de Configuración

### 👑 Administrador Total

```json
{
  "name": "super_admin",
  "permissions": [
    {
      "action": ["manage"],
      "subject": ["all"]
    }
  ]
}
```

### 👀 Solo Lectura

```json
{
  "name": "viewer",
  "permissions": [
    {
      "action": ["read"],
      "subject": ["People", "Payments"],
      "fields": {
        "read": ["name", "email", "amount", "status"]
      }
    }
  ]
}
```

### ✏️ Editor de Personas

```json
{
  "name": "people_editor",
  "permissions": [
    {
      "action": ["read", "create", "update"],
      "subject": ["People"],
      "fields": {
        "read": ["name", "email", "phone", "address", "id"],
        "create": ["name", "email", "phone"],
        "update": ["name", "phone", "address"]
      }
    }
  ]
}
```

### 🔒 Usuario con Restricciones

Solo puede ver/editar sus propios registros:

```json
{
  "name": "self_only",
  "permissions": [
    {
      "action": ["read", "update"],
      "subject": ["People"],
      "condition": {
        "userId": "{{_id}}"
      },
      "aggregation": {
        "userId": "{{_id}}"
      },
      "fields": {
        "read": ["name", "email", "phone"],
        "update": ["name", "phone"]
      }
    }
  ]
}
```

### 🚫 Rol con Prohibiciones

```json
{
  "name": "restricted_user",
  "permissions": [
    {
      "action": ["read"],
      "subject": ["all"]
    },
    {
      "action": ["delete"],
      "subject": ["People", "Payments"],
      "inverted": true  // Prohibir eliminación
    }
  ]
}
```

---

## 🚀 Casos de Uso Avanzados

### 🏢 Roles Organizacionales

**Gerente de Sucursal** - Solo ve datos de su oficina:

```json
{
  "name": "branch_manager",
  "permissions": [
    {
      "action": ["read", "create", "update"],
      "subject": ["People"],
      "condition": {
        "officeId": "{{officeId}}"
      },
      "aggregation": {
        "officeId": "{{officeId}}"
      },
      "fields": {
        "read": ["name", "email", "phone", "stage", "officeId"],
        "create": ["name", "email", "phone"],
        "update": ["stage", "phone"]
      }
    }
  ]
}
```

### 💰 Roles de Finanzas

**Contador** - Acceso total a pagos, solo lectura en personas:

```json
{
  "name": "accountant",
  "permissions": [
    {
      "action": ["manage"],
      "subject": ["Payments"]
    },
    {
      "action": ["read"],
      "subject": ["People"],
      "fields": {
        "read": ["name", "email", "id"]
      }
    },
    {
      "action": ["delete"],
      "subject": ["Payments"],
      "inverted": true
    }
  ]
}
```

### 🛡️ Roles de Seguridad

**Auditor** - Solo lectura a logs y usuarios (sin contraseñas):

```json
{
  "name": "auditor",
  "permissions": [
    {
      "action": ["read"],
      "subject": ["Historylog", "User", "Session"],
      "fields": {
        "read": ["!password", "!secretKey"]
      }
    }
  ]
}
```

---

## ✅ Mejores Prácticas

### 🎯 Principio de Menor Privilegio

```json
// ❌ Evitar permisos muy amplios
{
  "action": ["manage"],
  "subject": ["all"]
}

// ✅ Ser específico
{
  "action": ["read", "update"],
  "subject": ["People"],
  "fields": {
    "read": ["name", "email"],
    "update": ["phone"]
  }
}
```

### 📊 Organización de Roles

1. **Roles Base**: admin, user, viewer
2. **Roles Departamentales**: sales, finance, hr
3. **Roles Específicos**: people_editor, payment_processor

### 🔄 Orden de Permisos

Los permisos se evalúan en orden, coloque **más específicos primero**:

```json
{
  "permissions": [
    // Específico primero
    {
      "action": ["read"],
      "subject": ["People"],
      "fields": {"read": ["name"]}
    },
    // General después  
    {
      "action": ["manage"], 
      "subject": ["all"]
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Problema: "No field restrictions found"

**Causa**: Permiso `manage` + `all` sobrescribe otros permisos

```json
// ❌ Problemático
{
  "permissions": [
    {"action": ["manage"], "subject": ["all"]},  // ← Esto override todo
    {"action": ["read"], "subject": ["People"], "fields": [...]}
  ]
}

// ✅ Solución
{
  "permissions": [
    {"action": ["read"], "subject": ["People"], "fields": [...]},
    {"action": ["manage"], "subject": ["Payments"]}  // Solo específico
  ]
}
```

### Problema: Campos no se filtran

**Verificar**:
1. Formato de `fields` correcto
2. Nombres de campos coinciden con schema
3. Orden de permisos en el rol

### Problema: Usuario no puede crear/editar

**Debug**:
```json
// Verificar que tenga permisos específicos
{
  "action": ["create", "update"],  // ← Incluir acción específica
  "subject": ["People"], 
  "fields": {
    "create": ["name", "email"],
    "update": ["name"]
  }
}
```

### Variables de Template

Use `{{variable}}` para datos dinámicos del usuario:

```json
{
  "condition": {
    "userId": "{{_id}}",         // ID del usuario actual
    "officeId": "{{officeId}}",  // Oficina del usuario
    "roleId": "{{roleId}}"       // Rol del usuario
  }
}
```

---

## 🔗 Referencias Técnicas

### Logging de Debug

Para debuggear permisos, revisar logs del servidor:

```
🐛 [defineAbility] Processing role permissions: administrator
🐛 [people] Accessible fields for READ: ["name", "email", "phone", "id"]
✅ [people] Added field inclusion projection: {name: 1, email: 1, phone: 1, _id: 1}
```

### Endpoints Afectados

- **GET** `/module/` → Filtrado de campos en lectura
- **POST** `/module/` → Validación de campos en creación  
- **PATCH** `/module/:id` → Validación de campos en actualización
- **DELETE** `/module/:id` → Control de eliminación

### Implementación Técnica

- **CASL**: Librería de autorización
- **MongoDB Projections**: Para filtrar campos en BD
- **Field Validation**: En controladores genéricos
- **Role-Based**: Sistema basado en roles

---

**✨ Con esta configuración tienes control total sobre qué puede hacer cada usuario en tu API SIDIS!**