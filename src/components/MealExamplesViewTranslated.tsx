import { Sunrise, Sun, Moon, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

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
  nameKey: string;
  descKey: string;
  carbs: number;
  image: string;
}

interface MealCategory {
  titleKey: string;
  icon: typeof Sunrise;
  meals: MealExample[];
}

const mealCategories: MealCategory[] = [
  {
    titleKey: "meals.breakfast",
    icon: Sunrise,
    meals: [
      { nameKey: "meal.pancakes", descKey: "meal.pancakesDesc", carbs: 45, image: pancakesImg },
      { nameKey: "meal.cereal", descKey: "meal.cerealDesc", carbs: 35, image: cerealImg },
      { nameKey: "meal.toast", descKey: "meal.toastDesc", carbs: 30, image: toastJamImg },
      { nameKey: "meal.oatmeal", descKey: "meal.oatmealDesc", carbs: 40, image: oatmealImg },
      { nameKey: "meal.waffles", descKey: "meal.wafflesDesc", carbs: 38, image: wafflesImg },
      { nameKey: "meal.bagel", descKey: "meal.bagelDesc", carbs: 45, image: bagelImg },
    ],
  },
  {
    titleKey: "meals.lunch",
    icon: Sun,
    meals: [
      { nameKey: "meal.pbSandwich", descKey: "meal.pbSandwichDesc", carbs: 35, image: pbSandwichImg },
      { nameKey: "meal.macCheese", descKey: "meal.macCheeseDesc", carbs: 48, image: macCheeseImg },
      { nameKey: "meal.nuggets", descKey: "meal.nuggetsDesc", carbs: 42, image: nuggetsImg },
      { nameKey: "meal.grilledCheese", descKey: "meal.grilledCheeseDesc", carbs: 30, image: grilledCheeseImg },
      { nameKey: "meal.pizza", descKey: "meal.pizzaDesc", carbs: 35, image: pizzaImg },
      { nameKey: "meal.turkeyWrap", descKey: "meal.turkeyWrapDesc", carbs: 32, image: turkeyWrapImg },
    ],
  },
  {
    titleKey: "meals.dinner",
    icon: UtensilsCrossed,
    meals: [
      { nameKey: "meal.roastChicken", descKey: "meal.roastChickenDesc", carbs: 35, image: roastChickenImg },
      { nameKey: "meal.meatloaf", descKey: "meal.meatloafDesc", carbs: 40, image: meatloafImg },
      { nameKey: "meal.stirFry", descKey: "meal.stirFryDesc", carbs: 50, image: stirFryImg },
      { nameKey: "meal.salmon", descKey: "meal.salmonDesc", carbs: 42, image: salmonImg },
      { nameKey: "meal.chickenParm", descKey: "meal.chickenParmDesc", carbs: 55, image: chickenParmImg },
      { nameKey: "meal.porkChop", descKey: "meal.porkChopDesc", carbs: 38, image: porkChopImg },
    ],
  },
  {
    titleKey: "meals.supper",
    icon: Moon,
    meals: [
      { nameKey: "meal.spaghetti", descKey: "meal.spaghettiDesc", carbs: 55, image: spaghettiImg },
      { nameKey: "meal.chickenRice", descKey: "meal.chickenRiceDesc", carbs: 45, image: chickenRiceImg },
      { nameKey: "meal.tacos", descKey: "meal.tacosDesc", carbs: 40, image: tacosImg },
      { nameKey: "meal.fishSticks", descKey: "meal.fishSticksDesc", carbs: 38, image: fishSticksImg },
      { nameKey: "meal.hamburger", descKey: "meal.hamburgerDesc", carbs: 35, image: hamburgerImg },
      { nameKey: "meal.quesadilla", descKey: "meal.quesadillaDesc", carbs: 42, image: quesadillaImg },
    ],
  },
];

const MealExamplesView = ({ insulinRatio }: MealExamplesViewProps) => {
  const { t } = useLanguage();

  const calculateInsulin = (carbs: number) => {
    return (carbs / insulinRatio).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-center">{t("meals.title")}</CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {t("meals.subtitle")}
          </p>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="space-y-4" defaultValue={[t("meals.breakfast")]}>
        {mealCategories.map((category) => {
          const IconComponent = category.icon;
          const categoryTitle = t(category.titleKey);
          return (
            <AccordionItem
              key={category.titleKey}
              value={categoryTitle}
              className="border-none"
            >
              <Card className="shadow-soft overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {categoryTitle}
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
                            alt={t(meal.nameKey)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{t(meal.nameKey)}</h4>
                            <div className="text-right ml-2">
                              <div className="text-lg font-bold text-primary">
                                {meal.carbs}g
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t("meals.insulinEstimate", { insulin: calculateInsulin(meal.carbs) })}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{t(meal.descKey)}</p>
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
            {t("meals.disclaimer")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealExamplesView;
