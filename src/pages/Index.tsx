import { useState } from "react";
import { Camera, Calendar, Utensils, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import CameraCapture from "@/components/CameraCapture";
import ResultsDisplay from "@/components/ResultsDisplay";
import DailyHistoryView from "@/components/DailyHistoryView";
import MealExamplesView from "@/components/MealExamplesView";
import SettingsView from "@/components/SettingsView";

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
      toast({
        title: "Analyzing...",
        description: "AI is examining your food photo",
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-food`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageData: imageDataUrl }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const { carbsEstimate } = await response.json();
      const insulinDose = Number((carbsEstimate / insulinRatio).toFixed(1));
      
      const result: CalculationResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        imageUrl: imageDataUrl,
        carbsEstimate,
        insulinDose,
        insulinRatio,
      };
      
      setCurrentResult(result);
      setHistory(prev => [result, ...prev].slice(0, 10));
      setShowCamera(false);
      
      toast({
        title: "Analysis Complete!",
        description: `Estimated ${carbsEstimate}g carbs, ${insulinDose} units insulin needed`,
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

        {/* Camera View - Full Screen Override */}
        {showCamera && (
          <CameraCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setShowCamera(false)}
          />
        )}

        {/* Results Display - Full Screen Override */}
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

        {/* Main Tabs */}
        {!showCamera && !currentResult && (
          <Tabs defaultValue="capture" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="capture" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Capture
              </TabsTrigger>
              <TabsTrigger value="examples" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Meals
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="capture" className="space-y-8">
              {/* Main Action Button */}
              <div>
                <Button
                  onClick={() => setShowCamera(true)}
                  className="w-full h-32 text-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-card"
                  size="lg"
                >
                  <Camera className="mr-3 h-12 w-12" />
                  Take Photo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="examples">
              <MealExamplesView insulinRatio={insulinRatio} />
            </TabsContent>

            <TabsContent value="history">
              <DailyHistoryView
                history={history}
                onSelectItem={setCurrentResult}
              />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsView
                insulinRatio={insulinRatio}
                onRatioChange={setInsulinRatio}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
