# 🔧 Configuración del Proyecto Smart Wardrobe

## 📋 Variables de Entorno

Este proyecto requiere configurar variables de entorno para funcionar correctamente.

### 1. Crear archivo de configuración

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

### 2. Configurar Firebase

Edita el archivo `.env` y reemplaza los valores de Firebase con los de tu proyecto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

**¿Dónde encontrar estas credenciales?**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto** (⚙️)
4. En la pestaña **General**, busca la sección **Tus apps**
5. Selecciona tu app web y copia la configuración

### 3. Configurar OpenWeather API (Opcional)

Para obtener datos meteorológicos reales:

```env
# Weather API Configuration
VITE_OPENWEATHER_API_KEY=tu_openweather_api_key
```

**¿Cómo obtener la API key?**

1. Ve a [OpenWeatherMap](https://openweathermap.org/api)
2. Crea una cuenta gratuita
3. Ve a **API keys** en tu perfil
4. Copia tu API key

> **Nota:** Si no configuras la API key de OpenWeather, la app usará datos meteorológicos simulados.

## 🚀 Instalación y Ejecución

### Frontend (React + Vite)

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### Backend (Python API)

```bash
# Ir al directorio de la API
cd python-api

# Configuración automática
python setup.py

# Ejecutar la API
python run.py
```

## 🔒 Seguridad

- ✅ Las credenciales están en `.env` (ignorado por Git)
- ✅ Se incluye `.env.example` como plantilla
- ✅ Validación automática de variables requeridas
- ⚠️ **NUNCA** subas el archivo `.env` al repositorio

## 🆘 Solución de Problemas

### Error: "Missing required environment variables"

1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Asegúrate de que todas las variables estén configuradas
3. Reinicia el servidor de desarrollo

### Error de Firebase

1. Verifica que las credenciales de Firebase sean correctas
2. Asegúrate de que el proyecto de Firebase esté activo
3. Revisa las reglas de Firestore y Storage

### Error de OpenWeather

1. Verifica que la API key sea válida
2. Asegúrate de que la API key esté activada (puede tomar unas horas)
3. Si no funciona, la app usará datos simulados automáticamente
