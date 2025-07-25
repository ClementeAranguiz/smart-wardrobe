#!/usr/bin/env python3
"""
Script para inspeccionar detalladamente el modelo .pth
"""

import torch
import json
from pprint import pprint

def inspect_model():
    print("🔍 Inspección Detallada del Modelo")
    print("=" * 60)
    
    try:
        # Cargar checkpoint
        checkpoint = torch.load('../vit_clothes_prediction.pth', map_location='cpu')
        
        print(f"📦 Tipo: {type(checkpoint)}")
        print(f"🔑 Claves principales: {list(checkpoint.keys())}")
        print()
        
        # Analizar cada clave en detalle
        for key, value in checkpoint.items():
            print(f"🔍 Analizando: {key}")
            print(f"   Tipo: {type(value)}")
            
            if isinstance(value, dict):
                print(f"   Tamaño: {len(value)} elementos")
                if len(value) <= 10:
                    print("   Contenido:")
                    for k, v in value.items():
                        print(f"      {k}: {v}")
                else:
                    print("   Primeros 5 elementos:")
                    for i, (k, v) in enumerate(value.items()):
                        if i < 5:
                            print(f"      {k}: {v}")
                        else:
                            break
                    print(f"      ... y {len(value) - 5} más")
                            
            elif isinstance(value, list):
                print(f"   Tamaño: {len(value)} elementos")
                if len(value) <= 10:
                    print(f"   Contenido: {value}")
                else:
                    print(f"   Primeros 5: {value[:5]}")
                    print(f"   ... y {len(value) - 5} más")
                    
            elif isinstance(value, torch.Tensor):
                print(f"   Shape: {value.shape}")
                print(f"   Dtype: {value.dtype}")
                
            elif isinstance(value, (int, float, str)):
                print(f"   Valor: {value}")
                
            else:
                print(f"   Valor: {str(value)[:100]}...")
                
            print()
        
        # Análisis específico de las clases
        if 'category_classes' in checkpoint:
            print("📋 ANÁLISIS DE CLASES DE CATEGORÍAS")
            print("=" * 40)
            category_classes = checkpoint['category_classes']
            print(f"Tipo: {type(category_classes)}")
            print(f"Contenido: {category_classes}")
            print()
            
        if 'class2idx' in checkpoint:
            print("📋 ANÁLISIS DE MAPEO CLASE->ÍNDICE")
            print("=" * 40)
            class2idx = checkpoint['class2idx']
            print(f"Tipo: {type(class2idx)}")
            print(f"Cantidad: {len(class2idx)}")
            print("Mapeo completo:")
            for cls, idx in sorted(class2idx.items(), key=lambda x: x[1]):
                print(f"   {idx:2d}: {cls}")
            print()
            
        if 'climate2idx' in checkpoint:
            print("🌤️ ANÁLISIS DE MAPEO CLIMA->ÍNDICE")
            print("=" * 40)
            climate2idx = checkpoint['climate2idx']
            print(f"Tipo: {type(climate2idx)}")
            print(f"Cantidad: {len(climate2idx)}")
            print("Mapeo completo:")
            for clima, idx in sorted(climate2idx.items(), key=lambda x: x[1]):
                print(f"   {idx}: {clima}")
            print()
            
        # Análisis del state_dict del modelo
        if 'model_state_dict' in checkpoint:
            print("🧠 ANÁLISIS DEL STATE_DICT")
            print("=" * 40)
            state_dict = checkpoint['model_state_dict']
            
            # Agrupar por componente
            components = {}
            for key in state_dict.keys():
                component = key.split('.')[0]
                if component not in components:
                    components[component] = []
                components[component].append(key)
            
            for component, keys in components.items():
                print(f"\n📁 Componente: {component}")
                print(f"   Parámetros: {len(keys)}")
                
                # Mostrar algunos parámetros clave
                for key in keys[:3]:
                    tensor = state_dict[key]
                    print(f"   - {key}: {tensor.shape}")
                    
                if len(keys) > 3:
                    print(f"   ... y {len(keys) - 3} más parámetros")
                    
        print("\n" + "=" * 60)
        print("✅ Inspección completada")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    inspect_model()
