import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Filter, Wallet } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { Colors } from '../../theme/colors';
import { useTransactionStore } from '../../store/useTransactionStore';
import { formatCurrency } from '../../utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const FILTER_OPTIONS = [
  { key: 'all',   label: 'Semua' },
  { key: 'today', label: 'Hari Ini' },
  { key: 'week',  label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
];

const TransactionListScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const { transactions, fetchTransactions, deleteTransaction, loading } = useTransactionStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  // Apply date filter
  const filtered = transactions.filter(tx => {
    const today = new Date();
    const txDate = new Date(tx.date);

    if (activeFilter === 'today') {
      return tx.date === today.toISOString().split('T')[0];
    }
    if (activeFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return txDate >= weekAgo;
    }
    if (activeFilter === 'month') {
      return txDate.getMonth() === today.getMonth()
        && txDate.getFullYear() === today.getFullYear();
    }
    return true;
  });

  // Group by date
  const grouped = filtered.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  // Summary for filtered
  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleDelete = (tx) => {
    Alert.alert(
      'Hapus Transaksi',
      `Hapus transaksi ${tx.category_name} sebesar ${formatCurrency(tx.amount)}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(tx.id, tx);
            } catch (e) {
              Alert.alert('Error', 'Gagal menghapus transaksi');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
      }}>
        <Text style={{ color: Colors.text, fontSize: 24, fontWeight: '700' }}>
          Transaksi
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction')}
          style={{ backgroundColor: Colors.primary, borderRadius: 50, padding: 12 }}
        >
          <Plus size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12, height: 50 }}
      >
        {FILTER_OPTIONS.map(f => {
          const active = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? Colors.primary : Colors.card,
              }}
            >
              <Text style={{
                color: active ? Colors.text : Colors.textMuted,
                fontWeight: active ? '600' : '400',
                fontSize: 13,
              }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Summary Bar */}
      {filtered.length > 0 && (
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginBottom: 16,
          backgroundColor: Colors.card,
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          <View style={{ flex: 1, padding: 12, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#2A2D35' }}>
            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Pemasukan</Text>
            <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 14, marginTop: 2 }}>
              +{formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={{ flex: 1, padding: 12, alignItems: 'center' }}>
            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Pengeluaran</Text>
            <Text style={{ color: Colors.danger, fontWeight: '700', fontSize: 14, marginTop: 2 }}>
              -{formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Wallet size={52} color={Colors.textMuted} />
            <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '600', marginTop: 16 }}>
              Belum Ada Transaksi
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center' }}>
              {activeFilter !== 'all'
                ? 'Tidak ada transaksi pada periode ini'
                : 'Tap tombol + untuk menambah transaksi'
              }
            </Text>
          </Card>
        ) : (
          sortedDates.map(date => (
            <View key={date} style={{ marginBottom: 20 }}>
              {/* Date Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: Colors.textMuted, fontSize: 13, fontWeight: '600' }}>
                  {new Date(date).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                  {grouped[date].length} transaksi
                </Text>
              </View>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {grouped[date].map((tx, idx) => (
                  <TouchableOpacity
                    key={tx.id}
                    onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
                    onLongPress={() => handleDelete(tx)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderTopWidth: idx !== 0 ? 1 : 0,
                      borderTopColor: '#2A2D35',
                    }}
                  >
                    {/* Color Dot */}
                    <View style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: (tx.category_color || Colors.primary) + '25',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}>
                      <View style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: tx.category_color || Colors.primary,
                      }} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 15 }}>
                        {tx.category_name || 'Tidak ada kategori'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
                          {tx.wallet_name || '—'}
                        </Text>
                        {tx.note && (
                          <>
                            <Text style={{ color: Colors.textMuted, fontSize: 12 }}>·</Text>
                            <Text style={{ color: Colors.textMuted, fontSize: 12 }} numberOfLines={1}>
                              {tx.note}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>

                    <Text style={{
                      fontWeight: '700',
                      fontSize: 15,
                      color: tx.type === 'income' ? Colors.success : Colors.danger,
                    }}>
                      {tx.type === 'income' ? '+' : '−'}
                      {formatCurrency(tx.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionListScreen;