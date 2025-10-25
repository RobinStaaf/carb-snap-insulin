import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CameraCapture from "@/components/CameraCapture";
import ResultsDisplay from "@/components/ResultsDisplay";
import SettingsPanel from "@/components/SettingsPanel";
import HistoryList from "@/components/HistoryList";

export interface CalculationResult {
  id: string;
  timestamp: Date;
  imageUrl: string;
  carbsEstimate: number;
  insulinDose: number;
  insulinRatio: number;
}

const Index = () => {
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [insulinRatio, setInsulinRatio] = useState(10); // Default 1:10 ratio

  const handlePhotoCapture = async (imageDataUrl: string) => {
    try {
      // Here we'll integrate with Lovable AI to analyze the image
      // For now, we'll simulate the calculation
      const estimatedCarbs = Math.floor(Math.random() * 50) + 10; // Placeholder
      const insulinDose = Number((estimatedCarbs / insulinRatio).toFixed(1));
      
      const result: CalculationResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        imageUrl: imageDataUrl,
        carbsEstimate: estimatedCarbs,
        insulinDose,
        insulinRatio,
      };
      
      setCurrentResult(result);
      setHistory(prev => [result, ...prev].slice(0, 10));
      setShowCamera(false);
      
      toast({
        title: "Analysis Complete!",
        description: `Estimated ${estimatedCarbs}g carbs, ${insulinDose} units needed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🍎 CarbSmart
          </h1>
          <p className="text-muted-foreground text-lg">
            Take a photo, know your carbs!
          </p>
        </div>

        {/* Main Action Button */}
        {!showCamera && !currentResult && (
          <div className="mb-8">
            <Button
              onClick={() => setShowCamera(true)}
              className="w-full h-32 text-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-card"
              size="lg"
            >
              <Camera className="mr-3 h-12 w-12" />
              Take Photo
            </Button>
          </div>
        )}

        {/* Camera View */}
        {showCamera && (
          <CameraCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setShowCamera(false)}
          />
        )}

        {/* Results Display */}
        {currentResult && (
          <ResultsDisplay
            result={currentResult}
            onNewCalculation={() => {
              setCurrentResult(null);
              setShowCamera(true);
            }}
            onClose={() => setCurrentResult(null)}
          />
        )}

        {/* Settings Panel */}
        {!showCamera && !currentResult && (
          <>
            <SettingsPanel
              insulinRatio={insulinRatio}
              onRatioChange={setInsulinRatio}
            />

            {/* History */}
            {history.length > 0 && (
              <HistoryList
                history={history}
                onSelectItem={setCurrentResult}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
