"use client";

import { LoadingSpinner } from "@/components/loading-spinner";

export default function RootPage() {
  // Komponen ini tidak perlu melakukan apa-apa.
  // SessionProvider akan secara otomatis mengarahkan pengguna
  // ke /login atau /home berdasarkan status sesi.
  return <LoadingSpinner />;
}
