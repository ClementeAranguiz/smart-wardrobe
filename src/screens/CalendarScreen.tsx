import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shirt, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OutfitListScreen } from './OutfitListScreen';
import { RegisterUsageScreen } from './RegisterUsageScreen';
import { CalendarView } from '@/components/calendar/CalendarView';
import { DayOutfitsView } from '@/components/calendar/DayOutfitsView';
import { Outfit } from '@/types/detections';

type CalendarViewType = 'main' | 'outfits' | 'register' | 'day';

export const CalendarScreen: React.FC = () => {
  const [currentView, setCurrentView] = useState<CalendarViewType>('main');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayOutfits, setSelectedDayOutfits] = useState<Outfit[]>([]);

  const handleDayClick = (date: Date, outfits: Outfit[]) => {
    setSelectedDate(date);
    setSelectedDayOutfits(outfits);
    setCurrentView('day');
  };

  // Renderizar la vista actual
  if (currentView === 'outfits') {
    return <OutfitListScreen onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'register') {
    return <RegisterUsageScreen onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'day' && selectedDate) {
    return (
      <DayOutfitsView
        date={selectedDate}
        outfits={selectedDayOutfits}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  // Vista principal del calendario
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Calendario</h1>
              <p className="text-muted-foreground">
                Organiza tus outfits y planifica tu armario
              </p>
            </div>
          </div>

          {/* Botones principales */}
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentView('outfits')}
              className="flex-1"
            >
              <Shirt className="w-4 h-4 mr-2" />
              Mis Outfits
            </Button>

            <Button
              onClick={() => setCurrentView('register')}
              variant="outline"
              className="flex-1"
            >
              <Clock className="w-4 h-4 mr-2" />
              Registrar Uso
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CalendarView onDayClick={handleDayClick} />
        </motion.div>
      </div>
    </div>
  );
};
