import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, AlertTriangle } from "lucide-react";
import carbSmartLogo from "@/assets/carbsmart-logo.png";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface StartPageProps {
  onStart: () => void;
}

const StartPage = ({ onStart }: StartPageProps) => {
  const { language, setLanguage, t } = useLanguage();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("disclaimerAccepted");
    if (accepted === "true") {
      setDisclaimerAccepted(true);
    }
  }, []);

  const handleGetStarted = () => {
    if (disclaimerAccepted) {
      onStart();
    } else {
      setShowDisclaimer(true);
    }
  };

  const handleAcceptDisclaimer = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    onStart();
  };

  const handleDeclineDisclaimer = () => {
    setShowDisclaimer(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center space-y-8">
          {/* Language Selector */}
          <div className="flex justify-end animate-in fade-in duration-700">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-soft">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                <SelectTrigger className="w-32 border-0 bg-transparent h-8 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sv">Svenska</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logo */}
          <div className="flex justify-center animate-in fade-in zoom-in duration-700">
            <img
              src={carbSmartLogo}
              alt="CarbSmart - Kids & Type 1 Diabetes"
              className="w-72 h-72 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Welcome Text */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <h1 className="text-4xl font-bold text-foreground">
              {t("start.welcome")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("start.description")}
            </p>
          </div>

          {/* Start Button */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full h-16 text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-card"
            >
              {t("start.getStarted")}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Disclaimer Dialog */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <DialogTitle className="text-2xl">{t("start.disclaimerTitle")}</DialogTitle>
            </div>
            <DialogDescription className="text-base leading-relaxed whitespace-pre-line text-left">
              {t("start.disclaimerText")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDeclineDisclaimer}
              className="w-full sm:w-auto"
            >
              {t("start.decline")}
            </Button>
            <Button
              onClick={handleAcceptDisclaimer}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {t("start.accept")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartPage;
