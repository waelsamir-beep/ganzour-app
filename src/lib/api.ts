/**
 * تخزين توكن الجلسة بطريقة تعمل في كل البيئات:
 * 1) الذاكرة (دائمًا)
 * 2) الرابط نفسه #t=... (يعمل حتى لو حُجب التخزين داخل iframes)
 * 3) sessionStorage / localStorage كاحتياط
 */
const TOKEN_KEY = "gpz_token";
let memoryToken: string | null = null;

function readTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const hash = window.location.hash;
    const m = hash.match(/t=([a-f0-9]{16,})/);
    if (m) return m[1];
    const q = new URLSearchParams(window.location.search).get("token");
    if (q && /^[a-f0-9]{16,}$/.test(q)) return q;
  } catch {
    /* تجاهل */
  }
  return null;
}

function stripTokenFromUrl() {
  try {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("t=") || window.location.search.includes("token=")) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search.replace(/([?&])token=[^&]+/, "$1")
      );
    }
  } catch {
    /* تجاهل */
  }
}

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  const urlToken = readTokenFromUrl();
  if (urlToken) {
    setToken(urlToken);
    stripTokenFromUrl();
    return urlToken;
  }
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const s = window.sessionStorage.getItem(TOKEN_KEY);
      if (s) return (memoryToken = s);
    }
    if (typeof window !== "undefined" && window.localStorage) {
      const l = window.localStorage.getItem(TOKEN_KEY);
      if (l) return (memoryToken = l);
    }
  } catch {
    /* تخزين محظور — الذاكرة تكفي */
  }
  return null;
}

export function setToken(token: string) {
  memoryToken = token;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    }
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    /* تجاهل */
  }
}

export function clearToken() {
  memoryToken = null;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* تجاهل */
  }
}

/** عميل fetch صغير لواجهة التطبيق — يرسل التوكن تلقائيًا */
export async function api<T = unknown>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, headers, ...rest } = options;
  const token = getToken();
  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
  let data: { ok: boolean; error?: string } & Record<string, unknown> | null = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  // لو الاستجابة رجّعت توكن جلسة جديد نحفظه تلقائيًا
  if (data && typeof data.token === "string" && data.token) {
    setToken(data.token as string);
  }
  if (!res.ok) {
    throw new Error((data && (data.error as string)) || "حدث خطأ غير متوقع");
  }
  return data as T;
}
