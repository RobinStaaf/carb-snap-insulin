import { ArrowRight, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalculationResult } from "@/pages/Index";

interface ResultsDisplayProps {
  result: CalculationResult;
  onNewCalculation: () => void;
  onClose: () => void;
}

const ResultsDisplay = ({ result, onNewCalculation, onClose }: ResultsDisplayProps) => {
  return (
    <Card className="p-6 shadow-card animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Results</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Food Image */}
        <div className="aspect-square rounded-2xl overflow-hidden shadow-soft">
          <img
            src={result.imageUrl}
            alt="Analyzed food"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Calculation Display */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Estimated Carbs</p>
              <p className="text-4xl font-bold text-primary">{result.carbsEstimate}g</p>
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-medium">Insulin Needed</p>
              <p className="text-4xl font-bold text-accent">{result.insulinDose}u</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              Based on your 1:{result.insulinRatio} insulin ratio
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-14 text-lg"
            size="lg"
          >
            View History
          </Button>
          <Button
            onClick={onNewCalculation}
            className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-primary/80"
            size="lg"
          >
            <Camera className="mr-2 h-5 w-5" />
            New Photo
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ResultsDisplay;
