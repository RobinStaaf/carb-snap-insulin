import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, ArrowLeft, Trash2, Check, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'declined';
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
    } catch (error) {
      console.error("Error loading users:", error);
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t("admin.inviteUser")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
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
            <CardTitle>{t("admin.users")} ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.email")}</TableHead>
                  <TableHead>{t("admin.name")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                  <TableHead>{t("admin.role")}</TableHead>
                  <TableHead>{t("admin.created")}</TableHead>
                  <TableHead className="text-right">{t("admin.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
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
                      <TableCell className="text-right space-x-2">
                        {user.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveUser(user.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {t("admin.approve")}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeclineUser(user.id)}
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
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteUserId(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
