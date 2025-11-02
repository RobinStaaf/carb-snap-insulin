import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, AlertTriangle } from "lucide-react";
import carbSmartLogo from "@/assets/carbsmart-logo.png";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StartPageProps {
  onStart: () => void;
}

const StartPage = ({ onStart }: StartPageProps) => {
  const { language, setLanguage, t } = useLanguage();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationEmail, setApplicationEmail] = useState("");
  const [applicationDescription, setApplicationDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Load disclaimer status from database
        const { data } = await supabase
          .from("profiles")
          .select("disclaimer_accepted")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setDisclaimerAccepted(data.disclaimer_accepted);
        }
      }
    };
    getUser();
  }, []);

  const handleGetStarted = () => {
    if (disclaimerAccepted) {
      onStart();
    } else {
      setShowDisclaimer(true);
    }
  };

  const handleAcceptDisclaimer = async () => {
    if (userId) {
      try {
        await supabase
          .from("profiles")
          .update({ disclaimer_accepted: true })
          .eq("id", userId);
      } catch (error) {
        console.error("Error saving disclaimer acceptance:", error);
      }
    }
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    onStart();
  };

  const handleDeclineDisclaimer = () => {
    setShowDisclaimer(false);
  };

  const handleSubmitApplication = async () => {
    if (!applicationEmail || !applicationDescription) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert application
      const { error: insertError } = await supabase
        .from("membership_applications")
        .insert({
          email: applicationEmail,
          description: applicationDescription,
        });

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          toast.error("An application with this email already exists");
        } else {
          throw insertError;
        }
        return;
      }

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-application-email', {
        body: {
          email: applicationEmail,
          type: 'received',
        },
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the application if email fails
      }

      toast.success("Application submitted! Check your email for confirmation.");
      setShowApplicationForm(false);
      setApplicationEmail("");
      setApplicationDescription("");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-md w-full">
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center animate-in fade-in zoom-in duration-700">
            <img
              src={carbSmartLogo}
              alt="CarbSmart - Kids & Type 1 Diabetes"
              className="w-64 h-64 md:w-72 md:h-72 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Language Selector - Moved below logo */}
          <div className="flex justify-center animate-in fade-in duration-700">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-soft">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                <SelectTrigger className="w-32 border-0 bg-transparent h-8 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="sv">🇸🇪 Svenska</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {t("start.welcome")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("start.description")}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full h-16 text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-card"
            >
              {t("start.getStarted")}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button
              onClick={() => setShowApplicationForm(true)}
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg"
            >
              {t("application.title")}
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

      {/* Application Form Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("application.title")}</DialogTitle>
            <DialogDescription>
              {t("application.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("application.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("application.whyJoin")}</Label>
              <Textarea
                id="description"
                placeholder={t("application.whyJoinPlaceholder")}
                className="min-h-32"
                value={applicationDescription}
                onChange={(e) => setApplicationDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApplicationForm(false)}
              disabled={isSubmitting}
            >
              {t("application.cancel")}
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("application.submitting") : t("application.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartPage;
