import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from '../../components/Input/TextInput';
import { SolidButton } from '../../components/Button';

const AddTransactionScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 py-6">
        <TextInput
          label="Jumlah"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          style={{ marginBottom: 16 }}
        />

        <TextInput
          label="Catatan"
          value={note}
          onChangeText={setNote}
          placeholder="Tambahkan catatan..."
          multiline
          style={{ marginBottom: 24 }}
        />

        <SolidButton
          title="Simpan"
          onPress={() => {
            // TODO: Save transaction
            navigation.goBack();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddTransactionScreen;