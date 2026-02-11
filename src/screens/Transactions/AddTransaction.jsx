import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDown, ArrowUp, Calendar } from 'lucide-react-native';
import { TextInput } from '../../components/Input/TextInput';
import { SolidButton, OutlineButton } from '../../components/Button';
import { Card } from '../../components/Card/Card';
import { Colors } from '../../theme/colors';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useWalletStore } from '../../store/useWalletStore';

const AddTransactionScreen = ({ navigation }) => {
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedWalletId, setSelectedWalletId] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { addTransaction } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { wallets, fetchWallets } = useWalletStore();

  // Fetch categories and wallets on mount
  useEffect(() => {
    fetchCategories();
    fetchWallets();
  }, []);

  // Filter categories by type
  const filteredCategories = categories.filter(
    cat => cat.type === transactionType
  );

  // Auto-select first category
  useEffect(() => {
    if (filteredCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories]);

  const handleSave = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang valid');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Error', 'Pilih kategori terlebih dahulu');
      return;
    }

    if (!selectedWalletId) {
      Alert.alert('Error', 'Pilih dompet terlebih dahulu');
      return;
    }

    setSaving(true);

    try {
      const transaction = {
        type: transactionType,
        amount: parseFloat(amount),
        category_id: selectedCategoryId,
        wallet_id: selectedWalletId,
        date: date,
        note: note.trim() || null,
        photo_uri: null,
      };

      console.log('Saving transaction:', transaction);

      await addTransaction(transaction);

      console.log('Transaction saved successfully');

      Alert.alert(
        'Berhasil',
        'Transaksi berhasil disimpan',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Gagal menyimpan transaksi: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 py-6">
        {/* Transaction Type Toggle */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            onPress={() => setTransactionType('expense')}
            className="flex-1 mr-2"
          >
            <Card className={`items-center py-4 ${
              transactionType === 'expense' ? 'bg-danger/20 border-2 border-danger' : ''
            }`}>
              <ArrowDown 
                size={24} 
                color={transactionType === 'expense' ? Colors.danger : Colors.textMuted} 
              />
              <Text className={`mt-2 font-semibold ${
                transactionType === 'expense' ? 'text-danger' : 'text-textMuted'
              }`}>
                Pengeluaran
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTransactionType('income')}
            className="flex-1 ml-2"
          >
            <Card className={`items-center py-4 ${
              transactionType === 'income' ? 'bg-success/20 border-2 border-success' : ''
            }`}>
              <ArrowUp 
                size={24} 
                color={transactionType === 'income' ? Colors.success : Colors.textMuted} 
              />
              <Text className={`mt-2 font-semibold ${
                transactionType === 'income' ? 'text-success' : 'text-textMuted'
              }`}>
                Pemasukan
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <TextInput
          label="Jumlah"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          style={{ marginBottom: 16 }}
        />

        {/* Category Selection */}
        <View className="mb-4">
          <Text className="text-text text-sm font-medium mb-2">Kategori</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategoryId(category.id)}
                className="mr-3"
              >
                <Card className={`px-4 py-3 ${
                  selectedCategoryId === category.id 
                    ? 'bg-primary/20 border-2 border-primary' 
                    : ''
                }`}>
                  <Text className={`font-medium ${
                    selectedCategoryId === category.id 
                      ? 'text-primary' 
                      : 'text-text'
                  }`}>
                    {category.name}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Wallet Selection */}
        <View className="mb-4">
          <Text className="text-text text-sm font-medium mb-2">Dompet</Text>
          {wallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => setSelectedWalletId(wallet.id)}
              className="mb-2"
            >
              <Card className={`flex-row items-center justify-between ${
                selectedWalletId === wallet.id 
                  ? 'bg-primary/20 border-2 border-primary' 
                  : ''
              }`}>
                <Text className={`font-medium ${
                  selectedWalletId === wallet.id 
                    ? 'text-primary' 
                    : 'text-text'
                }`}>
                  {wallet.name}
                </Text>
                <Text className="text-textMuted text-sm">
                  Saldo: Rp {wallet.balance.toLocaleString('id-ID')}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Input */}
        <View className="mb-4">
          <Text className="text-text text-sm font-medium mb-2">Tanggal</Text>
          <Card className="flex-row items-center">
            <Calendar size={20} color={Colors.primary} />
            <Text className="text-text ml-3">
              {new Date(date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Card>
        </View>

        {/* Note Input */}
        <TextInput
          label="Catatan (Opsional)"
          value={note}
          onChangeText={setNote}
          placeholder="Tambahkan catatan..."
          multiline
          style={{ marginBottom: 24 }}
        />

        {/* Action Buttons */}
        <View className="flex-row">
          <View className="flex-1 mr-2">
            <OutlineButton
              title="Batal"
              onPress={() => navigation.goBack()}
              disabled={saving}
            />
          </View>
          <View className="flex-1 ml-2">
            <SolidButton
              title={saving ? "Menyimpan..." : "Simpan"}
              onPress={handleSave}
              disabled={saving}
              loading={saving}
            />
          </View>
        </View>

        {/* Debug Info - Remove in production */}
        <Card className="mt-4 bg-card/50">
          <Text className="text-textMuted text-xs">Debug Info:</Text>
          <Text className="text-textMuted text-xs">
            Categories: {categories.length} | Filtered: {filteredCategories.length}
          </Text>
          <Text className="text-textMuted text-xs">
            Wallets: {wallets.length}
          </Text>
          <Text className="text-textMuted text-xs">
            Selected Category: {selectedCategoryId}
          </Text>
          <Text className="text-textMuted text-xs">
            Selected Wallet: {selectedWalletId}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddTransactionScreen;