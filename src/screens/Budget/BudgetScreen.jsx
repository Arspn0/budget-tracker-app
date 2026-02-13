import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Wallet, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { ProgressBar } from '../../components/Chart';
import { Colors } from '../../theme/colors';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatCurrency } from '../../utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const BudgetScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { budgets, fetchBudgets, deleteBudget } = useBudgetStore();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useFocusEffect(
    React.useCallback(() => {
      fetchBudgets(currentMonth, currentYear);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets(currentMonth, currentYear);
    setRefreshing(false);
  };

  const handleDelete = (budget) => {
    Alert.alert(
      'Hapus Budget',
      `Hapus budget untuk kategori "${budget.category_name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus budget');
            }
          },
        },
      ]
    );
  };

  const getStatus = (percentage) => {
    if (percentage >= 100) return {
      color: Colors.danger,
      label: 'Melebihi Limit!',
      icon: AlertTriangle,
      bg: Colors.danger + '15',
    };
    if (percentage >= 80) return {
      color: '#FFA726',
      label: 'Hampir Limit',
      icon: AlertTriangle,
      bg: '#FFA72615',
    };
    return {
      color: Colors.success,
      label: 'Aman',
      icon: CheckCircle,
      bg: Colors.success + '15',
    };
  };

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overBudgetCount = budgets.filter(b => b.percentage >= 100).length;
  const warningCount = budgets.filter(b => b.percentage >= 80 && b.percentage < 100).length;

  const monthName = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
      }}>
        <View>
          <Text style={{ color: Colors.text, fontSize: 24, fontWeight: '700' }}>
            Budget
          </Text>
          <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
            {monthName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddBudget')}
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 50,
            padding: 12,
          }}
        >
          <Plus size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        {budgets.length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 14 }}>
              Ringkasan Budget Bulan Ini
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View>
                <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Total Budget</Text>
                <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700', marginTop: 2 }}>
                  {formatCurrency(totalLimit)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Terpakai</Text>
                <Text style={{ color: Colors.danger, fontSize: 18, fontWeight: '700', marginTop: 2 }}>
                  {formatCurrency(totalSpent)}
                </Text>
              </View>
            </View>

            <ProgressBar
              current={totalSpent}
              target={totalLimit}
              showPercentage
              showAmount={false}
              color={
                totalLimit > 0 && (totalSpent / totalLimit) >= 1
                  ? Colors.danger
                  : totalLimit > 0 && (totalSpent / totalLimit) >= 0.8
                    ? '#FFA726'
                    : Colors.primary
              }
              height={10}
            />

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 12,
            }}>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                Sisa:{' '}
                <Text style={{ color: Colors.success, fontWeight: '600' }}>
                  {formatCurrency(totalRemaining)}
                </Text>
              </Text>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                {overBudgetCount > 0 && (
                  <Text style={{ color: Colors.danger, fontSize: 12, fontWeight: '600' }}>
                    ⚠ {overBudgetCount} over limit
                  </Text>
                )}
                {warningCount > 0 && (
                  <Text style={{ color: '#FFA726', fontSize: 12, fontWeight: '600' }}>
                    ⚡ {warningCount} hampir limit
                  </Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Empty State */}
        {budgets.length === 0 ? (
          <View style={{
            backgroundColor: Colors.card,
            borderRadius: 16,
            padding: 40,
            alignItems: 'center',
            elevation: 3,
          }}>
            <Wallet size={56} color={Colors.textMuted} />
            <Text style={{
              color: Colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginTop: 16,
            }}>
              Belum Ada Budget
            </Text>
            <Text style={{
              color: Colors.textMuted,
              fontSize: 13,
              textAlign: 'center',
              marginTop: 8,
            }}>
              Buat budget bulanan untuk mengontrol pengeluaran Anda
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddBudget')}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
                marginTop: 20,
              }}
            >
              <Text style={{ color: Colors.text, fontWeight: '600' }}>
                Buat Budget
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgets.map((budget) => {
            const status = getStatus(budget.percentage || 0);
            const StatusIcon = status.icon;

            return (
              <Card key={budget.id} style={{
                marginBottom: 14,
                backgroundColor: Colors.card,
              }}>
                {/* Card Header */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {/* Category Color Dot */}
                    <View style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: (budget.category_color || Colors.primary) + '25',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 20 }}>
                        {getCategoryEmoji(budget.category_name)}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: Colors.text,
                        fontSize: 16,
                        fontWeight: '600',
                      }}>
                        {budget.category_name}
                      </Text>
                      <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                        Limit: {formatCurrency(budget.limit_amount)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Status Badge */}
                    <View style={{
                      backgroundColor: status.bg,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <StatusIcon size={12} color={status.color} />
                      <Text style={{ color: status.color, fontSize: 11, fontWeight: '600' }}>
                        {status.label}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => handleDelete(budget)}>
                      <Trash2 size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Progress Bar */}
                <ProgressBar
                  current={budget.spent || 0}
                  target={budget.limit_amount}
                  showPercentage
                  showAmount={false}
                  color={status.color}
                  height={8}
                />

                {/* Amount Details */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: '#2A2D35',
                }}>
                  <View>
                    <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Terpakai</Text>
                    <Text style={{ color: Colors.danger, fontSize: 14, fontWeight: '600', marginTop: 1 }}>
                      {formatCurrency(budget.spent || 0)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Sisa</Text>
                    <Text style={{
                      color: (budget.limit_amount - (budget.spent || 0)) < 0
                        ? Colors.danger
                        : Colors.success,
                      fontSize: 14,
                      fontWeight: '600',
                      marginTop: 1,
                    }}>
                      {formatCurrency(Math.max(0, budget.limit_amount - (budget.spent || 0)))}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper: get emoji for category
const getCategoryEmoji = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('makan') || lower.includes('food')) return '🍜';
  if (lower.includes('transport') || lower.includes('kendaraan')) return '🚗';
  if (lower.includes('belanja') || lower.includes('shop')) return '🛍️';
  if (lower.includes('tagihan') || lower.includes('bill')) return '📄';
  if (lower.includes('hiburan') || lower.includes('entertain')) return '🎬';
  if (lower.includes('kesehatan') || lower.includes('health')) return '❤️';
  if (lower.includes('pendidikan') || lower.includes('edu')) return '📚';
  if (lower.includes('gaji') || lower.includes('salary')) return '💼';
  return '💰';
};

export default BudgetScreen;