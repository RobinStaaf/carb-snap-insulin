import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FirstAdminSetup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const createFirstAdmin = async () => {
    setIsCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-first-admin", {
        body: { 
          email: "robin@speedphoto.eu", 
          password: "NEN4ever!",
          full_name: "Robin"
        },
      });

      if (error) throw error;

      toast({
        title: "Admin Account Created",
        description: "You can now log in with your credentials",
      });

      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>First Admin Setup</CardTitle>
          <CardDescription>
            Create the first administrator account for robin@speedphoto.eu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={createFirstAdmin} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Creating Admin..." : "Create Admin Account"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            This can only be done once. After creation, please log in with your credentials.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstAdminSetup;
