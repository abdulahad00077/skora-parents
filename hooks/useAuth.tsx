import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Driver } from '../types';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userRole: 'parent' | 'driver' | null;
  driver: Driver | null;
  signOut: () => Promise<void>;
  signInManual: (phone: string, role?: 'parent' | 'driver', driverData?: Driver) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'parent' | 'driver' | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);

  const signInManual = async (phone: string, role: 'parent' | 'driver' = 'parent', driverData?: Driver) => {
    const mockUser = {
      id: 'manual-' + phone,
      phone: phone,
      email: '',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    
    const mockSession = { 
      user: mockUser, 
      access_token: 'manual', 
      refresh_token: 'manual', 
      expires_in: 3600, 
      token_type: 'bearer' 
    } as Session;

    setUser(mockUser);
    setSession(mockSession);
    setUserRole(role);
    if (driverData) setDriver(driverData);
    
    await AsyncStorage.setItem('manual_session_phone', phone);
    await AsyncStorage.setItem('user_role', role);
    if (driverData) await AsyncStorage.setItem('driver_data', JSON.stringify(driverData));
  };

  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      const savedPhone = await AsyncStorage.getItem('manual_session_phone');
      const savedRole = await AsyncStorage.getItem('user_role') as 'parent' | 'driver' | null;
      const savedDriver = await AsyncStorage.getItem('driver_data');
      
      let phoneToVerify: string | null = null;
      if (supabaseSession?.user?.phone) {
        phoneToVerify = supabaseSession.user.phone;
      } else if (savedPhone) {
        phoneToVerify = savedPhone;
      }

      if (phoneToVerify) {
        const digitsOnly = phoneToVerify.replace(/[^0-9]/g, '');
        const variations = [digitsOnly, `+91${digitsOnly}`, `91${digitsOnly}`, `0${digitsOnly}`, `+91 ${digitsOnly}`, `91 ${digitsOnly}`];

        if (savedRole === 'driver') {
          // Re-verify driver
          const driverOrQuery = variations.map(fmt => `mobile_number.eq.${fmt}`).join(',');
          const { data: drivers, error } = await supabase
            .from('transport_drivers')
            .select('id, school_id, name:driver_name, phone:mobile_number, password, is_first_login, vehicle_number, vehicle_name:vehicle_type, route_id, created_at')
            .or(driverOrQuery);

          if (error || !drivers || drivers.length === 0) {
            await signOut();
            setLoading(false);
            return;
          }
          
          setUserRole('driver');
          setDriver(drivers[0]);
        } else {
          // Re-verify parent
        const orQuery = variations.map(fmt => `parent_phone.eq.${fmt}`).join(',');

        const { data: students, error: studentError } = await supabase
          .from('students')
          .select('*')
          .or(orQuery);

        if (studentError || !students || students.length === 0) {
          // No valid student found for this phone anymore
          await signOut();
          setLoading(false);
          return;
        }

        // Check if at least one student's school is active
        const schoolId = students[0].school_id;
        const { data: studentSchool } = await supabase
          .from('schools')
          .select('status, parents_app_enabled')
          .eq('id', schoolId)
          .single();
        
        if (studentSchool) {
          if (studentSchool.status !== 'active' || studentSchool.parents_app_enabled !== true) {
            await signOut();
            setLoading(false);
            return;
          }
        }
        setUserRole('parent');
        }
      }

      if (supabaseSession) {
        setSession(supabaseSession);
        setUser(supabaseSession.user);
      } else if (savedPhone) {
        let parsedDriver = null;
        if (savedDriver) parsedDriver = JSON.parse(savedDriver);
        await signInManual(savedPhone, savedRole || 'parent', parsedDriver || undefined);
      }
      setLoading(false);
    };

    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('manual_session_phone');
    await AsyncStorage.removeItem('selected_student_id');
    await AsyncStorage.removeItem('user_role');
    await AsyncStorage.removeItem('driver_data');
    setUser(null);
    setSession(null);
    setUserRole(null);
    setDriver(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, userRole, driver, signOut, signInManual }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
