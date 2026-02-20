import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput as RNTextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PiggyBank, ArrowDownCircle, ArrowUpCircle,
  Calendar, Target, TrendingUp, Clock,
} from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { ProgressBar } from '../../components/Chart';
import { SolidButton, OutlineButton } from '../../components/Button';
import { useThemeStore } from '../../store/useThemeStore';
import { useSavingStore } from '../../store/useSavingStore';
import { formatCurrency } from '../../utils/helpers';

const TransactionModal = ({ visible, type, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const isDeposit = type === 'deposit';

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang valid');
      return;
    }
    onConfirm(parseFloat(amount), note.trim());
    setAmount('');
    setNote('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: Colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
        }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            {isDeposit ? (
              <ArrowDownCircle size={28} color={Colors.success} />
            ) : (
              <ArrowUpCircle size={28} color={Colors.danger} />
            )}
            <Text style={{
              color: Colors.text,
              fontSize: 20,
              fontWeight: '700',
              marginLeft: 10,
            }}>
              {isDeposit ? 'Setor Tabungan' : 'Tarik Dana'}
            </Text>
          </View>

          {/* Amount Input */}
          <Text style={{
            color: Colors.text,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
          }}>
            Jumlah *
          </Text>
          <View style={{
            backgroundColor: Colors.background,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: amount ? (isDeposit ? Colors.success : Colors.danger) : 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 16,
          }}>
            <Text style={{ color: Colors.textMuted, fontSize: 16, marginRight: 8 }}>
              Rp
            </Text>
            <RNTextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              style={{
                flex: 1,
                color: Colors.text,
                fontSize: 16,
                paddingVertical: 14,
              }}
            />
          </View>

          {/* Note Input */}
          <Text style={{
            color: Colors.text,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
          }}>
            Catatan (Opsional)
          </Text>
          <View style={{
            backgroundColor: Colors.background,
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 24,
          }}>
            <RNTextInput
              value={note}
              onChangeText={setNote}
              placeholder="Tambahkan catatan..."
              placeholderTextColor={Colors.textMuted}
              style={{
                color: Colors.text,
                fontSize: 15,
                paddingVertical: 14,
              }}
            />
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <OutlineButton title="Batal" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <SolidButton
                title={isDeposit ? 'Setor' : 'Tarik'}
                onPress={handleConfirm}
                variant={isDeposit ? 'success' : 'danger'}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SavingDetailScreen = ({ route, navigation }) => {
  const Colors = useThemeStore();
  const { savingId } = route.params;
  const [saving, setSaving] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  const { savings, addSavingTransaction, getSavingTransactions } = useSavingStore();

  useEffect(() => {
    loadData();
  }, [savingId, savings]);

  const loadData = async () => {
    const found = savings.find(s => s.id === savingId);
    if (found) {
      setSaving(found);
      const txs = await getSavingTransactions(savingId);
      setTransactions(txs);
    }
    setLoading(false);
  };

  const handleTransaction = async (amount, note) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await addSavingTransaction({
        saving_id: savingId,
        type: modalType,
        amount,
        note,
        date: today,
      });
      setModalType(null);
      Alert.alert(
        'Berhasil',
        modalType === 'deposit' ? 'Setor tabungan berhasil!' : 'Tarik dana berhasil!'
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal melakukan transaksi: ' + error.message);
    }
  };

  if (loading || !saving) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const percentage = saving.target_amount > 0
    ? Math.min((saving.current_amount / saving.target_amount) * 100, 100)
    : 0;
  const isCompleted = percentage >= 100;
  const remaining = Math.max(0, saving.target_amount - saving.current_amount);

  const getDaysRemaining = () => {
    if (!saving.deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(saving.deadline);
    return Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  const weeksRemaining = daysRemaining ? Math.ceil(daysRemaining / 7) : null;
  const weeklySuggestion = weeksRemaining && remaining > 0
    ? Math.ceil(remaining / weeksRemaining)
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={{
          backgroundColor: (saving.color || Colors.primary) + '20',
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 28,
        }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: (saving.color || Colors.primary) + '30',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <PiggyBank size={36} color={saving.color || Colors.primary} />
            </View>
            <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700' }}>
              {saving.name}
            </Text>
            {isCompleted && (
              <View style={{
                backgroundColor: Colors.success + '25',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 4,
                marginTop: 8,
              }}>
                <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 13 }}>
                  🎉 Target Tercapai!
                </Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Terkumpul</Text>
              <Text style={{ color: Colors.success, fontSize: 18, fontWeight: '700', marginTop: 4 }}>
                {formatCurrency(saving.current_amount)}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Target</Text>
              <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>
                {formatCurrency(saving.target_amount)}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Sisa</Text>
              <Text style={{ color: Colors.danger, fontSize: 18, fontWeight: '700', marginTop: 4 }}>
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <ProgressBar
            current={saving.current_amount}
            target={saving.target_amount}
            showPercentage
            showAmount={false}
            color={saving.color || Colors.primary}
            height={12}
          />
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Info Cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {saving.deadline && (
              <Card style={{ flex: 1 }}>
                <Calendar size={18} color={Colors.primary} />
                <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 6 }}>
                  Deadline
                </Text>
                <Text style={{ color: Colors.text, fontSize: 13, fontWeight: '600', marginTop: 2 }}>
                  {new Date(saving.deadline).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                {daysRemaining !== null && (
                  <Text style={{
                    color: daysRemaining < 30 ? '#FFA726' : Colors.textMuted,
                    fontSize: 11,
                    marginTop: 2,
                  }}>
                    {daysRemaining <= 0 ? 'Sudah lewat' : `${daysRemaining} hari lagi`}
                  </Text>
                )}
              </Card>
            )}

            {weeklySuggestion && (
              <Card style={{ flex: 1 }}>
                <Target size={18} color={Colors.primary} />
                <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 6 }}>
                  Saran/Minggu
                </Text>
                <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600', marginTop: 2 }}>
                  {formatCurrency(weeklySuggestion)}
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 2 }}>
                  {weeksRemaining} minggu lagi
                </Text>
              </Card>
            )}

            <Card style={{ flex: 1 }}>
              <TrendingUp size={18} color={Colors.success} />
              <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 6 }}>
                Progress
              </Text>
              <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700', marginTop: 2 }}>
                {percentage.toFixed(0)}%
              </Text>
            </Card>
          </View>

          {/* Action Buttons */}
          {!isCompleted && (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <SolidButton
                  title="+ Setor"
                  onPress={() => setModalType('deposit')}
                  variant="success"
                />
              </View>
              <View style={{ flex: 1 }}>
                <OutlineButton
                  title="− Tarik"
                  onPress={() => setModalType('withdraw')}
                  variant="danger"
                />
              </View>
            </View>
          )}

          {/* Transaction History */}
          <Text style={{
            color: Colors.text,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 12,
          }}>
            Riwayat
          </Text>

          {transactions.length === 0 ? (
            <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Clock size={40} color={Colors.textMuted} />
              <Text style={{ color: Colors.textMuted, marginTop: 12 }}>
                Belum ada riwayat transaksi
              </Text>
            </Card>
          ) : (
            <Card>
              {transactions.map((tx, index) => (
                <View
                  key={tx.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    borderTopWidth: index !== 0 ? 1 : 0,
                    borderTopColor: '#2A2D35',
                  }}
                >
                  <View style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: tx.type === 'deposit'
                      ? Colors.success + '20'
                      : Colors.danger + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    {tx.type === 'deposit' ? (
                      <ArrowDownCircle size={20} color={Colors.success} />
                    ) : (
                      <ArrowUpCircle size={20} color={Colors.danger} />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 14 }}>
                      {tx.type === 'deposit' ? 'Setor' : 'Tarik Dana'}
                    </Text>
                    {tx.note && (
                      <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                        {tx.note}
                      </Text>
                    )}
                    <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 2 }}>
                      {new Date(tx.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <Text style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: tx.type === 'deposit' ? Colors.success : Colors.danger,
                  }}>
                    {tx.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Deposit/Withdraw Modal */}
      <TransactionModal
        visible={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
        onConfirm={handleTransaction}
      />
    </SafeAreaView>
  );
};

export default SavingDetailScreen;