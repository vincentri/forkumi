import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  message: z.string().min(1, "Pesan wajib diisi"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
