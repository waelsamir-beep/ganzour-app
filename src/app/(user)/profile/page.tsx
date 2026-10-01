"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Camera,
  ChevronLeft,
  ClipboardList,
  FileText,
  Heart,
  Info,
  LogOut,
  MapPinned,
  MessageSquare,
  Pencil,
  Settings,
  Sparkles,
  UserRound,
  UserCheck,
  Users2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { useToast } from "@/components/Toast";
import { LogoMark } from "@/components/Logo";
import type { SessionUserDTO } from "@/lib/types";
import { api, clearToken } from "@/lib/api";
import { formatNumber, cn } from "@/lib/utils";
import { resizeImage } from "@/lib/image";

export default function ProfilePage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<SessionUserDTO | null>(null);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<null | "about" | "privacy">(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", imageUrl: null as string | null });
  const [saving, setSaving] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [actForm, setActForm] = useState({ name: "", phone: "", imageUrl: null as string | null });
  const [actSaving, setActSaving] = useState(false);
  const actFileRef = useRef<HTMLInputElement>(null);

  const isFreshGuest = Boolean(user?.isGuest && !user.onboarded);

  useEffect(() => {
    let alive = true;
    api<{ user: SessionUserDTO }>("/api/me").then((res) => {
      if (!alive) return;
      setUser(res.user);
      setEditForm({
        name: res.user.name,
        phone: res.user.phone,
        email: res.user.email ?? "",
        imageUrl: res.user.imageUrl,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  // كارت عدد الداخلين — يتحدث تلقائيًا
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const d = await api<{ visitors: number }>("/api/community");
        if (alive) setVisitors(d.visitors);
      } catch {
        /* تجاهل */
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await resizeImage(file);
      setEditForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر رفع الصورة", "error");
    }
  }

  async function logout() {
    clearToken();
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/home";
  }

  async function onActPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await resizeImage(file);
      setActForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر رفع الصورة", "error");
    }
  }

  async function submitActivate() {
    setActSaving(true);
    try {
      await api("/api/onboard", { method: "POST", json: actForm });
      toast("تم تفعيل حسابك بنجاح 🎉");
      setActivateOpen(false);
      const res = await api<{ user: SessionUserDTO }>("/api/me");
      setUser(res.user);
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر التفعيل", "error");
    } finally {
      setActSaving(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await api("/api/me", { method: "PATCH", json: editForm });
      toast("تم حفظ التعديلات بنجاح ✅");
      setEditOpen(false);
      const res = await api<{ user: SessionUserDTO }>("/api/me");
      setUser(res.user);
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذر الحفظ", "error");
    } finally {
      setSaving(false);
    }
  }

  const MENU = [
    { label: "المفضلة", icon: Heart, href: "/favorites" },
    { label: "طلباتي", icon: ClipboardList, href: "/my-requests" },
    { label: "الإشعارات", icon: Bell, href: "/notifications" },
    { label: "الخريطة", icon: MapPinned, href: "/map" },
  ];

  return (
    <div className="pb-28">
      <PageHeader title="حسابي 👤" subtitle="إدارة حسابك وتفضيلاتك" />
      <div className="space-y-4 px-4">
        {/* بطاقة المستخدم */}
        <section className="animate-fade-up rounded-3xl border border-mist bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt={user.name}
                className="size-14 shrink-0 rounded-2xl border-2 border-brand-200 object-cover"
              />
            ) : (
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white">
                <UserRound className="size-7" strokeWidth={2.2} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-lg font-extrabold text-brand-950">
                {isFreshGuest ? "زائر" : (user?.name ?? "—")}
              </h2>
              {isFreshGuest ? (
                <p className="text-xs font-bold text-ink/50">تتصفح التطبيق بدون تسجيل دخول</p>
              ) : (
                <>
                  <p className="text-xs font-bold text-ink/50" dir="ltr">
                    {user?.phone ?? "—"}
                  </p>
                  {user?.email && (
                    <p className="truncate text-[11px] font-bold text-ink/40" dir="ltr">
                      {user.email}
                    </p>
                  )}
                </>
              )}
            </div>
            {isFreshGuest ? (
              <button
                onClick={() => setActivateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-accent-500 to-accent-600 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-card transition hover:brightness-105 active:scale-95"
              >
                <Sparkles className="size-4" />
                تفعيل حسابي
              </button>
            ) : (
              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 py-2.5 text-xs font-extrabold text-brand-700 transition hover:bg-brand-100 active:scale-95"
              >
                <Pencil className="size-4" />
                تعديل
              </button>
            )}
          </div>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-900 py-3 text-sm font-extrabold text-white transition hover:bg-brand-950 active:scale-[0.98]"
            >
              <Settings className="size-5" />
              ⚙️ لوحة الإدارة
            </Link>
          )}
        </section>

        {/* كارت عدد الداخلين — يتحدث تلقائيًا */}
        <section className="animate-fade-up flex items-center gap-3 rounded-2xl border border-brand-200 bg-gradient-to-l from-brand-50 to-white p-4 shadow-card [animation-delay:0.06s]">
          <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white">
            <Users2 className="size-6" />
            <span className="animate-pulse-dot absolute -left-1 -top-1 size-3 rounded-full border-2 border-white bg-success" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-extrabold text-ink/55">دخل التطبيق حتى الآن</p>
            <p className="font-display text-2xl font-extrabold text-brand-800">
              {visitors === null ? "…" : formatNumber(visitors)}
              <span className="mr-1 text-sm font-bold text-ink/50">شخصًا</span>
            </p>
          </div>
          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-extrabold text-brand-700">
            يتحدث تلقائيًا
          </span>
        </section>

        {/* روابط */}
        <section className="animate-fade-up overflow-hidden rounded-3xl border border-mist bg-white shadow-card [animation-delay:0.1s]">
          {MENU.map(({ label, icon: Icon, href }, i) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-brand-50 active:bg-brand-100 ${
                i > 0 ? "border-t border-mist" : ""
              }`}
            >
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-4.5" />
              </span>
              <span className="flex-1 text-sm font-extrabold text-brand-950">{label}</span>
              <ChevronLeft className="size-4 text-ink/30" />
            </Link>
          ))}
        </section>

        <section className="animate-fade-up overflow-hidden rounded-3xl border border-mist bg-white shadow-card [animation-delay:0.14s]">
          <Link
            href={user?.role === "admin" ? "/admin" : "/admin-login"}
            className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-brand-50 active:bg-brand-100"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-brand-900 text-amber-300">
              <Settings className="size-4.5" />
            </span>
            <span className="flex-1 text-sm font-extrabold text-brand-950">
              {user?.role === "admin" ? "لوحة التحكم — الإدارة" : "دخول لوحة الإدارة"}
            </span>
            <ChevronLeft className="size-4 text-ink/30" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 border-t border-mist px-4 py-3.5 transition hover:bg-brand-50 active:bg-brand-100"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-success-soft text-success">
              <MessageSquare className="size-4.5" />
            </span>
            <span className="flex-1 text-sm font-extrabold text-brand-950">تواصل معنا</span>
            <ChevronLeft className="size-4 text-ink/30" />
          </Link>
          <button
            onClick={() => setInfoModal("about")}
            className="flex w-full items-center gap-3 border-t border-mist px-4 py-3.5 text-right transition hover:bg-brand-50 active:bg-brand-100"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-paper text-ink/50">
              <Info className="size-4.5" />
            </span>
            <span className="flex-1 text-sm font-extrabold text-brand-950">عن التطبيق</span>
            <ChevronLeft className="size-4 text-ink/30" />
          </button>
          <button
            onClick={() => setInfoModal("privacy")}
            className="flex w-full items-center gap-3 border-t border-mist px-4 py-3.5 text-right transition hover:bg-brand-50 active:bg-brand-100"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-paper text-ink/50">
              <FileText className="size-4.5" />
            </span>
            <span className="flex-1 text-sm font-extrabold text-brand-950">سياسة الخصوصية</span>
            <ChevronLeft className="size-4 text-ink/30" />
          </button>
        </section>

        <button
          onClick={logout}
          className="animate-fade-up flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/25 bg-danger-soft py-3.5 text-sm font-extrabold text-danger transition hover:brightness-95 active:scale-[0.98] [animation-delay:0.18s]"
        >
          <LogOut className="size-5" />
          تسجيل الخروج
        </button>
      </div>

      {/* نافذة تعديل الملف */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="تعديل الملف الشخصي">
        <div className="space-y-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "relative grid size-20 place-items-center overflow-hidden rounded-full border-4 transition active:scale-95",
                editForm.imageUrl
                  ? "border-brand-500"
                  : "border-dashed border-mist bg-paper hover:border-brand-400"
              )}
              aria-label="تغيير الصورة"
            >
              {editForm.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editForm.imageUrl} alt="صورتك" className="size-full object-cover" />
              ) : (
                <Camera className="size-7 text-ink/40" />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-brand-950/60 py-0.5 text-center text-[9px] font-extrabold text-white">
                تغيير
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          </div>
          <Field label="الاسم بالكامل" required>
            <TextInput
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="رقم الموبايل">
            <TextInput
              type="tel"
              dir="ltr"
              className="text-left"
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </Field>
          <Field label="البريد الإلكتروني" hint="اختياري">
            <TextInput
              type="email"
              dir="ltr"
              className="text-left"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <PrimaryButton onClick={saveProfile} loading={saving}>
            حفظ التعديلات
          </PrimaryButton>
        </div>
      </Modal>

      {/* نوافذ معلومات */}
      <Modal
        open={infoModal !== null}
        onClose={() => setInfoModal(null)}
        title={infoModal === "about" ? "عن التطبيق" : "سياسة الخصوصية"}
      >
        <div className="space-y-3 text-sm font-medium leading-relaxed text-ink/70">
          {infoModal === "about" && (
            <>
              <div className="flex justify-center py-2">
                <LogoMark size={64} />
              </div>
              <p className="text-center font-display text-base font-extrabold text-brand-950">
                الدليل المهني لقرية جنزور
              </p>
              <p className="text-center text-xs text-ink/50">كل خدمات قريتك في مكان واحد</p>
              <p>
                تطبيق محلي يجمع أطباء القرية وعياداتها وصيدلياتها وأصحاب الحرف والمهن والمحلات
                والخدمات في دليل واحد موثوق، ليصل كل أبناء جنزور إلى الخدمة التي يحتاجونها بأسهل
                طريقة ممكنة.
              </p>
            </>
          )}
          {infoModal === "privacy" && (
            <>
              <p>
                نحن نحترم خصوصيتك: دخولك للتطبيق يتم بالاسم ورقم الموبايل فقط بدون كلمة مرور،
                وتُستخدم بياناتك لحفظ مفضلتك وطلباتك فقط.
              </p>
              <p>بيانات المهن والإعلانات المنشورة تُعرض بعد مراجعة الإدارة لضمان المصداقية.</p>
              <p>يمكنك طلب حذف حسابك وبياناتك في أي وقت عبر صفحة «تواصل معنا».</p>
            </>
          )}
        </div>
      </Modal>

      {/* نافذة تفعيل الحساب (اختيارية للزائر) */}
      <Modal open={activateOpen} onClose={() => setActivateOpen(false)} title="تفعيل حسابي">
        <div className="space-y-4">
          <p className="rounded-xl bg-brand-50 p-3 text-xs font-bold leading-relaxed text-brand-800">
            التطبيق يعمل بدون تسجيل — لكن بتفعيل حسابك بيظهر اسمك بدل «زائر» وبتتحفظ مفضلتك
            وطلباتك باسمك، بدون أي كلمة مرور.
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => actFileRef.current?.click()}
              className={cn(
                "relative grid size-20 place-items-center overflow-hidden rounded-full border-4 transition active:scale-95",
                actForm.imageUrl
                  ? "border-brand-500"
                  : "border-dashed border-mist bg-paper hover:border-brand-400"
              )}
              aria-label="رفع صورة شخصية"
            >
              {actForm.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={actForm.imageUrl} alt="صورتك" className="size-full object-cover" />
              ) : (
                <Camera className="size-7 text-ink/40" />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-brand-950/60 py-0.5 text-center text-[9px] font-extrabold text-white">
                صورة
              </span>
            </button>
            <input
              ref={actFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onActPick}
            />
          </div>
          <Field label="اسمك بالكامل" required>
            <TextInput
              placeholder="مثال: أحمد محمد عبدالله"
              value={actForm.name}
              onChange={(e) => setActForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="رقم الموبايل" required>
            <TextInput
              type="tel"
              inputMode="numeric"
              dir="ltr"
              className="text-left"
              placeholder="01XXXXXXXXX"
              value={actForm.phone}
              onChange={(e) => setActForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </Field>
          <PrimaryButton onClick={submitActivate} loading={actSaving}>
            <UserCheck className="size-5" />
            تفعيل الحساب
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
