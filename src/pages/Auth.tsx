import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Languages } from "lucide-react";
import carbsmartLogo from "@/assets/carbsmart-logo.png";
import { toast as sonnerToast } from "sonner";

const getSafeNext = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationEmail, setApplicationEmail] = useState("");
  const [applicationDescription, setApplicationDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      navigate(getSafeNext() ?? "/");
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

      navigate(getSafeNext() ?? "/admin");
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

  useEffect(() => {
    // Check if this is a password recovery flow
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setShowResetPassword(true);
    }
  }, []);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: t("app.error"),
        description: "Passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: t("app.error"),
        description: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated",
      });

      // Clear the hash and redirect to sign in
      window.location.hash = '';
      setShowResetPassword(false);
      setNewPassword("");
      setConfirmPassword("");
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

  const handleSubmitApplication = async () => {
    if (!applicationEmail || !applicationDescription) {
      sonnerToast.error("Please fill in all fields");
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
        if (insertError.code === '23505') {
          sonnerToast.error("An application with this email already exists");
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
      }

      sonnerToast.success("Application submitted! Check your email for confirmation.");
      setShowApplicationForm(false);
      setApplicationEmail("");
      setApplicationDescription("");
    } catch (error) {
      console.error("Error submitting application:", error);
      sonnerToast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src={carbsmartLogo} 
            alt="CarbSmart" 
            className="h-16 mx-auto mb-4"
          />
          
          {/* Language Selector - Moved here for better mobile visibility */}
          <div className="flex justify-center mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Languages className="h-4 w-4" />
                  <span>Language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-background">
                <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
                  🇬🇧 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("sv")} className={language === "sv" ? "bg-accent" : ""}>
                  🇸🇪 Svenska
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("fr")} className={language === "fr" ? "bg-accent" : ""}>
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")} className={language === "es" ? "bg-accent" : ""}>
                  🇪🇸 Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <CardTitle className="text-2xl">{t("auth.welcome")}</CardTitle>
          <CardDescription>{t("auth.welcomeDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {showResetPassword ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Set New Password</h3>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("auth.loading") : "Update Password"}
                </Button>
              </form>
            </div>
          ) : (
            <>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
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

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-center text-muted-foreground mb-3">
                  {t("application.noAccount")}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowApplicationForm(true)}
                >
                  {t("application.title")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
              <Label htmlFor="app-email">{t("application.email")}</Label>
              <Input
                id="app-email"
                type="email"
                placeholder="your.email@example.com"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-description">{t("application.whyJoin")}</Label>
              <Textarea
                id="app-description"
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

export default Auth;
