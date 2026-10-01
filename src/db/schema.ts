import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── المستخدمون ────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username"),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["member", "admin"] }).notNull().default("member"),
  status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),
  isGuest: boolean("is_guest").notNull().default(false),
  imageUrl: text("image_url"),
  onboarded: boolean("onboarded").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── جلسات الدخول ──────────────────────────────────────────────
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── الأقسام ───────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  iconKey: text("icon_key").notNull().default("folder"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── المهن والخدمات المعتمدة ───────────────────────────────────
export const professions = pgTable("professions", {
  id: serial("id").primaryKey(),
  ownerName: text("owner_name").notNull(),
  title: text("title").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  address: text("address"),
  description: text("description"),
  workingHours: text("working_hours"),
  mapUrl: text("map_url"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["approved", "hidden"] }).notNull().default("approved"),
  submittedById: integer("submitted_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── طلبات إضافة المهن ─────────────────────────────────────────
export const professionRequests = pgTable("profession_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ownerName: text("owner_name").notNull(),
  title: text("title").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  address: text("address"),
  description: text("description"),
  workingHours: text("working_hours"),
  mapUrl: text("map_url"),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// ─── المفضلة ───────────────────────────────────────────────────
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    professionId: integer("profession_id")
      .notNull()
      .references(() => professions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("fav_user_profession_idx").on(t.userId, t.professionId)]
);

// ─── التقييمات ─────────────────────────────────────────────────
export const ratings = pgTable(
  "ratings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    professionId: integer("profession_id")
      .notNull()
      .references(() => professions.id, { onDelete: "cascade" }),
    stars: integer("stars").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("rating_user_profession_idx").on(t.userId, t.professionId)]
);

// ─── الإشعارات ─────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── إعلانات الماركيو ─────────────────────────────────────────
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  ownerName: text("owner_name").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  rejectionReason: text("rejection_reason"),
  submittedById: integer("submitted_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Profession = typeof professions.$inferSelect;
export type ProfessionRequest = typeof professionRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
