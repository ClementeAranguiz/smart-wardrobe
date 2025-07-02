import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Shirt, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CalendarScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-2">Calendario</h1>
          <p className="text-muted-foreground">
            Planifica tus outfits y organiza tu armario
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col items-center justify-center">
            <CardContent className="text-center p-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              
              <h2 className="text-xl font-semibold mb-3">
                Próximamente
              </h2>
              
              <p className="text-muted-foreground mb-6 max-w-sm">
                Aquí podrás planificar tus outfits, programar combinaciones y 
                organizar tu armario por fechas y eventos especiales.
              </p>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4" />
                  <span>Planificación de outfits</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Shirt className="w-4 h-4" />
                  <span>Combinaciones programadas</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Plus className="w-4 h-4" />
                  <span>Eventos especiales</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="mt-6"
                disabled
              >
                Próximamente disponible
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
