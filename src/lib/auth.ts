import { randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export const SESSION_COOKIE = "gpz_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** ينشئ جلسة ويعيد التوكن (يُسلَّم للعميل ليعمل حتى داخل iframes بدون كوكيز) */
export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  try {
    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
      expires: expiresAt,
    });
  } catch {
    /* بيئات بدون كوكيز — التوكن في الهيدر يكفي */
  }
  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  store.delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: number;
  name: string;
  username: string | null;
  phone: string;
  email: string | null;
  role: "member" | "admin";
  status: "active" | "suspended";
  isGuest: boolean;
  imageUrl: string | null;
  onboarded: boolean;
};

function toSessionUser(u: User): SessionUser {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    phone: u.phone,
    email: u.email,
    role: u.role as "member" | "admin",
    status: u.status as "active" | "suspended",
    isGuest: u.isGuest,
    imageUrl: u.imageUrl,
    onboarded: u.onboarded,
  };
}

/** يقرأ الجلسة من هيدر Authorization أولًا (للـ iframes) ثم من الكوكيز */
export async function getSessionUser(): Promise<SessionUser | null> {
  let token: string | null = null;
  try {
    const hdr = (await headers()).get("authorization");
    if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
  } catch {
    token = null;
  }
  if (!token) {
    const store = await cookies();
    token = store.get(SESSION_COOKIE)?.value ?? null;
  }
  if (!token) return null;

  const rows = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const u = row.user;
  if (u.status !== "active") return null;
  return toSessionUser(u);
}

/**
 * يضمن وجود جلسة للمستخدم: إن لم توجد يُنشأ حساب زائر تلقائيًا
 * حتى يعمل التطبيق بدون أي شاشات تسجيل دخول.
 */
export async function ensureSessionUser(): Promise<SessionUser> {
  const existing = await getSessionUser();
  if (existing) return existing;

  const passwordHash = await hashPassword(randomBytes(16).toString("hex"));
  const prefixes = ["0", "1", "2", "5"];
  let created: User | null = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const phone = `01${prefixes[Math.floor(Math.random() * prefixes.length)]}${Math.floor(
      10000000 + Math.random() * 89999999
    )}`;
    try {
      const rows = await db
        .insert(users)
        .values({ name: "زائر", phone, passwordHash, role: "member", isGuest: true })
        .returning();
      created = rows[0];
    } catch {
      created = null; // تعارض نادر في رقم الهاتف — إعادة المحاولة
    }
  }
  if (!created) throw new Error("تعذر إنشاء جلسة الزائر");
  await createSession(created.id);
  return toSessionUser(created);
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
