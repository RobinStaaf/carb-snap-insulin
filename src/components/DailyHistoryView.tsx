import { useMemo } from "react";
import { format, startOfDay, isSameDay, startOfWeek, startOfMonth, isWithinInterval } from "date-fns";
import { Card } from "@/components/ui/card";
import { CalculationResult } from "@/pages/Index";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DailyHistoryViewProps {
  history: CalculationResult[];
  onSelectItem: (item: CalculationResult) => void;
}

interface DailySummary {
  date: Date;
  items: CalculationResult[];
  totalCarbs: number;
  totalInsulin: number;
}

const DailyHistoryView = ({ history, onSelectItem }: DailyHistoryViewProps) => {
  const dailySummaries = useMemo(() => {
    const summaryMap = new Map<string, DailySummary>();

    history.forEach((item) => {
      const dayKey = format(startOfDay(item.timestamp), "yyyy-MM-dd");
      
      if (!summaryMap.has(dayKey)) {
        summaryMap.set(dayKey, {
          date: startOfDay(item.timestamp),
          items: [],
          totalCarbs: 0,
          totalInsulin: 0,
        });
      }

      const summary = summaryMap.get(dayKey)!;
      summary.items.push(item);
      summary.totalCarbs += item.carbsEstimate;
      summary.totalInsulin += item.insulinDose;
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [history]);

  const weekSummary = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    
    const weekData = history.filter(item => 
      isWithinInterval(item.timestamp, { start: weekStart, end: now })
    );

    return {
      totalCarbs: weekData.reduce((sum, item) => sum + item.carbsEstimate, 0),
      totalInsulin: weekData.reduce((sum, item) => sum + item.insulinDose, 0),
      mealCount: weekData.length,
    };
  }, [history]);

  const monthSummary = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    
    const monthData = history.filter(item => 
      isWithinInterval(item.timestamp, { start: monthStart, end: now })
    );

    return {
      totalCarbs: monthData.reduce((sum, item) => sum + item.carbsEstimate, 0),
      totalInsulin: monthData.reduce((sum, item) => sum + item.insulinDose, 0),
      mealCount: monthData.length,
    };
  }, [history]);

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    if (isSameDay(date, today)) {
      return "Today";
    }
    return format(date, "EEEE, MMMM d");
  };

  if (history.length === 0) {
    return (
      <Card className="p-12 text-center shadow-soft">
        <p className="text-muted-foreground text-lg">No history yet. Start by taking a photo!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 shadow-soft">
          <h3 className="text-sm text-muted-foreground mb-2">This Week</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">{weekSummary.totalCarbs.toFixed(0)}g</p>
            <p className="text-sm text-muted-foreground">{weekSummary.totalInsulin.toFixed(1)}u insulin</p>
            <p className="text-xs text-muted-foreground">{weekSummary.mealCount} meals</p>
          </div>
        </Card>
        <Card className="p-4 shadow-soft">
          <h3 className="text-sm text-muted-foreground mb-2">This Month</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">{monthSummary.totalCarbs.toFixed(0)}g</p>
            <p className="text-sm text-muted-foreground">{monthSummary.totalInsulin.toFixed(1)}u insulin</p>
            <p className="text-xs text-muted-foreground">{monthSummary.mealCount} meals</p>
          </div>
        </Card>
      </div>

      {/* Daily History */}
      <Accordion type="multiple" className="space-y-4" defaultValue={[format(dailySummaries[0]?.date, "yyyy-MM-dd")]}>
        {dailySummaries.map((summary) => (
          <AccordionItem
            key={format(summary.date, "yyyy-MM-dd")}
            value={format(summary.date, "yyyy-MM-dd")}
            className="border-none"
          >
            <Card className="shadow-soft overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">
                      {formatDate(summary.date)}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {summary.items.length} meal{summary.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {summary.totalCarbs.toFixed(0)}g
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {summary.totalInsulin.toFixed(1)}u insulin
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3 pt-2">
                  {summary.items.map((item) => (
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
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default DailyHistoryView;
