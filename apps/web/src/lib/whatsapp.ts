import type { ReservationFormData, ContactFormData } from "~/schemas";

export function buildWhatsAppUrl(data: ReservationFormData, waNumber: string): string {
  const message = [
    `*Reservasi Hoz Pasta*`, ``,
    `Nama: ${data.name}`, `Telepon: ${data.phone}`, `Tanggal: ${data.date}`,
    `Waktu: ${data.time}`, `Jumlah Tamu: ${data.guests}`, `Lokasi: ${data.location}`,
    data.specialRequest ? `Permintaan Khusus: ${data.specialRequest}` : "",
  ].filter(Boolean).join("\n");
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

export function buildContactWhatsAppUrl(data: ContactFormData, waNumber: string): string {
  const message = [
    `*Pesan dari Website Hoz Pasta*`, ``,
    `Nama: ${data.name}`, `Email: ${data.email}`, `Telepon: ${data.phone}`, ``,
    `Pesan:`, data.message,
  ].join("\n");
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
