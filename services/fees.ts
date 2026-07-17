export interface FeeRecord {
  id: string;
  student_id: string;
  school_id: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'unpaid' | 'overdue';
  month: string;
  payment_date?: string;
  receipt_url?: string;
  created_at: string;
}

import { supabase } from './supabase';

export async function getStudentFees(studentId: string): Promise<FeeRecord[]> {
  const { data, error } = await supabase
    .from('fees')
    .select('*')
    .eq('student_id', studentId)
    .order('due_date', { ascending: false });

  if (error) {
    console.error('Error fetching fees:', error);
    return [];
  }

  return data || [];
}
