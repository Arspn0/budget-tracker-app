import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, FolderOpen, Wallet, Shield, Moon } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Card } from '../../components/Card/Card';

const ProfileScreen = ({ navigation }) => {
  const MenuItem = ({ icon: Icon, title, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Card className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="bg-primary/20 rounded-full p-2 mr-3">
            <Icon size={20} color={Colors.primary} />
          </View>
          <Text className="text-text font-medium">{title}</Text>
        </View>
        <ChevronRight size={20} color={Colors.textMuted} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 py-6">
        <Text className="text-text text-2xl font-bold">Profile</Text>
      </View>
      
      <ScrollView className="flex-1 px-5">
        <MenuItem
          icon={FolderOpen}
          title="Kelola Kategori"
          onPress={() => navigation.navigate('CategoryManager')}
        />
        <MenuItem
          icon={Wallet}
          title="Kelola Dompet"
          onPress={() => navigation.navigate('WalletManager')}
        />
        <MenuItem
          icon={Shield}
          title="Keamanan"
          onPress={() => {}}
        />
        <MenuItem
          icon={Moon}
          title="Dark Mode"
          onPress={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;