import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card/Card';

const BudgetScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 py-6">
        <Text className="text-text text-2xl font-bold">Budget</Text>
      </View>
      
      <ScrollView className="flex-1 px-5">
        <Card className="items-center py-8">
          <Text className="text-textMuted">Belum ada budget</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BudgetScreen;