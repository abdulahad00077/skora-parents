import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { StudentProvider } from './hooks/useStudent';
import RootNavigator from './navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { useNotifications } from './hooks/useNotifications';
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Define background task for handling notifications when app is killed/backgrounded
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background notification error:', error);
    return;
  }
  if (data) {
    console.log('Background notification received!', data);
    // The notification will be shown automatically by the OS
    // This handler just logs it for debugging
  }
});

// Register the background task for notifications
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(err => {
  console.log('Background task registration (may already be registered):', err);
});

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // Show notification banner in-app
    shouldPlaySound: true,     // Play notification sound
    shouldSetBadge: true,      // Update app badge count
    shouldShowBanner: true,    // Show banner on top of screen
    shouldShowList: true,      // Show in notification center
  }),
});

import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

const AppContent = () => {
  const { user } = useAuth();
  useNotifications(user?.id);
  useRealtimeNotifications();
  
  return <RootNavigator />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <StudentProvider>
                <AppContent />
              </StudentProvider>
              <StatusBar style="auto" />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
