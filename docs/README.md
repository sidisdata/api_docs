# Documentación Interactiva SIDIS API

Esta es una documentación interactiva de tu API construida con **Docusaurus** que permite probar los endpoints directamente desde el navegador, similar a **Swagger UI**.

## Características

- **Pruebas en vivo**: Ejecuta llamadas reales a tu API desde la documentación
- **Configuración global**: Define la URL base y token JWT una vez para todos los endpoints
- **Generación de cURL**: Copia comandos cURL para usar en terminal
- **Soporte para temas**: Light/Dark mode automático
- **Responsive**: Funciona perfecto en desktop y mobile
- **Parámetros dinámicos**: Path y query parameters configurables
- **Request bodies**: Editor JSON para POST/PUT requests
- **Respuestas reales**: Muestra las respuestas de tu API en tiempo real

## Instalación y Configuración

### 1. Ejecutar el script de configuración

**En Windows (PowerShell):**
```powershell
./setup-docs.ps1
```

**En Linux/Mac:**
```bash
chmod +x setup-docs.sh
./setup-docs.sh
```

### 2. Iniciar el servidor de desarrollo

```bash
cd docs
npm start
```

Esto abrirá la documentación en `http://localhost:3000`

## Cómo Usar

### 1. Configurar la API Base
1. Ve a la página "API Interactive"
2. Configura tu URL base (ej: `http://localhost:3000`)
3. Añade tu token JWT si es necesario
4. Guarda la configuración

### 2. Probar Endpoints
1. Selecciona cualquier endpoint
2. Llena los parámetros requeridos
3. Modifica el request body si es necesario
4. Click en "Execute [METHOD]"
5. Ve la respuesta en tiempo real

### 3. Copiar como cURL
- Click en "Copy as cURL" en cualquier endpoint
- El comando completo se copiará al clipboard
- Úsalo en terminal o en tus scripts

## Estructura de Archivos

```
docs/
├── components/
│   ├── ApiEndpoint.jsx          # Componente principal para endpoints
│   ├── ApiEndpoint.module.css   # Estilos del componente
│   ├── ApiConfig.jsx            # Configuración global
│   └── ApiConfig.module.css     # Estilos de configuración
├── src/
│   └── css/
│       └── custom.css           # Estilos globales personalizados
├── static/
│   └── img/                     # Imágenes y logos
├── api-documentation.md         # Documentación estática original
├── API_INTERACTIVE.md           # Documentación interactiva
├── auth-api-documentation.md    # Documentación de autenticación
├── intro.md                     # Página de introducción
├── docusaurus.config.js         # Configuración de Docusaurus
├── sidebars.js                  # Configuración del sidebar
└── package.json                 # Dependencias del proyecto
```

## Personalización

### Cambiar Colores del Theme
Edita `src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #tu-color-principal;
  --ifm-color-primary-dark: #tu-color-oscuro;
  /* ... más variables */
}
```

### Añadir Nuevos Endpoints
Edita `API_INTERACTIVE.md` y añade:

```jsx
<ApiEndpoint
  method="POST"
  endpoint="/tu-nuevo-endpoint"
  title="Tu Título"
  description="Descripción del endpoint"
  requestBody='{"ejemplo": "json"}'
  responseExample={{
    "status": 200,
    "data": "ejemplo"
  }}
/>
```

### Configurar CORS en tu API
Para que funcione desde el navegador, asegúrate de tener CORS habilitado:

```javascript
// Express.js ejemplo
app.use(cors({
  origin: ['http://localhost:3000', 'https://tu-docs-domain.com'],
  credentials: true
}));
```

## Deploy en Producción

### Build para Producción
```bash
cd docs
npm run build
```

### Deploy en Netlify
1. Connecta tu repositorio a Netlify
2. Build command: `cd docs && npm run build`
3. Publish directory: `docs/build`

### Deploy en Vercel
```bash
cd docs
npm install -g vercel
vercel --prod
```

### Deploy en GitHub Pages
```bash
cd docs
npm run deploy
```

## Scripts Disponibles

En el directorio `docs/`:

- `npm start` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run serve` - Preview del build
- `npm run clear` - Limpiar cache
- `npm run deploy` - Deploy a GitHub Pages

## Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para detalles.

## Troubleshooting

### Error de CORS
Si ves errores de CORS, asegúrate de que tu API tenga configurado:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Componentes no se cargan
Asegúrate de que todos los archivos estén en las rutas correctas:
- `components/` debe estar en el directorio `docs/`
- Los archivos `.module.css` deben tener exactamente ese nombre

### Token JWT no funciona
- Verifica que el token no tenga el prefijo 'Bearer '
- Comprueba que el token no haya expirado
- Revisa los logs de tu API para ver si llega correctamente

## Soporte

Si tienes problemas o preguntas, puedes:
- Abrir un issue en GitHub
- Revisar la [documentación de Docusaurus](https://docusaurus.io/)
- Consultar los logs del navegador (F12 -> Console)

Happy documenting!