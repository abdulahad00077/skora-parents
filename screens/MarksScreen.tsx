import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Platform, StatusBar } from 'react-native';
import { useStudent } from '../hooks/useStudent';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getStudentMarks, MarkRecord } from '../services/marks';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MarksScreen = () => {
  const { selectedStudent } = useStudent();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const fetchMarks = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    const data = await getStudentMarks(selectedStudent.id, selectedStudent.school_id);
    setMarks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMarks();
  }, [selectedStudent]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMarks();
    setRefreshing(false);
  };

  // Group marks by exam title
  const groupedMarks = marks.reduce((acc, curr) => {
    const examName = curr.exams?.name || 'Other Assessments';
    if (!acc[examName]) acc[examName] = [];
    acc[examName].push(curr);
    return acc;
  }, {} as Record<string, MarkRecord[]>);

  if (!selectedStudent) return null;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Academic Results</Text>
        <Text style={[styles.headerSubtitle, { color: subtextColor }]}>{selectedStudent.name}</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0284c7" />}
        >
          {Object.keys(groupedMarks).length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={subtextColor} style={{ opacity: 0.5 }} />
              <Text style={[styles.emptyText, { color: textColor }]}>No marks published yet</Text>
            </View>
          ) : (
            Object.entries(groupedMarks).map(([examTitle, records], idx) => {
              // Calculate Total Percentage
              const totalObtained = records.reduce((sum, r) => sum + (r.score || 0), 0);
              const totalMax = records.reduce((sum, r) => sum + (r.total_marks || 100), 0);
              const perc = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

              return (
                <View key={examTitle} style={styles.examSection}>
                  <View style={styles.examHeader}>
                    <Text style={[styles.examTitle, { color: textColor }]}>{examTitle}</Text>
                    <View style={styles.totalBadge}>
                      <Text style={styles.totalBadgeText}>{perc}%</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    {records.map((item, index) => {
                      const score = item.score || 0;
                      const total = item.total_marks || 100;
                      const subjectPerc = (score / total) * 100;
                      let progressColor = '#10b981'; // Green
                      if (subjectPerc < 40) progressColor = '#ef4444'; // Red
                      else if (subjectPerc < 75) progressColor = '#f59e0b'; // Yellow

                      return (
                        <View key={item.exam_id + index} style={[styles.markRow, index !== records.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
                          <View style={styles.markInfo}>
                            <Text style={[styles.subjectText, { color: textColor }]}>{item.exams?.subject || 'Subject'}</Text>
                            <Text style={[styles.marksText, { color: subtextColor }]}>
                              {score} / {total}
                            </Text>
                          </View>
                          
                          <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                              <View style={[styles.progressFill, { width: `${subjectPerc}%`, backgroundColor: progressColor }]} />
                            </View>
                            {item.remarks && (
                              <View style={[styles.gradeBadge, { backgroundColor: progressColor + '20' }]}>
                                <Text style={[styles.gradeText, { color: progressColor }]}>{item.remarks}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '900' },
  headerSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  examSection: { marginBottom: 30 },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  examTitle: { fontSize: 18, fontWeight: '800' },
  totalBadge: { backgroundColor: '#0284c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  totalBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  markRow: { padding: 20 },
  markInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subjectText: { fontSize: 16, fontWeight: '700' },
  marksText: { fontSize: 14, fontWeight: '800' },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 8, borderRadius: 4, marginRight: 15, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  gradeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  gradeText: { fontSize: 12, fontWeight: '900' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '700', marginTop: 15 },
});

export default MarksScreen;
