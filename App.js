import './global.css';

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import StackNav from './src/navigation/StackNav';
// import { initDatabase } from './src/api/db';

export default function App() {
  // useEffect(() => {
  //   // Initialize database on app start
  //   initDatabase()
  //     .then(() => console.log('Database initialized'))
  //     .catch(err => console.error('Database init error:', err));
  // }, []);

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <StackNav />
      </NavigationContainer>
    </>
  );
}