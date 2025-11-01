import { useState, useEffect } from "react";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import SettingsPanel from "@/components/SettingsPanelTranslated";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";

interface SettingsViewProps {
  insulinRatio: number;
  onRatioChange: (ratio: number) => void;
  comments: string;
  onCommentsChange: (comments: string) => void;
}

const PIN_STORAGE_KEY = "carbsmart_parental_pin";

const SettingsView = ({ insulinRatio, onRatioChange, comments, onCommentsChange }: SettingsViewProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const loadPinData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);
      
      const { data } = await supabase
        .from("profiles")
        .select("parental_pin_hash")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setHasPin(!!data.parental_pin_hash);
      }
    };
    loadPinData();
  }, []);

  const handleSetPin = async () => {
    if (!userId) return;
    
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: t("settings.invalidPin"),
        description: t("settings.invalidPinDesc"),
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: t("settings.pinsNoMatch"),
        description: t("settings.pinsNoMatchDesc"),
        variant: "destructive",
      });
      return;
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    
    await supabase
      .from("profiles")
      .update({ parental_pin_hash: hashedPin })
      .eq("id", userId);

    setHasPin(true);
    setIsUnlocked(true);
    setIsSettingPin(false);
    setPin("");
    setConfirmPin("");
    toast({
      title: t("settings.pinSuccess"),
      description: t("settings.pinSuccessDesc"),
    });
  };

  const handleVerifyPin = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("parental_pin_hash")
      .eq("id", userId)
      .single();
    
    if (!data || !data.parental_pin_hash) return;

    const isValid = await bcrypt.compare(pin, data.parental_pin_hash);
    
    if (isValid) {
      setIsUnlocked(true);
      setPin("");
      toast({
        title: t("settings.accessGranted"),
        description: t("settings.accessGrantedDesc"),
      });
    } else {
      toast({
        title: t("settings.incorrectPin"),
        description: t("settings.incorrectPinDesc"),
        variant: "destructive",
      });
      setPin("");
    }
  };

  const handlePinInput = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
    }
  };

  const handleConfirmPinInput = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 4) {
      setConfirmPin(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  if (!hasPin) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
            {t("settings.setupPin")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {t("settings.setupPinDesc")}
          </p>
          
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("settings.enterPin")}</label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => handlePinInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleSetPin)}
                placeholder="••••"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("settings.confirmPin")}</label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => handleConfirmPinInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleSetPin)}
                placeholder="••••"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              onClick={handleSetPin}
              className="w-full"
              disabled={pin.length !== 4 || confirmPin.length !== 4}
            >
              {t("settings.setPin")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isUnlocked) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Lock className="h-6 w-6 text-primary" />
            {t("settings.unlockSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {t("settings.parentalControl")}
          </p>
          
          <div className="space-y-4 max-w-sm mx-auto">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => handlePinInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleVerifyPin)}
              placeholder="••••"
              className="text-center text-2xl tracking-widest"
              autoFocus
            />

            <Button
              onClick={handleVerifyPin}
              className="w-full"
              disabled={pin.length !== 4}
            >
              {t("settings.unlock")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-soft bg-accent/10 border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span className="font-medium">{t("settings.settingsUnlocked")}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUnlocked(false)}
            >
              {t("settings.lockSettings")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SettingsPanel
        insulinRatio={insulinRatio}
        onRatioChange={onRatioChange}
        comments={comments}
        onCommentsChange={onCommentsChange}
        onShowDisclaimer={() => setShowDisclaimer(true)}
      />

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
          <DialogFooter>
            <Button
              onClick={() => setShowDisclaimer(false)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {t("start.accept")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsView;
