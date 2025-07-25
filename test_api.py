#!/usr/bin/env python3
"""
Script para probar la API de Smart Wardrobe
"""

import requests
import json
import os
from PIL import Image
import io

def test_health():
    """Probar endpoint de salud"""
    print("🔍 Probando endpoint de salud...")
    try:
        response = requests.get("http://127.0.0.1:8000/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_predict_with_dummy_image():
    """Probar endpoint de predicción con imagen dummy"""
    print("\n🔍 Probando endpoint de predicción...")
    try:
        # Crear una imagen dummy simple
        img = Image.new('RGB', (224, 224), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
        
        print("📤 Enviando imagen de prueba...")
        response = requests.post("http://127.0.0.1:8000/predict", files=files, timeout=30)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Respuesta exitosa!")
            print(f"Mejor predicción: {result.get('mejor_prediccion', {}).get('nombre', 'N/A')}")
            print(f"Confianza: {result.get('mejor_prediccion', {}).get('confianza', 'N/A')}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_cors():
    """Probar CORS"""
    print("\n🔍 Probando CORS...")
    try:
        headers = {
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = requests.options("http://127.0.0.1:8000/predict", headers=headers, timeout=5)
        print(f"CORS Status: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error CORS: {e}")
        return False

def main():
    print("🤖 Probando API de Smart Wardrobe")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = test_health()
    
    # Test 2: CORS
    cors_ok = test_cors()
    
    # Test 3: Predict endpoint
    predict_ok = test_predict_with_dummy_image()
    
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE PRUEBAS:")
    print(f"✅ Health endpoint: {'OK' if health_ok else 'FAIL'}")
    print(f"✅ CORS: {'OK' if cors_ok else 'FAIL'}")
    print(f"✅ Predict endpoint: {'OK' if predict_ok else 'FAIL'}")
    
    if all([health_ok, cors_ok, predict_ok]):
        print("\n🎉 ¡Todas las pruebas pasaron! La API está funcionando correctamente.")
    else:
        print("\n⚠️ Algunas pruebas fallaron. Revisa los logs arriba.")

if __name__ == "__main__":
    main()
