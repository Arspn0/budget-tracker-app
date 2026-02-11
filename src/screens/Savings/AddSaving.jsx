import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from '../../components/Input/TextInput';
import { SolidButton } from '../../components/Button';

const AddSavingScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 py-6">
        <TextInput
          label="Nama Target"
          value={name}
          onChangeText={setName}
          placeholder="Contoh: Beli Laptop"
          style={{ marginBottom: 16 }}
        />

        <TextInput
          label="Target Jumlah"
          value={targetAmount}
          onChangeText={setTargetAmount}
          placeholder="0"
          keyboardType="numeric"
          style={{ marginBottom: 24 }}
        />

        <SolidButton
          title="Buat Target"
          onPress={() => {
            // TODO: Save saving target
            navigation.goBack();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddSavingScreen;