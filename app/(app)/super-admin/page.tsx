"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/session-context";
import {
  MoreHorizontal,
  UserPlus,
  PlusCircle,
  Trash2,
  Edit,
  KeyRound,
} from "lucide-react";

// --- Tipe Data ---
type User = {
  id: number;
  username: string;
  group_name: string;
  role: "user" | "superadmin";
};
type Group = { name: string };
type Schedule = { [key: string]: string };
type AdminData = { users: User[]; groups: Group[]; schedule: Schedule };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Komponen Skeleton ---
const SuperAdminPageSkeleton = () => (
  <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-0">
    <header>
      <Skeleton className="h-8 w-48" />
    </header>
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full sm:w-96 mb-4" />
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="rounded-md border p-2">
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  </main>
);

// --- Komponen Utama ---
export default function SuperAdminPage() {
  const { session } = useSession();
  const { data, error, isValidating, mutate } = useSWR<AdminData>(
    "/api/admin/data",
    fetcher
  );
  const [activeTab, setActiveTab] = useState("pengguna");

  useEffect(() => {
    const lastTab = localStorage.getItem("superadmin_last_tab");
    if (lastTab) setActiveTab(lastTab);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("superadmin_last_tab", value);
  };

  if (session?.role !== "superadmin") {
    return (
      <main className="text-center p-4">
        Anda tidak memiliki akses ke halaman ini.
      </main>
    );
  }

  if (!data && isValidating) return <SuperAdminPageSkeleton />;
  if (error)
    return (
      <div className="text-center text-red-500">Gagal memuat data admin.</div>
    );

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-0">
      <header>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          Super Admin
        </h1>
        <p className="text-muted-foreground">
          Kelola semua aspek aplikasi piket dari satu tempat.
        </p>
      </header>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-1 h-auto sm:grid-cols-3 sm:h-10">
          <TabsTrigger value="pengguna">Manajemen Pengguna</TabsTrigger>
          <TabsTrigger value="grup">Manajemen Grup</TabsTrigger>
          <TabsTrigger value="jadwal">Manajemen Jadwal</TabsTrigger>
        </TabsList>
        <TabsContent value="pengguna">
          <UserManagementTab data={data} mutate={mutate} />
        </TabsContent>
        <TabsContent value="grup">
          <GroupManagementTab data={data} mutate={mutate} />
        </TabsContent>
        <TabsContent value="jadwal">
          <ScheduleManagementTab data={data} mutate={mutate} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

// --- Komponen Manajemen Pengguna ---
function UserManagementTab({
  data,
  mutate,
}: {
  data: AdminData | undefined;
  mutate: (data?: any, options?: any) => Promise<any>;
}) {
  const users = data?.users || [];
  const groups = data?.groups || [];
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newRole, setNewRole] = useState("user");

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data || !newGroup) {
      toast.error("Gagal", {
        description: "Data grup belum dimuat atau belum dipilih.",
      });
      return;
    }

    const optimisticUser: User = {
      id: Date.now(),
      username: newUsername,
      group_name: newGroup,
      role: newRole as User["role"],
    };
    const optimisticData = { ...data, users: [...data.users, optimisticUser] };

    await mutate(optimisticData, false);
    setAddDialogOpen(false);
    toast.success("Pengguna Baru Ditambahkan", {
      description: `Pengguna '${newUsername}' telah dibuat.`,
    });

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          group: newGroup,
          role: newRole,
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Gagal menambah pengguna.");
      mutate(); // Revalidasi dengan data asli dari server
    } catch (error) {
      toast.error("Gagal Menambahkan Pengguna", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan.",
      });
      await mutate(data, false); // Rollback jika gagal
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Daftar Pengguna</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data pengguna.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Grup</Label>
                  <Select onValueChange={setNewGroup} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih grup..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.name} value={g.name}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <Select
                    onValueChange={setNewRole}
                    defaultValue="user"
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Batal</Button>
                  </DialogClose>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden rounded-md border md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Grup</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.group_name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <UserActions user={user} data={data} mutate={mutate} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-4 md:hidden">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.group_name} - ({user.role})
                  </p>
                </div>
                <UserActions user={user} data={data} mutate={mutate} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Dropdown Aksi untuk Pengguna ---
