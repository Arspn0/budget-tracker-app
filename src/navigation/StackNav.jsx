import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/useTheme';

// Bottom Tab Navigator
import BottomNav from './BottomNav';

// Modal & Detail Screens
import AddTransactionScreen from '../screens/Transactions/AddTransaction';
import TransactionDetailScreen from '../screens/Transactions/TransactionDetail';
import SavingDetailScreen from '../screens/Savings/SavingDetail';
import AddSavingScreen from '../screens/Savings/AddSaving';
import AddBudgetScreen from '../screens/Budget/AddBudgetScreen';
import CategoryManagerScreen from '../screens/Profile/CategoryManagerScreen';
import WalletManagerScreen from '../screens/Profile/WalletManagerScreen';
import ReportScreen from '../screens/Report/ReportScreen';
import FinancialCalendarScreen from '../screens/Calendar/FinancialCalendarScreen';
import SecurityScreen from '../screens/Security/SecurityScreen';
import { SetupPinScreen } from '../screens/Security/SetupPinScreen';

const Stack = createNativeStackNavigator();

const StackNav = () => {
  const Colors = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Bottom Tab Navigator */}
      <Stack.Screen 
        name="Main" 
        component={BottomNav}
        options={{ headerShown: false }}
      />

      {/* Transaction Screens */}
      <Stack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={{ 
          title: 'Tambah Transaksi',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="TransactionDetail" 
        component={TransactionDetailScreen}
        options={{ title: 'Detail Transaksi' }}
      />

      {/* Saving Screens */}
      <Stack.Screen 
        name="AddSaving" 
        component={AddSavingScreen}
        options={{ 
          title: 'Buat Target Tabungan',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="SavingDetail" 
        component={SavingDetailScreen}
        options={{ title: 'Detail Tabungan' }}
      />

      {/* Budget Screens */}
      <Stack.Screen 
        name="AddBudget" 
        component={AddBudgetScreen}
        options={{ 
          title: 'Atur Budget',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Profile/Settings Screens */}
      <Stack.Screen 
        name="CategoryManager" 
        component={CategoryManagerScreen}
        options={{ title: 'Kelola Kategori' }}
      />
      <Stack.Screen 
        name="WalletManager" 
        component={WalletManagerScreen}
        options={{ title: 'Kelola Dompet' }}
      />

      {/* Report & Calendar */}
      <Stack.Screen
        name="Report"
        component={ReportScreen}
        options={{ title: 'Laporan Keuangan' }}
      />
      <Stack.Screen
        name="FinancialCalendar"
        component={FinancialCalendarScreen}
        options={{ title: 'Kalender Finansial' }}
      />

      {/* Security & Setup Pin */}
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ title: 'Keamanan' }} 
      />
      <Stack.Screen
        name="SetupPin"
        component={SetupPinScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StackNav;