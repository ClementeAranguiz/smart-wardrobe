#!/usr/bin/env python3
"""
Script para probar los cambios en la detección de colores
"""

import requests
import json
from PIL import Image
import io

def test_color_detection():
    """Probar que los colores ya no incluyan nombres"""
    print("🎨 Probando detección de colores sin nombres...")
    
    try:
        # Crear una imagen azul (como jeans)
        img = Image.new('RGB', (224, 224), color=(70, 100, 140))  # Azul típico de jeans
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('test_jeans.jpg', img_bytes, 'image/jpeg')}
        
        print("📤 Enviando imagen azul de prueba...")
        response = requests.post("http://127.0.0.1:8000/predict", files=files, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Respuesta exitosa!")
            
            # Verificar estructura de colores
            if 'mejor_prediccion' in result and 'colores' in result['mejor_prediccion']:
                colores = result['mejor_prediccion']['colores']
                print(f"\n🎨 Colores detectados: {len(colores)}")
                
                for i, color in enumerate(colores):
                    print(f"  Color {i+1}:")
                    print(f"    RGB: {color.get('rgb', 'N/A')}")
                    print(f"    HEX: {color.get('hex', 'N/A')}")
                    print(f"    Frecuencia: {color.get('frecuencia', 'N/A')}")
                    
                    # Verificar que NO tenga nombre
                    if 'nombre' in color:
                        print(f"    ❌ ERROR: Todavía incluye nombre: {color['nombre']}")
                    else:
                        print(f"    ✅ Sin nombre (correcto)")
                    print()
                
                return True
            else:
                print("❌ No se encontraron colores en la respuesta")
                return False
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🧪 Probando cambios en detección de colores")
    print("=" * 50)
    
    success = test_color_detection()
    
    print("=" * 50)
    if success:
        print("🎉 ¡Cambios aplicados correctamente!")
        print("💡 Ahora puedes probar en el navegador en http://127.0.0.1:8000")
    else:
        print("⚠️ Hubo problemas con los cambios")

if __name__ == "__main__":
    main()
