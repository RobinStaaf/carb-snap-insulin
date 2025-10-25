import { useState, useEffect } from "react";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import SettingsPanel from "@/components/SettingsPanel";
import bcrypt from "bcryptjs";

interface SettingsViewProps {
  insulinRatio: number;
  onRatioChange: (ratio: number) => void;
  comments: string;
  onCommentsChange: (comments: string) => void;
}

const PIN_STORAGE_KEY = "carbsmart_parental_pin";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const AUTO_LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface PinStorage {
  hashedPin: string;
  failedAttempts: number;
  lockedUntil: number | null;
  lastUnlockTime: number | null;
}

const SettingsView = ({ insulinRatio, onRatioChange, comments, onCommentsChange }: SettingsViewProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndsAt, setLockoutEndsAt] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedData = localStorage.getItem(PIN_STORAGE_KEY);
    if (storedData) {
      try {
        const pinData: PinStorage = JSON.parse(storedData);
        setHasPin(true);
        
        // Check if locked
        if (pinData.lockedUntil && pinData.lockedUntil > Date.now()) {
          setIsLocked(true);
          setLockoutEndsAt(pinData.lockedUntil);
        }
      } catch {
        // Invalid data, treat as no PIN
        setHasPin(false);
      }
    }
  }, []);

  // Auto-lock timer
  useEffect(() => {
    if (!isUnlocked) return;

    const timer = setTimeout(() => {
      setIsUnlocked(false);
      toast({
        title: "Settings Locked",
        description: "Settings automatically locked after 30 minutes of inactivity",
      });
    }, AUTO_LOCK_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isUnlocked, toast]);

  // Lockout countdown
  useEffect(() => {
    if (!isLocked || !lockoutEndsAt) return;

    const interval = setInterval(() => {
      if (Date.now() >= lockoutEndsAt) {
        setIsLocked(false);
        setLockoutEndsAt(null);
        
        // Reset failed attempts
        const storedData = localStorage.getItem(PIN_STORAGE_KEY);
        if (storedData) {
          const pinData: PinStorage = JSON.parse(storedData);
          pinData.failedAttempts = 0;
          pinData.lockedUntil = null;
          localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pinData));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockoutEndsAt]);

  const handleSetPin = async () => {
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

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);
    
    const pinData: PinStorage = {
      hashedPin,
      failedAttempts: 0,
      lockedUntil: null,
      lastUnlockTime: Date.now(),
    };

    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pinData));
    setHasPin(true);
    setIsUnlocked(true);
    setIsSettingPin(false);
    setPin("");
    setConfirmPin("");
    toast({
      title: "PIN Set Successfully",
      description: "Your parental control PIN has been created. Settings will auto-lock after 30 minutes.",
    });
  };

  const handleVerifyPin = async () => {
    const storedData = localStorage.getItem(PIN_STORAGE_KEY);
    if (!storedData) return;

    try {
      const pinData: PinStorage = JSON.parse(storedData);

      // Check if locked
      if (pinData.lockedUntil && pinData.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil((pinData.lockedUntil - Date.now()) / 60000);
        toast({
          title: "Settings Locked",
          description: `Too many failed attempts. Try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          variant: "destructive",
        });
        setPin("");
        return;
      }

      // Verify PIN
      const isValid = await bcrypt.compare(pin, pinData.hashedPin);
      
      if (isValid) {
        // Reset failed attempts and unlock
        pinData.failedAttempts = 0;
        pinData.lockedUntil = null;
        pinData.lastUnlockTime = Date.now();
        localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pinData));
        
        setIsUnlocked(true);
        setIsLocked(false);
        setPin("");
        toast({
          title: "Access Granted",
          description: "Settings will auto-lock after 30 minutes of inactivity",
        });
      } else {
        // Increment failed attempts
        pinData.failedAttempts += 1;
        
        if (pinData.failedAttempts >= MAX_FAILED_ATTEMPTS) {
          // Lock the settings
          const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
          pinData.lockedUntil = lockUntil;
          setIsLocked(true);
          setLockoutEndsAt(lockUntil);
          
          toast({
            title: "Settings Locked",
            description: `Too many failed attempts. Settings locked for 15 minutes.`,
            variant: "destructive",
          });
        } else {
          const attemptsRemaining = MAX_FAILED_ATTEMPTS - pinData.failedAttempts;
          toast({
            title: "Incorrect PIN",
            description: `${attemptsRemaining} attempt${attemptsRemaining > 1 ? 's' : ''} remaining before lockout`,
            variant: "destructive",
          });
        }
        
        localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pinData));
        setPin("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify PIN. Please try again.",
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
    const getRemainingTime = () => {
      if (!lockoutEndsAt) return "";
      const remaining = Math.ceil((lockoutEndsAt - Date.now()) / 60000);
      return remaining > 0 ? `${remaining} minute${remaining > 1 ? 's' : ''}` : "";
    };

    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            {isLocked ? (
              <>
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Settings Temporarily Locked
              </>
            ) : (
              <>
                <Lock className="h-6 w-6 text-primary" />
                Enter PIN to Access Settings
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLocked ? (
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Too many failed PIN attempts
              </p>
              <p className="text-sm font-medium text-destructive">
                Locked for {getRemainingTime()}
              </p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Parental control is enabled
            </p>
          )}
          
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
              disabled={isLocked}
            />

            <Button
              onClick={handleVerifyPin}
              className="w-full"
              disabled={pin.length !== 4 || isLocked}
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
