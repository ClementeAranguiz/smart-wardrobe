import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClothingItem, ClothingCategory, ClimateType } from '@/types/detections';

interface EditClothingDialogProps {
  item: ClothingItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, updates: Partial<ClothingItem>) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}

const categoryOptions: { value: ClothingCategory; label: string }[] = [
  { value: 'superior', label: 'Superior' },
  { value: 'inferior', label: 'Inferior' },
  { value: 'calzado', label: 'Calzado' },
  { value: 'accesorio', label: 'Accesorio' },
  { value: 'abrigo', label: 'Abrigo' }
];

const climateOptions: { value: ClimateType; label: string }[] = [
  { value: 'calor', label: 'Calor' },
  { value: 'frio', label: 'Frío' },
  { value: 'lluvia', label: 'Lluvia' },
  { value: 'entretiempo', label: 'Entretiempo' },
  { value: 'viento', label: 'Viento' },
  { value: 'nieve', label: 'Nieve' }
];

export const EditClothingDialog: React.FC<EditClothingDialogProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [nombre, setNombre] = useState(item.nombre);
  const [categoria, setCategoria] = useState<ClothingCategory>(item.categoria as ClothingCategory);
  const [climas, setClimas] = useState<ClimateType[]>(item.climas as ClimateType[]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(item.id, {
        nombre: nombre.trim(),
        categoria,
        climas
      });
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete(item.id);
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClimate = (climate: ClimateType) => {
    setClimas(prev => 
      prev.includes(climate)
        ? prev.filter(c => c !== climate)
        : [...prev, climate]
    );
  };

  const hasChanges = () => {
    return (
      nombre.trim() !== item.nombre ||
      categoria !== item.categoria ||
      JSON.stringify(climas.sort()) !== JSON.stringify((item.climas as ClimateType[]).sort())
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Editar Prenda
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu prenda
          </DialogDescription>
        </DialogHeader>

        {!showDeleteConfirm ? (
          <div className="space-y-4">
            {/* Imagen */}
            <div className="flex justify-center">
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-24 h-24 object-cover rounded-lg border"
              />
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre de la prenda"
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoria} onValueChange={(value) => setCategoria(value as ClothingCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Climas */}
            <div className="space-y-2">
              <Label>Climas apropiados</Label>
              <div className="flex flex-wrap gap-2">
                {climateOptions.map(option => (
                  <Badge
                    key={option.value}
                    variant={climas.includes(option.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleClimate(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Haz clic en los climas para seleccionar/deseleccionar
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
              
              <div className="flex-1" />
              
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges() || loading || !nombre.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="text-destructive">
              <Trash2 className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">¿Eliminar prenda?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Esta acción no se puede deshacer. La prenda será eliminada permanentemente.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
