"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema, type ReservationFormData } from "~/schemas";
import { buildWhatsAppUrl } from "~/lib/whatsapp";

type Location = { name: string; sub: string; waNumber?: string };

export default function ReservationForm({ locations, defaultWaNumber }: { locations: Location[]; defaultWaNumber: string }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { guests: "2 Tamu", location: locations[0]?.name ?? "" },
  });
  const selectedLocation = watch("location");
  const onSubmit = (data: ReservationFormData) => {
    const loc = locations.find((l) => l.name === data.location);
    const waNumber = loc?.waNumber || defaultWaNumber;
    window.open(buildWhatsAppUrl(data, waNumber), "_blank");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="form-label">NAMA LENGKAP</label>
          <input {...register("name")} placeholder="Nama Anda" className="form-input" />
          {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="form-label">TELEPON</label>
          <input {...register("phone")} placeholder="+62..." className="form-input" />
          {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="form-label">TANGGAL</label>
          <input {...register("date")} type="date" className="form-input" />
          {errors.date && <p className="mt-1.5 text-xs text-red-600">{errors.date.message}</p>}
        </div>
        <div>
          <label className="form-label">WAKTU</label>
          <input {...register("time")} type="time" className="form-input" />
          {errors.time && <p className="mt-1.5 text-xs text-red-600">{errors.time.message}</p>}
        </div>
        <div>
          <label className="form-label">JUMLAH TAMU</label>
          <div className="relative">
            <select {...register("guests")} className="form-input w-full appearance-none pr-10">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={`${n} Tamu`}>{n} Tamu</option>)}
              <option value="10+ Tamu">10+ Tamu</option>
            </select>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 opacity-50"><path d="m6 9 6 6 6-6" /></svg>
          </div>
          {errors.guests && <p className="mt-1.5 text-xs text-red-600">{errors.guests.message}</p>}
        </div>
      </div>

      <div>
        <label className="form-label">LOKASI</label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {locations.map((loc) => {
            const active = selectedLocation === loc.name;
            return (
              <button key={loc.name} type="button" onClick={() => setValue("location", loc.name, { shouldValidate: true })} className="flex items-center gap-3 px-4 py-4 text-left transition-colors" style={{ border: `1px solid ${active ? "#1A1A1A" : "#E5E5E5"}`, background: active ? "#1A1A1A" : "#FFFFFF", color: active ? "#FFFFFF" : "#1A1A1A", fontFamily: "var(--font-montserrat)", fontSize: "14px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ opacity: active ? 1 : 0.4 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <div>
                  <div>{loc.name}</div>
                  {loc.sub && <div className="mt-0.5 opacity-60" style={{ fontSize: "12px" }}>{loc.sub}</div>}
                </div>
              </button>
            );
          })}
        </div>
        {errors.location && <p className="mt-1.5 text-xs text-red-600">{errors.location.message}</p>}
      </div>

      <div>
        <label className="form-label">PERMINTAAN KHUSUS</label>
        <textarea {...register("specialRequest")} rows={4} placeholder="Ada kebutuhan diet atau permintaan khusus..." className="w-full resize-none bg-white px-4 py-4 outline-none transition" style={{ fontFamily: "var(--font-montserrat)", fontSize: "15px", border: "1px solid #E5E5E5", color: "#1A1A1A", height: "120px" }} />
      </div>

      <button type="submit" className="w-full font-sans font-semibold uppercase text-white transition hover:bg-[#1A1A1A]/80" style={{ background: "#1A1A1A", fontSize: "13px", letterSpacing: "1.5px", padding: "18px 32px", fontFamily: "var(--font-montserrat)" }}>
        KONFIRMASI VIA WHATSAPP
      </button>
    </form>
  );
}
