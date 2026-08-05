import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getResolvedClient, resolveAndSetDatabase, clearDatabaseConfig } from './databaseResolver';

const coreUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const coreKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const coreSupabase = createClient(coreUrl, coreKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const resolveSchoolDatabase = async (schoolId: string) => {
  await resolveAndSetDatabase(schoolId);
  return getResolvedClient();
};

export const resetSchoolDatabase = async () => {
  await clearDatabaseConfig();
};

export const supabase = new Proxy(coreSupabase, {
  get(target, prop, receiver) {
    const clientToUse = getResolvedClient();
    const value = Reflect.get(clientToUse, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(clientToUse);
    }
    return value;
  }
});
