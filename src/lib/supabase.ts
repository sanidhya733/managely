import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          email: string;
          department: string;
          position: string;
          join_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          department: string;
          position: string;
          join_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          department?: string;
          position?: string;
          join_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          status: 'present' | 'absent' | 'overtime' | 'halfday';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date: string;
          status: 'present' | 'absent' | 'overtime' | 'halfday';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          status?: 'present' | 'absent' | 'overtime' | 'halfday';
          notes?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          assigned_to: string;
          assigned_by: string;
          status: 'pending' | 'accepted' | 'completed';
          created_date: string;
          due_date: string;
          completed_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          assigned_to: string;
          assigned_by: string;
          status?: 'pending' | 'accepted' | 'completed';
          created_date?: string;
          due_date: string;
          completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          assigned_to?: string;
          assigned_by?: string;
          status?: 'pending' | 'accepted' | 'completed';
          created_date?: string;
          due_date?: string;
          completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}