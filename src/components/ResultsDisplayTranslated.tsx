import { Camera, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalculationResult } from "@/pages/Index";
import { useLanguage } from "@/contexts/LanguageContext";

interface ResultsDisplayProps {
  results: CalculationResult[];
  onMore: () => void;
  onDone: () => void;
  onClose: () => void;
}

const ResultsDisplay = ({ results, onMore, onDone, onClose }: ResultsDisplayProps) => {
  const { t } = useLanguage();
  
  const totalCarbs = results.reduce((sum, r) => sum + r.carbsEstimate, 0);
  const totalInsulin = results.reduce((sum, r) => sum + r.insulinDose, 0);
  
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">{t("results.title")}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Photos Preview */}
        <div className="space-y-4 mb-8">
          {results.map((result) => (
            <div key={result.id} className="rounded-2xl overflow-hidden shadow-card">
              <img
                src={result.imageUrl}
                alt="Analyzed meal"
                className="w-full h-48 object-cover"
              />
              <div className="p-4 bg-card">
                <p className="text-sm text-muted-foreground">
                  {t("results.carbs")}: <span className="font-semibold text-foreground">{result.carbsEstimate}g</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Results Cards */}
        <div className="space-y-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("results.totalCarbs")}
                </p>
                <p className="text-5xl font-bold text-primary mb-1">
                  {totalCarbs.toFixed(0)}
                </p>
                <p className="text-xl text-muted-foreground">{t("results.grams")}</p>
                {results.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("results.fromPhotos", { count: results.length })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("results.recommendedInsulin")}
                </p>
                <p className="text-5xl font-bold text-secondary-foreground mb-1">
                  {totalInsulin.toFixed(1)}
                </p>
                <p className="text-xl text-muted-foreground">{t("results.units")}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("results.basedOnRatio", { ratio: results[0].insulinRatio })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onMore}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            <Camera className="mr-2 h-6 w-6" />
            {t("results.addMore")}
          </Button>
          
          <Button
            onClick={onDone}
            className="w-full h-14 text-lg bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
            size="lg"
          >
            <Check className="mr-2 h-6 w-6" />
            {t("results.done")}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-14 text-lg"
            size="lg"
          >
            <X className="mr-2 h-6 w-6" />
            {t("results.abort")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
