#!/usr/bin/env python3
"""
Script para ejecutar Smart Wardrobe AI API
"""

import uvicorn
import sys
import os

def main():
    print("🤖 Smart Wardrobe AI - Iniciando servidor...")
    print("=" * 50)
    
    # Verificar que los archivos del modelo existan
    if not os.path.exists('../vit_clothes_prediction.pth'):
        print("❌ No se encuentra vit_clothes_prediction.pth")
        print("   Asegúrate de que el archivo esté en la carpeta padre")
        return
    
    if not os.path.exists('../climate.json'):
        print("❌ No se encuentra climate.json")
        print("   Asegúrate de que el archivo esté en la carpeta padre")
        return
    
    print("✅ Archivos del modelo encontrados")
    print("\n🚀 Iniciando servidor FastAPI...")
    print("📍 URL: http://localhost:8000")
    print("🧪 Interfaz de prueba: http://localhost:8000")
    print("\n💡 Presiona Ctrl+C para detener el servidor")
    print("-" * 50)
    
    try:
        uvicorn.run(
            "main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido")

if __name__ == "__main__":
    main()
