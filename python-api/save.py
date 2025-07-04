from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import ViTModel, ViTImageProcessor
from PIL import Image
import json
import io
import logging
from typing import Dict, Any
import numpy as np
from sklearn.cluster import KMeans
import cv2
from collections import Counter
import colorsys

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(" Iniciando App Smart Wardrobe AI...")
    load_model()
    yield
    # Shutdown
    logger.info("Cerrando Smart Wardrobe AI...")


# ========== Configuración FastAPI ==========
app = FastAPI(
    title="Smart Wardrobe AI",
    description="API para clasificación de prendas de vestir",
    lifespan=lifespan
)

# Configurar CORS para permitir conexiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========== Se carga la arquitectura con la que se entrenó el modelo ==========
class ViTMultiTask(nn.Module):
    def __init__(self, num_categories, num_climates):
        super().__init__()
        self.backbone = ViTModel.from_pretrained("google/vit-base-patch16-224")
        hidden = self.backbone.config.hidden_size
        self.category_head = nn.Linear(hidden, num_categories)
        self.climate_head = nn.Linear(hidden, num_climates)

    def forward(self, x):
        out = self.backbone(pixel_values=x)
        pooled = out.pooler_output
        return self.category_head(pooled), self.climate_head(pooled)



# Variables globales para el modelo
model = None
processor = None
climate_data = None
class_names = None
classes = None
climate2idx = None
climates_matrix = None
category_map = None
nombre_map = None

RUTA_MODEL = 'C:/Users/diego/OneDrive/Documentos/USM/Vision Computer/Proyecto/SmartWardrove/AppSmartWardrove/smart-wardrobe/vit_clothes_prediction.pth'
def load_model():
    global model, processor, climate_data, class_names, classes, climate2idx, climates_matrix, category_map, nombre_map

    try:
        logger.info("🤖 Cargando modelo custom...")

        # Cargar checkpoint
        checkpoint = torch.load(RUTA_MODEL, map_location='cpu')

        # Extraer información del checkpoint
        classes = checkpoint['classes'] # Lista de clases de prendas
        class2idx = checkpoint['class2idx'] # Lista de clases de prendas
        climate2idx = checkpoint['climate2idx'] # Diccionario de climas (clima: índice)
        climates_matrix = checkpoint['climates'] # Matriz de climas (categorías x climas)
        category_map = checkpoint["category_map"] #Categorías de prendas como diccionario (superior, inferior, calzado)
        nombre_map = checkpoint["nombre_map"] #Nombre en español de las prendas
      

        logger.info(f"📊 Categorías: {len(classes)}\n")
        logger.info(f"classes: {classes}\n\n")
        logger.info(f"class2idx: {class2idx}")
        logger.info(f"🌤️ Climas: {len(climate2idx)}\n")
        logger.info(f"📊 Categorías: {climate2idx}\n")
        logger.info(f"cantidadcategory_map: {len(category_map)}\n")
        logger.info(f"category_map: {category_map}\n")
        logger.info(f"cantidad nombre_map: {len(nombre_map)}\n")
        logger.info(f"nombre_map: {nombre_map}\n")
        logger.info(f"climates_matrix: {climates_matrix}\n")
        # Crear modelo custom
        model = ViTMultiTask(
            num_categories=len(classes),
            num_climates=len(climate2idx)
        )

        # Cargar pesos entrenados
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()

        logger.info("✅ Modelo custom cargado exitosamente!")

        # Cargar procesador de imágenes
        processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')

        logger.info("✅ Modelo y procesador cargados exitosamente")

    except Exception as e:
        logger.error(f"❌ Error cargando modelo: {e}")
        raise



def preprocess_image(image: Image.Image) -> torch.Tensor:
    """Preprocesar imagen para el modelo"""
    try:
        # Convertir a RGB si es necesario
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Usar el procesador de ViT
        inputs = processor(images=image, return_tensors="pt")
        return inputs['pixel_values']

    except Exception as e:
        logger.error(f"Error preprocesando imagen: {e}")
        raise


