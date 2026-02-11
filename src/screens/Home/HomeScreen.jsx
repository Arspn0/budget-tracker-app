import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Card } from '../../components/Card/Card';

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5">
        {/* Header */}
        <View className="py-6">
          <Text className="text-textMuted text-sm">Total Saldo</Text>
          <Text className="text-text text-4xl font-bold mt-1">
            Rp 0
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            className="flex-1 mr-2"
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Card className="items-center py-4">
              <View className="bg-primary/20 rounded-full p-3 mb-2">
                <Plus size={24} color={Colors.primary} />
              </View>
              <Text className="text-text text-sm font-semibold">
                Tambah Transaksi
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Placeholder Cards */}
        <Card className="mb-4">
          <Text className="text-text font-semibold mb-2">
            Pengeluaran Hari Ini
          </Text>
          <Text className="text-textMuted">Rp 0</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-text font-semibold mb-2">Grafik</Text>
          <View className="h-32 bg-background rounded-xl justify-center items-center">
            <Text className="text-textMuted">Chart akan ditampilkan di sini</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;