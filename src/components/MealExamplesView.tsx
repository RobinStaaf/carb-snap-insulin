import { Sunrise, Sun, Moon, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Import meal images
import pancakesImg from "@/assets/meals/pancakes.jpg";
import cerealImg from "@/assets/meals/cereal.jpg";
import toastJamImg from "@/assets/meals/toast-jam.jpg";
import oatmealImg from "@/assets/meals/oatmeal.jpg";
import wafflesImg from "@/assets/meals/waffles.jpg";
import bagelImg from "@/assets/meals/bagel.jpg";
import pbSandwichImg from "@/assets/meals/pb-sandwich.jpg";
import macCheeseImg from "@/assets/meals/mac-cheese.jpg";
import nuggetsImg from "@/assets/meals/nuggets.jpg";
import grilledCheeseImg from "@/assets/meals/grilled-cheese.jpg";
import pizzaImg from "@/assets/meals/pizza.jpg";
import turkeyWrapImg from "@/assets/meals/turkey-wrap.jpg";
import spaghettiImg from "@/assets/meals/spaghetti.jpg";
import chickenRiceImg from "@/assets/meals/chicken-rice.jpg";
import tacosImg from "@/assets/meals/tacos.jpg";
import fishSticksImg from "@/assets/meals/fish-sticks.jpg";
import hamburgerImg from "@/assets/meals/hamburger.jpg";
import quesadillaImg from "@/assets/meals/quesadilla.jpg";
import roastChickenImg from "@/assets/meals/roast-chicken.jpg";
import meatloafImg from "@/assets/meals/meatloaf.jpg";
import stirFryImg from "@/assets/meals/stir-fry.jpg";
import salmonImg from "@/assets/meals/salmon.jpg";
import chickenParmImg from "@/assets/meals/chicken-parm.jpg";
import porkChopImg from "@/assets/meals/pork-chop.jpg";

interface MealExamplesViewProps {
  insulinRatio: number;
}

interface MealExample {
  name: string;
  carbs: number;
  description: string;
  image: string;
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
      { name: "Pancakes with syrup", carbs: 45, description: "2 medium pancakes with 2 tbsp syrup", image: pancakesImg },
      { name: "Cereal with milk", carbs: 35, description: "1 cup cereal with 1/2 cup milk", image: cerealImg },
      { name: "Toast with jam", carbs: 30, description: "2 slices toast with 1 tbsp jam", image: toastJamImg },
      { name: "Oatmeal with banana", carbs: 40, description: "1 cup oatmeal with 1 small banana", image: oatmealImg },
      { name: "Waffles with fruit", carbs: 38, description: "2 waffles with 1/2 cup berries", image: wafflesImg },
      { name: "Bagel with cream cheese", carbs: 45, description: "1 small bagel with 2 tbsp cream cheese", image: bagelImg },
    ],
  },
  {
    title: "Lunch",
    icon: Sun,
    meals: [
      { name: "Peanut butter sandwich", carbs: 35, description: "2 slices bread with 2 tbsp PB", image: pbSandwichImg },
      { name: "Mac and cheese", carbs: 48, description: "1 cup prepared mac and cheese", image: macCheeseImg },
      { name: "Chicken nuggets meal", carbs: 42, description: "6 nuggets with small fries", image: nuggetsImg },
      { name: "Grilled cheese", carbs: 30, description: "2 slices bread with cheese", image: grilledCheeseImg },
      { name: "Pizza slice", carbs: 35, description: "1 slice cheese pizza", image: pizzaImg },
      { name: "Turkey wrap", carbs: 32, description: "1 tortilla with turkey and veggies", image: turkeyWrapImg },
    ],
  },
  {
    title: "Supper",
    icon: Moon,
    meals: [
      { name: "Spaghetti with meatballs", carbs: 55, description: "1 cup pasta with 3 meatballs", image: spaghettiImg },
      { name: "Chicken with rice", carbs: 45, description: "4 oz chicken with 3/4 cup rice", image: chickenRiceImg },
      { name: "Tacos", carbs: 40, description: "2 soft tacos with meat and toppings", image: tacosImg },
      { name: "Fish sticks meal", carbs: 38, description: "5 fish sticks with mashed potatoes", image: fishSticksImg },
      { name: "Hamburger with bun", carbs: 35, description: "1 burger with bun and small side", image: hamburgerImg },
      { name: "Chicken quesadilla", carbs: 42, description: "1 quesadilla with cheese and chicken", image: quesadillaImg },
    ],
  },
  {
    title: "Dinner",
    icon: UtensilsCrossed,
    meals: [
      { name: "Roast chicken with veggies", carbs: 35, description: "Baked chicken with roasted vegetables and small potato", image: roastChickenImg },
      { name: "Meatloaf with sides", carbs: 40, description: "Meatloaf slice with green beans and mashed potatoes", image: meatloafImg },
      { name: "Beef stir fry", carbs: 50, description: "Beef stir fry with vegetables over rice", image: stirFryImg },
      { name: "Baked salmon dinner", carbs: 42, description: "Salmon fillet with broccoli and rice", image: salmonImg },
      { name: "Chicken parmesan", carbs: 55, description: "Breaded chicken with melted cheese over spaghetti", image: chickenParmImg },
      { name: "Pork chop dinner", carbs: 38, description: "Grilled pork chop with applesauce and corn", image: porkChopImg },
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
                        className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border/50"
                      >
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-soft">
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{meal.name}</h4>
                            <div className="text-right ml-2">
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
