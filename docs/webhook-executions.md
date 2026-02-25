# Documentación API - Webhook Execute

## Descripción General

La ruta `executeWebhook` es un endpoint especializado que recibe webhooks externos, los procesa internamente y los reenvía a servicios workflows externos basados en configuración dinámica.

## Endpoint

```
POST /webhooks/:id
```

## Parámetros

### Path Parameters
- **id** (string, requerido): Identificador único del webhook que se debe ejecutar

### Body
- **Cualquier estructura JSON**: El payload del webhook puede contener cualquier estructura de datos JSON válida

### Headers
- **Content-Type**: application/json (recomendado)
- **User-Agent**: Identificación del cliente (opcional)

## Flujo de Procesamiento

### 1. **Validación Inicial**
- Verifica que el webhook ID esté presente
- Captura información del request (IP, headers, body, timestamp)
- Genera un requestId único para tracking

### 2. **Carga de Configuración**
```typescript
const config = await getWebhookConfig("default");
```
- Obtiene configuración dinámica desde la base de datos
- Incluye baseUrl, timeout, maxRetries, statusCodes

### 3. **Registro de Ejecución**
- Crea un documento en la colección `WorkflowExecution`
- Estado inicial: `0` (processing)
- Almacena metadata completa del request

### 4. **Llamada Externa**
- Construye URL: `{config.baseUrl}/{webhookId}`
- Realiza POST con el payload original
- Timeout configurable
- Manejo de errores robusto

### 5. **Actualización de Estado**
- Actualiza el registro con la respuesta externa
- Extrae `execution.id` si existe en la respuesta
- Marca como completado o fallido

### 6. **Respuesta**
- Retorna información completa del procesamiento
- Incluye metadata de timing y estado

## Estructura de Configuración

```json
{
  "baseUrl": "https://webhook-processor.example.com",
  "timeout": 30000,
  "maxRetries": 3,
  "statusCodes": {
    "processing": 0,
    "success": 1,
    "failed": 2
  }
}
```

## Ejemplos de Uso

