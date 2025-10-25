import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SettingsPanelProps {
  insulinRatio: number;
  onRatioChange: (ratio: number) => void;
  comments: string;
  onCommentsChange: (comments: string) => void;
}

const SettingsPanel = ({ insulinRatio, onRatioChange, comments, onCommentsChange }: SettingsPanelProps) => {
  return (
    <Card className="p-6 mb-6 shadow-soft">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Your Settings</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="insulin-ratio" className="text-base">
            Insulin-to-Carb Ratio (I:C)
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
            1 unit of insulin covers {insulinRatio} grams of carbs
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments" className="text-base">
            Comments / Notes
          </Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            placeholder="Add any notes or comments about your diabetes management..."
            className="min-h-32 resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Use this space for reminders, doctor notes, or other important information
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SettingsPanel;
