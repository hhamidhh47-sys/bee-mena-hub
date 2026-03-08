import { db, type AuthUser } from "./db";

// Simple hash function for offline use (not cryptographically secure, but works offline)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "nahali-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function registerUser(
  username: string,
  password: string,
  displayName: string
): Promise<AuthUser> {
  const existing = await db.authUsers.where("username").equals(username).first();
  if (existing) {
    throw new Error("اسم المستخدم موجود بالفعل");
  }

  if (password.length < 4) {
    throw new Error("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
  }

  const passwordHash = await hashPassword(password);
  const id = await db.authUsers.add({
    username,
    passwordHash,
    displayName,
    createdAt: new Date(),
  });

  const user = await db.authUsers.get(id);
  if (!user) throw new Error("فشل إنشاء الحساب");

  // Create default profile for this user
  await db.profile.add({
    userId: id as number,
    name: displayName,
    title: "نحّال",
    startYear: new Date().getFullYear(),
    phone: "",
    email: "",
    location: "",
  });

  return user;
}

export async function loginUser(
  username: string,
  password: string
): Promise<AuthUser> {
  const user = await db.authUsers.where("username").equals(username).first();
  if (!user) {
    throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
  }

  return user;
}

const AUTH_KEY = "nahali_auth_user_id";

export function saveSession(userId: number) {
  localStorage.setItem(AUTH_KEY, String(userId));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const id = localStorage.getItem(AUTH_KEY);
  if (!id) return null;
  const user = await db.authUsers.get(Number(id));
  return user || null;
}
