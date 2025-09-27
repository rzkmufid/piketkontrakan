"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format, startOfWeek } from "date-fns";
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

type RecapData = {
  date: string;
  taskName: string;
  status: "Completed" | "Missed";
  completedBy?: string;
  group: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Komponen Skeleton untuk Desktop ---
const RecapTableSkeleton = () => (
  <TableBody>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`desktop-skeleton-${i}`}>
        <TableCell>
          <Skeleton className="h-5 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-full" />
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
  </TableBody>
);

// --- Komponen Skeleton untuk Mobile ---
const RecapCardSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={`mobile-skeleton-${i}`}>
        <CardContent className="p-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function RecapPage() {
  const today = new Date();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfWeek(today, { weekStartsOn: 1 }),
    to: today,
  });

  const apiUrl =
    date?.from && date?.to
      ? `/api/recap?startDate=${format(
          date.from,
          "yyyy-MM-dd"
        )}&endDate=${format(date.to, "yyyy-MM-dd")}`
      : null;

  // === PERUBAHAN DI SINI: Ambil 'isValidating' dari SWR ===
  const { data, error, isValidating } = useSWR<{ recap: RecapData[] }>(
    apiUrl,
    fetcher
  );

  if (error) {
    return (
      <div className="text-center text-red-500">Gagal memuat data rekap.</div>
    );
  }

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
          {/* === TAMPILAN DESKTOP (TABLE) === */}
          <div className="hidden rounded-md border md:block">
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
              {/* === PERUBAHAN DI SINI: Gunakan 'isValidating' === */}
              {isValidating ? (
                <RecapTableSkeleton />
              ) : (
                <TableBody>
                  {!data?.recap || data.recap.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Tidak ada data untuk rentang tanggal yang dipilih.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recap.map((item, index) => (
                      <TableRow key={`desktop-${index}`}>
                        <TableCell>
                          {format(new Date(item.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.taskName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.status === "Completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>
                              {item.status === "Completed"
                                ? "Selesai"
                                : "Terlewat"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{item.group}</TableCell>
                        <TableCell>{item.completedBy ?? "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              )}
            </Table>
          </div>

          {/* === TAMPILAN MOBILE (CARD LIST) === */}
          <div className="space-y-4 md:hidden">
            {/* === PERUBAHAN DI SINI: Gunakan 'isValidating' === */}
            {isValidating ? (
              <RecapCardSkeleton />
            ) : !data?.recap || data.recap.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Tidak ada data untuk rentang tanggal yang dipilih.</p>
              </div>
            ) : (
              data.recap.map((item, index) => (
                <Card key={`mobile-${index}`}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.taskName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.date), "eeee, dd MMM yyyy")}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <div className="flex items-center gap-2 font-medium">
                        {item.status === "Completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>
                          {item.status === "Completed" ? "Selesai" : "Terlewat"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grup:</span>
                      <span>{item.group}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Oleh:</span>
                      <span>{item.completedBy ?? "-"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
