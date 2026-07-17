import { supabase } from './supabase';
import { Homework } from '../types';

export async function getStudentHomework(studentClass: string, studentSection?: string): Promise<Homework[]> {
  let query = supabase
    .from('homeworks')
    .select('*')
    .eq('class', studentClass);

  if (studentSection) {
    query = query.eq('section', studentSection);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching homework:', error);
    return [];
  }

  return data || [];
}
