import { Settings, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";

interface SettingsPanelProps {
  insulinRatio: number;
  onRatioChange: (ratio: number) => void;
  portionSize: string;
  onPortionSizeChange: (size: string) => void;
  carbAdjustment: number;
  onCarbAdjustmentChange: (adjustment: number) => void;
  comments: string;
  onCommentsChange: (comments: string) => void;
  onShowDisclaimer?: () => void;
}

const SettingsPanel = ({ insulinRatio, onRatioChange, portionSize, onPortionSizeChange, carbAdjustment, onCarbAdjustmentChange, comments, onCommentsChange, onShowDisclaimer }: SettingsPanelProps) => {
  const { t } = useLanguage();

  return (
    <Card className="p-6 mb-6 shadow-soft">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t("settings.title")}</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="insulin-ratio" className="text-base">
            {t("settings.insulinRatio")}
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-foreground">1:</span>
            <Input
              id="insulin-ratio"
              type="number"
              min="1"
              max="50"
              value={insulinRatio}
              onChange={(e) => onRatioChange(Number(e.target.value))}
              className="text-2xl font-semibold h-14 text-center"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("settings.insulinRatioDesc", { ratio: insulinRatio })}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-base">
            {t("settings.portionSize")}
          </Label>
          <RadioGroup value={portionSize} onValueChange={onPortionSizeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="child" id="child" />
              <Label htmlFor="child" className="cursor-pointer">{t("settings.childPortion")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="adult" id="adult" />
              <Label htmlFor="adult" className="cursor-pointer">{t("settings.adultPortion")}</Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground">
            {t("settings.portionSizeDesc")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="carb-adjustment" className="text-base">
            {t("settings.carbAdjustment")}
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onCarbAdjustmentChange(Math.max(-50, carbAdjustment - 5))}
              className="h-12 w-12 text-xl font-bold"
            >
              −
            </Button>
            <Input
              id="carb-adjustment"
              type="number"
              min="-50"
              max="50"
              value={carbAdjustment}
              onChange={(e) => onCarbAdjustmentChange(Number(e.target.value))}
              className="text-xl font-semibold h-12 text-center flex-1"
            />
            <span className="text-xl font-semibold text-foreground">%</span>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onCarbAdjustmentChange(Math.min(50, carbAdjustment + 5))}
              className="h-12 w-12 text-xl font-bold"
            >
              +
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("settings.carbAdjustmentDesc")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments" className="text-base">
            {t("settings.comments")}
          </Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            placeholder={t("settings.commentsPlaceholder")}
            className="min-h-32 resize-none"
          />
          <p className="text-sm text-muted-foreground">
            {t("settings.commentsDesc")}
          </p>
        </div>

        {onShowDisclaimer && (
          <Button
            variant="outline"
            onClick={onShowDisclaimer}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            {t("settings.rereadDisclaimer")}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default SettingsPanel;