### Request Básico
```bash
curl -X POST "https://api.sidis.ai/webhooks/user-signup" \
  -H "Content-Type: application/json" \
  -H "User-Agent: External-Service/1.0" \
  -d '{
    "userId": "12345",
    "email": "user@example.com",
    "event": "signup",
    "metadata": {
      "source": "web",
      "campaign": "summer2024"
    }
  }'
```

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "executionId": "60f7b1c5e4b0c7a2d8f9e1a2",
  "webhookId": "user-signup",
  "processingTime": "1250ms",
  "config": {
    "baseUrl": "https://workflow.sidis.ai/webhook"
  },
  "externalCall": {
    "url": "https://workflow.sidis.ai/webhook/user-signup",
    "success": true,
    "status": 200,
    "statusText": "OK",
    "processingTime": "890ms",
    "responseHeaders": {
      "content-type": "application/json",
      "server": "nginx/1.18.0"
    },
    "responseBody": {
      "status": "processed",
      "execution": {
        "id": "wf_exec_789"
      },
      "message": "User signup workflow completed"
    },
    "error": null
  },
  "metadata": {
    "requestId": "webhook_user-signup_1640995200000",
    "timestamp": "2023-12-31T23:59:59.999Z",
    "clientIp": "192.168.1.100",
    "processingTimeMs": 1250
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Error processing webhook",
  "error": "Connect ECONNREFUSED 127.0.0.1:3000",
  "metadata": {
    "requestId": "webhook_user-signup_1640995200000",
    "timestamp": "2023-12-31T23:59:59.999Z",
    "processingTimeMs": 5000
  }
}
```

## Logging y Debugging

La función incluye logging detallado para debugging:

### Logs de Inicio
```
🚀 [WEBHOOK START] webhook_user-signup_1640995200000
📅 Timestamp: 2023-12-31T23:59:59.999Z
🌐 URL Called: POST /webhooks/user-signup
🔗 Webhook ID: user-signup
📍 Client IP: 192.168.1.100
```

### Logs de Procesamiento
```
⚙️ [WEBHOOK CONFIG] - Loading dynamic configuration...
✅ [WEBHOOK CONFIG] - Configuration loaded
💾 [WEBHOOK DB] - Getting WorkflowExecution model...
✅ [WEBHOOK EXECUTION] - Execution record created with ID: 60f7b1c5e4b0c7a2d8f9e1a2
```

### Logs de Llamada Externa
```
🌐 [WEBHOOK CALL] - Making POST to: https://workflow.sidis.ai/webhook/user-signup
✅ [WEBHOOK CALL] - External POST completed
📊 [WEBHOOK CALL] - Status: 200 OK
⏱️ [WEBHOOK CALL] - External call time: 890ms
```

### Logs de Finalización
```
🎉 [WEBHOOK SUCCESS] - Webhook processing completed successfully
⏱️ Total Processing Time: 1250ms
🏁 [WEBHOOK END] webhook_user-signup_1640995200000
```

## Casos de Error

### 1. **Webhook ID Faltante**
- **Status**: 400 Bad Request
- **Respuesta**: `{ "success": false, "message": "Webhook ID is required" }`

### 2. **Modelo No Disponible**
- **Status**: 500 Internal Server Error
- **Respuesta**: `{ "success": false, "message": "WorkflowExecution model not available" }`

### 3. **Error en Llamada Externa**
- **Status**: 200 OK (pero success: true/false según el caso)
- **La respuesta incluye detalles del error en `externalCall.error`**

### 4. **Timeout**
- Configurado via `config.timeout`
- Se registra como error en la llamada externa
- El webhook principal retorna éxito pero marca el external call como fallido

## Modelos de Base de Datos

### WorkflowExecution
```typescript
{
  workflowId: string,           // ID del webhook
  recordId: string,             // ID del registro (mismo que workflowId por defecto)
  model: "Webhook",            // Tipo de modelo
  executedAt: Date,            // Fecha de ejecución
  status: number,              // 0=processing, 1=success, 2=failed
  execution?: string,          // ID de ejecución externa (si está disponible)
  results: [{
    actionId: string,          // Identificador de la acción
    type: string,              // Tipo de acción
    result: {
      success: boolean,
      message: string,
      data: any,
      metadata?: any
    }
  }]
}
```

## Configuración del Sistema

Para que funcione correctamente necesitas:

1. **Configuración de Webhook**:
   ```javascript
   // En webhook.config.ts
   export const getWebhookConfig = async (profile: string) => {
     return {
       baseUrl: process.env.WEBHOOK_BASE_URL || "https://workflow.sidis.ai/webhook",
       timeout: 30000,
       maxRetries: 3,
       statusCodes: {
         processing: 0,
         success: 1,
         failed: 2
       }
     };
   };
   ```

2. **Modelo WorkflowExecution** configurado en la base de datos

3. **Servicio externo** que reciba los webhooks en `{baseUrl}/{webhookId}`

## Mejores Prácticas

### Para Implementación
- Usar IDs de webhook descriptivos y únicos
- Configurar timeouts apropiados para tu infraestructura
- Implementar retry logic en el servicio receptor
- Monitorear los logs para detectar problemas

### Para Debugging
- Cada request tiene un `requestId` único para tracking
- Los tiempos de procesamiento están disponibles en múltiples niveles
- Los logs incluyen toda la información necesaria para debugging
- Las respuestas de error incluyen stack traces cuando es apropiado

### Para Monitoreo
- Revisar los registros de `WorkflowExecution` para análisis de rendimiento
- Monitorear los timeouts y errores en las llamadas externas
- Implementar alertas basadas en los status codes en los logs

## Notas de Seguridad

- El endpoint no incluye autenticación por defecto
- Los headers y body del request se loggean completamente
- Las respuestas externas se almacenan en la base de datos
- Considera implementar rate limiting para prevenir abuse
- Valida y sanitiza los payloads según tus necesidades de seguridad