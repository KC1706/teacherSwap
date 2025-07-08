import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import {
  users,
  teachers,
  transferRequests,
  matches,
  type User,
  type Teacher,
  type TransferRequest,
  type Match,
  type InsertUser,
  type InsertTeacher,
  type InsertTeacherWithUserId,
  type InsertTransferRequest,
  type TeacherWithUser,
  type TransferRequestWithTeachers,
  type MatchWithTeachers
} from "@shared/schema";
import bcrypt from "bcryptjs";
import type { AnyPgTable } from 'drizzle-orm/pg-core';
import 'dotenv/config';
import { sql } from 'drizzle-orm';


export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  
  // Teacher operations
  createTeacher(teacher: InsertTeacherWithUserId): Promise<Teacher>;
  getTeacherByUserId(userId: number): Promise<Teacher | undefined>;
  getTeacherById(id: number): Promise<Teacher | undefined>;
  updateTeacher(id: number, updates: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  getAllTeachers(): Promise<Teacher[]>;
  getTeachersWithUsers(): Promise<TeacherWithUser[]>;
  
  // Transfer request operations
  createTransferRequest(request: InsertTransferRequest): Promise<TransferRequest>;
  getTransferRequestById(id: number): Promise<TransferRequest | undefined>;
  getTransferRequestsForTeacher(teacherId: number): Promise<TransferRequestWithTeachers[]>;
  getTransferRequestsByTeacher(teacherId: number): Promise<TransferRequestWithTeachers[]>;
  updateTransferRequestStatus(id: number, status: string): Promise<TransferRequest | undefined>;
  
  // Match operations
  createMatch(teacher1Id: number, teacher2Id: number, matchType: string, distance?: number, score?: number): Promise<Match>;
  getMatchesForTeacher(teacherId: number): Promise<MatchWithTeachers[]>;
  deleteMatch(id: number): Promise<void>;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please set it in your environment.");
}
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

class PgStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
      email: insertUser.email,
      password: hashedPassword,
    }).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(sql`${users.email} = ${email}`);
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(sql`${users.id} = ${id}`);
    return user;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async createTeacher(insertTeacher: InsertTeacherWithUserId): Promise<Teacher> {
    const teacherData = {
      ...insertTeacher,
      subjects: Array.isArray(insertTeacher.subjects) ? [...insertTeacher.subjects] : [],
      preferredDistricts: Array.isArray(insertTeacher.preferredDistricts) ? [...insertTeacher.preferredDistricts] : [],
    };
    const [teacher] = await db.insert(teachers).values(teacherData).returning();
    return teacher;
  }

  async getTeacherByUserId(userId: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(sql`${teachers.userId} = ${userId}`);
    return teacher;
  }

  async getTeacherById(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(sql`${teachers.id} = ${id}`);
    return teacher;
  }

  async updateTeacher(id: number, updates: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const updateData = {
      ...updates,
      subjects: updates.subjects ? Array.prototype.slice.call(updates.subjects) : undefined,
      preferredDistricts: updates.preferredDistricts ? Array.prototype.slice.call(updates.preferredDistricts) : undefined,
    };
    const [teacher] = await db.update(teachers).set(updateData).where(sql`${teachers.id} = ${id}`).returning();
    return teacher;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return db.select().from(teachers);
  }

  async getTeachersWithUsers(): Promise<TeacherWithUser[]> {
    const result = await db.execute(sql`
      SELECT t.*, u.* FROM ${teachers} t
      INNER JOIN ${users} u ON t.user_id = u.id
    `);
    return result.rows.map((row: any) => {
      const user: User = {
        id: row.user_id,
        email: row.email,
        password: row.password,
        createdAt: row.created_at,
      };
      const teacher: Teacher = {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        subjects: row.subjects,
        gradeLevel: row.grade_level,
        phoneNumber: row.phone_number,
        currentSchool: row.current_school,
        currentSchoolAddress: row.current_school_address,
        currentDistrict: row.current_district,
        currentLatitude: row.current_latitude,
        currentLongitude: row.current_longitude,
        currentSchoolLatitude: row.current_school_latitude,
        currentSchoolLongitude: row.current_school_longitude,
        homeDistrict: row.home_district,
        homeLatitude: row.home_latitude,
        homeLongitude: row.home_longitude,
        preferredDistricts: row.preferred_districts,
        preferredLocationLatitude: row.preferred_location_latitude,
        preferredLocationLongitude: row.preferred_location_longitude,
        maxDistance: row.max_distance,
        hideContact: row.hide_contact,
        allowRequests: row.allow_requests,
        emailNotifications: row.email_notifications,
        experience: row.experience,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return { ...teacher, user };
    });
  }

  async createTransferRequest(insertRequest: InsertTransferRequest): Promise<TransferRequest> {
    const [request] = await db.insert(transferRequests).values(insertRequest).returning();
    return request;
  }

  async getTransferRequestById(id: number): Promise<TransferRequest | undefined> {
    const [request] = await db.select().from(transferRequests).where(sql`${transferRequests.id} = ${id}`);
    return request;
  }

  async getTransferRequestsForTeacher(teacherId: number): Promise<TransferRequestWithTeachers[]> {
    const result = await db.execute(sql`
      SELECT r.*, 
        ft.*, fu.*, 
        tt.id as to_teacher_id, tt.user_id as to_teacher_user_id, tt.name as to_teacher_name, tt.subjects as to_teacher_subjects, tt.grade_level as to_teacher_grade_level, tt.phone_number as to_teacher_phone_number, tt.current_school as to_teacher_current_school, tt.current_school_address as to_teacher_current_school_address, tt.current_district as to_teacher_current_district, tt.current_latitude as to_teacher_current_latitude, tt.current_longitude as to_teacher_current_longitude, tt.current_school_latitude as to_teacher_current_school_latitude, tt.current_school_longitude as to_teacher_current_school_longitude, tt.home_district as to_teacher_home_district, tt.home_latitude as to_teacher_home_latitude, tt.home_longitude as to_teacher_home_longitude, tt.preferred_districts as to_teacher_preferred_districts, tt.preferred_location_latitude as to_teacher_preferred_location_latitude, tt.preferred_location_longitude as to_teacher_preferred_location_longitude, tt.max_distance as to_teacher_max_distance, tt.hide_contact as to_teacher_hide_contact, tt.allow_requests as to_teacher_allow_requests, tt.email_notifications as to_teacher_email_notifications, tt.experience as to_teacher_experience, tt.is_active as to_teacher_is_active, tt.created_at as to_teacher_created_at, tt.updated_at as to_teacher_updated_at,
        tu.id as to_user_id, tu.email as to_user_email, tu.password as to_user_password, tu.created_at as to_user_created_at
      FROM ${transferRequests} r
      INNER JOIN ${teachers} ft ON r.from_teacher_id = ft.id
      INNER JOIN ${users} fu ON ft.user_id = fu.id
      INNER JOIN ${teachers} tt ON r.to_teacher_id = tt.id
      INNER JOIN ${users} tu ON tt.user_id = tu.id
      WHERE r.to_teacher_id = ${teacherId}
    `);
    return result.rows.map((row: any) => ({
      ...row,
      fromTeacher: {
        id: row.from_teacher_id,
        userId: row.user_id,
        name: row.name,
        subjects: row.subjects,
        gradeLevel: row.grade_level,
        phoneNumber: row.phone_number,
        currentSchool: row.current_school,
        currentSchoolAddress: row.current_school_address,
        currentDistrict: row.current_district,
        currentLatitude: row.current_latitude,
        currentLongitude: row.current_longitude,
        currentSchoolLatitude: row.current_school_latitude,
        currentSchoolLongitude: row.current_school_longitude,
        homeDistrict: row.home_district,
        homeLatitude: row.home_latitude,
        homeLongitude: row.home_longitude,
        preferredDistricts: row.preferred_districts,
        preferredLocationLatitude: row.preferred_location_latitude,
        preferredLocationLongitude: row.preferred_location_longitude,
        maxDistance: row.max_distance,
        hideContact: row.hide_contact,
        allowRequests: row.allow_requests,
        emailNotifications: row.email_notifications,
        experience: row.experience,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        user: {
          id: row.id,
          email: row.email,
          password: row.password,
          createdAt: row.created_at,
        },
      },
      toTeacher: {
        id: row.to_teacher_id,
        userId: row.to_teacher_user_id,
        name: row.to_teacher_name,
        subjects: row.to_teacher_subjects,
        gradeLevel: row.to_teacher_grade_level,
        phoneNumber: row.to_teacher_phone_number,
        currentSchool: row.to_teacher_current_school,
        currentSchoolAddress: row.to_teacher_current_school_address,
        currentDistrict: row.to_teacher_current_district,
        currentLatitude: row.to_teacher_current_latitude,
        currentLongitude: row.to_teacher_current_longitude,
        currentSchoolLatitude: row.to_teacher_current_school_latitude,
        currentSchoolLongitude: row.to_teacher_current_school_longitude,
        homeDistrict: row.to_teacher_home_district,
        homeLatitude: row.to_teacher_home_latitude,
        homeLongitude: row.to_teacher_home_longitude,
        preferredDistricts: row.to_teacher_preferred_districts,
        preferredLocationLatitude: row.to_teacher_preferred_location_latitude,
        preferredLocationLongitude: row.to_teacher_preferred_location_longitude,
        maxDistance: row.to_teacher_max_distance,
        hideContact: row.to_teacher_hide_contact,
        allowRequests: row.to_teacher_allow_requests,
        emailNotifications: row.to_teacher_email_notifications,
        experience: row.to_teacher_experience,
        isActive: row.to_teacher_is_active,
        createdAt: row.to_teacher_created_at,
        updatedAt: row.to_teacher_updated_at,
        user: {
          id: row.to_user_id,
          email: row.to_user_email,
          password: row.to_user_password,
          createdAt: row.to_user_created_at,
        },
      },
    }));
  }

  async getTransferRequestsByTeacher(teacherId: number): Promise<TransferRequestWithTeachers[]> {
    const result = await db.execute(sql`
      SELECT r.*, 
        ft.*, fu.*, 
        tt.id as to_teacher_id, tt.user_id as to_teacher_user_id, tt.name as to_teacher_name, tt.subjects as to_teacher_subjects, tt.grade_level as to_teacher_grade_level, tt.phone_number as to_teacher_phone_number, tt.current_school as to_teacher_current_school, tt.current_school_address as to_teacher_current_school_address, tt.current_district as to_teacher_current_district, tt.current_latitude as to_teacher_current_latitude, tt.current_longitude as to_teacher_current_longitude, tt.current_school_latitude as to_teacher_current_school_latitude, tt.current_school_longitude as to_teacher_current_school_longitude, tt.home_district as to_teacher_home_district, tt.home_latitude as to_teacher_home_latitude, tt.home_longitude as to_teacher_home_longitude, tt.preferred_districts as to_teacher_preferred_districts, tt.preferred_location_latitude as to_teacher_preferred_location_latitude, tt.preferred_location_longitude as to_teacher_preferred_location_longitude, tt.max_distance as to_teacher_max_distance, tt.hide_contact as to_teacher_hide_contact, tt.allow_requests as to_teacher_allow_requests, tt.email_notifications as to_teacher_email_notifications, tt.experience as to_teacher_experience, tt.is_active as to_teacher_is_active, tt.created_at as to_teacher_created_at, tt.updated_at as to_teacher_updated_at,
        tu.id as to_user_id, tu.email as to_user_email, tu.password as to_user_password, tu.created_at as to_user_created_at
      FROM ${transferRequests} r
      INNER JOIN ${teachers} ft ON r.from_teacher_id = ft.id
      INNER JOIN ${users} fu ON ft.user_id = fu.id
      INNER JOIN ${teachers} tt ON r.to_teacher_id = tt.id
      INNER JOIN ${users} tu ON tt.user_id = tu.id
      WHERE r.from_teacher_id = ${teacherId}
    `);
    return result.rows.map((row: any) => ({
      ...row,
      fromTeacher: {
        id: row.from_teacher_id,
        userId: row.user_id,
        name: row.name,
        subjects: row.subjects,
        gradeLevel: row.grade_level,
        phoneNumber: row.phone_number,
        currentSchool: row.current_school,
        currentSchoolAddress: row.current_school_address,
        currentDistrict: row.current_district,
        currentLatitude: row.current_latitude,
        currentLongitude: row.current_longitude,
        currentSchoolLatitude: row.current_school_latitude,
        currentSchoolLongitude: row.current_school_longitude,
        homeDistrict: row.home_district,
        homeLatitude: row.home_latitude,
        homeLongitude: row.home_longitude,
        preferredDistricts: row.preferred_districts,
        preferredLocationLatitude: row.preferred_location_latitude,
        preferredLocationLongitude: row.preferred_location_longitude,
        maxDistance: row.max_distance,
        hideContact: row.hide_contact,
        allowRequests: row.allow_requests,
        emailNotifications: row.email_notifications,
        experience: row.experience,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        user: {
          id: row.id,
          email: row.email,
          password: row.password,
          createdAt: row.created_at,
        },
      },
      toTeacher: {
        id: row.to_teacher_id,
        userId: row.to_teacher_user_id,
        name: row.to_teacher_name,
        subjects: row.to_teacher_subjects,
        gradeLevel: row.to_teacher_grade_level,
        phoneNumber: row.to_teacher_phone_number,
        currentSchool: row.to_teacher_current_school,
        currentSchoolAddress: row.to_teacher_current_school_address,
        currentDistrict: row.to_teacher_current_district,
        currentLatitude: row.to_teacher_current_latitude,
        currentLongitude: row.to_teacher_current_longitude,
        currentSchoolLatitude: row.to_teacher_current_school_latitude,
        currentSchoolLongitude: row.to_teacher_current_school_longitude,
        homeDistrict: row.to_teacher_home_district,
        homeLatitude: row.to_teacher_home_latitude,
        homeLongitude: row.to_teacher_home_longitude,
        preferredDistricts: row.to_teacher_preferred_districts,
        preferredLocationLatitude: row.to_teacher_preferred_location_latitude,
        preferredLocationLongitude: row.to_teacher_preferred_location_longitude,
        maxDistance: row.to_teacher_max_distance,
        hideContact: row.to_teacher_hide_contact,
        allowRequests: row.to_teacher_allow_requests,
        emailNotifications: row.to_teacher_email_notifications,
        experience: row.to_teacher_experience,
        isActive: row.to_teacher_is_active,
        createdAt: row.to_teacher_created_at,
        updatedAt: row.to_teacher_updated_at,
        user: {
          id: row.to_user_id,
          email: row.to_user_email,
          password: row.to_user_password,
          createdAt: row.to_user_created_at,
        },
      },
    }));
  }

  async updateTransferRequestStatus(id: number, status: string): Promise<TransferRequest | undefined> {
    const [request] = await db.update(transferRequests).set({ status }).where(sql`${transferRequests.id} = ${id}`).returning();
    return request;
  }

  async createMatch(teacher1Id: number, teacher2Id: number, matchType: string, distance?: number, score?: number): Promise<Match> {
    const [match] = await db.insert(matches).values({
      teacher1Id,
      teacher2Id,
      matchType,
      distance: distance?.toString() || null,
      score: score || 0,
    }).returning();
    return match;
  }

  async getMatchesForTeacher(teacherId: number): Promise<MatchWithTeachers[]> {
    // Implement as needed, similar to getTeachersWithUsers
    return [];
  }

  async deleteMatch(id: number): Promise<void> {
    await db.delete(matches).where(sql`${matches.id} = ${id}`);
  }
}

export const storage = new PgStorage();
