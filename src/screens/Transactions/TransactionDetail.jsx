import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput as RNTextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDown, ArrowUp, Calendar, Edit2,
  Trash2, Check, X, ChevronRight,
} from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { SolidButton, OutlineButton } from '../../components/Button';
import { Colors } from '../../theme/colors';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useWalletStore } from '../../store/useWalletStore';
import { TransactionRepository } from '../../data/repositories/TransactionRepository';
import { formatCurrency } from '../../utils/helpers';

const TransactionDetailScreen = ({ route, navigation }) => {
  const { transactionId } = route.params;

  const [transaction, setTransaction]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [isEditing, setIsEditing]           = useState(false);
  const [saving, setSaving]                 = useState(false);

  // Edit form state
  const [editType, setEditType]             = useState('expense');
  const [editAmount, setEditAmount]         = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editWalletId, setEditWalletId]     = useState(null);
  const [editDate, setEditDate]             = useState('');
  const [editNote, setEditNote]             = useState('');

  const { updateTransaction, deleteTransaction } = useTransactionStore();
  const { categories, fetchCategories }          = useCategoryStore();
  const { wallets, fetchWallets }                = useWalletStore();

  useEffect(() => {
    loadTransaction();
    fetchCategories();
    fetchWallets();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      const tx = await TransactionRepository.getById(transactionId);
      setTransaction(tx);
      // Pre-fill edit form
      setEditType(tx.type);
      setEditAmount(tx.amount.toString());
      setEditCategoryId(tx.category_id);
      setEditWalletId(tx.wallet_id);
      setEditDate(tx.date);
      setEditNote(tx.note || '');
    } catch (e) {
      Alert.alert('Error', 'Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang valid');
      return;
    }
    if (!editCategoryId) {
      Alert.alert('Error', 'Pilih kategori');
      return;
    }

    setSaving(true);
    try {
      const updated = {
        type:        editType,
        amount:      parseFloat(editAmount),
        category_id: editCategoryId,
        wallet_id:   editWalletId,
        date:        editDate,
        note:        editNote.trim() || null,
        photo_uri:   transaction.photo_uri || null,
      };
      // Pass old transaction so store can reverse its wallet effect
      await updateTransaction(transactionId, updated, transaction);
      await loadTransaction();
      setIsEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan perubahan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Transaksi',
      'Yakin ingin menghapus transaksi ini? Saldo dompet akan dikembalikan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transactionId, transaction);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', 'Gagal menghapus transaksi');
            }
          },
        },
      ]
    );
  };

  if (loading || !transaction) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const filteredCategories = categories.filter(c => c.type === editType);
  const isIncome = transaction.type === 'income';

  // ── View Mode ──────────────────────────────────────────────────────────
  if (!isEditing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 36,
          }}>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isIncome ? Colors.success + '20' : Colors.danger + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              {isIncome
                ? <ArrowUp size={36} color={Colors.success} />
                : <ArrowDown size={36} color={Colors.danger} />
              }
            </View>
            <Text style={{
              color: isIncome ? Colors.success : Colors.danger,
              fontSize: 36,
              fontWeight: '800',
            }}>
              {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 14, marginTop: 6 }}>
              {isIncome ? 'Pemasukan' : 'Pengeluaran'}
            </Text>
          </View>

          {/* Detail Card */}
          <Card style={{ marginBottom: 20 }}>
            {[
              { label: 'Kategori',  value: transaction.category_name || '—' },
              { label: 'Dompet',    value: transaction.wallet_name || '—' },
              {
                label: 'Tanggal',
                value: new Date(transaction.date).toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                }),
              },
              { label: 'Catatan',   value: transaction.note || '—' },
            ].map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingVertical: 14,
                  borderTopWidth: idx !== 0 ? 1 : 0,
                  borderTopColor: '#2A2D35',
                }}
              >
                <Text style={{ color: Colors.textMuted, fontSize: 14, flex: 1 }}>
                  {item.label}
                </Text>
                <Text style={{
                  color: Colors.text,
                  fontSize: 14,
                  fontWeight: '500',
                  flex: 2,
                  textAlign: 'right',
                }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </Card>

          {/* Category Color Badge */}
          {transaction.category_color && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 28,
            }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: transaction.category_color,
                marginRight: 8,
              }} />
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
                {transaction.category_name}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <OutlineButton
                title="Hapus"
                onPress={handleDelete}
                variant="danger"
              />
            </View>
            <View style={{ flex: 1 }}>
              <SolidButton
                title="Edit"
                onPress={() => setIsEditing(true)}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Edit Mode ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Edit header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>
            Edit Transaksi
          </Text>
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <X size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Type Toggle */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          {['expense', 'income'].map(t => {
            const active = editType === t;
            const color = t === 'income' ? Colors.success : Colors.danger;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setEditType(t);
                  setEditCategoryId(null);
                }}
                style={{
                  flex: 1,
                  backgroundColor: active ? color + '20' : Colors.card,
                  borderRadius: 16,
                  padding: 14,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: active ? color : 'transparent',
                }}
              >
                {t === 'income'
                  ? <ArrowUp size={22} color={active ? color : Colors.textMuted} />
                  : <ArrowDown size={22} color={active ? color : Colors.textMuted} />
                }
                <Text style={{
                  color: active ? color : Colors.textMuted,
                  fontWeight: '600',
                  marginTop: 6,
                  fontSize: 13,
                }}>
                  {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Amount */}
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
          borderColor: editAmount ? Colors.primary : 'transparent',
        }}>
          <Text style={{ color: Colors.textMuted, fontSize: 18, marginRight: 8 }}>Rp</Text>
          <RNTextInput
            value={editAmount}
            onChangeText={setEditAmount}
            keyboardType="numeric"
            style={{ flex: 1, color: Colors.text, fontSize: 22, fontWeight: '700', paddingVertical: 14 }}
          />
        </View>

        {/* Category */}
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 10 }}>
          Kategori *
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ gap: 10 }}
        >
          {filteredCategories.map(cat => {
            const sel = editCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setEditCategoryId(cat.id)}
                style={{
                  backgroundColor: sel ? (cat.color || Colors.primary) + '25' : Colors.card,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 2,
                  borderColor: sel ? (cat.color || Colors.primary) : 'transparent',
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
                  color: sel ? Colors.text : Colors.textMuted,
                  fontWeight: sel ? '600' : '400',
                  fontSize: 14,
                }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Wallet */}
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 10 }}>
          Dompet *
        </Text>
        {wallets.map(wallet => {
          const sel = editWalletId === wallet.id;
          return (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => setEditWalletId(wallet.id)}
              style={{ marginBottom: 10 }}
            >
              <Card style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: sel ? Colors.primary + '15' : Colors.card,
                borderWidth: 2,
                borderColor: sel ? Colors.primary : 'transparent',
              }}>
                <Text style={{ color: Colors.text, fontWeight: '600' }}>{wallet.name}</Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
                  {formatCurrency(wallet.balance)}
                </Text>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Date */}
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
            value={editDate}
            onChangeText={setEditDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
            style={{ flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 14, marginLeft: 10 }}
          />
        </View>

        {/* Note */}
        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 10 }}>
          Catatan
        </Text>
        <View style={{
          backgroundColor: Colors.card,
          borderRadius: 12,
          paddingHorizontal: 16,
          marginBottom: 28,
        }}>
          <RNTextInput
            value={editNote}
            onChangeText={setEditNote}
            placeholder="Catatan..."
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

        {/* Save / Cancel */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <OutlineButton
              title="Batal"
              onPress={() => setIsEditing(false)}
              disabled={saving}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SolidButton
              title={saving ? 'Menyimpan...' : 'Simpan'}
              onPress={handleSaveEdit}
              disabled={saving}
              loading={saving}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetailScreen;