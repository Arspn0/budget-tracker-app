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

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  const { initSecurity, isPinSet, isLocked, lock } = useSecurityStore();
  const { isDarkMode, initTheme } = useAppStore();

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