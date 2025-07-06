import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level").notNull(),
  phoneNumber: text("phone_number").notNull(),
  currentSchool: text("current_school").notNull(),
  currentDistrict: text("current_district").notNull(),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  homeDistrict: text("home_district").notNull(),
  homeLatitude: decimal("home_latitude", { precision: 10, scale: 8 }),
  homeLongitude: decimal("home_longitude", { precision: 11, scale: 8 }),
  preferredDistricts: json("preferred_districts").$type<string[]>().notNull(),
  maxDistance: integer("max_distance").default(100),
  hideContact: boolean("hide_contact").default(true),
  allowRequests: boolean("allow_requests").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  experience: integer("experience").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transferRequests = pgTable("transfer_requests", {
  id: serial("id").primaryKey(),
  fromTeacherId: integer("from_teacher_id").references(() => teachers.id).notNull(),
  toTeacherId: integer("to_teacher_id").references(() => teachers.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  teacher1Id: integer("teacher1_id").references(() => teachers.id).notNull(),
  teacher2Id: integer("teacher2_id").references(() => teachers.id).notNull(),
  matchType: text("match_type").notNull(), // perfect, nearby
  distance: decimal("distance", { precision: 8, scale: 2 }),
  score: integer("score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransferRequestSchema = createInsertSchema(transferRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type InsertTransferRequest = z.infer<typeof insertTransferRequestSchema>;
export type TransferRequest = typeof transferRequests.$inferSelect;
export type Match = typeof matches.$inferSelect;

export interface TeacherWithUser extends Teacher {
  user: User;
}

export interface TransferRequestWithTeachers extends TransferRequest {
  fromTeacher: TeacherWithUser;
  toTeacher: TeacherWithUser;
}

export interface MatchWithTeachers extends Match {
  teacher1: TeacherWithUser;
  teacher2: TeacherWithUser;
}
