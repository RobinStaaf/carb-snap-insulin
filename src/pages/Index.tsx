import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Calendar, Utensils, Settings, Info, LogOut, Shield, Languages } from "lucide-react";
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
      setShowCamera(false);
      
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {t("app.title")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("app.subtitle")}
              </p>
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    title={t("start.selectLanguage")}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    Language
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-background">
                  <DropdownMenuItem 
                    onClick={() => setLanguage("en")}
                    className={language === "en" ? "bg-accent" : ""}
                  >
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("sv")}
                    className={language === "sv" ? "bg-accent" : ""}
                  >
                    🇸🇪 Svenska
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("fr")}
                    className={language === "fr" ? "bg-accent" : ""}
                  >
                    🇫🇷 Français
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("es")}
                    className={language === "es" ? "bg-accent" : ""}
                  >
                    🇪🇸 Español
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/admin")}
                  title="Admin Dashboard"
                >
                  <Shield className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title={t("auth.signOut")}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Camera View - Full Screen Override */}
        {showCamera && (
          <CameraCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setShowCamera(false)}
          />
        )}

        {/* Results Display - Full Screen Override */}
        {currentResults.length > 0 && (
          <ResultsDisplay
            results={currentResults}
            onMore={() => setShowCamera(true)}
            onDone={() => {
              setHistory(prev => [...currentResults, ...prev].slice(0, 10));
              setCurrentResults([]);
              toast({
                title: t("app.savedToHistory"),
                description: t("app.savedToHistoryDesc"),
              });
            }}
            onClose={() => setCurrentResults([])}
          />
        )}

        {/* Main Tabs */}
        {!showCamera && currentResults.length === 0 && (
          <Tabs defaultValue="capture" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="capture" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                {t("tabs.capture")}
              </TabsTrigger>
              <TabsTrigger value="examples" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                {t("tabs.meals")}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("tabs.history")}
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                {t("tabs.info")}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("tabs.settings")}
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
      </div>
    </div>
  );
};

export default Index;
