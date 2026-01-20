# API Authentication Documentation

Esta documentación describe todos los endpoints de autenticación disponibles en el sistema SIDIS.

## Base URL
```
/auth
```

---

## 🔑 Autenticación Principal

### 1. Login Estándar

#### Endpoint
```
POST /auth/login
```

#### Descripción
Autentica un usuario con email y contraseña, retornando JWT y refresh token.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Validaciones
- **Email**: Obligatorio, formato email válido
- **Password**: Obligatorio, no puede estar vacío

#### Response Success (200)
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "roleId": "507f1f77bcf86cd799439012",
    // ... otros campos del usuario (sin password)
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response Error (400)
```json
{
  "msg": "user/password are incorrect"
}
```

#### Response Error (500)
```json
{
  "msg": "Something wrong"
}
```

#### Proceso Interno
1. Verifica que el email exista en la base de datos
2. Compara la contraseña usando bcrypt
3. Genera JWT y refresh token
4. Crea una sesión en la base de datos
5. Elimina el campo password de la respuesta

### 2. Login Active Directory

#### Endpoint
```
POST /auth/login/ac
```

#### Descripción
Autentica un usuario contra Active Directory usando LDAP, con fallback a autenticación local.

#### Request Body
```json
{
  "email": "user@corp.banvendes",
  "password": "password123"
}
```

#### Configuración LDAP
- **Servidor**: `ldap://180.183.112.244:389`
- **DN Format**: `CN={username},dc=corp,dc=Banvendes`

#### Response
Mismo formato que el login estándar.

#### Proceso
1. Verifica usuario en base de datos local
2. Intenta autenticación LDAP contra Active Directory
3. Si falla LDAP, usa autenticación local como fallback
4. Genera tokens y crea sesión

---

## 🔄 Gestión de Tokens

### 3. Renovar Token

#### Endpoint
```
POST /auth/token
```

#### Descripción
Renueva un JWT usando el refresh token.

#### Request Body
```json
{
  "email": "user@example.com",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response Success (200)
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response Error
```json
{
  "error": true,
  "msg": "Invalid refreshToken"
}
```

### 4. Validar Token por Query

#### Endpoint
```
GET /auth/token?tk={token}
```

#### Descripción
Valida un JWT pasado como query parameter y retorna información del usuario.

#### Query Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `tk` | string | JWT token a validar |

#### Token de Desarrollo
Existe un token hardcoded para desarrollo:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhZGFhYWFhYWFhYWFhYWFhYWFhYWFhYWEiLCJpYXQiOjE2ODU0NjEyOTYsImV4cCI6MTY4NTQ3NTY5Nn0.fMFQ4LsV6faMP44hJXDXhBltCST8GKzPncE2DpJLY3k
```

#### Response Success (200)
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Logout / Revocar Token

#### Endpoint
```
DELETE /auth/token/reject
```

#### Descripción
Revoca un refresh token, efectivamente cerrando la sesión.

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response Success (200)
```json
{
  "error": false,
  "data": [],
  "msg": "Session Logout"
}
```

#### Response Error
```json
{
  "error": true,
  "data": [],
  "msg": "No session found"
}
```

---

## 👤 Registro de Usuarios

### 6. Registro

#### Endpoint
```
POST /auth/register
```

#### Descripción
Registra un nuevo usuario en el sistema con generación automática de códigos 2FA.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "rolName": "user" // opcional - nombre del rol
}
```

#### Validaciones
- **Email único**: No puede existir otro usuario con el mismo email
- **Password**: Se encripta automáticamente con bcrypt
- **Rol**: Si se especifica `rolName`, busca el rol por nombre y asigna `roleId`

#### Response Success (200)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "roleId": "507f1f77bcf86cd799439012",
  "qr": "<img src=data:image/png;base64,iVBOR... >",
  "secret": "JBSWY3DPEHPK3PXP",
  "createdAt": "2023-10-27T10:00:00Z",
  "updatedAt": "2023-10-27T10:00:00Z"
}
```

