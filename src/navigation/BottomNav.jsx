import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { 
  Home, 
  Receipt, 
  PiggyBank, 
  Wallet, 
  User 
} from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';

// Import Screens
import HomeScreen from '../screens/Home/HomeScreen';
import TransactionListScreen from '../screens/Transactions/TransactionList';
import SavingsScreen from '../screens/Savings/SavingsScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomNav = () => {
  const Colors = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          
          switch (route.name) {
            case 'HomeTab':
              IconComponent = Home;
              break;
            case 'TransactionTab':
              IconComponent = Receipt;
              break;
            case 'SavingTab':
              IconComponent = PiggyBank;
              break;
            case 'BudgetTab':
              IconComponent = Wallet;
              break;
            case 'ProfileTab':
              IconComponent = User;
              break;
            default:
              IconComponent = Home;
          }

          return (
            <View className={`
              ${focused ? 'bg-primary/20' : ''} 
              rounded-full 
              p-2
            `}>
              <IconComponent 
                size={size} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="TransactionTab" 
        component={TransactionListScreen}
        options={{ tabBarLabel: 'Transaksi' }}
      />
      <Tab.Screen 
        name="SavingTab" 
        component={SavingsScreen}
        options={{ tabBarLabel: 'Tabungan' }}
      />
      <Tab.Screen 
        name="BudgetTab" 
        component={BudgetScreen}
        options={{ tabBarLabel: 'Budget' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default BottomNav;