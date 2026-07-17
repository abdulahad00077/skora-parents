import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInManual: (phone: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInManual = async (phone: string) => {
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
    
    await AsyncStorage.setItem('manual_session_phone', phone);
  };

  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      const savedPhone = await AsyncStorage.getItem('manual_session_phone');
      
      let phoneToVerify: string | null = null;
      if (supabaseSession?.user?.phone) {
        phoneToVerify = supabaseSession.user.phone;
      } else if (savedPhone) {
        phoneToVerify = savedPhone;
      }

      if (phoneToVerify) {
        // Re-verify if still allowed to use the app
        const digitsOnly = phoneToVerify.replace(/[^0-9]/g, '');
        const variations = [digitsOnly, `+91${digitsOnly}`, `91${digitsOnly}`, `0${digitsOnly}`];
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
      }

      if (supabaseSession) {
        setSession(supabaseSession);
        setUser(supabaseSession.user);
      } else if (savedPhone) {
        await signInManual(savedPhone);
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
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, signInManual }}>
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
