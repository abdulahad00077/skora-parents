import { supabase } from './supabase';
import { Student, TransportLog } from '../types';
import NetInfo from '@react-native-community/netinfo';
import { addToOfflineQueue, PendingTransportAction } from './offlineSync';

export const getDriverAssignedStudents = async (driver_id: string, school_id: string, route_id?: string): Promise<Student[]> => {
  // First, fetch the assigned student IDs from transport_allocations
  let query = supabase
    .from('transport_allocations')
    .select('student_id')
    .eq('school_id', school_id);
    
  if (route_id) {
    query = query.or(`driver_id.eq.${driver_id},route_id.eq.${route_id}`);
  } else {
    query = query.eq('driver_id', driver_id);
  }

  const { data: allocations, error: allocError } = await query;

  if (allocError) {
    console.error('Error fetching transport allocations:', allocError);
    return [];
  }

  if (!allocations || allocations.length === 0) {
    return [];
  }

  const studentIds = allocations.map(a => a.student_id);

  // Then fetch the actual student records
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('school_id', school_id)
    .in('id', studentIds)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching students for driver:', error);
    return [];
  }
  return data || [];
};

export const getLatestTransportLog = async (student_id: string): Promise<TransportLog | null> => {
  const { data, error } = await supabase
    .from('transport_logs')
    .select('*')
    .eq('student_id', student_id)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Error fetching latest transport log:', error);
    return null;
  }
  return data || null;
};

export const getTodayTransportLogs = async (school_id: string): Promise<TransportLog[]> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const { data, error } = await supabase
    .from('transport_logs')
    .select('*')
    .eq('school_id', school_id)
    .gte('timestamp', yesterday.toISOString())
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching today transport logs:', error);
    return [];
  }
  return data || [];
};

export const logTransportAction = async (action: PendingTransportAction): Promise<boolean> => {
  const state = await NetInfo.fetch();
  
  if (state.isConnected) {
    const { id, student_name, type, ...dbData } = action;
    const { error } = await supabase.from('transport_logs').insert([{ ...dbData, trip_type: type }]);
    
    if (error) {
      console.error('Error inserting transport log, queueing offline:', error);
      await addToOfflineQueue(action);
      return false; // Returns false to indicate offline queue
    }
    
    // Simulate push notification if the user requested it directly
    // Call your push API here or assume Edge Function handles it
    sendPushNotificationMock(action.student_name, action.type);
    
    return true; // Online success
  } else {
    // Offline
    await addToOfflineQueue(action);
    return false; // Offline queued
  }
};

const sendPushNotificationMock = async (studentName: string, type: 'pickup' | 'drop') => {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const message = type === 'pickup' 
    ? `${studentName} has boarded the school vehicle at ${timeStr}.`
    : `${studentName} has been safely dropped at ${timeStr}.`;
  
  // Here we would fetch the parent's push token and send to Expo API.
  // Mocking the console log.
  console.log('Sending Push Notification:', message);
};

export const subscribeToTransportLogs = (student_id: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel(`public:transport_logs:student_id=eq.${student_id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transport_logs',
        filter: `student_id=eq.${student_id}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
    
  return subscription;
};

export const getStudentTransportInfo = async (student_id: string) => {
  const { data, error } = await supabase
    .from('transport_allocations')
    .select('*, transport_drivers(driver_name, vehicle_name, vehicle_number, mobile_number), transport_routes(route_name, pickup_location, drop_location)')
    .eq('student_id', student_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching transport info:', error);
    return null;
  }
  return data || null;
};

export const getStudentTransportLogsByDate = async (student_id: string, dateStr: string): Promise<TransportLog[]> => {
  const startDate = new Date(`${dateStr}T00:00:00.000Z`);
  const endDate = new Date(`${dateStr}T23:59:59.999Z`);
  
  const { data, error } = await supabase
    .from('transport_logs')
    .select('*')
    .eq('student_id', student_id)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching logs by date:', error);
    return [];
  }
  return data || [];
};
