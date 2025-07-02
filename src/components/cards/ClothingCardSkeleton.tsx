import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ClothingCardSkeletonProps {
  className?: string;
}

export const ClothingCardSkeleton: React.FC<ClothingCardSkeletonProps> = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn("clothing-card", className)}
    >
      <Card className="overflow-hidden">
        {/* Imagen skeleton */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Skeleton className="w-full h-full" />
          
          {/* Categoría skeleton */}
          <div className="absolute top-2 left-2">
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
        </div>

        <CardContent className="p-4">
          {/* Nombre skeleton */}
          <Skeleton className="h-4 w-3/4 mb-2" />

          {/* Climas skeleton */}
          <div className="flex items-center gap-1 flex-wrap mb-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>

          {/* Fecha skeleton */}
          <Skeleton className="h-3 w-1/3" />
        </CardContent>
      </Card>
    </motion.div>
  );
};
