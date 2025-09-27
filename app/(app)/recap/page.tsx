"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format, startOfWeek } from "date-fns";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DatePickerWithPresets } from "@/components/ui/date-picker";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { id as localeID } from "date-fns/locale";

type RecapData = {
  date: string;
  taskName: string;
  status: "Completed" | "Missed";
  completedBy?: string;
  group: string;
};
type PaginationData = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};
type ApiResponse = { recap: RecapData[]; pagination: PaginationData };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RecapTableSkeleton = () => (
  <TableBody>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`d-skel-${i}`}>
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
const RecapCardSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={`m-skel-${i}`}>
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [date]);

  const apiUrl =
    date?.from && date?.to
      ? `/api/recap?startDate=${format(
          date.from,
          "yyyy-MM-dd"
        )}&endDate=${format(
          date.to,
          "yyyy-MM-dd"
        )}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      : null;

  const { data, error, isValidating } = useSWR<ApiResponse>(apiUrl, fetcher);

  const recapData = data?.recap || [];
  const pagination = data?.pagination;

  if (error)
    return (
      <div className="text-center text-red-500">Gagal memuat data rekap.</div>
    );

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

      {/* Filter Tanggal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium">Filter Riwayat</h2>
        <DatePickerWithPresets date={date} setDate={setDate} />
      </div>

      {/* Konten Utama */}
      <div className="space-y-4">
        {/* Tampilan Desktop (Table) */}
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
            {isValidating ? (
              <RecapTableSkeleton />
            ) : (
              <TableBody>
                {recapData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada data.
                    </TableCell>
                  </TableRow>
                ) : (
                  recapData.map((item, index) => (
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

        {/* Tampilan Mobile (Daftar yang lebih sederhana) */}
        <div className="space-y-3 md:hidden">
          {isValidating ? (
            <RecapCardSkeleton />
          ) : recapData.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Tidak ada data.</p>
            </div>
          ) : (
            recapData.map((item, index) => (
              <div
                key={`mobile-${index}`}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <div>
                  {item.status === "Completed" ? (
                    <CheckCircle2 className="mt-1 h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="mt-1 h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">{item.taskName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(item.date), "eeee, dd MMM", {
                      locale: localeID,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Oleh: {item.completedBy ?? "-"} ({item.group})
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Komponen Paginasi */}
      {!isValidating && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-muted-foreground">
            Halaman {pagination.page} dari {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Berikutnya <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
