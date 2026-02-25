import './global.css';

import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackNav from './src/navigation/StackNav';
import { initDatabase } from './src/api/db';
import { useSecurityStore } from './src/store/useSecurityStore';
import { useAppStore } from './src/store/useAppStore';
import LockScreen from './src/screens/LockScreen';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { sendDailySummary } from './src/utils/notificationUtils';
import { TransactionRepository } from './src/data/repositories/TransactionRepository';
import { useNotificationStore } from './src/store/useNotificationStore';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  const { initSecurity, isPinSet, isLocked, lock } = useSecurityStore();
  const { isDarkMode, initTheme } = useAppStore();

  const notificationListener = useRef();
  const responseListener = useRef();

  // init db, security and theme
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([
          initDatabase(),
          initSecurity(),
          initTheme(),
        ]);
        setDbReady(true);
      } catch (err) {
        console.error('Bootstrap error:', err);
        setDbError(err.message);
      }
    };
    bootstrap();
  }, []);

  // loading app on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if ((nextState === 'background' || nextState === 'inactive') && isPinSet) {
        lock();
      }
    });
    return () => sub.remove();
  }, [isPinSet]);

  useEffect(() => {
    // Init notification settings
    useNotificationStore.getState().initNotifications();

    // Listener for foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received:', notification);
      }
    );

    // Listener for notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        const data = response.notification.request.content.data;
        
        // Handle notification tap based on type
        if (data.type === 'budget-alert') {
          // Navigate to Budget screen
          // navigation.navigate('Budget');
        } else if (data.type === 'daily-summary') {
          // Navigate to Transactions
          // navigation.navigate('Main', { screen: 'Transactions' });
        }
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // ── Check and send daily summary at scheduled time ──
  useEffect(() => {
    const checkDailySummary = async () => {
      const { dailySummaryEnabled } = useNotificationStore.getState();
      if (!dailySummaryEnabled) return;

      const today = new Date().toISOString().split('T')[0];
      const transactions = await TransactionRepository.getByDateRange(today, today);

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      if (transactions.length > 0) {
        await sendDailySummary({
          income,
          expense,
          transactionCount: transactions.length,
        });
      }
    };

    // Check every hour for daily summary trigger
    const interval = setInterval(checkDailySummary, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // loading app
  if (!dbReady && !dbError) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#0F1115' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ActivityIndicator size="large" color="#3ED6C4" />
        <Text style={{
          color: isDarkMode ? '#9FA5B4' : '#6B7280',
          marginTop: 16,
          fontSize: 14,
        }}>
          Memuat aplikasi...
        </Text>
      </View>
    );
  }

  if (dbError) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#0F1115' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <Text style={{
          color: '#FF5252',
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 12,
        }}>
          Gagal memuat database
        </Text>
        <Text style={{
          color: isDarkMode ? '#9FA5B4' : '#6B7280',
          textAlign: 'center',
        }}>
          {dbError}
        </Text>
      </View>
    );
  }

  if (isPinSet && isLocked) {
    return (
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <LockScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <StackNav />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}