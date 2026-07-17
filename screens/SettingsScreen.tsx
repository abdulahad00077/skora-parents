import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const isHindi = language === 'hi';

  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardColor = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#F1F5F9';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appearance Group */}
        <Text style={[styles.sectionTitle, { color: subtextColor }]}>{t('appearance')}</Text>
        <View style={[styles.group, { backgroundColor: cardColor, borderColor }]}>
          <View style={[styles.settingRow, { borderBottomColor: borderColor, borderBottomWidth: 1 }]}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: '#E0F2FE' }]}>
                <Feather name="moon" size={20} color="#0284C7" />
              </View>
              <Text style={[styles.settingText, { color: textColor }]}>{t('darkMode')}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E2E8F0', true: '#0284C7' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: '#FFEDD5' }]}>
                <Feather name="globe" size={20} color="#EA580C" />
              </View>
              <Text style={[styles.settingText, { color: textColor }]}>{t('language')} (Hindi)</Text>
            </View>
            <Switch
              value={isHindi}
              onValueChange={(val) => setLanguage(val ? 'hi' : 'en')}
              trackColor={{ false: '#E2E8F0', true: '#0284C7' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* General Group */}
        <Text style={[styles.sectionTitle, { color: subtextColor }]}>{t('general')}</Text>
        <View style={[styles.group, { backgroundColor: cardColor, borderColor }]}>
          <TouchableOpacity 
            style={[styles.settingRow, { borderBottomColor: borderColor, borderBottomWidth: 1 }]}
            onPress={() => (navigation as any).navigate('SecurityPrivacy')}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: '#DCFCE7' }]}>
                <Feather name="shield" size={20} color="#16A34A" />
              </View>
              <Text style={[styles.settingText, { color: textColor }]}>{t('securityAndPrivacy')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={subtextColor} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => (navigation as any).navigate('About')}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconBg, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="info" size={20} color="#9333EA" />
              </View>
              <Text style={[styles.settingText, { color: textColor }]}>{t('aboutEdutrack')}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={subtextColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  group: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 25,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
