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
class_to_category = None

RUTA_MODEL = '../vit_clothes_prediction.pth'
def load_model():
    global model, processor, climate_data, class_names, classes, climate2idx, climates_matrix, category_map, nombre_map, class_to_category

    try:
        logger.info("🤖 Cargando modelo custom...")
        logger.info(f"📁 Cargando checkpoint desde: {RUTA_MODEL}")

        # Cargar checkpoint
        checkpoint = torch.load(RUTA_MODEL, map_location='cpu')
        logger.info("✅ Checkpoint cargado exitosamente")

        # Extraer información del checkpoint
        classes = checkpoint['category_classes'] # Lista de clases de prendas
        class2idx = checkpoint['class2idx'] # Mapeo de clases de prendas
        climate2idx = checkpoint['climate2idx'] # Diccionario de climas (clima: índice)
        num_climates = checkpoint['num_climates'] # Número de climas

        # Crear mapeos adicionales que el código espera
        category_map = {
            "superior": ["blouse", "button-down", "cardigan", "flannel", "henley", "hoodie", "jacket", "jersey", "sweater", "tank", "tee", "top", "turtleneck", "blazer", "bomber", "coat", "parka", "peacoat"],
            "inferior": ["capris", "chinos", "culottes", "cutoffs", "gauchos", "jeans", "jeggings", "jodhpurs", "joggers", "leggings", "shorts", "skirt", "sweatpants", "sweatshorts", "trunks"],
            "calzado": ["boots", "sandals", "shoes", "slippers"],
            "vestido": ["dress", "jumpsuit", "romper", "sundress"],
            "abrigo": ["anorak", "caftan", "coverup", "kaftan", "kimono", "onesie", "poncho", "robe", "sarong"]
        }

        # Crear mapeo de nombres en español (simplificado)
        nombre_map = {cls: cls.replace('-', ' ').title() for cls in classes}

        # Crear mapeo inverso: clase -> categoría
        class_to_category = {}
        for categoria, clases_lista in category_map.items():
            for clase in clases_lista:
                if clase in classes:
                    class_to_category[clase] = categoria

        # Para clases que no están en el mapeo, asignar una categoría por defecto
        for clase in classes:
            if clase not in class_to_category:
                class_to_category[clase] = "otros"
      
        # Crear modelo custom
        logger.info(f"🏗️ Creando modelo con {len(classes)} categorías y {len(climate2idx)} climas...")
        model = ViTMultiTask(
            num_categories=len(classes),
            num_climates=len(climate2idx)
        )
        logger.info("✅ Arquitectura del modelo creada")

        # Cargar pesos entrenados
        logger.info("⚙️ Cargando pesos del modelo entrenado...")
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()
        logger.info("✅ Pesos del modelo cargados exitosamente!")

        # Cargar procesador de imágenes
        logger.info("📷 Cargando procesador de imágenes...")
        processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
        logger.info("✅ Procesador de imágenes cargado!")

        logger.info("🎉 Modelo y procesador cargados exitosamente!")

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
            color_info.append({
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
    
import cv2
import numpy as np
from PIL import Image

def recortar_fondo_perfil_blanco(pil_img: Image.Image) -> Image.Image:
    img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gris, 200, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    contornos, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contornos = sorted(contornos, key=cv2.contourArea, reverse=True)
    x,y,w,h = cv2.boundingRect(contornos[0])

    recortada = img[y:y+h, x:x+w]
    alfa = mask[y:y+h, x:x+w]

    h2, w2 = recortada.shape[:2]
    fondo = np.ones((h2, w2, 3), dtype=np.uint8) * 255
    for c in range(3):
        fondo[:,:,c] = np.where(alfa==255, recortada[:,:,c], 255)
        
    return Image.fromarray(cv2.cvtColor(fondo, cv2.COLOR_BGR2RGB))


def predict_clothing(image: Image.Image) -> Dict[str, Any]:
    """Predecir tipo de prenda y clima usando el modelo custom"""
    try:
        logger.info("🔄 Iniciando predict_clothing...")
        # Preprocesar imagen
        logger.info("📷 Preprocesando imagen...")
        input_tensor = preprocess_image(image)
        logger.info(f"✅ Imagen preprocesada. Shape: {input_tensor.shape}")

        # Hacer predicción
        logger.info("🧠 Iniciando predicción con modelo...")
        with torch.no_grad():
          
            category_logits, climate_logits = model(input_tensor)
          
            # Probabilidades para categorías
            category_probs = F.softmax(category_logits, dim=-1)
            climate_probs = F.softmax(climate_logits, dim=-1)

            # Top 3 predicciones de categoría
            top_cat_probs, top_cat_indices = torch.topk(category_probs, k=min(3, len(classes)))

            # Top 3 predicciones de clima
            top_clim_probs, top_clim_indices = torch.topk(climate_probs, k=min(3, len(climate2idx)))

            # Crear lista de climas
            climate_names = list(climate2idx.keys())
            
            # Devolver la mejor predicción y alternativas
            all_predictions = []
            for i in range(len(top_cat_indices[0])):
                idx = top_cat_indices[0][i].item()
                prob = top_cat_probs[0][i].item()

                if idx < len(classes):
                    class_name = classes[idx]
                    categoria = class_to_category.get(class_name, "otros")

                    prediction = {
                        "clase": class_name,
                        "confianza": float(prob),
                        "nombre": nombre_map[class_name],
                        "categoria": categoria,
                        "climas": []
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
            colors = extract_clothing_colors(image, num_colors=2)
            logger.info(f"Colores extraídos: {colors}\n\n")
            # Agregar colores a todas las predicciones
            for prediction in all_predictions:
                prediction["colores"] = colors
            logger.info(f"Predicciones: {all_predictions}\n\n")
            logger.info(f"Mejor predicción: {best_prediction}\n\n")
            logger.info(f"Resultados de climas: {climate_results}\n\n")
            logger.info(f"mejor clima: {climate_results[0] if climate_results else None}\n\n")
          
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
                                <div class="color-circles" style="margin-top: 10px;">
                                    <strong>🎨 Colores:</strong>
                                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                                        ${pred.colores.map(color => `
                                            <div style="
                                                width: 32px;
                                                height: 32px;
                                                border-radius: 50%;
                                                background: ${color.hex};
                                                border: 2px solid #ddd;
                                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                                position: relative;
                                                cursor: pointer;
                                            " title="RGB: ${color.rgb.join(', ')} | HEX: ${color.hex} | ${(color.frecuencia * 100).toFixed(0)}%">
                                            </div>
                                        `).join('')}
                                    </div>
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
    


@app.post("/imagecut")
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
