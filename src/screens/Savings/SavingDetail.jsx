import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SavingDetailScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 py-6">
        <Text className="text-text text-xl font-bold">Saving Detail</Text>
      </View>
    </SafeAreaView>
  );
};

export default SavingDetailScreen;