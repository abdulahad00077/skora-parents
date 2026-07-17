import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Alert } from 'react-native';
import TabNavigator from './TabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import HomeworkScreen from '../screens/HomeworkScreen';
import FeesScreen from '../screens/FeesScreen';
import TimetableScreen from '../screens/TimetableScreen';
import SyllabusScreen from '../screens/SyllabusScreen';
import ReportCardScreen from '../screens/ReportCardScreen';
import GrievancesScreen from '../screens/GrievancesScreen';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useStudent } from '../hooks/useStudent';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TouchableOpacity, ScrollView } from 'react-native';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const { signOut } = useAuth();
  const { students, selectedStudent, selectStudent } = useStudent();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const headerBg = isDark ? '#1E293B' : '#F8FAFC';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const dividerColor = isDark ? '#334155' : '#F1F5F9';

  const handleSignOut = () => {
    Alert.alert(
      t('signOut'),
      "Are you sure you want to log out?",
      [
        { text: t('cancel'), style: "cancel" },
        { text: t('signOut'), onPress: signOut, style: 'destructive' }
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={[styles.drawerContent, { backgroundColor: bgColor }]}>
      <View style={[styles.drawerHeader, { backgroundColor: headerBg, borderBottomColor: dividerColor }]}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarInitial}>
            {selectedStudent?.name?.charAt(0) || 'S'}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: textColor }]}>
          {selectedStudent?.name || t('appName')}
        </Text>
        <Text style={[styles.profileEmail, { color: subtextColor }]}>
          Class {selectedStudent?.class || '-'}
        </Text>

        {/* Sibling Switcher */}
        {students.length > 1 && (
          <View style={styles.siblingList}>
            <Text style={styles.siblingLabel}>SWITCH PROFILE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.siblingScroll}>
              {students.map((student) => {
                const isSelected = student.id === selectedStudent?.id;
                return (
                  <TouchableOpacity
                    key={student.id}
                    onPress={() => {
                      selectStudent(student);
                      props.navigation.closeDrawer();
                    }}
                    style={[
                      styles.siblingBadge,
                      { 
                        backgroundColor: isSelected ? '#0284c7' : (isDark ? '#334155' : '#E0F2FE'),
                        borderColor: isSelected ? '#0284c7' : dividerColor,
                        borderWidth: 1
                      }
                    ]}
                  >
                    <Text style={[
                      styles.siblingText,
                      { color: isSelected ? '#FFFFFF' : (isDark ? '#cbd5e1' : '#0284c7') }
                    ]}>
                      {student.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
      
      <View style={[styles.drawerItems, { backgroundColor: bgColor }]}>
        <DrawerItemList {...props} />
        
        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        
        <DrawerItem
          label={t('settings')}
          icon={({ color, size }: { color: string; size: number }) => <Feather name="settings" size={size} color={isDark ? '#e2e8f0' : color} />}
          onPress={() => props.navigation.navigate('Settings')}
          labelStyle={[styles.drawerItemLabel, { color: isDark ? '#e2e8f0' : '#475569' }]}
          activeTintColor="#0284c7"
          inactiveTintColor={isDark ? '#e2e8f0' : '#475569'}
        />
        
        <DrawerItem
          label={t('signOut')}
          icon={({ color, size }: { color: string; size: number }) => <Feather name="log-out" size={size} color="#EF4444" />}
          onPress={handleSignOut}
          labelStyle={[styles.drawerItemLabel, { color: '#EF4444' }]}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const inActiveColor = isDark ? '#94A3B8' : '#64748b';

  return (
    <Drawer.Navigator
      drawerContent={(props: any) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#0284c7',
        drawerInactiveTintColor: inActiveColor,
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginLeft: -10,
        },
        drawerStyle: {
          width: 280,
          backgroundColor: bgColor,
        }
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{
          drawerLabel: t('dashboard'),
          drawerIcon: ({ color, size }: { color: string; size: number }) => <Feather name="layout" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerLabel: t('profile'),
          drawerIcon: ({ color, size }: { color: string; size: number }) => <Feather name="user" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Homework" 
        component={HomeworkScreen}
        options={{
          drawerLabel: t('homework'),
          drawerIcon: ({ color, size }: { color: string; size: number }) => <Feather name="book-open" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Fees" 
        component={FeesScreen}
        options={{
          drawerLabel: t('fees'),
          drawerIcon: ({ color, size }: { color: string; size: number }) => <Feather name="credit-card" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Timetable" 
        component={TimetableScreen}
        options={{
          drawerLabel: t('timetable'),
          drawerIcon: ({ color, size }: { color: string; size: number }) => <Feather name="clock" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Syllabus" 
        component={SyllabusScreen}
        options={{
          drawerLabel: 'Syllabus',
          drawerIcon: ({ color, size }: { color: string; size: number }) => <Feather name="book" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="ReportCard" 
        component={ReportCardScreen}
        options={{
          drawerLabel: 'Report Card',
          drawerIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="clipboard-text-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Grievances" 
        component={GrievancesScreen}
        options={{
          drawerLabel: 'Grievances',
          drawerIcon: ({ color, size }: { color: string; size: number }) => <Feather name="alert-circle" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 0,
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0284c7',
  },
  siblingList: {
    marginTop: 20,
    width: '100%',
  },
  siblingLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  siblingScroll: {
    flexDirection: 'row',
  },
  siblingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  siblingText: {
    fontSize: 11,
    fontWeight: '800',
  },
  drawerItems: {
    flex: 1,
    paddingHorizontal: 8,
  },
  drawerItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: -10,
  },
  divider: {
    height: 1,
    marginVertical: 15,
    marginHorizontal: 16,
  },
});

export default DrawerNavigator;
