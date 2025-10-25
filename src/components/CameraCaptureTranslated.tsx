import { useState } from "react";
import { Camera as CameraPlugin, CameraResultType, CameraSource } from "@capacitor/camera";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import photoMealIllustration from "@/assets/photo-meal-illustration.png";

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleTakePhoto = async () => {
    try {
      const image = await CameraPlugin.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setPreview(image.dataUrl);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: t("camera.error"),
        description: t("camera.errorDesc"),
        variant: "destructive",
      });
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onCapture(preview);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-foreground">{t("camera.title")}</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {!preview ? (
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                src={photoMealIllustration} 
                alt="Take photo of food" 
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              onClick={handleTakePhoto}
              className="w-full h-16 text-xl bg-gradient-to-r from-primary to-primary/80"
              size="lg"
            >
              <Camera className="mr-2 h-6 w-6" />
              {t("camera.takePhoto")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-soft">
              <img
                src={preview}
                alt="Food preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setPreview(null)}
                variant="outline"
                className="flex-1 h-14 text-lg"
                size="lg"
              >
                {t("camera.retake")}
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-14 text-lg bg-gradient-to-r from-accent to-accent/80"
                size="lg"
              >
                {t("camera.analyze")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CameraCapture;
