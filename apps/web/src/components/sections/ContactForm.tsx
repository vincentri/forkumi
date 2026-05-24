"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "~/schemas";
import { buildContactWhatsAppUrl } from "~/lib/whatsapp";

export default function ContactForm({ waNumber }: { waNumber: string }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });
  const onSubmit = (data: ContactFormData) => { window.open(buildContactWhatsAppUrl(data, waNumber), "_blank"); };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="form-label">NAMA</label>
          <input {...register("name")} placeholder="Nama Anda" className="form-input" />
          {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="form-label">TELEPON</label>
          <input {...register("phone")} placeholder="+62..." className="form-input" />
          {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <label className="form-label">EMAIL</label>
        <input {...register("email")} type="email" placeholder="email@contoh.com" className="form-input" />
        {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className="form-label">PESAN</label>
        <textarea {...register("message")} rows={5} placeholder="Tulis pesan Anda..." className="w-full resize-none bg-white px-4 py-4 outline-none transition" style={{ fontFamily: "var(--font-roboto)", fontSize: "15px", border: "1px solid #E5E5E5", color: "#1A1A1A", height: "120px" }} />
        {errors.message && <p className="mt-1.5 text-xs text-red-500">{errors.message.message}</p>}
      </div>
      <div className="flex justify-center">
        <button type="submit" className="btn-primary">KIRIM PESAN</button>
      </div>
    </form>
  );
}