#### Response Error (400)
```json
{
  "email": "Correo already registerd"
}
```

#### Características Automáticas
- **Encriptación de password** con bcrypt
- **Generación de QR** para 2FA (TOTP)
- **Secret base32** para autenticador
- **Asignación de rol** por nombre

---

## 🛡️ Autenticación de Dos Factores (2FA)

### 7. Generar QR para 2FA

#### Endpoint
```
GET /auth/qr
```

#### Descripción
Genera un nuevo código QR y secret para configurar 2FA en aplicaciones como Google Authenticator.

#### Response (200)
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "url": "<img src=data:image/png;base64,iVBOR... >"
}
```

#### Uso
1. El usuario escanea el QR con su app de autenticación
2. La app genera códigos TOTP basados en el secret
3. El usuario puede usar estos códigos para verificación

### 8. Verificar Código 2FA

#### Endpoint
```
POST /auth/verify
```

#### Descripción
Verifica un código TOTP y genera códigos de backup de un solo uso.

#### Request Body
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

#### Response Success (200)
```json
{
  "verified": true,
  "secretCodes": [
    "A1B2C3",
    "D4E5F6",
    "G7H8I9",
    // ... 7 códigos más (total 10)
  ]
}
```

#### Proceso
1. Verifica el código TOTP usando el secret del usuario
2. Si es la primera verificación exitosa:
   - Genera 10 códigos de backup aleatorios
   - Los encripta y almacena en `user.secretCodes`
   - Activa 2FA en el usuario (`2af: true`)
3. Retorna los códigos de backup en texto plano (solo esta vez)

#### Códigos de Backup
- **Cantidad**: 10 códigos de 6 caracteres alfanuméricos
- **Uso único**: Se eliminan después de usarse
- **Encriptados**: Se almacenan con bcrypt en la base de datos

### 9. Login con Código de Backup

#### Endpoint
```
POST /auth/code
```

#### Descripción
Permite login usando uno de los códigos de backup de un solo uso.

#### Request Body
```json
{
  "email": "user@example.com",
  "code": "A1B2C3"
}
```

#### Response Success (200)
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Proceso
1. Busca el usuario por email
2. Compara el código con todos los códigos de backup almacenados
3. Si encuentra coincidencia:
   - Elimina ese código del array (uso único)
   - Actualiza el usuario sin ese código
   - Genera JWT y refresh token
   - Crea sesión

### 10. Generar QR para Todos los Usuarios

#### Endpoint
```
GET /auth/generateQrAll
POST /auth/generateQr
```

#### Descripción
**Función administrativa** que genera códigos QR y secrets para todos los usuarios existentes.

#### Response (200)
```json
{
  "generated": true
}
```

#### Uso
- **GET**: Regenera QR para todos los usuarios automáticamente
- **POST**: Mismo comportamiento con método POST
- Útil para migración masiva o reconfiguración de 2FA

---

## 🔐 Gestión de Permisos

### 11. Obtener Permisos del Usuario

#### Endpoint
```
GET /auth/permissions
```

#### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "email": "user@example.com",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Descripción
Valida la sesión del usuario y retorna un nuevo token junto con la información del usuario.

#### Response Success (200)
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "roleId": "507f1f77bcf86cd799439012"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔧 Configuración y Utilidades

### Configuración JWT
Los tokens JWT se configuran usando:
- **Secret Key**: Variable de entorno `SECRETKEY`
- **Algoritmo**: HS256
- **Payload**: Contiene `uid` (user ID) o `id`

### Configuración LDAP/Active Directory
- **URL**: `ldap://180.183.112.244:389`
- **Base DN**: `dc=corp,dc=Banvendes`
- **Formato Usuario**: `CN={username},dc=corp,dc=Banvendes`

### Modelos de Base de Datos

