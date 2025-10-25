import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import carbSmartLogo from "@/assets/carbsmart-logo.png";

interface StartPageProps {
  onStart: () => void;
}

const StartPage = ({ onStart }: StartPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center space-y-8">
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
              Welcome to CarbSmart!
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Take photos of meals and get instant carb estimates to help manage your child's diabetes
            </p>
          </div>

          {/* Start Button */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button
              onClick={onStart}
              size="lg"
              className="w-full h-16 text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-card"
            >
              Get Started
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
