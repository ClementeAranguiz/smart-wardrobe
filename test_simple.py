#!/usr/bin/env python3
"""
Script simple para probar conectividad básica
"""

import socket
import requests
import time

def test_port():
    """Probar si el puerto 8000 está abierto"""
    print("🔍 Probando conectividad al puerto 8000...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('127.0.0.1', 8000))
        sock.close()
        
        if result == 0:
            print("✅ Puerto 8000 está abierto")
            return True
        else:
            print("❌ Puerto 8000 no está accesible")
            return False
    except Exception as e:
        print(f"❌ Error probando puerto: {e}")
        return False

def test_root():
    """Probar endpoint raíz"""
    print("\n🔍 Probando endpoint raíz...")
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Servidor responde en raíz")
            return True
        else:
            print(f"❌ Error en raíz: {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print("❌ Timeout en endpoint raíz")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_health_simple():
    """Probar health con timeout largo"""
    print("\n🔍 Probando /health con timeout largo...")
    try:
        start_time = time.time()
        response = requests.get("http://127.0.0.1:8000/health", timeout=60)
        end_time = time.time()
        
        print(f"Status: {response.status_code}")
        print(f"Tiempo de respuesta: {end_time - start_time:.2f} segundos")
        
        if response.status_code == 200:
            print("✅ Health endpoint funciona")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print("❌ Timeout después de 60 segundos")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🔧 Diagnóstico simple de conectividad")
    print("=" * 40)
    
    # Test 1: Puerto
    port_ok = test_port()
    
    if not port_ok:
        print("\n❌ El servidor no está corriendo o no es accesible")
        return
    
    # Test 2: Endpoint raíz
    root_ok = test_root()
    
    # Test 3: Health con timeout largo
    health_ok = test_health_simple()
    
    print("\n" + "=" * 40)
    print("📊 RESUMEN:")
    print(f"Puerto 8000: {'✅' if port_ok else '❌'}")
    print(f"Endpoint raíz: {'✅' if root_ok else '❌'}")
    print(f"Health endpoint: {'✅' if health_ok else '❌'}")

if __name__ == "__main__":
    main()
