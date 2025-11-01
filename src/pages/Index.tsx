import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Calendar, Utensils, Settings, Info, LogOut, Shield, Languages, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CameraCapture from "@/components/CameraCaptureTranslated";
import ResultsDisplay from "@/components/ResultsDisplayTranslated";
import DailyHistoryView from "@/components/DailyHistoryViewTranslated";
import MealExamplesView from "@/components/MealExamplesViewTranslated";
import SettingsView from "@/components/SettingsViewTranslated";
import StartPage from "@/pages/StartPage";
import photoExampleImg from "@/assets/photo-meal-example.jpg";

export interface CalculationResult {
  id: string;
  timestamp: Date;
  imageUrl: string;
  carbsEstimate: number;
  insulinDose: number;
  insulinRatio: number;
}

const Index = () => {
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [currentResults, setCurrentResults] = useState<CalculationResult[]>([]);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [insulinRatio, setInsulinRatio] = useState(10); // Default 1:10 ratio
  const [comments, setComments] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (session?.user) {
          checkAdminStatus(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    } else if (user) {
      // Track app start
      const trackAppStart = async () => {
        try {
          await supabase.from("app_statistics").insert({
            user_id: user.id,
            event_type: "app_start"
          });
        } catch (error) {
          console.error("Error tracking app start:", error);
        }
      };
      trackAppStart();

      // Load meal history from database
      const loadHistory = async () => {
        try {
          const { data, error } = await supabase
            .from("meal_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false });

          if (error) throw error;

          if (data) {
            const loadedHistory: CalculationResult[] = data.map((log) => ({
              id: log.id,
              timestamp: new Date(log.timestamp),
              imageUrl: log.image_url,
              carbsEstimate: Number(log.carbs_estimate),
              insulinDose: Number(log.insulin_dose),
              insulinRatio: Number(log.insulin_ratio),
            }));
            setHistory(loadedHistory);
          }
        } catch (error) {
          console.error("Error loading history:", error);
        }
      };
      loadHistory();
    }
  }, [user, isLoading, navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

      setIsAdmin(!!data);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowLogoutDialog(false);
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center">
        <p className="text-muted-foreground">{t("auth.loading")}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showStartPage) {
    return <StartPage onStart={() => setShowStartPage(false)} />;
  }

  const handlePhotoCapture = async (imageDataUrl: string) => {
    try {
      toast({
        title: t("app.analyzing"),
        description: t("app.analyzingDesc"),
      });

      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageData: imageDataUrl },
      });

      if (error) {
        throw error;
      }

      const { carbsEstimate } = data;
      const insulinDose = Number((carbsEstimate / insulinRatio).toFixed(1));
      
      const result: CalculationResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        imageUrl: imageDataUrl,
        carbsEstimate,
        insulinDose,
        insulinRatio,
      };
      
      setCurrentResults(prev => [...prev, result]);
      setShowCamera(false); // Close camera to show results
      
      toast({
        title: t("app.analysisComplete"),
        description: t("app.analysisCompleteDesc", { carbs: carbsEstimate, insulin: insulinDose }),
      });
    } catch (error) {
      toast({
        title: t("app.error"),
        description: t("app.errorDesc"),
        variant: "destructive",
      });
      setShowCamera(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center gap-2 mb-4">
            <div className="flex-1 text-center md:text-center">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">
                {t("app.title")}
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg">
                {t("app.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Menu"
                    className="h-9 w-9"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-background w-48">
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    {t("start.selectLanguage")}
                  </div>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("en")}
                    className={language === "en" ? "bg-accent" : ""}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("sv")}
                    className={language === "sv" ? "bg-accent" : ""}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    🇸🇪 Svenska
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("fr")}
                    className={language === "fr" ? "bg-accent" : ""}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    🇫🇷 Français
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("es")}
                    className={language === "es" ? "bg-accent" : ""}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    🇪🇸 Español
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <div className="h-px bg-border my-1" />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("auth.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("auth.signOut")}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>
                {t("auth.signOut")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Camera View - Full Screen Override */}
        {showCamera && (
          <CameraCapture
            onCapture={handlePhotoCapture}
            onCancel={() => {
              if (currentResults.length > 0) {
                // If we have results, show them instead of closing
                setShowCamera(false);
              } else {
                // No results, go back to main view
                setShowCamera(false);
              }
            }}
          />
        )}

        {/* Results Display - Full Screen Override */}
        {!showCamera && currentResults.length > 0 && (
          <ResultsDisplay
            results={currentResults}
            onMore={() => setShowCamera(true)}
            onDone={async () => {
              try {
                // Save each result to database
                const savePromises = currentResults.map((result) =>
                  supabase.from("meal_logs").insert({
                    user_id: user!.id,
                    timestamp: result.timestamp.toISOString(),
                    image_url: result.imageUrl,
                    carbs_estimate: result.carbsEstimate,
                    insulin_dose: result.insulinDose,
                    insulin_ratio: result.insulinRatio,
                  })
                );

                await Promise.all(savePromises);

                // Update local history
                setHistory(prev => [...currentResults, ...prev]);
                setCurrentResults([]);
                
                toast({
                  title: t("app.savedToHistory"),
                  description: t("app.savedToHistoryDesc"),
                });
              } catch (error) {
                console.error("Error saving to history:", error);
                toast({
                  title: t("app.error"),
                  description: "Failed to save meal data",
                  variant: "destructive",
                });
              }
            }}
            onClose={() => setCurrentResults([])}
          />
        )}

        {/* Main Tabs */}
        {!showCamera && currentResults.length === 0 && (
          <Tabs defaultValue="capture" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 md:mb-8">
              <TabsTrigger value="capture" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2">
                <Camera className="h-4 w-4" />
                <span className="hidden md:inline">{t("tabs.capture")}</span>
              </TabsTrigger>
              <TabsTrigger value="examples" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2">
                <Utensils className="h-4 w-4" />
                <span className="hidden md:inline">{t("tabs.meals")}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">{t("tabs.history")}</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2">
                <Info className="h-4 w-4" />
                <span className="hidden md:inline">{t("tabs.info")}</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm px-2">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">{t("tabs.settings")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="capture" className="space-y-8">
              {/* Example Photo */}
              <div className="rounded-2xl overflow-hidden shadow-card">
                <img
                  src={photoExampleImg}
                  alt="Take a photo of your meal"
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* Main Action Button */}
              <div>
                <Button
                  onClick={() => setShowCamera(true)}
                  className="w-full h-24 text-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-card"
                  size="lg"
                >
                  <Camera className="mr-3 h-10 w-10" />
                  {t("camera.takePhoto")}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="examples">
              <MealExamplesView insulinRatio={insulinRatio} />
            </TabsContent>

            <TabsContent value="history">
              <DailyHistoryView
                history={history}
                onSelectItem={(result) => setCurrentResults([result])}
              />
            </TabsContent>

            <TabsContent value="info">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary" />
                    {t("start.disclaimerTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed whitespace-pre-line text-muted-foreground">
                    {t("start.disclaimerText")}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <SettingsView
                insulinRatio={insulinRatio}
                onRatioChange={setInsulinRatio}
                comments={comments}
                onCommentsChange={setComments}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        {!showCamera && currentResults.length === 0 && (
          <footer className="mt-12 pt-6 pb-4 text-center border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              CarbSmart by <span className="font-semibold text-foreground">TidalDev</span>
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Index;
