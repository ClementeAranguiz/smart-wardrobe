#!/usr/bin/env python3
"""
Script simple para ejecutar la API sin reload
"""

import uvicorn
import os

def main():
    print("🤖 Smart Wardrobe AI - Servidor Simple")
    print("=" * 40)
    
    # Verificar archivos
    if not os.path.exists('../vit_clothes_prediction.pth'):
        print("❌ No se encuentra vit_clothes_prediction.pth")
        return
    
    print("✅ Archivos encontrados")
    print("🚀 Iniciando servidor...")
    print("📍 URL: http://127.0.0.1:8000")
    print("💡 Presiona Ctrl+C para detener")
    print("-" * 40)
    
    try:
        # Configuración más simple
        uvicorn.run(
            "main:app",
            host="127.0.0.1",
            port=8000,
            reload=False,  # Sin reload para evitar problemas
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
