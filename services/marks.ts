import { supabase } from './supabase';

export interface MarkRecord {
  id: string; // or you might not have an id, but let's assume it has one or just use composite
  created_at?: string;
  student_id: string;
  exam_id: string;
  score: number;
  total_marks: number;
  remarks?: string;
  exams?: {
    name: string;
    date: string;
    subject: string;
  };
}

export async function getStudentMarks(studentId: string, schoolId: string): Promise<MarkRecord[]> {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select(`
        *,
        exams!inner (
          name,
          date,
          subject,
          school_id
        )
      `)
      .eq('student_id', studentId)
      .eq('exams.school_id', schoolId);

    if (error) {
      console.error('Error fetching marks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('getStudentMarks error:', error);
    return [];
  }
}