def rgb_to_color_name(rgb):
    """Convertir RGB a nombre de color en español"""
    r, g, b = rgb

    # Convertir a HSV para mejor análisis
    h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
    h = h * 360  # Convertir a grados
    s = s * 100  # Convertir a porcentaje
    v = v * 100  # Convertir a porcentaje

    # Definir rangos de colores
    if v < 20:
        return "negro"
    elif v > 80 and s < 20:
        return "blanco"
    elif s < 20:
        if v < 40:
            return "gris oscuro"
        elif v < 70:
            return "gris"
        else:
            return "gris claro"

    # Colores con saturación
    if h < 15 or h >= 345:
        return "rojo"
    elif h < 45:
        return "naranja"
    elif h < 75:
        return "amarillo"
    elif h < 150:
        return "verde"
    elif h < 210:
        return "azul"
    elif h < 270:
        return "morado"
    elif h < 330:
        return "rosa"
    else:
        return "rojo"

def extract_clothing_colors(image: Image.Image, num_colors=3):
    """Extraer colores dominantes de una prenda evitando el fondo"""
    try:
        # Convertir PIL a numpy array
        img_array = np.array(image)

        # Si es RGBA, convertir a RGB
        if img_array.shape[2] == 4:
            img_array = img_array[:, :, :3]

        # Redimensionar para procesamiento más rápido
        height, width = img_array.shape[:2]
        if height > 400 or width > 400:
            scale = min(400/height, 400/width)
            new_height, new_width = int(height * scale), int(width * scale)
            img_array = cv2.resize(img_array, (new_width, new_height))

        # Crear máscara para excluir bordes (probablemente fondo)
        h, w = img_array.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)

        # Crear máscara circular/elíptica en el centro (donde probablemente está la prenda)
        center_x, center_y = w // 2, h // 2
        radius_x, radius_y = int(w * 0.35), int(h * 0.35)  # 70% del ancho/alto

        y, x = np.ogrid[:h, :w]
        mask_condition = ((x - center_x) / radius_x) ** 2 + ((y - center_y) / radius_y) ** 2 <= 1
        mask[mask_condition] = 255

        # Aplicar máscara
        masked_img = cv2.bitwise_and(img_array, img_array, mask=mask)

        # Obtener solo los píxeles de la región de interés
        pixels = masked_img[mask > 0]

        if len(pixels) == 0:
            # Fallback: usar toda la imagen sin bordes
            border = min(h, w) // 10
            pixels = img_array[border:h-border, border:w-border].reshape(-1, 3)

        # Filtrar píxeles muy oscuros o muy claros (probablemente sombras/reflejos)
        brightness = np.mean(pixels, axis=1)
        valid_pixels = pixels[(brightness > 30) & (brightness < 225)]

        if len(valid_pixels) < 100:
            valid_pixels = pixels  # Usar todos si hay muy pocos válidos

        # Aplicar K-means clustering
        n_colors = min(num_colors, len(valid_pixels) // 50)  # Asegurar suficientes píxeles por cluster
        if n_colors < 1:
            n_colors = 1

        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        kmeans.fit(valid_pixels)

        # Obtener colores dominantes
        colors = kmeans.cluster_centers_.astype(int)

        # Calcular frecuencia de cada color
        labels = kmeans.labels_
        label_counts = Counter(labels)

        # Ordenar colores por frecuencia
        color_info = []
        for i, color in enumerate(colors):
            frequency = label_counts[i] / len(labels)
            color_name = rgb_to_color_name(color)
            color_info.append({
                "nombre": color_name,
                "rgb": color.tolist(),
                "hex": "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2]),
                "frecuencia": round(frequency, 3)
            })

        # Ordenar por frecuencia descendente
        color_info.sort(key=lambda x: x["frecuencia"], reverse=True)

        return color_info

    except Exception as e:
        logger.error(f"Error extrayendo colores: {e}")
        # Fallback: devolver colores básicos
        return [{
            "nombre": "desconocido",
            "rgb": [128, 128, 128],
            "hex": "#808080",
            "frecuencia": 1.0
        }]

def predict_clothing(image: Image.Image) -> Dict[str, Any]:
    """Predecir tipo de prenda y clima usando el modelo custom"""
    try:
        # Preprocesar imagen
        input_tensor = preprocess_image(image)
        logger.error(f"ENTRO A predict_clothing")
        # Hacer predicción
        with torch.no_grad():
            logger.error(f"ENTRO A with torch.no_grad()")
            category_logits, climate_logits = model(input_tensor)
            logger.error(f"category_logits: {category_logits}")
            logger.error(f"climate_logits: {climate_logits}")
            
            # Probabilidades para categorías
            category_probs = F.softmax(category_logits, dim=-1)
            climate_probs = F.softmax(climate_logits, dim=-1)

            # Top 3 predicciones de categoría
            top_cat_probs, top_cat_indices = torch.topk(category_probs, k=min(3, len(classes)))

            # Top 3 predicciones de clima
            top_clim_probs, top_clim_indices = torch.topk(climate_probs, k=min(3, len(climate2idx)))

            # Crear lista de climas
            climate_names = list(climate2idx.keys())
            logger.error(f"climate_names: {climate_names}")

            # Devolver la mejor predicción y alternativas
            all_predictions = []
            for i in range(len(top_cat_indices[0])):
                idx = top_cat_indices[0][i].item()
                prob = top_cat_probs[0][i].item()

                if idx < len(classes):
                    class_name = classes[idx]
                    categoria = category_map[class_name]

                    prediction = {
                        "clase": class_name,
                        "confianza": float(prob),
                        "nombre": nombre_map[class_name],
                        "categoria": categoria,
                        "climas": []  # Se llenará después con los climas predichos
                    }
                    all_predictions.append(prediction)

            best_prediction = all_predictions[0] if all_predictions else None

            # Resultados de climas sin normalizar (sin llamar a normalize_climate_name)
            climate_results = []
            for i in range(len(top_clim_indices[0])):
                idx = top_clim_indices[0][i].item()
                prob = top_clim_probs[0][i].item()

                if idx < len(climate_names):
                    climate_name = climate_names[idx]
                    
                    climate_results.append({
                        "clima": climate_name,
                        "confianza": float(prob)
                    })

            # Actualizar climas en todas las predicciones (sin normalizar)
            if all_predictions and climate_results:
                top_climas = [c["clima"] for c in climate_results[:2]]
                for prediction in all_predictions:
                    prediction["climas"] = top_climas

            # Extraer colores de la prenda
            logger.info("🎨 Extrayendo colores de la prenda...")
            colors = extract_clothing_colors(image, num_colors=3)
            logger.info(f"Colores extraídos: {colors}")
            # Agregar colores a todas las predicciones
            for prediction in all_predictions:
                prediction["colores"] = colors
            logger.info(f"Predicciones: {all_predictions}")
            logger.info(f"Mejor predicción: {best_prediction}")
            logger.info(f"Resultados de climas: {climate_results}")
            logger.info(f"mejor clima: {climate_results[0] if climate_results else None}")
          
            return {
                "predicciones": all_predictions,
                "mejor_prediccion": best_prediction,
                "alternativas": all_predictions[1:] if len(all_predictions) > 1 else [],
                "predicciones_clima": climate_results,
                "mejor_clima": climate_results[0] if climate_results else None,
                "colores": colors,
                "color_principal": colors[0] if colors else None
            }

    except Exception as e:
        logger.error(f"Error en predicción: {e}")
        raise




@app.get("/", response_class=HTMLResponse)
async def get_test_interface():
    """Interfaz simple para probar el modelo"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Wardrobe AI - Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .result { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .prediction { border-left: 4px solid #007bff; padding-left: 15px; margin: 10px 0; }
            .confidence { color: #666; font-size: 0.9em; }
            .climate-tags { margin: 5px 0; }
            .tag { background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin: 2px; display: inline-block; }
            input[type="file"] { margin: 10px 0; padding: 10px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .loading { color: #666; font-style: italic; }
            img { max-width: 300px; max-height: 300px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🤖 Smart Wardrobe AI - Clasificador de Prendas</h1>
        
        <div class="container">
            <h3>📤 Subir Imagen</h3>
            <input type="file" id="imageInput" accept="image/*">
            <button onclick="uploadImage()">Analizar Prenda</button>
            <div id="preview"></div>
        </div>
        
        <div id="results"></div>
        
        <div class="container">
            <h3>ℹ️ Información</h3>
            <p>Este modelo puede clasificar <strong>56 tipos diferentes</strong> de prendas de vestir.</p>
            <p>Para cada prenda detectada, se proporcionan:</p>
            <ul>
                <li>🏷️ <strong>Nombre</strong> en español</li>
                <li>📂 <strong>Categoría</strong> (superior, inferior, calzado)</li>
                <li>🌤️ <strong>Climas apropiados</strong> para usar la prenda</li>
                <li>🎨 <strong>Colores dominantes</strong> de la prenda</li>
                <li>📊 <strong>Nivel de confianza</strong> de la predicción</li>
            </ul>
        </div>

        <script>
            async function uploadImage() {
                const input = document.getElementById('imageInput');
                const file = input.files[0];
                
                if (!file) {
                    alert('Por favor selecciona una imagen');
                    return;
                }
                
                // Mostrar preview
                const preview = document.getElementById('preview');
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                preview.innerHTML = '<h4>Imagen seleccionada:</h4>';
                preview.appendChild(img);
                
                // Mostrar loading
                const results = document.getElementById('results');
                results.innerHTML = '<div class="container"><div class="loading">🔄 Analizando imagen...</div></div>';
                
                // Subir imagen
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    const response = await fetch('/predict', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    displayResults(data);
                } catch (error) {
                    results.innerHTML = '<div class="container"><div style="color: red;">❌ Error: ' + error.message + '</div></div>';
                }
            }
            
            function displayResults(data) {
                const results = document.getElementById('results');
                
                if (!data.predicciones || data.predicciones.length === 0) {
                    results.innerHTML = '<div class="container"><div>❌ No se pudo clasificar la imagen</div></div>';
                    return;
                }
                
                let html = '<div class="container"><h3>🎯 Resultados de Clasificación</h3>';
                
                data.predicciones.forEach((pred, index) => {
                    const isTop = index === 0;
                    html += `
                        <div class="prediction" style="${isTop ? 'border-left-color: #28a745; background: #f8fff9;' : ''}">
                            <h4>${isTop ? '🥇' : '🥈'} ${pred.nombre} ${isTop ? '(Mejor predicción)' : ''}</h4>
                            <div class="confidence">Confianza: ${(pred.confianza * 100).toFixed(1)}%</div>
                            <div><strong>Categoría:</strong> ${pred.categoria}</div>
                            <div class="climate-tags">
                                <strong>Climas apropiados:</strong>
                                ${pred.climas.map(clima => `<span class="tag">${clima}</span>`).join('')}
                            </div>
                            ${pred.colores ? `
                                <div class="color-tags" style="margin-top: 10px;">
                                    <strong>🎨 Colores:</strong>
                                    ${pred.colores.map(color => `
                                        <span class="color-tag" style="
                                            display: inline-block;
                                            margin: 2px;
                                            padding: 4px 8px;
                                            background: ${color.hex};
                                            color: ${color.nombre === 'negro' || color.nombre.includes('oscuro') ? 'white' : 'black'};
                                            border-radius: 12px;
                                            font-size: 0.8em;
                                            border: 1px solid #ddd;
                                        ">
                                            ${color.nombre} (${(color.frecuencia * 100).toFixed(0)}%)
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
                
                html += '</div>';
                results.innerHTML = html;
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    """Endpoint para clasificar una imagen"""
    try:
        # Validar que sea una imagen
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # Leer imagen
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        logger.info(f"📸 Procesando imagen: {file.filename}, tamaño: {image.size}")
        
        # Hacer predicción
        result = predict_clothing(image)
        
        logger.info(f"✅ Predicción completada: {result['mejor_prediccion']['nombre'] if result['mejor_prediccion'] else 'Sin resultado'}")
        
        return result
    
    except Exception as e:
        logger.error(f"❌ Error en predicción: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")

@app.get("/health")
async def health_check():
    """Endpoint de salud"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "classes_available": len(class_names) if class_names else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
