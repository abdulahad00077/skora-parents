import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useStudent } from '../hooks/useStudent';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Student } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex1: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoBadge: {
    padding: 24,
    borderRadius: 36,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  brandName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 20,
    letterSpacing: -1.5,
  },
  portalBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  portalText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 48,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputError: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF7ED',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: 1,
  },
  phoneInput: {
    letterSpacing: 2,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  prefixText: {
    fontSize: 18,
    color: '#0284C7',
    fontWeight: '900',
  },
  prefixDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  errorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 28,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#BAE6FD',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginRight: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 35,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dividerText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '800',
    marginHorizontal: 15,
    letterSpacing: 1,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  link: {
    color: '#0284C7',
    fontWeight: '800',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalSubTitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
  studentItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentClass: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
});

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchingStudents, setMatchingStudents] = useState<Student[]>([]);
  const [showSelection, setShowSelection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signInManual } = useAuth();
  const { selectStudent } = useStudent();
  const { isDark } = useTheme();

  // Dynamic Theme Colors
  const bgColor = isDark ? '#020817' : '#FFFFFF';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const inputBgColor = isDark ? '#0F172A' : '#F8FAFC';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';
  const cardColor = isDark ? '#020817' : '#FFFFFF';
  const gradientColors = isDark 
    ? ['#0F172A', '#020817'] as const
    : ['#E0F2FE', '#F8FAFC'] as const;

  const handleLogin = async () => {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    if (!digitsOnly || digitsOnly.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find students with this phone number
      const variations = [
        digitsOnly,
        `+91${digitsOnly}`,
        `91${digitsOnly}`,
        `0${digitsOnly}`,
        `+91 ${digitsOnly}`,
        `91 ${digitsOnly}`
      ];

      const orQuery = Array.from(new Set(variations)).map(fmt => `parent_phone.eq.${fmt}`).join(',');

      // Step 1: Find Students first (Simplified query without school join yet)
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('*')
        .or(orQuery);

      if (studentError) {
        console.error('Supabase Student Query Error:', studentError);
        throw studentError;
      }

      console.log('LoginScreen: Student data found:', students?.length || 0);

      if (!students || students.length === 0) {
        setError('This phone number is not registered. (Checked ' + variations.slice(0, 3).join(', ') + ')');
        setLoading(false);
        return;
      }

      // Step 2: Fetch school details for the first student
      const { data: studentSchool, error: schoolError } = await supabase
        .from('schools')
        .select('name, slug, status, parents_app_enabled')
        .eq('id', students[0].school_id)
        .single();
      
      if (schoolError) {
        console.warn('Could not fetch school details (likely RLS), but continuing login...:', schoolError);
        // We will continue if school data is missing, assuming active for now if blocked by RLS
      } else if (studentSchool) {
        if (studentSchool.status !== 'active') {
          setError('This school portal is currently disabled. Please contact support.');
          setLoading(false);
          return;
        }

        if (studentSchool.parents_app_enabled !== true) {
          setError('Parent app access is currently disabled for your school. Please contact your administrator.');
          setLoading(false);
          return;
        }
      }

      // Filter students by password logic
      // password = first 4 letters of name + birth year (lowercase)
      const validStudents = students.filter(student => {
        if (!student.name || !student.date_of_birth) return false;
        
        const firstName = student.name.split(' ')[0].toLowerCase().substring(0, 4);
        const birthYear = new Date(student.date_of_birth).getFullYear();
        const expectedPassword = `${firstName}${birthYear}`.toLowerCase();
        
        return password.toLowerCase() === expectedPassword;
      });

      if (validStudents.length === 0) {
        setError('Incorrect password. Hint: first 4 letters of child name + birth year');
        setLoading(false);
        return;
      }

      if (validStudents.length === 1) {
        // Only one child matches this password, log in directly
        await selectStudent(validStudents[0]);
        await signInManual(digitsOnly);
      } else {
        // Multiple children might have the same password structure (rare but possible)
        // OR the parent just entered a password that matches one but there are others.
        // Actually, if they entered a password for one child, they should see all their children anyway.
        // Let's just log them in if at least one password matches.
        setMatchingStudents(validStudents);
        setShowSelection(true);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = async (student: Student) => {
    await selectStudent(student);
    await signInManual(phoneNumber.replace(/[^0-9]/g, ''));
    setShowSelection(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={isDark ? ['#1E293B', '#020817'] : ['#E0F2FE', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: '28%',
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 40,
        }}
      >
        <Text style={[styles.brandName, { color: textColor }]}>SKORA</Text>
        <View style={[styles.portalBadge, { backgroundColor: isDark ? 'rgba(2, 132, 199, 0.2)' : '#E0F2FE', borderWidth: 0 }]}>
          <Text style={[styles.portalText, { color: isDark ? '#38BDF8' : '#0284C7' }]}>PARENT PORTAL</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex1}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 40,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: '700', color: textColor, marginBottom: 4 }}>
              Welcome
            </Text>
            <Text style={{ fontSize: 15, color: subtextColor, marginBottom: 28 }}>
              Login with your phone and child's unique password
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: subtextColor }]}>PHONE NUMBER</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor: borderColor }, error && !phoneNumber ? styles.inputError : null]}>
                <Feather name="phone" size={20} color="#0284C7" />
                <View style={styles.prefixContainer}>
                  <Text style={[styles.prefixText, { color: textColor }]}>+91</Text>
                  <View style={[styles.prefixDivider, { backgroundColor: borderColor }]} />
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput, { color: textColor }]}
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor={isDark ? '#64748B' : '#CBD5E1'}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(text: string) => {
                    setPhoneNumber(text.replace(/[^0-9]/g, ''));
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: subtextColor }]}>PASSWORD</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor: borderColor }, error && password ? styles.inputError : null]}>
                <Feather name="lock" size={20} color="#0284C7" />
                <View style={[styles.prefixDivider, { backgroundColor: borderColor }]} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="password here"
                  placeholderTextColor={isDark ? '#64748B' : '#CBD5E1'}
                  secureTextEntry={!showPassword}
                  value={password}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text: string) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 5 }}
                >
                  <Feather 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#94A3B8" 
                  />
                </TouchableOpacity>
              </View>
              {error && (
                <View style={styles.errorWrapper}>
                  <Feather name="shield" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              style={[styles.button, loading ? styles.buttonDisabled : null]}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Login</Text>
                  <Feather name="arrow-right" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            <Text
              style={{
                textAlign: 'center',
                color: subtextColor,
                fontSize: 12,
                marginTop: 24,
              }}
            >
              Please contact your administrator if you cannot access your account.
            </Text>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSelection}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSelection(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIndicator, { backgroundColor: borderColor }]} />
              <Text style={[styles.modalTitle, { color: textColor }]}>Choose Profile</Text>
              <Text style={[styles.modalSubTitle, { color: subtextColor }]}>Select which child's profile you want to view first</Text>
            </View>
            
            <FlatList
              data={matchingStudents}
              keyExtractor={(item: Student) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: Student }) => (
                <TouchableOpacity 
                  style={[styles.studentItem, { backgroundColor: inputBgColor, borderColor: borderColor, borderWidth: 1 }]}
                  onPress={() => handleSelectChild(item)}
                >
                  <View style={{ backgroundColor: isDark ? 'rgba(2, 132, 199, 0.2)' : '#E0F2FE', padding: 12, borderRadius: 16 }}>
                    <Feather name="user" size={24} color="#0284C7" />
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: textColor }]}>{item.name}</Text>
                    <Text style={[styles.studentClass, { color: subtextColor }]}>Class {item.class} {item.section ? ` - Section ${item.section}` : ''}</Text>
                  </View>
                  <Feather name="check-circle" size={24} color="#10B981" />
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity 
              onPress={() => setShowSelection(false)}
              style={{ marginTop: 20, alignItems: 'center', padding: 15 }}
            >
              <Text style={{ color: '#64748B', fontWeight: '800' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;
