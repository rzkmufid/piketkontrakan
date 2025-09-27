// components/ui/date-picker.tsx
"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerWithPresetsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DatePickerWithPresets({
  className,
  date,
  setDate,
}: DatePickerWithPresetsProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pilih rentang tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-auto flex-col space-y-2 p-2"
          align="end"
        >
          <Select
            onValueChange={(value) => {
              const today = new Date();
              if (value === "0") setDate({ from: today, to: today });
              else if (value === "7")
                setDate({
                  from: addDays(today, -6),
                  to: today,
                });
              // Last 7 days including today
              else if (value === "30")
                setDate({
                  from: addDays(today, -29),
                  to: today,
                });
              // Last 30 days
              else setDate(undefined);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih preset..." />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="0">Hari Ini</SelectItem>
              <SelectItem value="7">7 Hari Terakhir</SelectItem>
              <SelectItem value="30">30 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-md border">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              // --- KONEKSI PENTING ADA DI SINI ---
              selected={date} // Properti untuk menampilkan tanggal yang dipilih
              onSelect={setDate} // Properti untuk mengubah state saat tanggal diklik
              // ------------------------------------
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
