import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
  tempSelectedDate?: Date;
  onTempDateSelect?: (date: Date) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  tempSelectedDate,
  onTempDateSelect,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  // Usar tempSelectedDate si está disponible, sino selectedDate
  const displayDate = tempSelectedDate || selectedDate;

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
      days.push(date);
    }
    
    return days;
  }, [currentDate]);

  const today = new Date();
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === displayDate.toDateString();
  };

  const handleDateClick = (date: Date) => {
    if (onTempDateSelect) {
      onTempDateSelect(date);
    } else if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
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
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="aspect-square" />;
            }

            const isDateToday = isToday(date);
            const isDateSelected = isSelected(date);

            return (
              <motion.button
                key={date.getDate()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateClick(date)}
                className={cn(
                  "aspect-square p-1 rounded-lg text-sm transition-colors relative",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                  "flex items-center justify-center",
                  isDateSelected && "bg-primary text-primary-foreground font-semibold",
                  isDateToday && !isDateSelected && "bg-primary/20 font-semibold"
                )}
              >
                <span className="text-sm">
                  {date.getDate()}
                </span>

                {/* Indicador solo para hoy */}
                {isDateToday && !isDateSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Información de la fecha seleccionada */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Fecha seleccionada:
            </p>
            <p className="font-medium">
              {displayDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded-lg" />
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/20 rounded-lg" />
            <span>Hoy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
