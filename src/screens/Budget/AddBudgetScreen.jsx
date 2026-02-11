import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from '../../components/Input/TextInput';
import { SolidButton } from '../../components/Button';

const AddBudgetScreen = ({ navigation }) => {
  const [limitAmount, setLimitAmount] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 py-6">
        <TextInput
          label="Limit Budget"
          value={limitAmount}
          onChangeText={setLimitAmount}
          placeholder="0"
          keyboardType="numeric"
          style={{ marginBottom: 24 }}
        />

        <SolidButton
          title="Simpan Budget"
          onPress={() => {
            // TODO: Save budget
            navigation.goBack();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddBudgetScreen;