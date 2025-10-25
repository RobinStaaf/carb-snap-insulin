import { useState, useEffect } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import SettingsPanel from "@/components/SettingsPanel";

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
  const { toast } = useToast();

  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    setHasPin(!!storedPin);
  }, []);

  const handleSetPin = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please make sure both PINs match",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(PIN_STORAGE_KEY, pin);
    setHasPin(true);
    setIsUnlocked(true);
    setIsSettingPin(false);
    setPin("");
    setConfirmPin("");
    toast({
      title: "PIN Set Successfully",
      description: "Your parental control PIN has been created",
    });
  };

  const handleVerifyPin = () => {
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    
    if (pin === storedPin) {
      setIsUnlocked(true);
      setPin("");
      toast({
        title: "Access Granted",
        description: "Welcome to Settings",
      });
    } else {
      toast({
        title: "Incorrect PIN",
        description: "Please try again",
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
            Set Up Parental Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Create a 4-digit PIN to protect your settings
          </p>
          
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter PIN</label>
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
              <label className="text-sm font-medium">Confirm PIN</label>
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
              Set PIN
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
            Enter PIN to Access Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Parental control is enabled
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
              Unlock Settings
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
              <span className="font-medium">Settings Unlocked</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUnlocked(false)}
            >
              Lock Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <SettingsPanel
        insulinRatio={insulinRatio}
        onRatioChange={onRatioChange}
        comments={comments}
        onCommentsChange={onCommentsChange}
      />
    </div>
  );
};

export default SettingsView;
