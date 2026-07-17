import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Modal, 
  Pressable, 
  Platform, 
  ActivityIndicator, 
  StatusBar, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudent } from '../hooks/useStudent';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getStudentAttendance } from '../services/attendance';
import { getStudentHomework } from '../services/homework';
import { getStudentTimetable } from '../services/timetable';
import { getStudentMessages } from '../services/messages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DashboardScreen = () => {
  const { students, selectedStudent, selectStudent, loading, refreshStudents } = useStudent();
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // Theme Colors
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const headerBg = isDark ? '#1E293B' : '#FFFFFF';
  const cardColor = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#F1F5F9';

  // Dashboard Metrics
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [attendancePerc, setAttendancePerc] = useState('0');
  const [homeworkCount, setHomeworkCount] = useState('0');
  const [nextClass, setNextClass] = useState('--:--');
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

  const fetchDashboardMetrics = React.useCallback(async () => {
    if (!selectedStudent) return;
    setMetricsLoading(true);
    try {
      const [attendData, hwData, ttData, msgData] = await Promise.all([
        getStudentAttendance(selectedStudent.id),
        getStudentHomework(selectedStudent.class, selectedStudent.section),
        getStudentTimetable(selectedStudent.school_id, selectedStudent.class, selectedStudent.section),
        getStudentMessages(selectedStudent.id)
      ]);

      // 1. Calculate Attendance
      if (attendData.length > 0) {
        const presentDays = attendData.filter(r => r.status === 'present').length;
        setAttendancePerc(Math.round((presentDays / attendData.length) * 100).toString());
      } else {
        setAttendancePerc('0');
      }

      // 2. Calculate Pending Homework
      const _now = new Date();
      const activeHw = hwData.filter(hw => new Date(hw.due_date) >= _now).length;
      setHomeworkCount(activeHw.toString());

      // 3. Find Next Class
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[_now.getDay()];
      const currentTime = _now.toTimeString().substring(0, 5); 
      
      const todaysClasses = ttData.filter(t => t.day_of_week === today);
      const upcomingClass = todaysClasses
        .filter(t => t.start_time > currentTime)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
      
      setNextClass(upcomingClass ? upcomingClass.start_time.substring(0, 5) : 'None');

      // 4. Populate Recent Activity (Map top 2 messages + top 2 homeworks)
      const topMsgs = msgData.slice(0, 2).map((m: any) => ({
        id: 'msg_' + m.id,
        title: 'New Message',
        desc: m.message_text || m.message || 'You have a new message.',
        date: new Date(m.created_at),
        icon: 'message-circle',
        color: '#8B5CF6'
      }));
      
      const topHw = hwData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 2).map(h => ({
        id: 'hw_' + h.id,
        title: 'New Homework: ' + (h.title || 'Assignment'),
        desc: h.title,
        date: new Date(h.created_at),
        icon: 'book',
        color: '#EA580C'
      }));

      const combined = [...topMsgs, ...topHw]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 3);
        
      setRecentUpdates(combined);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setMetricsLoading(false);
    }
  }, [selectedStudent]);

  React.useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshStudents();
    await fetchDashboardMetrics();
    setRefreshing(false);
  }, [refreshStudents, fetchDashboardMetrics]);

  if (loading || !selectedStudent) {
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
      
      {/* Premium Header */}
      <View style={[styles.headerWrapper, { backgroundColor: headerBg }]}>
        <View style={[styles.headerGradient, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
          <View style={[styles.headerTop, { justifyContent: 'space-between' }]}>
            <TouchableOpacity
              onPress={() => students.length > 1 && setShowSwitchModal(true)}
              activeOpacity={0.7}
              style={[styles.studentSelector, { backgroundColor: bgColor, borderColor: borderColor }]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{selectedStudent.name.charAt(0)}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentLabel, { color: subtextColor }]}>STUDENT PROFILE</Text>
                <View style={styles.studentNameRow}>
                  <Text style={[styles.studentName, { color: textColor }]} numberOfLines={1}>{selectedStudent.name}</Text>
                  {students.length > 1 && <Feather name="chevron-down" size={14} color={subtextColor} />}
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Feather name="menu" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0284c7" />}
      >
        <View style={styles.mainContent}>
          
          {/* Main Info Card */}
          <LinearGradient
            colors={['#0ea5e9', '#0284c7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardLabel}>Current Class</Text>
                <Text style={styles.cardTitle}>
                  {selectedStudent.class}{selectedStudent.section ? ` - ${selectedStudent.section}` : ''}
                </Text>
              </View>
              <View style={styles.rollBadge}>
                <Text style={styles.rollText}>#{selectedStudent.roll_id}</Text>
              </View>
            </View>
            
            <View style={styles.cardDivider} />
            
            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <View style={styles.footerIconBg}>
                  <MaterialCommunityIcons name="school" size={16} color="white" />
                </View>
                <Text style={styles.footerLabel}>Active Enrollment</Text>
              </View>
              <View style={styles.sessionBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.sessionText}>
                  {selectedStudent.session || 'Academic Year 2026-27'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: cardColor, borderColor }]}>
              <View style={[styles.statIconBg, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.2)' : '#F0FDF4' }]}>
                <Feather name="calendar" size={22} color="#16a34a" />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>
                {metricsLoading ? '-' : `${attendancePerc}%`}
              </Text>
              <Text style={[styles.statLabel, { color: subtextColor }]}>{t('attendance').toUpperCase()}</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: cardColor, borderColor }]}>
              <View style={[styles.statIconBg, { backgroundColor: isDark ? 'rgba(234, 88, 12, 0.2)' : '#FFF7ED' }]}>
                <Feather name="book-open" size={22} color="#ea580c" />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>
                {metricsLoading ? '-' : homeworkCount}
              </Text>
              <Text style={[styles.statLabel, { color: subtextColor }]}>{t('homework').toUpperCase()}</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: cardColor, borderColor }]}>
              <View style={[styles.statIconBg, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF' }]}>
                <Feather name="clock" size={22} color="#2563eb" />
              </View>
              <Text style={[styles.statValue, { color: textColor }]}>
                {metricsLoading ? '--:--' : nextClass}
              </Text>
              <Text style={[styles.statLabel, { color: subtextColor }]}>NEXT CLASS</Text>
            </View>
          </View>

          {/* Recent Updates */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{t('recentActivity')}</Text>
          </View>

          {metricsLoading ? (
             <ActivityIndicator style={{ marginVertical: 30 }} size="large" color="#0284c7" />
          ) : recentUpdates.length === 0 ? (
             <Text style={[styles.statLabel, { color: subtextColor, textAlign: 'center', marginVertical: 20 }]}>No recent activity found.</Text>
          ) : (
            recentUpdates.map((update, idx) => (
              <View key={update.id} style={[styles.updateCard, { backgroundColor: cardColor, borderColor, marginBottom: idx === recentUpdates.length - 1 ? 0 : 12 }]}>
                <View style={styles.updateRow}>
                  <View style={[styles.updateIconBg, { backgroundColor: isDark ? update.color + '20' : update.color + '15' }]}>
                    <Feather name={update.icon as any} size={18} color={update.color} />
                  </View>
                  <View style={styles.updateContent}>
                    <Text style={[styles.updateTitle, { color: textColor }]}>{update.title}</Text>
                    <Text style={[styles.updateDesc, { color: subtextColor }]} numberOfLines={2}>{update.desc}</Text>
                    <Text style={[styles.updateTime, { color: subtextColor }]}>{update.date.toLocaleDateString()}</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Logout Section */}
          <TouchableOpacity 
            onPress={signOut}
            style={[styles.logoutButton, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
          >
            <Feather name="log-out" size={20} color={subtextColor} />
            <Text style={[styles.logoutText, { color: subtextColor }]}>{t('signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Student Switcher Modal */}
      <Modal
        visible={showSwitchModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSwitchModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowSwitchModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#475569' : '#E2E8F0' }]} />
            <Text style={[styles.modalTitle, { color: textColor }]}>Switch Student Profile</Text>
            
            {students.map((student) => {
              const isActive = student.id === selectedStudent.id;
              return (
                <TouchableOpacity
                  key={student.id}
                  onPress={() => {
                    selectStudent(student);
                    setShowSwitchModal(false);
                  }}
                  style={[
                    styles.studentItem, 
                    { 
                      backgroundColor: isActive ? (isDark ? 'rgba(2, 132, 199, 0.2)' : '#F0F9FF') : bgColor,
                      borderColor: isActive ? '#0284C7' : borderColor 
                    }
                  ]}
                >
                  <View style={[
                    styles.itemAvatar,
                    isActive ? { backgroundColor: '#0284C7' } : { backgroundColor: isDark ? '#334155' : '#F1F5F9' }
                  ]}>
                    <Text style={[
                      styles.itemAvatarText,
                      isActive ? { color: '#FFFFFF' } : { color: subtextColor }
                    ]}>
                      {student.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[
                      styles.itemName,
                      { color: isActive ? '#0284C7' : textColor }
                    ]}>
                      {student.name}
                    </Text>
                    <Text style={[styles.itemClass, { color: subtextColor }]}>Class {student.class}</Text>
                  </View>
                  {isActive && <View style={styles.checkBadge}><Feather name="check" size={14} color="white" /></View>}
                </TouchableOpacity>
              );
            })}
            
            <TouchableOpacity 
              onPress={() => setShowSwitchModal(false)}
              style={styles.closeModalButton}
            >
              <Text style={[styles.closeModalText, { color: subtextColor }]}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Original styles slightly modified to remove hardcoded background colors since inline styles handle them now.
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontWeight: '600',
  },
  flex1: {
    flex: 1,
  },
  headerWrapper: {
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingRight: 15,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    marginRight: 15,
  },
  avatar: {
    backgroundColor: '#0284C7',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  studentInfo: {
    marginLeft: 10,
    flex: 1,
  },
  studentLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainContent: {
    padding: 25,
  },
  mainCard: {
    borderRadius: 36,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  rollBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rollText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIconBg: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 8,
  },
  footerLabel: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 13,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  sessionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 35,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 28,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 3,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  seeAllText: {
    color: '#0284C7',
    fontWeight: '900',
    fontSize: 14,
  },
  updateCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    marginBottom: 30,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  updateIconBg: {
    padding: 10,
    borderRadius: 14,
  },
  updateContent: {
    marginLeft: 15,
    flex: 1,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  updateDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  updateTime: {
    fontSize: 11,
    marginTop: 10,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 22,
  },
  logoutText: {
    marginLeft: 10,
    fontWeight: '800',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemInfo: {
    marginLeft: 15,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemClass: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  checkBadge: {
    backgroundColor: '#0284C7',
    padding: 4,
    borderRadius: 10,
  },
  closeModalButton: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  closeModalText: {
    fontWeight: '800',
    fontSize: 16,
  },
});

export default DashboardScreen;
