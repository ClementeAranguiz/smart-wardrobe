import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from './DatePicker';

interface DatePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DatePickerDialog: React.FC<DatePickerDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect
}) => {
  const [tempDate, setTempDate] = useState(selectedDate);

  // Resetear la fecha temporal cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTempDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  const handleConfirm = () => {
    onDateSelect(tempDate);
    onClose();
  };

  const handleCancel = () => {
    setTempDate(selectedDate); // Resetear a la fecha original
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Seleccionar Fecha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DatePicker
            selectedDate={selectedDate}
            tempSelectedDate={tempDate}
            onTempDateSelect={setTempDate}
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