#### User Model (campos relacionados con auth)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,     // único
  password: String,  // encriptado con bcrypt
  roleId: ObjectId,
  secret: String,    // secret base32 para TOTP
  qr: String,        // HTML img tag con QR
  secretCodes: [String], // códigos de backup encriptados
  "2af": Boolean     // 2FA activado
}
```

#### Session Model
```javascript
{
  _id: ObjectId,
  refreshToken: String,
  userId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📋 Flujos de Autenticación Típicos

### Flujo de Login Estándar
1. **POST /auth/login** con email/password
2. Recibir JWT y refresh token
3. Usar JWT en header `Authorization: Bearer {token}` para requests
4. Cuando JWT expire, usar **POST /auth/token** con refresh token
5. Para logout: **DELETE /auth/token/reject**

### Flujo de Registro + 2FA
1. **POST /auth/register** - Crea usuario y genera QR
2. Usuario escanea QR en app de autenticación
3. **POST /auth/verify** con código TOTP - Activa 2FA y genera códigos backup
4. Guardar códigos de backup de forma segura
5. Login normal + código TOTP o código backup si es necesario

### Flujo de Active Directory
1. **POST /auth/login/ac** - Intenta LDAP primero
2. Si LDAP falla, fallback a autenticación local
3. Resto del flujo igual que login estándar

---

## 🚨 Consideraciones de Seguridad

### Tokens
- **JWT**: Contienen información del usuario, verificar siempre
- **Refresh Token**: Más larga duración, revocar en logout
- **Token de desarrollo**: Solo usar en entornos de desarrollo

### Passwords
- **Encriptación**: bcrypt con salt automático
- **No se retornan**: Campo password eliminado de respuestas

### 2FA
- **Códigos backup**: Uso único, eliminar después de usar
- **Secret**: Base32, único por usuario
- **TOTP**: Compatible con Google Authenticator, Authy, etc.

### Active Directory
- **Conexión segura**: Configurar SSL/TLS en producción
- **Credenciales**: No almacenar passwords de AD localmente
- **Fallback**: Siempre tener opción de autenticación local

---

## 📝 Ejemplos de Uso

### JavaScript/Axios
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, refreshToken, user } = response.data;
  
  // Guardar tokens
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  
  return { token, user };
};

// Configurar interceptor para renovar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      const email = localStorage.getItem('userEmail');
      
      try {
        const response = await api.post('/auth/token', { email, refreshToken });
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Reintentar request original
        error.config.headers.Authorization = `Bearer ${token}`;
        return api.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Logout
const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  await api.delete('/auth/token/reject', { data: { refreshToken } });
  
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
};
```

### cURL Examples
```bash
#!/bin/bash

# Login
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Renovar token
curl -X POST "http://localhost:3000/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","refreshToken":"eyJ..."}'

# Verificar 2FA
curl -X POST "http://localhost:3000/auth/verify" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","token":"123456"}'

# Logout
curl -X DELETE "http://localhost:3000/auth/token/reject" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJ..."}'

# Login con código backup
curl -X POST "http://localhost:3000/auth/code" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"A1B2C3"}'
```

---

## ⚠️ Códigos de Error Comunes

| Código | Mensaje | Causa | Solución |
|--------|---------|-------|----------|
| 400 | "user/password are incorrect" | Credenciales inválidas | Verificar email y password |
| 400 | "Correo already registerd" | Email ya existe | Usar email diferente |
| 401 | "no Token" | Falta header Authorization | Añadir token JWT |
| 401 | "Invalid Token" | JWT malformado/expirado | Renovar con refresh token |
| 400 | "Invalid refreshToken" | Refresh token inválido | Login nuevamente |
| 500 | "Something wrong" | Error interno | Revisar logs del servidor |

Esta documentación cubre todos los endpoints de autenticación disponibles en el sistema SIDIS. Para más detalles sobre implementación específica, consulta el código fuente o contacta al equipo de desarrollo.