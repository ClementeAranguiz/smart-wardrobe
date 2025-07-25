import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
  maxFutureDays?: number;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateSelect,
  className,
  maxFutureDays = 5
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() === d2.getTime();
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Hoy';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(date, tomorrow)) {
      return 'Mañana';
    }

    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getAvailableDates = () => {
    const dates: Date[] = [];
    
    // Agregar hoy
    dates.push(new Date(today));
    
    // Agregar días futuros
    for (let i = 1; i <= maxFutureDays; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      dates.push(futureDate);
    }
    
    return dates;
  };

  const availableDates = getAvailableDates();

  const handlePrevious = () => {
    const currentIndex = availableDates.findIndex(date => isSameDay(date, selectedDate));
    if (currentIndex > 0) {
      onDateSelect(availableDates[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = availableDates.findIndex(date => isSameDay(date, selectedDate));
    if (currentIndex < availableDates.length - 1) {
      onDateSelect(availableDates[currentIndex + 1]);
    }
  };

  const currentIndex = availableDates.findIndex(date => isSameDay(date, selectedDate));
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < availableDates.length - 1;

  return (
    <div className={cn("relative", className)}>
      {/* Selector compacto */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 min-w-[120px] justify-center"
        >
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {formatDate(selectedDate)}
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Lista expandida de fechas */}
      {showCalendar && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 z-50 mt-2"
        >
          <Card className="shadow-lg border">
            <CardContent className="p-2">
              <div className="space-y-1">
                {availableDates.map((date, index) => (
                  <motion.button
                    key={date.toISOString()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onDateSelect(date);
                      setShowCalendar(false);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-md transition-colors flex items-center justify-between",
                      isSameDay(date, selectedDate)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    <div>
                      <div className="font-medium">
                        {formatDate(date)}
                      </div>
                      <div className={cn(
                        "text-sm",
                        isSameDay(date, selectedDate)
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}>
                        {date.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    {isToday(date) && (
                      <div className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isSameDay(date, selectedDate)
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      )}>
                        Hoy
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Pronóstico disponible para los próximos {maxFutureDays} días
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
