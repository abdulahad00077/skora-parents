import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar, 
  StyleSheet, 
  Dimensions, 
  Platform 
} from 'react-native';
import { useStudent } from '../hooks/useStudent';
import { getStudentAttendance } from '../services/attendance';
import { AttendanceRecord } from '../types';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AttendanceScreen = () => {
  const navigation = useNavigation();
  const { selectedStudent } = useStudent();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const headerBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardColor = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#F1F5F9';

  useEffect(() => {
    if (selectedStudent) {
      setLoading(true);
      getStudentAttendance(selectedStudent.id).then(data => {
        setAttendance(data);
        setLoading(false);
      });
    }
  }, [selectedStudent]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={[styles.loadingText, { color: subtextColor }]}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={[styles.headerWrapper, { backgroundColor: headerBg }]}>
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#ffffff', '#F8FAFC']}
          style={[styles.headerGradient, { borderBottomColor: borderColor }]}
        >
          <View style={[styles.headerTop, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
            <View>
              <Text style={[styles.headerTitle, { color: textColor }]}>{t('attendance')}</Text>
              <Text style={[styles.headerSubtitle, { color: subtextColor }]}>History for {selectedStudent?.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Feather name="menu" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {attendance.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={[styles.emptyIconBg, { backgroundColor: isDark ? 'rgba(2,132,199,0.2)' : '#F8FAFC' }]}>
              <Feather name="calendar" size={64} color={isDark ? '#0284C7' : '#CBD5E1'} />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>No Records Found</Text>
            <Text style={[styles.emptyDesc, { color: subtextColor }]}>Attendance records for this student will appear here once updated by the school.</Text>
          </View>
        ) : (
          <View>
            {attendance.map((record) => {
              const isPresent = record.status === 'present';
              const date = new Date(record.date);
              return (
                <View key={record.id} style={[styles.recordCard, { backgroundColor: cardColor, borderColor }]}>
                  <View style={[
                    styles.statusIconBg, 
                    { backgroundColor: isPresent ? (isDark ? 'rgba(22,163,74,0.2)' : '#F0FDF4') : (isDark ? 'rgba(220,38,38,0.2)' : '#FEF2F2') }
                  ]}>
                    {isPresent ? (
                      <Feather name="check-circle" size={24} color={isDark ? '#4ade80' : '#16A34A'} />
                    ) : (
                      <Feather name="x-circle" size={24} color={isDark ? '#f87171' : '#DC2626'} />
                    )}
                  </View>
                  
                  <View style={styles.recordInfo}>
                    <Text style={[styles.recordDate, { color: textColor }]}>
                      {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    <Text style={[styles.recordDay, { color: subtextColor }]}>
                      {date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: isPresent ? (isDark ? 'rgba(22,163,74,0.2)' : '#F0FDF4') : (isDark ? 'rgba(220,38,38,0.2)' : '#FEF2F2') }
                  ]}>
                    <Text style={[
                      styles.statusText, 
                      { color: isPresent ? (isDark ? '#4ade80' : '#166534') : (isDark ? '#f87171' : '#991B1B') }
                    ]}>
                      {record.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 15, fontWeight: '600' },
  flex1: { flex: 1 },
  headerWrapper: { zIndex: 10 },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 25, paddingHorizontal: 25, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  menuButton: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  emptyCard: { borderRadius: 40, padding: 40, justifyContent: 'center', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 2, marginTop: 30, alignItems: 'center' },
  emptyIconBg: { padding: 24, borderRadius: 30, marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  emptyDesc: { fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
  recordCard: { borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  statusIconBg: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { marginLeft: 15, flex: 1 },
  recordDate: { fontSize: 18, fontWeight: '800' },
  recordDay: { fontSize: 10, fontWeight: '900', marginTop: 2, letterSpacing: 1, textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
});

export default AttendanceScreen;
