import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UploadProgress } from '@/components/ui/upload-progress';
import { DetectionAlternatives } from '@/components/ui/detection-alternatives';
import { useWardrobeContext } from '@/contexts/WardrobeContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { detectImage } from '@/services/modelService';
import { uploadClothingImage } from '@/services/firebaseService';
import { compressImage, validateImageFile, createImagePreview, revokeImagePreview } from '@/utils/imageUtils';
import { Detecciones } from '@/types/detections';
import { cn } from '@/lib/utils';

interface UploadScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadStep = 'select' | 'preview' | 'processing' | 'results' | 'success';
type ProcessingStep = 'compressing' | 'processing' | 'uploading' | 'saving' | 'complete';

export const UploadScreen: React.FC<UploadScreenProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detecciones | null>(null);
  const [selectedDetections, setSelectedDetections] = useState<Detecciones | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('compressing');
  const [uploadSource, setUploadSource] = useState<'camera' | 'gallery' | null>(null);

  const { addItem } = useWardrobeContext();
  const { user } = useAuthContext();
  const location = useLocation();

  // Detectar si viene con un archivo desde el state o desde URL params
  useEffect(() => {
    if (isOpen) {
      // Verificar si viene con un archivo desde el state (cámara directa)
      const fileFromState = location.state?.file as File;
      const sourceFromState = location.state?.source as 'camera' | 'gallery';

      if (fileFromState && sourceFromState) {
        setUploadSource(sourceFromState);
        handleFileSelect(fileFromState);
        return;
      }

      // Si no viene con archivo, verificar URL params (modo legacy)
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('source') as 'camera' | 'gallery' | null;
      setUploadSource(source);

      // Si viene de la cámara por URL, activar automáticamente
      if (source === 'camera') {
        setTimeout(() => {
          const cameraInput = document.getElementById('camera-input') as HTMLInputElement;
          if (cameraInput) {
            cameraInput.click();
          }
        }, 500);
      }
    }
  }, [isOpen, location.state]);

  const resetState = () => {
    setCurrentStep('select');
    setSelectedFile(null);
    setCompressedFile(null);
    if (previewUrl) {
      revokeImagePreview(previewUrl);
    }
    setPreviewUrl(null);
    setDetections(null);
    setSelectedDetections(null);
    setError(null);
    setUploadProgress('');
    setUploadSource(null);
  };

  const handleClose = () => {
    resetState();
    // Limpiar el state de navegación si existe
    if (location.state?.file) {
      window.history.replaceState(null, '', '/home');
    }
    onClose();
  };

  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      setProcessingStep('compressing');
      setUploadProgress('Validando imagen...');

      // Validar archivo
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Archivo inválido');
        setUploadProgress('');
        return;
      }

      setSelectedFile(file);
      setUploadProgress('Comprimiendo imagen...');

      // Comprimir imagen
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: 'jpeg'
      });

      setCompressedFile(compressed);

      // Crear preview URL
      const url = createImagePreview(compressed);
      setPreviewUrl(url);
      setCurrentStep('preview');
      setUploadProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen');
      setUploadProgress('');
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const processImage = async () => {
    if (!compressedFile) return;

    try {
      setCurrentStep('processing');
      setError(null);
      setProcessingStep('processing');
      setUploadProgress('Analizando imagen con IA...');

      const result = await detectImage(compressedFile);
      setDetections(result);
      setSelectedDetections(result); // Inicializar con las detecciones originales
      setCurrentStep('results');
      setUploadProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen');
      setCurrentStep('preview');
      setUploadProgress('');
    }
  };

  const saveDetections = async () => {
    if (!selectedDetections || !compressedFile || !user) return;

    try {
      setCurrentStep('processing');
      setProcessingStep('uploading');
      setUploadProgress('Preparando subida...');

      // Guardar cada detección como una prenda separada
      const detectionEntries = Object.values(selectedDetections);

      for (let i = 0; i < detectionEntries.length; i++) {
        const detection = detectionEntries[i];

        // Generar ID único para la prenda
        const itemId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        setUploadProgress(`Subiendo imagen para ${detection.nombre}... (${i + 1}/${detectionEntries.length})`);

        // Subir imagen a Firebase Storage
        const imageUrl = await uploadClothingImage(compressedFile, user.uid, itemId);

        setProcessingStep('saving');
        setUploadProgress(`Guardando ${detection.nombre}... (${i + 1}/${detectionEntries.length})`);

        // Guardar prenda con la URL de la imagen y colores
        await addItem({
          nombre: detection.nombre,
          categoria: detection.categoria as any,
          climas: detection.climas as any[],
          imagen: imageUrl,
          colores: detection.colores || []
        });
      }

      setProcessingStep('complete');
      setCurrentStep('success');
      setUploadProgress('¡Prendas guardadas exitosamente!');

      // Auto-cerrar después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar las prendas');
      setUploadProgress('');
      setCurrentStep('results');
    }
  };

  const renderSelectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Agregar Nueva Prenda</h3>
        <p className="text-muted-foreground">
          {uploadSource === 'camera'
            ? 'Toca el botón de cámara para tomar una foto de tu prenda'
            : 'Toma una foto o selecciona una imagen de tu galería'
          }
        </p>
      </div>

      {uploadSource === 'camera' ? (
        // Solo mostrar cámara cuando viene del botón de navegación
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <Card className="hover:bg-accent transition-colors ring-2 ring-primary bg-primary/5 w-64">
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg">Tomar Foto</p>
                  <p className="text-sm text-muted-foreground">Usa tu cámara</p>
                </div>
              </CardContent>
            </Card>
          </label>
        </div>
      ) : (
        // Mostrar ambas opciones cuando no hay fuente específica
        <div className="grid grid-cols-2 gap-4">
          {/* Camera */}
          <label className="cursor-pointer">
            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Cámara</p>
                  <p className="text-sm text-muted-foreground">Tomar foto</p>
                </div>
              </CardContent>
            </Card>
          </label>

          {/* Gallery */}
          <label className="cursor-pointer">
            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              onChange={handleGallerySelect}
              className="hidden"
            />
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Galería</p>
                  <p className="text-sm text-muted-foreground">Seleccionar imagen</p>
                </div>
              </CardContent>
            </Card>
          </label>
        </div>
      )}
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Vista Previa</h3>
        <p className="text-muted-foreground">
          Confirma que la imagen es correcta antes de procesarla
        </p>
      </div>

      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('select')} className="flex-1">
          Cambiar Imagen
        </Button>
        <Button onClick={processImage} className="flex-1">
          Procesar Imagen
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <UploadProgress
      step={processingStep}
      message={uploadProgress}
    />
  );

  const handleDetectionChange = (detectionKey: string, newSelection: any) => {
    if (!selectedDetections) return;

    setSelectedDetections({
      ...selectedDetections,
      [detectionKey]: {
        ...selectedDetections[detectionKey],
        nombre: newSelection.nombre,
        categoria: newSelection.categoria,
        climas: newSelection.climas,
        confianza: Math.round(newSelection.confianza * 100)
      }
    });
  };

  const renderResultsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Prenda Detectada</h3>
        <p className="text-muted-foreground">
          Revisa la detección y confirma si es correcta
        </p>
      </div>

      {detections && Object.entries(detections).map(([key, detection]) => {
        const apiResponse = detection._apiResponse;
        const mainDetection = apiResponse?.mejor_prediccion || detection;
        const alternatives = apiResponse?.alternativas || [];

        return (
          <DetectionAlternatives
            key={key}
            mainDetection={{
              clase: mainDetection.clase || detection.nombre,
              confianza: mainDetection.confianza || (detection.confianza || 0) / 100,
              nombre: mainDetection.nombre || detection.nombre,
              categoria: mainDetection.categoria || detection.categoria,
              climas: mainDetection.climas || detection.climas
            }}
            alternatives={alternatives.map((alt: any) => ({
              clase: alt.clase,
              confianza: alt.confianza,
              nombre: alt.nombre,
              categoria: alt.categoria,
              climas: alt.climas
            }))}
            onSelectionChange={(selected) => handleDetectionChange(key, selected)}
          />
        );
      })}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('preview')} className="flex-1">
          Volver
        </Button>
        <Button onClick={saveDetections} className="flex-1">
          Guardar Prenda
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold mb-2">¡Prendas Guardadas!</h3>
          <p className="text-muted-foreground">
            Las prendas se han agregado exitosamente a tu armario
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Subir Prenda
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Agrega nuevas prendas a tu armario tomando una foto o seleccionando una imagen
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 'select' && renderSelectStep()}
            {currentStep === 'preview' && renderPreviewStep()}
            {currentStep === 'processing' && renderProcessingStep()}
            {currentStep === 'results' && renderResultsStep()}
            {currentStep === 'success' && renderSuccessStep()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
