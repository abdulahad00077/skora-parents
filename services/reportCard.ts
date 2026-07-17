import { supabase } from './supabase';
import { ReportCard } from '../types';

export const getStudentReportCards = async (studentId: string): Promise<ReportCard[]> => {
  const { data, error } = await supabase
    .from('report_cards')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching report cards:', error);
    return [];
  }

  return data as ReportCard[];
};