function UserActions({
  user,
  data,
  mutate,
}: {
  user: User;
  data: AdminData | undefined;
  mutate: (data?: any, options?: any) => Promise<any>;
}) {
  const groups = data?.groups || [];
  const [action, setAction] = useState<"edit" | "reset" | "delete" | null>(
    null
  );

  const handleResetPassword = async () => {
    toast.promise(
      fetch(`/api/users/${user.id}/reset-password`, { method: "POST" }),
      {
        loading: "Mereset password...",
        success: `Password untuk ${user.username} berhasil direset.`,
        error: (err) => err?.message || "Gagal mereset password.",
      }
    );
  };

  const handleDeleteUser = async () => {
    if (!data) return;
    const optimisticUsers = data.users.filter((u) => u.id !== user.id);
    const optimisticData = { ...data, users: optimisticUsers };
    await mutate(optimisticData, false);
    toast.success("Pengguna Dihapus", {
      description: `Pengguna ${user.username} telah dihapus.`,
    });
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
    } catch (error) {
      toast.error("Gagal Menghapus", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan.",
      });
      await mutate(data, false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setAction("edit")}>
            <Edit className="mr-2 h-4 w-4" /> Edit Pengguna
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAction("reset")}>
            <KeyRound className="mr-2 h-4 w-4" /> Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setAction("delete")}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditUserDialog
        open={action === "edit"}
        onOpenChange={(open) => !open && setAction(null)}
        user={user}
        groups={groups}
        data={data}
        mutate={mutate}
      />
      <AlertDialog
        open={action === "reset" || action === "delete"}
        onOpenChange={(open) => !open && setAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              {action === "reset"
                ? `Ini akan mereset password untuk pengguna ${user.username} ke default.`
                : `Tindakan ini akan menghapus pengguna ${user.username} secara permanen.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                action === "reset" ? handleResetPassword : handleDeleteUser
              }
            >
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// --- Dialog Edit Pengguna ---
function EditUserDialog({
  open,
  onOpenChange,
  user,
  groups,
  data,
  mutate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  groups: Group[];
  data: AdminData | undefined;
  mutate: (data?: any, options?: any) => Promise<any>;
}) {
  const [username, setUsername] = useState(user.username);
  const [groupName, setGroupName] = useState(user.group_name);
  const [role, setRole] = useState(user.role);

  useEffect(() => {
    if (open) {
      setUsername(user.username);
      setGroupName(user.group_name);
      setRole(user.role);
    }
  }, [open, user]);

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data) return;
    const updatedUser = { ...user, username, group_name: groupName, role };
    const optimisticUsers = data.users.map((u) =>
      u.id === user.id ? updatedUser : u
    );
    const optimisticData = { ...data, users: optimisticUsers };

    await mutate(optimisticData, false);
    onOpenChange(false);
    toast.success("Pengguna Diperbarui", {
      description: `Data untuk '${username}' telah disimpan.`,
    });

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, groupName, role }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      mutate();
    } catch (error) {
      toast.error("Gagal Memperbarui", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan.",
      });
      await mutate(data, false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pengguna: {user.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditUser} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Grup</Label>
            <Select
              onValueChange={setGroupName}
              defaultValue={groupName}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.name} value={g.name}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Select
              onValueChange={(value) => setRole(value as User["role"])}
              defaultValue={role}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Komponen Manajemen Grup ---
function GroupManagementTab({
  data,
  mutate,
}: {
  data: AdminData | undefined;
  mutate: (data?: any, options?: any) => Promise<any>;
}) {
  const groups = data?.groups || [];
  const [isAddGroupOpen, setAddGroupOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const handleAddGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data) return;
    const optimisticGroup = { name: newGroupName };
    const optimisticData = {
      ...data,
      groups: [...data.groups, optimisticGroup],
    };
    await mutate(optimisticData, false);
    setAddGroupOpen(false);
    setNewGroupName("");
    toast.success("Grup Baru Ditambahkan", {
      description: `Grup '${newGroupName}' berhasil dibuat.`,
    });
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      mutate();
    } catch (error) {
      toast.error("Gagal Menambah Grup", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan.",
      });
      await mutate(data, false);
    }
  };

  const handleEditGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGroup || !data) return;
    const oldName = selectedGroup.name;
    const optimisticGroups = data.groups.map((g) =>
      g.name === oldName ? { name: newGroupName } : g
    );
    const optimisticData = { ...data, groups: optimisticGroups };
    await mutate(optimisticData, false);
    setEditDialogOpen(false);
    toast.success("Grup Diperbarui", {
      description: `Grup '${oldName}' diubah menjadi '${newGroupName}'.`,
    });
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(oldName)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: newGroupName }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      mutate();
    } catch (error) {
      toast.error("Gagal Memperbarui", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan.",
      });
      await mutate(data, false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup || !data) return;
    const optimisticGroups = data.groups.filter(
      (g) => g.name !== selectedGroup.name
    );
    const optimisticData = { ...data, groups: optimisticGroups };
    await mutate(optimisticData, false);
    toast.success("Grup Dihapus", {
      description: `Grup '${selectedGroup.name}' telah dihapus.`,
    });
    try {
      const res = await fetch(
        `/api/groups/${encodeURIComponent(selectedGroup.name)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error((await res.json()).error);
    } catch (error) {
      toast.error("Gagal Menghapus", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan.",
      });
      await mutate(data, false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Daftar Grup</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus grup piket.
            </CardDescription>
          </div>
          <Dialog open={isAddGroupOpen} onOpenChange={setAddGroupOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Grup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Grup Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGroup} className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="group-name">Nama Grup</Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Batal</Button>
                  </DialogClose>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Grup</TableHead>
                <TableHead className="text-right w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.name}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedGroup(group);
                            setNewGroupName(group.name);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => {
                            setSelectedGroup(group);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Nama Grup</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditGroup} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="edit-group-name">Nama Grup</Label>
                <Input
                  id="edit-group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Batal</Button>
                </DialogClose>
                <Button type="submit">Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus{" "}
                <strong>{selectedGroup?.name}</strong>. Pastikan tidak ada
                pengguna yang masih berada di grup ini.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGroup}>
                Ya, Hapus Grup
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

// --- Komponen Manajemen Jadwal ---
function ScheduleManagementTab({
  data,
  mutate,
}: {
  data: AdminData | undefined;
  mutate: (data?: any, options?: any) => Promise<any>;
}) {
  const schedule = data?.schedule || {};
  const groups = data?.groups || [];
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const scheduleOptions = [{ name: "Piket Bersama" }, ...groups];

  const handleScheduleChange = async (day: string, newGroup: string) => {
    if (!data) return;
    const optimisticSchedule = { ...data.schedule, [day]: newGroup };
    const optimisticData = { ...data, schedule: optimisticSchedule };

    await mutate(optimisticData, false);
    toast.success("Jadwal Diperbarui", {
      description: `Jadwal untuk hari ${day} telah diubah menjadi ${newGroup}.`,
    });

    try {
      // Anda perlu membuat API endpoint ini: PUT /api/schedule
      // const res = await fetch('/api/schedule', { method: 'PUT', body: JSON.stringify({ day, group: newGroup }) });
      // if (!res.ok) throw new Error("Gagal menyimpan jadwal");
      // mutate();
    } catch (error) {
      toast.error("Gagal Memperbarui Jadwal", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan.",
      });
      await mutate(data, false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jadwal Piket Mingguan</CardTitle>
        <CardDescription>
          Atur grup yang bertugas untuk setiap hari.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {days.map((day) => (
          <div
            key={day}
            className="flex flex-col gap-2 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="font-semibold">{day}</p>
            <Select
              defaultValue={schedule[day]}
              onValueChange={(newGroup) => handleScheduleChange(day, newGroup)}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Pilih grup..." />
              </SelectTrigger>
              <SelectContent>
                {scheduleOptions.map((option) => (
                  <SelectItem key={option.name} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
