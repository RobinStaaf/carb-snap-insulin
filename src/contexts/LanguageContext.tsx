import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "sv";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // StartPage
    "start.welcome": "Welcome to CarbSmart!",
    "start.description": "Take photos of meals and get instant carb estimates to help manage your child's diabetes",
    "start.getStarted": "Get Started",
    "start.selectLanguage": "Select Language",
    "start.disclaimerTitle": "Important Disclaimer",
    "start.disclaimerText": "This app uses AI to estimate the carbohydrate content of food from images. Results are only estimates and may be inaccurate depending on how photos are taken.\n\nAlways use this tool with care — you should understand the basics of carbohydrate counting and insulin calculation before use.\n\nThe app and its creators do not take responsibility for any medical or dietary decisions based on these results. Always confirm with a healthcare professional when in doubt.",
    "start.accept": "I Understand and Accept",
    "start.decline": "Decline",
    
    // Main App
    "app.title": "CarbSmart",
    "app.subtitle": "Take a photo, know your carbs!",
    "app.analyzing": "Analyzing...",
    "app.analyzingDesc": "AI is examining your food photo",
    "app.analysisComplete": "Analysis Complete!",
    "app.analysisCompleteDesc": "Found {carbs}g carbs, suggesting {insulin} units of insulin",
    "app.savedToHistory": "Saved to History",
    "app.savedToHistoryDesc": "Your meal has been saved successfully",
    "app.error": "Error",
    "app.errorDesc": "Failed to analyze image. Please try again.",
    
    // Tabs
    "tabs.capture": "Capture",
    "tabs.meals": "Meals",
    "tabs.history": "History",
    "tabs.info": "Info",
    "tabs.settings": "Settings",
    
    // Camera
    "camera.title": "Capture Food",
    "camera.takePhoto": "Take Photo",
    "camera.retake": "Retake",
    "camera.analyze": "Analyze",
    "camera.error": "Camera Error",
    "camera.errorDesc": "Could not access camera. Please check permissions.",
    
    // Results
    "results.title": "Results",
    "results.estimatedCarbs": "Estimated Carbs",
    "results.totalCarbs": "Total Carbs",
    "results.recommendedInsulin": "Recommended Insulin Dose",
    "results.insulinNeeded": "Insulin Needed",
    "results.grams": "grams",
    "results.units": "units",
    "results.carbs": "Carbs",
    "results.basedOnRatio": "Based on 1:{ratio} ratio",
    "results.fromPhotos": "from {count} photos",
    "results.addMore": "More Pictures",
    "results.done": "Done - Calculate & Save",
    "results.abort": "Abort",
    "results.viewHistory": "View History",
    "results.newPhoto": "New Photo",
    
    // History
    "history.title": "Recent Calculations",
    "history.noHistory": "No history yet. Start by taking a photo!",
    "history.meals": "meal",
    "history.mealsPlural": "meals",
    "history.carbs": "carbs",
    "history.insulin": "insulin",
    "history.insulinNeeded": "insulin needed",
    "history.today": "Today",
    
    // Settings
    "settings.title": "Your Settings",
    "settings.setupPin": "Set Up Parental Control",
    "settings.setupPinDesc": "Create a 4-digit PIN to protect your settings",
    "settings.enterPin": "Enter PIN",
    "settings.confirmPin": "Confirm PIN",
    "settings.setPin": "Set PIN",
    "settings.unlockSettings": "Enter PIN to Access Settings",
    "settings.parentalControl": "Parental control is enabled",
    "settings.unlock": "Unlock Settings",
    "settings.settingsUnlocked": "Settings Unlocked",
    "settings.lockSettings": "Lock Settings",
    "settings.insulinRatio": "Insulin-to-Carb Ratio (I:C)",
    "settings.insulinRatioDesc": "1 unit of insulin covers {ratio} grams of carbs",
    "settings.comments": "Comments / Notes",
    "settings.commentsPlaceholder": "Add any notes or comments about your diabetes management...",
    "settings.commentsDesc": "Use this space for reminders, doctor notes, or other important information",
    "settings.invalidPin": "Invalid PIN",
    "settings.invalidPinDesc": "PIN must be exactly 4 digits",
    "settings.pinMismatch": "PINs don't match",
    "settings.pinMismatchDesc": "Please make sure both PINs match",
    "settings.pinSuccess": "PIN Set Successfully",
    "settings.pinSuccessDesc": "Your parental control PIN has been created",
    "settings.accessGranted": "Access Granted",
    "settings.accessGrantedDesc": "Welcome to Settings",
    "settings.incorrectPin": "Incorrect PIN",
    "settings.incorrectPinDesc": "Please try again",
    "settings.rereadDisclaimer": "Re-read Disclaimer",
    
    // Meal Examples
    "meals.title": "Kid-Friendly Meal Examples",
    "meals.subtitle": "Common meals with estimated carb counts",
    "meals.breakfast": "Breakfast",
    "meals.lunch": "Lunch",
    "meals.dinner": "Dinner",
    "meals.supper": "Supper",
    "meals.disclaimer": "💡 These are estimates. Always verify with nutrition labels when possible.",
    "meals.insulinEstimate": "~{insulin}u insulin",
    
    // Meal names
    "meal.pancakes": "Pancakes with syrup",
    "meal.pancakesDesc": "2 medium pancakes with 2 tbsp syrup",
    "meal.cereal": "Cereal with milk",
    "meal.cerealDesc": "1 cup cereal with 1/2 cup milk",
    "meal.toast": "Toast with jam",
    "meal.toastDesc": "2 slices toast with 1 tbsp jam",
    "meal.oatmeal": "Oatmeal with banana",
    "meal.oatmealDesc": "1 cup oatmeal with 1 small banana",
    "meal.waffles": "Waffles with fruit",
    "meal.wafflesDesc": "2 waffles with 1/2 cup berries",
    "meal.bagel": "Bagel with cream cheese",
    "meal.bagelDesc": "1 small bagel with 2 tbsp cream cheese",
    "meal.pbSandwich": "Peanut butter sandwich",
    "meal.pbSandwichDesc": "2 slices bread with 2 tbsp PB",
    "meal.macCheese": "Mac and cheese",
    "meal.macCheeseDesc": "1 cup prepared mac and cheese",
    "meal.nuggets": "Chicken nuggets meal",
    "meal.nuggetsDesc": "6 nuggets with small fries",
    "meal.grilledCheese": "Grilled cheese",
    "meal.grilledCheeseDesc": "2 slices bread with cheese",
    "meal.pizza": "Pizza slice",
    "meal.pizzaDesc": "1 slice cheese pizza",
    "meal.turkeyWrap": "Turkey wrap",
    "meal.turkeyWrapDesc": "1 tortilla with turkey and veggies",
    "meal.roastChicken": "Roast chicken with veggies",
    "meal.roastChickenDesc": "Baked chicken with roasted vegetables and small potato",
    "meal.meatloaf": "Meatloaf with sides",
    "meal.meatloafDesc": "Meatloaf slice with green beans and mashed potatoes",
    "meal.stirFry": "Beef stir fry",
    "meal.stirFryDesc": "Beef stir fry with vegetables over rice",
    "meal.salmon": "Baked salmon dinner",
    "meal.salmonDesc": "Salmon fillet with broccoli and rice",
    "meal.chickenParm": "Chicken parmesan",
    "meal.chickenParmDesc": "Breaded chicken with melted cheese over spaghetti",
    "meal.porkChop": "Pork chop dinner",
    "meal.porkChopDesc": "Grilled pork chop with applesauce and corn",
    "meal.spaghetti": "Spaghetti with meatballs",
    "meal.spaghettiDesc": "1 cup pasta with 3 meatballs",
    "meal.chickenRice": "Chicken with rice",
    "meal.chickenRiceDesc": "4 oz chicken with 3/4 cup rice",
    "meal.tacos": "Tacos",
    "meal.tacosDesc": "2 soft tacos with meat and toppings",
    "meal.fishSticks": "Fish sticks meal",
    "meal.fishSticksDesc": "5 fish sticks with mashed potatoes",
    "meal.hamburger": "Hamburger with bun",
    "meal.hamburgerDesc": "1 burger with bun and small side",
    "meal.quesadilla": "Chicken quesadilla",
    "meal.quesadillaDesc": "1 quesadilla with cheese and chicken",
  },
  sv: {
    // StartPage
    "start.welcome": "Välkommen till CarbSmart!",
    "start.description": "Ta bilder på måltider och få omedelbar uppskattning av kolhydrater för att hjälpa till att hantera ditt barns diabetes",
    "start.getStarted": "Kom igång",
    "start.selectLanguage": "Välj språk",
    "start.disclaimerTitle": "Viktig ansvarsfriskrivning",
    "start.disclaimerText": "Denna app använder AI för att uppskatta kolhydratinnehållet i mat från bilder. Resultaten är endast uppskattningar och kan vara felaktiga beroende på hur fotona tas.\n\nAnvänd alltid detta verktyg med försiktighet — du bör förstå grunderna för kolhydraträkning och insulinberäkning innan användning.\n\nAppen och dess skapare tar inget ansvar för medicinska eller kostmässiga beslut baserade på dessa resultat. Bekräfta alltid med en vårdpersonal vid tveksamhet.",
    "start.accept": "Jag förstår och accepterar",
    "start.decline": "Avböj",
    
    // Main App
    "app.title": "CarbSmart",
    "app.subtitle": "Ta ett foto, känn dina kolhydrater!",
    "app.analyzing": "Analyserar...",
    "app.analyzingDesc": "AI undersöker din matbild",
    "app.analysisComplete": "Analys klar!",
    "app.analysisCompleteDesc": "Hittade {carbs}g kolhydrater, föreslår {insulin} enheter insulin",
    "app.savedToHistory": "Sparat till historik",
    "app.savedToHistoryDesc": "Din måltid har sparats framgångsrikt",
    "app.error": "Fel",
    "app.errorDesc": "Misslyckades med att analysera bilden. Försök igen.",
    
    // Tabs
    "tabs.capture": "Fånga",
    "tabs.meals": "Måltider",
    "tabs.history": "Historik",
    "tabs.info": "Info",
    "tabs.settings": "Inställningar",
    
    // Camera
    "camera.title": "Fånga mat",
    "camera.takePhoto": "Ta foto",
    "camera.retake": "Ta om",
    "camera.analyze": "Analysera",
    "camera.error": "Kamerafel",
    "camera.errorDesc": "Kunde inte komma åt kameran. Kontrollera behörigheter.",
    
    // Results
    "results.title": "Resultat",
    "results.estimatedCarbs": "Uppskattade kolhydrater",
    "results.totalCarbs": "Totalt kolhydrater",
    "results.recommendedInsulin": "Rekommenderad insulindos",
    "results.insulinNeeded": "Insulin som behövs",
    "results.grams": "gram",
    "results.units": "enheter",
    "results.carbs": "Kolhydrater",
    "results.basedOnRatio": "Baserat på 1:{ratio} förhållande",
    "results.fromPhotos": "från {count} foton",
    "results.addMore": "Fler bilder",
    "results.done": "Klar - Beräkna & Spara",
    "results.abort": "Avbryt",
    "results.viewHistory": "Visa historik",
    "results.newPhoto": "Nytt foto",
    
    // History
    "history.title": "Senaste beräkningar",
    "history.noHistory": "Ingen historik ännu. Börja med att ta ett foto!",
    "history.meals": "måltid",
    "history.mealsPlural": "måltider",
    "history.carbs": "kolhydrater",
    "history.insulin": "insulin",
    "history.insulinNeeded": "insulin behövs",
    "history.today": "Idag",
    
    // Settings
    "settings.title": "Dina inställningar",
    "settings.setupPin": "Ställ in föräldrakontroll",
    "settings.setupPinDesc": "Skapa en 4-siffrig PIN-kod för att skydda dina inställningar",
    "settings.enterPin": "Ange PIN",
    "settings.confirmPin": "Bekräfta PIN",
    "settings.setPin": "Ställ in PIN",
    "settings.unlockSettings": "Ange PIN för att komma åt inställningar",
    "settings.parentalControl": "Föräldrakontroll är aktiverad",
    "settings.unlock": "Lås upp inställningar",
    "settings.settingsUnlocked": "Inställningar upplåsta",
    "settings.lockSettings": "Lås inställningar",
    "settings.insulinRatio": "Insulin-till-kolhydrat-förhållande (I:C)",
    "settings.insulinRatioDesc": "1 enhet insulin täcker {ratio} gram kolhydrater",
    "settings.comments": "Kommentarer / Anteckningar",
    "settings.commentsPlaceholder": "Lägg till anteckningar eller kommentarer om din diabeteshantering...",
    "settings.commentsDesc": "Använd detta utrymme för påminnelser, läkaranteckningar eller annan viktig information",
    "settings.invalidPin": "Ogiltig PIN",
    "settings.invalidPinDesc": "PIN måste vara exakt 4 siffror",
    "settings.pinMismatch": "PIN-koderna matchar inte",
    "settings.pinMismatchDesc": "Se till att båda PIN-koderna matchar",
    "settings.pinSuccess": "PIN inställd",
    "settings.pinSuccessDesc": "Din föräldrakontroll PIN har skapats",
    "settings.accessGranted": "Åtkomst beviljad",
    "settings.accessGrantedDesc": "Välkommen till inställningar",
    "settings.incorrectPin": "Felaktig PIN",
    "settings.incorrectPinDesc": "Försök igen",
    "settings.rereadDisclaimer": "Läs ansvarsfriskrivning igen",
    
    // Meal Examples
    "meals.title": "Barnvänliga måltidsexempel",
    "meals.subtitle": "Vanliga måltider med uppskattade kolhydrater",
    "meals.breakfast": "Frukost",
    "meals.lunch": "Lunch",
    "meals.dinner": "Middag",
    "meals.supper": "Kvällsmat",
    "meals.disclaimer": "💡 Dessa är uppskattningar. Verifiera alltid med näringsdeklarationer när det är möjligt.",
    "meals.insulinEstimate": "~{insulin}e insulin",
    
    // Meal names
    "meal.pancakes": "Pannkakor med sirap",
    "meal.pancakesDesc": "2 medelstora pannkakor med 2 msk sirap",
    "meal.cereal": "Flingor med mjölk",
    "meal.cerealDesc": "1 kopp flingor med 1/2 kopp mjölk",
    "meal.toast": "Rostat bröd med sylt",
    "meal.toastDesc": "2 skivor rostat bröd med 1 msk sylt",
    "meal.oatmeal": "Havregrynsgröt med banan",
    "meal.oatmealDesc": "1 kopp havregrynsgröt med 1 liten banan",
    "meal.waffles": "Våfflor med frukt",
    "meal.wafflesDesc": "2 våfflor med 1/2 kopp bär",
    "meal.bagel": "Bagel med färskost",
    "meal.bagelDesc": "1 liten bagel med 2 msk färskost",
    "meal.pbSandwich": "Jordnötssmörsmacka",
    "meal.pbSandwichDesc": "2 skivor bröd med 2 msk jordnötssmör",
    "meal.macCheese": "Makaroner och ost",
    "meal.macCheeseDesc": "1 kopp tillagade makaroner och ost",
    "meal.nuggets": "Kycklingnuggets måltid",
    "meal.nuggetsDesc": "6 nuggets med små pommes",
    "meal.grilledCheese": "Grillad ostsmörgås",
    "meal.grilledCheeseDesc": "2 skivor bröd med ost",
    "meal.pizza": "Pizzabit",
    "meal.pizzaDesc": "1 bit ostpizza",
    "meal.turkeyWrap": "Kalkonwrap",
    "meal.turkeyWrapDesc": "1 tortilla med kalkon och grönsaker",
    "meal.roastChicken": "Rostad kyckling med grönsaker",
    "meal.roastChickenDesc": "Bakad kyckling med rostade grönsaker och liten potatis",
    "meal.meatloaf": "Köttfärslimpa med tillbehör",
    "meal.meatloafDesc": "Köttfärslimpskiva med gröna bönor och potatismos",
    "meal.stirFry": "Biff wok",
    "meal.stirFryDesc": "Biff wok med grönsaker över ris",
    "meal.salmon": "Bakad lax middag",
    "meal.salmonDesc": "Laxfilé med broccoli och ris",
    "meal.chickenParm": "Kycklingparmigiana",
    "meal.chickenParmDesc": "Panerad kyckling med smält ost över spaghetti",
    "meal.porkChop": "Fläskkotlett middag",
    "meal.porkChopDesc": "Grillad fläskkotlett med äppelmos och majs",
    "meal.spaghetti": "Spaghetti med köttbullar",
    "meal.spaghettiDesc": "1 kopp pasta med 3 köttbullar",
    "meal.chickenRice": "Kyckling med ris",
    "meal.chickenRiceDesc": "115g kyckling med 3/4 kopp ris",
    "meal.tacos": "Tacos",
    "meal.tacosDesc": "2 mjuka tacos med kött och pålägg",
    "meal.fishSticks": "Fiskpinnar måltid",
    "meal.fishSticksDesc": "5 fiskpinnar med potatismos",
    "meal.hamburger": "Hamburgare med bröd",
    "meal.hamburgerDesc": "1 burgare med bröd och liten tillbehör",
    "meal.quesadilla": "Kycklingquesadilla",
    "meal.quesadillaDesc": "1 quesadilla med ost och kyckling",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
