import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LocationSearch } from '@/components/ui/location-search';
import { DateSelector } from '@/components/ui/date-selector';
import { LocationSearchResult } from '@/types/weather';

interface WeatherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  selectedLocation: LocationSearchResult | null;
  onLocationSelect: (location: LocationSearchResult) => void;
  useCurrentLocation: boolean;
  onUseCurrentLocation: () => void;
  currentLocationName?: string;
}

export const WeatherSettingsModal: React.FC<WeatherSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
  selectedLocation,
  onLocationSelect,
  useCurrentLocation,
  onUseCurrentLocation,
  currentLocationName
}) => {
  const [tempDate, setTempDate] = useState(selectedDate);
  const [tempLocation, setTempLocation] = useState<LocationSearchResult | null>(selectedLocation);
  const [tempUseCurrentLocation, setTempUseCurrentLocation] = useState(useCurrentLocation);

  const handleSave = () => {
    onDateSelect(tempDate);
    if (tempUseCurrentLocation) {
      onUseCurrentLocation();
    } else if (tempLocation) {
      onLocationSelect(tempLocation);
    }
    onClose();
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    setTempLocation(selectedLocation);
    setTempUseCurrentLocation(useCurrentLocation);
    onClose();
  };

  const handleLocationSelect = (location: LocationSearchResult) => {
    setTempLocation(location);
    setTempUseCurrentLocation(false);
  };

  const handleUseCurrentLocation = () => {
    setTempLocation(null);
    setTempUseCurrentLocation(true);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate.getTime() === today.getTime()) {
      return 'Hoy';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (checkDate.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    }

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getLocationDisplay = () => {
    if (tempUseCurrentLocation) {
      return currentLocationName || 'Ubicación actual';
    }
    return tempLocation?.displayName || 'Seleccionar ubicación';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Editar fecha y ubicación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selector de fecha */}
          <div>
            <label className="text-sm font-medium mb-3 block">Fecha</label>
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="p-4">
                <DateSelector
                  selectedDate={tempDate}
                  onDateSelect={setTempDate}
                  maxFutureDays={5}
                />
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Seleccionado:</strong> {formatDate(tempDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selector de ubicación */}
          <div>
            <label className="text-sm font-medium mb-3 block">Ubicación</label>
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="p-4 space-y-3">
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  currentLocation={tempUseCurrentLocation ? currentLocationName : tempLocation?.displayName}
                />
                
                {!tempUseCurrentLocation && tempLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUseCurrentLocation}
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Usar ubicación actual
                    </Button>
                  </motion.div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Seleccionado:</strong> {getLocationDisplay()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            Aplicar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
