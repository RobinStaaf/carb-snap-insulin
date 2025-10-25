import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import carbsmartLogo from "@/assets/carbsmart-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: t("auth.signupSuccess"),
        description: t("auth.signupSuccessDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("app.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check user status
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profileData) {
        await supabase.auth.signOut();
        toast({
          title: t("app.error"),
          description: t("auth.profileError"),
          variant: "destructive",
        });
        return;
      }

      if (profileData.status === 'pending') {
        await supabase.auth.signOut();
        toast({
          title: t("auth.accountPending"),
          description: t("auth.accountPendingDesc"),
          variant: "destructive",
        });
        return;
      }

      if (profileData.status === 'declined') {
        await supabase.auth.signOut();
        toast({
          title: t("auth.accountDeclined"),
          description: t("auth.accountDeclinedDesc"),
          variant: "destructive",
        });
        return;
      }

      navigate("/");
    } catch (error: any) {
      toast({
        title: t("app.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: t("app.error"),
          description: t("auth.notAdmin"),
        });
        return;
      }

      navigate("/admin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("app.error"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: t("auth.resetEmailSent"),
        description: t("auth.checkEmail"),
      });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("app.error"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Languages className="h-4 w-4" />
              <span>Language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("sv")} className={language === "sv" ? "bg-accent" : ""}>
              Svenska
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("fr")} className={language === "fr" ? "bg-accent" : ""}>
              Français
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("es")} className={language === "es" ? "bg-accent" : ""}>
              Español
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src={carbsmartLogo} 
            alt="CarbSmart" 
            className="h-16 mx-auto mb-4"
          />
          <CardTitle className="text-2xl">{t("auth.welcome")}</CardTitle>
          <CardDescription>{t("auth.welcomeDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
              <TabsTrigger value="admin">{t("auth.admin")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder={t("auth.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    {t("auth.forgotPassword")}
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("auth.loading") : t("auth.signIn")}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder={t("auth.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("auth.loading") : t("auth.signUp")}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleAdminSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder={t("auth.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    {t("auth.forgotPassword")}
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("auth.loading") : t("auth.adminSignIn")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {showForgotPassword && (
            <div className="mt-4 p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-4">{t("auth.resetPassword")}</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder={t("auth.email")}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                    }}
                  >
                    {t("auth.cancel")}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
