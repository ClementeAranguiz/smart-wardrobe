#!/usr/bin/env python3
"""
Script de configuración para Smart Wardrobe AI API
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Ejecutar comando y mostrar resultado"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}:")
        print(f"   Comando: {command}")
        print(f"   Error: {e.stderr}")
        return False

def check_files():
    """Verificar que los archivos necesarios existan"""
    required_files = [
        '../vit_clothes_prediction.pth',
        '../climate.json'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Archivos faltantes:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    print("✅ Todos los archivos necesarios están presentes")
    return True

def main():
    print("🤖 Smart Wardrobe AI - Configuración")
    print("=" * 50)
    
    # Verificar archivos
    if not check_files():
        print("\n❌ No se pueden encontrar los archivos del modelo.")
        print("   Asegúrate de que vit_clothes_prediction.pth y climate.json estén en la carpeta padre.")
        return
    
    # Crear entorno virtual
    if not os.path.exists('venv'):
        if not run_command(f"{sys.executable} -m venv venv", "Creando entorno virtual"):
            return
    
    # Activar entorno virtual y instalar dependencias
    if sys.platform.startswith('win'):
        pip_command = "venv\\Scripts\\pip"
        python_command = "venv\\Scripts\\python"
    else:
        pip_command = "venv/bin/pip"
        python_command = "venv/bin/python"
    
    if not run_command(f"{pip_command} install --upgrade pip", "Actualizando pip"):
        return
    
    if not run_command(f"{pip_command} install -r requirements.txt", "Instalando dependencias"):
        return
    
    print("\n🎉 ¡Configuración completada!")
    print("\n📋 Para ejecutar la API:")
    print(f"   {python_command} main.py")
    print("\n🌐 La API estará disponible en:")
    print("   http://localhost:8000")
    print("\n🧪 Interfaz de prueba en:")
    print("   http://localhost:8000")

if __name__ == "__main__":
    main()
