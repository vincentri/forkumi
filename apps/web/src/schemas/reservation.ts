import { z } from "zod";

export const reservationSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").regex(/^(\+62|62|0)?\d{9,13}$/, "Format nomor telepon tidak valid"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  time: z.string().min(1, "Waktu wajib diisi"),
  guests: z.string().min(1, "Jumlah tamu wajib diisi"),
  location: z.string().min(1, "Pilih lokasi restoran"),
  specialRequest: z.string().optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
