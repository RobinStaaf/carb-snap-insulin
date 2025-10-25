import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CalculationResult } from "@/pages/Index";

interface HistoryListProps {
  history: CalculationResult[];
  onSelectItem: (item: CalculationResult) => void;
}

const HistoryList = ({ history, onSelectItem }: HistoryListProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Calculations</h3>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="w-full flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-soft">
                <img
                  src={item.imageUrl}
                  alt="Food"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground">{item.carbsEstimate}g carbs</span>
                  <span className="text-sm text-muted-foreground">{formatTime(item.timestamp)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.insulinDose}u insulin needed
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default HistoryList;
