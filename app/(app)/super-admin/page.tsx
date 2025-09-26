"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/components/session-context"

export default function SuperAdminPage() {
  const { session } = useSession()
  if (session?.role !== "superadmin") {
    return (
      <main className="mx-auto grid min-h-[60svh] w-full max-w-3xl place-items-center p-4">
        <p className="text-center text-base">Anda tidak memiliki akses ke halaman ini.</p>
      </main>
    )
  }
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Super Admin</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pengguna">
            <TabsList>
              <TabsTrigger value="pengguna">Manajemen Pengguna</TabsTrigger>
              <TabsTrigger value="grup">Manajemen Grup</TabsTrigger>
            </TabsList>

            <TabsContent value="pengguna" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Daftar Pengguna</h2>
                <Button>Tambah Pengguna Baru</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Grup</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>Grup 1</TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm">
                        Reset Password
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>Grup 2</TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm">
                        Reset Password
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="grup" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Daftar Grup</h2>
                <Button>Tambah Grup Baru</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Grup</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Grup 1</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm">
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Grup 2</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm">
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
