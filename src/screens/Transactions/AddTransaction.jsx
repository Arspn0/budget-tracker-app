import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDown, ArrowUp, Calendar, ChevronDown } from 'lucide-react-native';
import { SolidButton, OutlineButton } from '../../components/Button';
import { Card } from '../../components/Card/Card';
import { useTheme } from '../store/useTheme';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useWalletStore } from '../../store/useWalletStore';
import { formatCurrency } from '../../utils/helpers';

const AddTransactionScreen = ({ navigation }) => {
  const Colors = useTheme();
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // ─── FIX BUG 2: Use ref to ensure fetchCategories only runs ONCE ───
  const hasFetched = useRef(false);

  const { addTransaction } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { wallets, fetchWallets } = useWalletStore();

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCategories();
      fetchWallets();
    }
  }, []);

  // Set default wallet once wallets are loaded
  useEffect(() => {
    if (wallets.length > 0 && selectedWalletId === null) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  // Filter categories by current type — computed, no extra fetch needed
  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  // Auto-select first category when type changes or categories load
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setSelectedCategoryId(filteredCategories[0].id);
    } else {
      setSelectedCategoryId(null);
    }
  }, [transactionType, categories]);

  // ─── FIX BUG 4: No Alert before goBack — just navigate directly ───
  const handleSave = async () => {
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
      await addTransaction({
        type: transactionType,
        amount: parseFloat(amount),
        category_id: selectedCategoryId,
        wallet_id: selectedWalletId,
        date,
        note: note.trim() || null,
        photo_uri: null,
      });

      // Go back immediately — no Alert to prevent flickering
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan transaksi: ' + error.message);
      setSaving(false);
    }
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Type Toggle ── */}
        <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 24, gap: 12 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: transactionType === 'expense'
                ? Colors.danger + '20' : Colors.card,
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: transactionType === 'expense' ? Colors.danger : 'transparent',
            }}
            onPress={() => setTransactionType('expense')}
          >
            <ArrowDown
              size={24}
              color={transactionType === 'expense' ? Colors.danger : Colors.textMuted}
            />
            <Text style={{
              marginTop: 6,
              fontWeight: '600',
              color: transactionType === 'expense' ? Colors.danger : Colors.textMuted,
            }}>
              Pengeluaran
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: transactionType === 'income'
                ? Colors.success + '20' : Colors.card,
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: transactionType === 'income' ? Colors.success : 'transparent',
            }}
            onPress={() => setTransactionType('income')}
          >
            <ArrowUp
              size={24}
              color={transactionType === 'income' ? Colors.success : Colors.textMuted}
            />
            <Text style={{
              marginTop: 6,
              fontWeight: '600',
              color: transactionType === 'income' ? Colors.success : Colors.textMuted,
            }}>
              Pemasukan
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Amount ── */}
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Jumlah *
        </Text>
        <View style={{
          backgroundColor: Colors.card,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 20,
          borderWidth: 2,
          borderColor: amount ? Colors.primary : 'transparent',
        }}>
          <Text style={{ color: Colors.textMuted, fontSize: 18, marginRight: 8 }}>Rp</Text>
          <RNTextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            style={{ flex: 1, color: Colors.text, fontSize: 22, fontWeight: '700', paddingVertical: 16 }}
          />
        </View>

        {/* ── Category ── */}
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 10 }}>
          Kategori *
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ gap: 10, paddingRight: 4 }}
        >
          {filteredCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={{
                  backgroundColor: isSelected ? (cat.color || Colors.primary) + '25' : Colors.card,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderWidth: 2,
                  borderColor: isSelected ? (cat.color || Colors.primary) : 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: cat.color || Colors.primary,
                }} />
                <Text style={{
                  color: isSelected ? Colors.text : Colors.textMuted,
                  fontWeight: isSelected ? '600' : '400',
                  fontSize: 14,
                }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Wallet ── */}
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 10 }}>
          Dompet *
        </Text>
        {wallets.map((wallet) => {
          const isSelected = selectedWalletId === wallet.id;
          return (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => setSelectedWalletId(wallet.id)}
              style={{ marginBottom: 10 }}
            >
              <Card style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isSelected ? Colors.primary + '15' : Colors.card,
                borderWidth: 2,
                borderColor: isSelected ? Colors.primary : 'transparent',
              }}>
                <View>
                  <Text style={{ color: Colors.text, fontWeight: '600' }}>
                    {wallet.name}
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    {wallet.type === 'cash' ? '💵 Cash'
                      : wallet.type === 'bank' ? '🏦 Bank'
                      : '📱 E-Wallet'}
                  </Text>
                </View>
                <Text style={{
                  color: isSelected ? Colors.primary : Colors.text,
                  fontWeight: '700',
                }}>
                  {formatCurrency(wallet.balance)}
                </Text>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* ── Date ── */}
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 10 }}>
          Tanggal
        </Text>
        <View style={{
          backgroundColor: Colors.card,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 20,
        }}>
          <Calendar size={18} color={Colors.primary} />
          <RNTextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
            style={{ flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 14, marginLeft: 10 }}
          />
        </View>

        {/* ── Note ── */}
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 10 }}>
          Catatan (Opsional)
        </Text>
        <View style={{
          backgroundColor: Colors.card,
          borderRadius: 12,
          paddingHorizontal: 16,
          marginBottom: 28,
        }}>
          <RNTextInput
            value={note}
            onChangeText={setNote}
            placeholder="Tambahkan catatan..."
            placeholderTextColor={Colors.textMuted}
            multiline
            style={{
              color: Colors.text,
              fontSize: 15,
              paddingVertical: 14,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* ── Buttons ── */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <OutlineButton
              title="Batal"
              onPress={() => navigation.goBack()}
              disabled={saving}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SolidButton
              title={saving ? 'Menyimpan...' : 'Simpan'}
              onPress={handleSave}
              disabled={saving}
              loading={saving}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddTransactionScreen;