"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth, startOfWeek } from "date-fns";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithPresets } from "@/components/ui/date-picker";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Definisikan tipe data yang akan kita terima dari API
type RecapData = {
  date: string;
  taskName: string;
  status: "Completed" | "Missed";
  completedBy?: string;
  group: string;
};

// Fungsi untuk fetch data
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RecapPage() {
  const today = new Date();
  // State untuk menyimpan rentang tanggal yang dipilih
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfWeek(today), // Default: Awal minggu ini
    to: today, // Default: Hari ini
  });

  // Membuat URL API dengan parameter tanggal
  const apiUrl =
    date?.from && date?.to
      ? `/api/recap?startDate=${format(
          date.from,
          "yyyy-MM-dd"
        )}&endDate=${format(date.to, "yyyy-MM-dd")}`
      : null;

  // Menggunakan SWR untuk fetching data
  const { data, error, isLoading } = useSWR<{ recap: RecapData[] }>(
    apiUrl,
    fetcher
  );

  console.log(data, "data");

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          Rekapitulasi Piket
        </h1>
        <p className="text-muted-foreground">
          Lihat riwayat tugas piket yang telah selesai atau terlewat.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Filter Riwayat</CardTitle>
            <DatePickerWithPresets date={date} setDate={setDate} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Tanggal</TableHead>
                  <TableHead>Tugas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grup Piket</TableHead>
                  <TableHead>Diselesaikan Oleh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  // Tampilan loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && (!data?.recap || data.recap.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada data untuk rentang tanggal yang dipilih.
                    </TableCell>
                  </TableRow>
                )}
                {data?.recap.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {format(new Date(item.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{item.taskName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.status === "Completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>
                          {item.status === "Completed" ? "Selesai" : "Terlewat"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.group}</TableCell>
                    <TableCell>{item.completedBy ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
