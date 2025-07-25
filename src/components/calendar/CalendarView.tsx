import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithLoading } from '@/components/ui/image-with-loading';
import { useOutfitContext } from '@/contexts/OutfitContext';
import { Outfit } from '@/types/detections';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  onDayClick?: (date: Date, outfits: Outfit[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { outfits } = useOutfitContext();

  // Obtener el primer día del mes y información del calendario
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo
  const daysInMonth = lastDayOfMonth.getDate();

  // Nombres de los meses y días
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Función para obtener outfits de una fecha específica
  const getOutfitsForDate = (date: Date): Outfit[] => {
    const dateStr = date.toDateString();
    return outfits.filter(outfit => 
      outfit.fechasUso?.some(fechaUso => fechaUso.toDateString() === dateStr)
    );
  };

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayOutfits = getOutfitsForDate(date);
      days.push({ date, outfits: dayOutfits });
    }
    
    return days;
  }, [currentDate, outfits]);

  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <div key={index} className="aspect-square" />;
            }

            const { date, outfits: dayOutfits } = dayData;
            const hasOutfits = dayOutfits.length > 0;

            return (
              <motion.button
                key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDayClick?.(date, dayOutfits)}
                className={cn(
                  "aspect-square p-1 rounded-lg text-sm transition-colors relative",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                  isToday(date) && "bg-primary text-primary-foreground font-semibold",
                  hasOutfits && !isToday(date) && "bg-primary/10 border border-primary/20"
                )}
              >
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <span className={cn(
                    "text-xs",
                    isToday(date) ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {date.getDate()}
                  </span>
                  
                  {/* Indicador de outfits */}
                  {hasOutfits && (
                    <div className="flex items-center justify-center mt-1">
                      {dayOutfits.length === 1 ? (
                        // Mostrar imagen pequeña del primer outfit
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-muted">
                          <ImageWithLoading
                            src={dayOutfits[0].prendas[0]?.imagen}
                            alt="Outfit"
                            className="object-cover w-full h-full"
                            aspectRatio="square"
                          />
                        </div>
                      ) : (
                        // Mostrar número de outfits
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs px-1 py-0 h-4 min-w-4",
                            isToday(date) && "bg-primary-foreground text-primary"
                          )}
                        >
                          {dayOutfits.length}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/10 border border-primary/20 rounded-full" />
            <span>Con outfits</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
