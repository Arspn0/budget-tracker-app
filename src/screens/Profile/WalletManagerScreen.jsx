import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Edit2, X } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { SolidButton, OutlineButton } from '../../components/Button';
import { useTheme } from '../store/useTheme';
import { useWalletStore } from '../../store/useWalletStore';
import { formatCurrency } from '../../utils/helpers';

const Colors = useTheme();

const WALLET_TYPES = [
  { key: 'cash',    label: 'Cash',     emoji: '💵' },
  { key: 'bank',    label: 'Bank',     emoji: '🏦' },
  { key: 'ewallet', label: 'E-Wallet', emoji: '📱' },
];

const WALLET_COLORS = [
  '#3ED6C4', '#FF6B6B', '#4ECDC4', '#AA96DA',
  '#4CAF50', '#FFA726', '#F38181', '#A8D8EA',
];

const WalletForm = ({ visible, onClose, onSave, initial }) => {
  const [name, setName]       = useState(initial?.name || '');
  const [type, setType]       = useState(initial?.type || 'cash');
  const [balance, setBalance] = useState(initial ? '' : '');
  const [color, setColor]     = useState(initial?.color || WALLET_COLORS[0]);
  const [saving, setSaving]   = useState(false);
  const isEdit                = !!initial;

  useEffect(() => {
    if (visible) {
      setName(initial?.name || '');
      setType(initial?.type || 'cash');
      setBalance('');
      setColor(initial?.color || WALLET_COLORS[0]);
    }
  }, [visible, initial]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama dompet tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name:    name.trim(),
        type,
        color,
        balance: isEdit
          ? (initial?.balance ?? 0)
          : (balance ? parseFloat(balance) : 0),
        icon:    'wallet',
      });
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: Colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>
              {isEdit ? 'Edit Dompet' : 'Tambah Dompet'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={{ color: Colors.text, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            Nama Dompet *
          </Text>
          <View style={{
            backgroundColor: Colors.background,
            borderRadius: 12,
            paddingHorizontal: 14,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: name ? Colors.primary : 'transparent',
          }}>
            <RNTextInput
              value={name}
              onChangeText={setName}
              placeholder="Contoh: BCA, Dana, Dompet Harian"
              placeholderTextColor={Colors.textMuted}
              style={{ color: Colors.text, fontSize: 15, paddingVertical: 13 }}
            />
          </View>

          {/* Type */}
          <Text style={{ color: Colors.text, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>
            Tipe
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {WALLET_TYPES.map(wt => {
              const sel = type === wt.key;
              return (
                <TouchableOpacity
                  key={wt.key}
                  onPress={() => setType(wt.key)}
                  style={{
                    flex: 1,
                    backgroundColor: sel ? Colors.primary + '20' : Colors.background,
                    borderRadius: 12,
                    padding: 12,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: sel ? Colors.primary : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{wt.emoji}</Text>
                  <Text style={{ color: sel ? Colors.primary : Colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: sel ? '600' : '400' }}>
                    {wt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Saldo Awal — only for new wallets */}
          {!isEdit && (
            <>
              <Text style={{ color: Colors.text, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                Saldo Awal
              </Text>
              <View style={{
                backgroundColor: Colors.background,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                marginBottom: 16,
              }}>
                <Text style={{ color: Colors.textMuted, fontSize: 16, marginRight: 8 }}>Rp</Text>
                <RNTextInput
                  value={balance}
                  onChangeText={setBalance}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  style={{ flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 13 }}
                />
              </View>
            </>
          )}

          {/* Color */}
          <Text style={{ color: Colors.text, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>
            Warna
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {WALLET_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: c,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: color === c ? 3 : 0,
                  borderColor: Colors.text,
                }}
              >
                {color === c && (
                  <Text style={{ color: Colors.text, fontWeight: '700' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <OutlineButton title="Batal" onPress={onClose} disabled={saving} />
            </View>
            <View style={{ flex: 1 }}>
              <SolidButton
                title={saving ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Tambah'}
                onPress={handleSave}
                disabled={saving}
                loading={saving}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const WalletManagerScreen = () => {
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const hasFetched = useRef(false);

  const { wallets, totalBalance, fetchWallets, addWallet, updateWallet, deleteWallet } = useWalletStore();

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchWallets();
    }
  }, []);

  const handleDelete = (wallet) => {
    Alert.alert(
      'Hapus Dompet',
      `Hapus dompet "${wallet.name}"?\nSemua riwayat transaksi tetap tersimpan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet(wallet.id);
            } catch (e) {
              Alert.alert('Error', 'Gagal menghapus dompet');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <View>
          <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700' }}>Kelola Dompet</Text>
          <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
            Total: {formatCurrency(totalBalance)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => { setEditTarget(null); setShowForm(true); }}
          style={{ backgroundColor: Colors.primary, borderRadius: 50, padding: 12 }}
        >
          <Plus size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {wallets.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 40 }}>💳</Text>
            <Text style={{ color: Colors.textMuted, marginTop: 12 }}>Belum ada dompet</Text>
          </Card>
        ) : (
          wallets.map((wallet) => {
            const wt = WALLET_TYPES.find(t => t.key === wallet.type);
            return (
              <Card key={wallet.id} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Color + Emoji */}
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: (wallet.color || Colors.primary) + '25',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                    <Text style={{ fontSize: 22 }}>{wt?.emoji || '💰'}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>
                      {wallet.name}
                    </Text>
                    <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                      {wt?.label || wallet.type}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', marginRight: 14 }}>
                    <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>
                      {formatCurrency(wallet.balance)}
                    </Text>
                  </View>

                  {/* Actions */}
                  <TouchableOpacity
                    onPress={() => { setEditTarget(wallet); setShowForm(true); }}
                    style={{ padding: 6, marginRight: 4 }}
                  >
                    <Edit2 size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(wallet)}
                    style={{ padding: 6 }}
                  >
                    <Trash2 size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <WalletForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        initial={editTarget}
        onSave={async (data) => {
          if (editTarget) {
            await updateWallet(editTarget.id, { ...editTarget, ...data });
          } else {
            await addWallet(data);
          }
          await fetchWallets();
        }}
      />
    </SafeAreaView>
  );
};

export default WalletManagerScreen;