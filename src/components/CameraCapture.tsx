import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
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
          <h2 className="text-2xl font-semibold text-foreground">Capture Food</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {!preview ? (
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
              <Camera className="h-24 w-24 text-muted-foreground" />
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-16 text-xl bg-gradient-to-r from-primary to-primary/80"
              size="lg"
            >
              <Camera className="mr-2 h-6 w-6" />
              Choose Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
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
                Retake
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-14 text-lg bg-gradient-to-r from-accent to-accent/80"
                size="lg"
              >
                Analyze
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CameraCapture;
