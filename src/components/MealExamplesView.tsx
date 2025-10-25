import { Sunrise, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface MealExamplesViewProps {
  insulinRatio: number;
}

interface MealExample {
  name: string;
  carbs: number;
  description: string;
}

interface MealCategory {
  title: string;
  icon: typeof Sunrise;
  meals: MealExample[];
}

const mealCategories: MealCategory[] = [
  {
    title: "Breakfast",
    icon: Sunrise,
    meals: [
      { name: "Pancakes with syrup", carbs: 45, description: "2 medium pancakes with 2 tbsp syrup" },
      { name: "Cereal with milk", carbs: 35, description: "1 cup cereal with 1/2 cup milk" },
      { name: "Toast with jam", carbs: 30, description: "2 slices toast with 1 tbsp jam" },
      { name: "Oatmeal with banana", carbs: 40, description: "1 cup oatmeal with 1 small banana" },
      { name: "Waffles with fruit", carbs: 38, description: "2 waffles with 1/2 cup berries" },
      { name: "Bagel with cream cheese", carbs: 45, description: "1 small bagel with 2 tbsp cream cheese" },
    ],
  },
  {
    title: "Lunch",
    icon: Sun,
    meals: [
      { name: "Peanut butter sandwich", carbs: 35, description: "2 slices bread with 2 tbsp PB" },
      { name: "Mac and cheese", carbs: 48, description: "1 cup prepared mac and cheese" },
      { name: "Chicken nuggets meal", carbs: 42, description: "6 nuggets with small fries" },
      { name: "Grilled cheese", carbs: 30, description: "2 slices bread with cheese" },
      { name: "Pizza slice", carbs: 35, description: "1 slice cheese pizza" },
      { name: "Turkey wrap", carbs: 32, description: "1 tortilla with turkey and veggies" },
    ],
  },
  {
    title: "Supper",
    icon: Moon,
    meals: [
      { name: "Spaghetti with meatballs", carbs: 55, description: "1 cup pasta with 3 meatballs" },
      { name: "Chicken with rice", carbs: 45, description: "4 oz chicken with 3/4 cup rice" },
      { name: "Tacos", carbs: 40, description: "2 soft tacos with meat and toppings" },
      { name: "Fish sticks meal", carbs: 38, description: "5 fish sticks with mashed potatoes" },
      { name: "Hamburger with bun", carbs: 35, description: "1 burger with bun and small side" },
      { name: "Chicken quesadilla", carbs: 42, description: "1 quesadilla with cheese and chicken" },
    ],
  },
];

const MealExamplesView = ({ insulinRatio }: MealExamplesViewProps) => {
  const calculateInsulin = (carbs: number) => {
    return (carbs / insulinRatio).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-center">Kid-Friendly Meal Examples</CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Common meals with estimated carb counts
          </p>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="space-y-4" defaultValue={["Breakfast"]}>
        {mealCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <AccordionItem
              key={category.title}
              value={category.title}
              className="border-none"
            >
              <Card className="shadow-soft overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {category.title}
                    </h3>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-3 pt-2">
                    {category.meals.map((meal, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{meal.name}</h4>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {meal.carbs}g
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ~{calculateInsulin(meal.carbs)}u insulin
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{meal.description}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Card className="shadow-soft bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            💡 These are estimates. Always verify with nutrition labels when possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealExamplesView;
