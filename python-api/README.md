# 🤖 Smart Wardrobe AI - API de Clasificación

API local con FastAPI para clasificar prendas de vestir usando un modelo Vision Transformer (ViT).

## 🚀 Inicio Rápido

### 1. Configuración Automática
```bash
cd python-api
python setup.py
```

### 2. Ejecutar API
```bash
# Windows
venv\Scripts\python run.py

# Linux/Mac
venv/bin/python run.py
```

### 3. Probar
- **Interfaz web**: http://localhost:8000
- **API docs**: http://localhost:8000/docs
- **Script de prueba**: `python test_api.py`

## 🔗 Integración con Frontend

### Configuración CORS
La API está configurada para aceptar conexiones desde:
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)

### Endpoint Principal
```bash
POST /predict
Content-Type: multipart/form-data
Body: file (imagen)
```

### Respuesta de la API
```json
{
  "predicciones": [
    {
      "clase": "jeans",
      "confianza": 0.819,
      "nombre": "Jeans",
      "categoria": "inferior",
      "climas": ["entretiempo", "calor"]
    }
  ],
  "mejor_prediccion": { ... },
  "predicciones_clima": [
    {
      "clima": "entretiempo",
      "confianza": 0.996
    }
  ],
  "mejor_clima": { ... }
}
```

## 📁 Estructura de Archivos

```
python-api/
├── main.py              # API principal
├── run.py               # Script de ejecución
├── setup.py             # Configuración automática
├── requirements.txt     # Dependencias
└── README.md           # Esta documentación

Archivos requeridos (en carpeta padre):
├── vit_clothes_prediction.pth  # Modelo entrenado
└── climate.json               # Mapeo de climas
```

## 🎯 Funcionalidades

### Clasificación de Prendas
- **56 tipos diferentes** de prendas
- **Confianza de predicción** (0-100%)
- **Mapeo automático** a categorías y climas

### Información por Prenda
- 🏷️ **Nombre** en español
- 📂 **Categoría** (superior, inferior, calzado, etc.)
- 🌤️ **Climas apropiados** (calor, frío, lluvia, etc.)
- 📊 **Nivel de confianza**

## 🔌 Endpoints de la API

### `POST /predict`
Clasifica una imagen de prenda.

**Request:**
```bash
curl -X POST "http://localhost:8000/predict" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@imagen.jpg"
```

**Response:**
```json
{
  "predicciones": [
    {
      "clase": "t_shirt",
      "confianza": 0.95,
      "nombre": "Camiseta",
      "categoria": "superior",
      "climas": ["calor", "entretiempo"]
    }
  ],
  "mejor_prediccion": {
    "clase": "t_shirt",
    "confianza": 0.95,
    "nombre": "Camiseta",
    "categoria": "superior",
    "climas": ["calor", "entretiempo"]
  }
}
```

### `GET /health`
Verifica el estado de la API.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes_available": 56
}
```

## 🧪 Interfaz de Prueba

La API incluye una interfaz web simple en `http://localhost:8000` que permite:

- 📤 **Subir imágenes** arrastrando o seleccionando
- 👀 **Ver preview** de la imagen
- 🎯 **Resultados detallados** con confianza y climas
- 📊 **Top 3 predicciones** ordenadas por confianza

## 🔧 Solución de Problemas

### Error: "No se encuentra vit_clothes_prediction.pth"
- Asegúrate de que el archivo esté en la carpeta padre
- Verifica que el nombre sea exacto

### Error: "CUDA out of memory"
- El modelo se ejecuta en CPU por defecto
- Para GPU, modifica `map_location='cpu'` por `map_location='cuda'`

### Error: "Module not found"
- Ejecuta `python setup.py` para instalar dependencias
- Activa el entorno virtual antes de ejecutar

### Predicciones incorrectas
- Verifica que la imagen sea clara y bien iluminada
- Asegúrate de que la prenda ocupe la mayor parte de la imagen
- Prueba con diferentes ángulos

## 📊 Tipos de Prendas Soportadas

El modelo puede clasificar 56 tipos diferentes de prendas, incluyendo:

- **Superiores**: Camisetas, blusas, suéteres, chaquetas, etc.
- **Inferiores**: Pantalones, faldas, shorts, etc.
- **Calzado**: Zapatos, botas, sandalias, etc.
- **Accesorios**: Sombreros, bufandas, etc.

## 🌤️ Climas Soportados

- **calor**: Para días calurosos
- **frio**: Para días fríos
- **lluvia**: Para días lluviosos
- **entretiempo**: Para clima templado
- **nieve**: Para días con nieve

## 🚀 Próximos Pasos

Una vez que confirmes que el modelo funciona correctamente:

1. **Integración con React**: Conectar la API con el frontend
2. **Optimización**: Mejorar velocidad de predicción
3. **Deployment**: Opciones para producción (Vercel, Railway, etc.)

## 📞 Soporte

Si tienes problemas:

1. Verifica que todos los archivos estén en su lugar
2. Revisa los logs en la consola
3. Prueba con imágenes diferentes
4. Verifica que las dependencias estén instaladas

La API está diseñada para ser robusta y manejar errores graciosamente.
