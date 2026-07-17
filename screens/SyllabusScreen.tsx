import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Platform, StatusBar } from 'react-native';
import { useStudent } from '../hooks/useStudent';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getSyllabusByClass, SyllabusItem } from '../services/syllabus';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SyllabusScreen = () => {
  const { selectedStudent } = useStudent();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const fetchSyllabus = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    const data = await getSyllabusByClass(selectedStudent.school_id, selectedStudent.class);
    setSyllabus(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSyllabus();
  }, [selectedStudent]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSyllabus();
    setRefreshing(false);
  };

  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return '#3b82f6';
    if (s.includes('sci')) return '#10b981';
    if (s.includes('eng')) return '#f59e0b';
    if (s.includes('hist') || s.includes('soc')) return '#8b5cf6';
    return '#0284c7';
  };

  if (!selectedStudent) return null;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Class {selectedStudent.class} Syllabus</Text>
        <Text style={[styles.headerSubtitle, { color: subtextColor }]}>Academic Year 2026-27</Text>
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
          {syllabus.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="book-open-blank-variant" size={64} color={subtextColor} style={{ opacity: 0.5 }} />
              <Text style={[styles.emptyText, { color: textColor }]}>No syllabus uploaded yet</Text>
            </View>
          ) : (
            syllabus.map((item) => (
              <View key={item.id} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.subjectBadge, { backgroundColor: getSubjectColor(item.subject) + '20' }]}>
                  <Text style={[styles.subjectText, { color: getSubjectColor(item.subject) }]}>
                    {item.subject.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.itemTitle, { color: textColor }]}>{item.title}</Text>
                {item.description ? (
                  <Text style={[styles.itemDesc, { color: subtextColor }]}>{item.description}</Text>
                ) : null}
                
                {item.file_url && (
                  <TouchableOpacity style={styles.downloadButton}>
                    <Feather name="download" size={16} color="#0284c7" />
                    <Text style={styles.downloadText}>Download PDF</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
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
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  subjectText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  itemTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  itemDesc: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 8,
  },
  downloadText: { color: '#0284c7', fontWeight: '800', marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '700', marginTop: 15 },
});

export default SyllabusScreen;
