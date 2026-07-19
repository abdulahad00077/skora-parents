export interface FeePayment {
  id: string;
  fee_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  transaction_id?: string;
  receipt_number?: string;
  remarks?: string;
  created_at: string;
}

export interface FeeRecord {
  id: string;
  student_id: string;
  school_id: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'partial';
  month?: string;
  months?: string[];
  payment_date?: string;
  receipt_url?: string;
  pdf_url?: string;
  created_at: string;
  paid_amount?: number;
  description?: string;
  fee_type?: string;
  fee_payments?: FeePayment[];
}

import { supabase } from './supabase';

export async function getStudentFees(studentId: string): Promise<FeeRecord[]> {
  const { data, error } = await supabase
    .from('fees')
    .select('*, fee_payments(*)')
    .eq('student_id', studentId)
    .order('due_date', { ascending: false });

  if (error) {
    console.error('Error fetching fees:', error);
    return [];
  }

  return data || [];
}

export interface SchoolDetails {
  id?: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  affiliation_number?: string;
  school_code?: string;
}

export async function getSchoolDetails(schoolId: string): Promise<SchoolDetails | null> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('name, address, email, phone, affiliation_number, school_code')
      .eq('id', schoolId)
      .single();
      
    if (error) {
      console.error('Error fetching school details:', error);
      return null;
    }
    
    return data as SchoolDetails;
  } catch (error) {
    console.error('getSchoolDetails error:', error);
    return null;
  }
}
