import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shirt } from 'lucide-react';

interface OutfitNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  loading?: boolean;
}

export const OutfitNameDialog: React.FC<OutfitNameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('Mi nuevo outfit');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleConfirm();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Nombrar Outfit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outfit-name">¿Cómo quieres llamar a este outfit?</Label>
            <Input
              id="outfit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: Outfit casual de verano"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || !name.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                'Crear Outfit'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
