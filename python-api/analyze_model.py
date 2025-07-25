import torch
import json
from collections import OrderedDict

def analyze_checkpoint():
    print("🔍 Análisis Detallado del Modelo")
    print("=" * 50)
    
    # Cargar checkpoint
    checkpoint = torch.load('../vit_clothes_prediction.pth', map_location='cpu')
    
    print(f"📦 Tipo de checkpoint: {type(checkpoint)}")
    print(f"🔑 Claves principales: {list(checkpoint.keys())}")
    
    # Analizar cada componente
    if 'classes' in checkpoint:
        classes = checkpoint['classes']
        print(f"\n📋 Clases del modelo entrenado ({len(classes)}):")
        for i, cls in enumerate(classes):
            print(f"   {i:2d}. {cls}")
    
    if 'class2idx' in checkpoint:
        class2idx = checkpoint['class2idx']
        print(f"\n🏷️ Mapeo clase->índice: {len(class2idx)} entradas")
        # Mostrar algunos ejemplos
        for i, (cls, idx) in enumerate(list(class2idx.items())[:10]):
            print(f"   {cls} -> {idx}")
        if len(class2idx) > 10:
            print(f"   ... y {len(class2idx) - 10} más")
    
    if 'climate2idx' in checkpoint:
        climate2idx = checkpoint['climate2idx']
        print(f"\n🌤️ Mapeo clima->índice: {climate2idx}")
    
    if 'climates' in checkpoint:
        climates = checkpoint['climates']
        print(f"\n🌡️ Matriz de climas: {climates.shape}")
        print(f"   Tipo: {climates.dtype}")
    
    if 'model_state_dict' in checkpoint:
        state_dict = checkpoint['model_state_dict']
        print(f"\n🧠 State dict del modelo: {len(state_dict)} parámetros")
        
        # Analizar las capas
        layer_info = {}
        for key, tensor in state_dict.items():
            layer_name = key.split('.')[0]
            if layer_name not in layer_info:
                layer_info[layer_name] = []
            layer_info[layer_name].append((key, tensor.shape))
        
        print("\n🏗️ Estructura del modelo:")
        for layer_name, params in layer_info.items():
            print(f"   📁 {layer_name}:")
            for param_name, shape in params[:3]:  # Mostrar solo los primeros 3
                print(f"      - {param_name}: {shape}")
            if len(params) > 3:
                print(f"      ... y {len(params) - 3} más parámetros")
        
        # Verificar la capa clasificadora
        classifier_keys = [k for k in state_dict.keys() if 'classifier' in k or 'head' in k]
        if classifier_keys:
            print(f"\n🎯 Capas clasificadoras encontradas:")
            for key in classifier_keys:
                print(f"   - {key}: {state_dict[key].shape}")
        else:
            print(f"\n⚠️ No se encontraron capas clasificadoras estándar")
            # Buscar capas que podrían ser clasificadoras
            potential_classifiers = [k for k in state_dict.keys() if any(term in k.lower() for term in ['fc', 'linear', 'dense', 'output'])]
            if potential_classifiers:
                print(f"🔍 Posibles clasificadores:")
                for key in potential_classifiers:
                    print(f"   - {key}: {state_dict[key].shape}")

def compare_with_climate_json():
    """Comparar las clases del modelo con climate.json"""
    print("\n" + "=" * 50)
    print("🔄 Comparación con climate.json")
    print("=" * 50)
    
    # Cargar checkpoint
    checkpoint = torch.load('../vit_clothes_prediction.pth', map_location='cpu')
    model_classes = checkpoint.get('classes', [])
    
    # Cargar climate.json
    with open('../climate.json', 'r', encoding='utf-8') as f:
        climate_data = json.load(f)
    
    climate_classes = list(climate_data.keys())
    
    print(f"📊 Clases en modelo: {len(model_classes)}")
    print(f"📊 Clases en climate.json: {len(climate_classes)}")
    
    # Encontrar diferencias
    model_set = set(model_classes)
    climate_set = set(climate_classes)
    
    only_in_model = model_set - climate_set
    only_in_climate = climate_set - model_set
    common = model_set & climate_set
    
    print(f"\n✅ Clases comunes: {len(common)}")
    print(f"🔴 Solo en modelo: {len(only_in_model)}")
    print(f"🔵 Solo en climate.json: {len(only_in_climate)}")
    
    if only_in_model:
        print(f"\n🔴 Clases solo en modelo:")
        for cls in sorted(only_in_model):
            print(f"   - {cls}")
    
    if only_in_climate:
        print(f"\n🔵 Clases solo en climate.json:")
        for cls in sorted(only_in_climate):
            print(f"   - {cls}")
    
    # Verificar si hay un mapeo directo
    if len(model_classes) == len(climate_classes):
        print(f"\n🤔 Mismo número de clases, verificando orden...")
        mismatches = []
        for i, (model_cls, climate_cls) in enumerate(zip(model_classes, climate_classes)):
            if model_cls != climate_cls:
                mismatches.append((i, model_cls, climate_cls))
        
        if mismatches:
            print(f"⚠️ {len(mismatches)} diferencias de orden:")
            for i, model_cls, climate_cls in mismatches[:10]:
                print(f"   {i}: '{model_cls}' vs '{climate_cls}'")
        else:
            print(f"✅ Orden idéntico!")

def suggest_fixes():
    """Sugerir posibles soluciones"""
    print("\n" + "=" * 50)
    print("💡 Posibles Soluciones")
    print("=" * 50)
    
    checkpoint = torch.load('../vit_clothes_prediction.pth', map_location='cpu')
    
    print("🔧 Opciones para arreglar el modelo:")
    print()
    
    print("1️⃣ **Usar las clases del modelo entrenado**")
    print("   - Ignorar climate.json")
    print("   - Usar checkpoint['classes'] directamente")
    print("   - Crear mapeo manual a climas")
    print()
    
    print("2️⃣ **Verificar arquitectura del modelo**")
    print("   - El modelo podría no ser ViT estándar")
    print("   - Podría ser un modelo custom")
    print("   - Revisar si hay código del modelo original")
    print()
    
    print("3️⃣ **Usar mapeo de índices del checkpoint**")
    print("   - Usar checkpoint['class2idx']")
    print("   - Respetar el orden original del entrenamiento")
    print()
    
    if 'climates' in checkpoint:
        climates_tensor = checkpoint['climates']
        print("4️⃣ **Usar matriz de climas del checkpoint**")
        print(f"   - Matriz de {climates_tensor.shape}")
        print("   - Podría contener mapeo directo clase->clima")

def main():
    try:
        analyze_checkpoint()
        compare_with_climate_json()
        suggest_fixes()
        
        print("\n" + "=" * 50)
        print("🎯 Próximo paso recomendado:")
        print("   Crear un script que use las clases del modelo entrenado")
        print("   en lugar de climate.json")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
