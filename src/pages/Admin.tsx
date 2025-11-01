import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, ArrowLeft, Trash2, Check, X, BarChart3, Search, Mail } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'declined';
  last_login: string | null;
  login_count: number;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState(
    "Welcome! You have been invited to join our application. Your temporary password is included below. Please change it after your first login for security purposes."
  );
  const [searchEmail, setSearchEmail] = useState("");
  const [filterName, setFilterName] = useState("");
  const [totalAppStarts, setTotalAppStarts] = useState(0);
  const [userGrowthData, setUserGrowthData] = useState<{ date: string; count: number }[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: t("admin.accessDenied"),
          description: t("admin.noPermissions"),
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadUsers();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (profiles) setUsers(profiles);
      if (roles) setUserRoles(roles);
      
      // Load statistics
      await loadStatistics();
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get total app starts
      const { count: startsCount } = await supabase
        .from("app_statistics")
        .select("*", { count: 'exact', head: true })
        .eq("event_type", "app_start");
      
      if (startsCount) setTotalAppStarts(startsCount);

      // Get user growth data (users per day for last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (profiles) {
        // Group users by date
        const growthMap = new Map<string, number>();
        profiles.forEach(profile => {
          const date = new Date(profile.created_at).toLocaleDateString();
          growthMap.set(date, (growthMap.get(date) || 0) + 1);
        });

        const growthData = Array.from(growthMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setUserGrowthData(growthData);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email, password, full_name: fullName, invited_by: currentUser.id },
      });

      if (error) throw error;

      toast({
        title: t("admin.userCreated"),
        description: t("admin.successInvite", { email }),
      });

      setEmail("");
      setPassword("");
      setFullName("");
      loadUsers();
    } catch (error: any) {
      toast({
        title: t("app.error"),
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: deleteUserId },
      });

      if (error) throw error;

      toast({
        title: t("admin.userDeleted"),
        description: t("admin.userRemoved"),
      });

      setDeleteUserId(null);
      loadUsers();
    } catch (error: any) {
      toast({
        title: t("app.error"),
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;
        toast({ title: t("admin.adminRoleRemoved") });
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (error) throw error;
        toast({ title: t("admin.adminRoleGranted") });
      }

      loadUsers();
    } catch (error: any) {
      toast({
        title: t("app.error"),
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const getUserRole = (userId: string): 'admin' | 'user' => {
    const adminRole = userRoles.find(r => r.user_id === userId && r.role === 'admin');
    return adminRole ? 'admin' : 'user';
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: 'approved' })
        .eq("id", userId);

      if (error) throw error;
      
      toast({ 
        title: t("admin.userApproved"),
        description: t("admin.userCanLogin")
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: t("app.error"),
        description: error.message || "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  const handleDeclineUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: 'declined' })
        .eq("id", userId);

      if (error) throw error;
      
      toast({ 
        title: t("admin.userDeclined"),
        description: t("admin.userDenied")
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: t("app.error"),
        description: error.message || "Failed to decline user",
        variant: "destructive",
      });
    }
  };

  const handleSendResetEmail = async (userEmail: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Reset Email Sent",
        description: `Password reset email sent to ${userEmail}`,
      });
    } catch (error: any) {
      toast({
        title: t("app.error"),
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("admin.loading")}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Filter users based on search and filter inputs
  const filteredUsers = users.filter(user => {
    const matchesEmail = searchEmail === "" || user.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesName = filterName === "" || (user.full_name?.toLowerCase().includes(filterName.toLowerCase()) || false);
    return matchesEmail && matchesName;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.backToApp")}
          </Button>
        </div>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">App Starts</p>
                <p className="text-2xl font-bold">{totalAppStarts}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">New Users (30 days)</p>
                <p className="text-2xl font-bold">
                  {userGrowthData.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
            </div>
            {userGrowthData.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">User Growth (Last 30 Days)</p>
                <div className="flex gap-1 h-24 items-end">
                  {userGrowthData.map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-primary rounded-t hover:bg-primary/80 transition-colors"
                      style={{ height: `${(item.count / Math.max(...userGrowthData.map(d => d.count))) * 100}%` }}
                      title={`${item.date}: ${item.count} users`}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t("admin.inviteUser")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteMessage">Invitation Message</Label>
                <Textarea
                  id="inviteMessage"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Enter invitation message..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("admin.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("admin.temporaryPassword")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("admin.minCharacters")}
                    minLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("admin.fullName")}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? t("admin.creating") : t("admin.createAccount")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.users")} ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="searchEmail" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search by Email
                </Label>
                <Input
                  id="searchEmail"
                  type="text"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Search email..."
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="filterName" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Filter by Name
                </Label>
                <Input
                  id="filterName"
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Filter name..."
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.email")}</TableHead>
                  <TableHead>{t("admin.name")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                  <TableHead>{t("admin.role")}</TableHead>
                  <TableHead>{t("admin.created")}</TableHead>
                  <TableHead>Login Count</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">{t("admin.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const role = getUserRole(user.id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || "-"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            user.status === 'approved' ? 'default' : 
                            user.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                          {role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.login_count}
                      </TableCell>
                      <TableCell>
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveUser(user.id)}
                                className="w-24"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                {t("admin.approve")}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeclineUser(user.id)}
                                className="w-24"
                              >
                                <X className="h-4 w-4 mr-1" />
                                {t("admin.decline")}
                              </Button>
                            </>
                          )}
                          {user.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAdmin(user.id, role === 'admin')}
                            >
                              {role === 'admin' ? t("admin.removeAdmin") : t("admin.makeAdmin")}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendResetEmail(user.email)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteUserId(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.deleteUser")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>{t("admin.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
