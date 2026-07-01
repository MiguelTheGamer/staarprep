/**
 * lib/database.types.ts
 * ---------------------------------------------------------------------------
 * Typed shape of the Postgres schema. In production this is generated with
 * `npm run db:types` (supabase gen types). It's hand-maintained here so the
 * scaffold is fully typed out of the box without a live database connection.
 * Keep in sync with supabase/schema.sql.
 * ---------------------------------------------------------------------------
 */

import type { GeneratedQuestion } from "./prompts";

export type Plan = "trial" | "teacher" | "campus" | "district";
export type Role = "teacher" | "campus_admin" | "district_admin";

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      districts: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string; created_at?: string };
        Update: Partial<{ name: string }>;
        Relationships: [];
      };
      campuses: {
        Row: { id: string; district_id: string | null; name: string; created_at: string };
        Insert: { id?: string; district_id?: string | null; name: string };
        Update: Partial<{ district_id: string | null; name: string }>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          campus_id: string | null;
          role: Role;
          plan: Plan;
          created_at: string;
        };
        Insert: { id: string; full_name?: string | null; campus_id?: string | null; role?: Role; plan?: Plan };
        Update: Partial<{ full_name: string | null; campus_id: string | null; role: Role; plan: Plan }>;
        Relationships: [];
      };
      question_sets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          grade: string;
          subject: string;
          teks: string | null;
          questions: GeneratedQuestion[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          grade: string;
          subject: string;
          teks?: string | null;
          questions: GeneratedQuestion[];
        };
        Update: Partial<{ title: string; questions: GeneratedQuestion[] }>;
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          teacher_id: string;
          display_name: string;
          sis_id: string | null;
          class_period: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          display_name: string;
          sis_id?: string | null;
          class_period?: string | null;
        };
        Update: Partial<{ display_name: string; sis_id: string | null; class_period: string | null }>;
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          set_id: string;
          teacher_id: string;
          assigned_at: string;
          due_at: string | null;
        };
        Insert: { id?: string; set_id: string; teacher_id: string; due_at?: string | null };
        Update: Partial<{ due_at: string | null }>;
        Relationships: [];
      };
      results: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          teacher_id: string;
          score: number | null;
          teks_breakdown: Record<string, number>;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          teacher_id: string;
          score?: number | null;
          teks_breakdown?: Record<string, number>;
        };
        Update: Partial<{ score: number | null; teks_breakdown: Record<string, number> }>;
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          grade: string | null;
          subject: string | null;
          teks: string | null;
          count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          grade?: string | null;
          subject?: string | null;
          teks?: string | null;
          count?: number | null;
        };
        Update: Partial<{ count: number | null }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
