import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText, Download, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, BarChart2,
} from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { ProgressBar } from '../../components/Chart';
import { useTheme } from '../../theme/useTheme';
import { TransactionRepository } from '../../data/repositories/TransactionRepository';
import { useWalletStore } from '../../store/useWalletStore';
import { formatCurrency } from '../../utils/helpers';
import { exportPDF, exportCSV } from '../../utils/exportUtils';

const ReportScreen = () => {
  const Colors = useTheme();
  const now = new Date();
  const [month, setMonth]                   = useState(now.getMonth() + 1);
  const [year, setYear]                     = useState(now.getFullYear());
  const [transactions, setTransactions]     = useState([]);
  const [summary, setSummary]               = useState({ income: 0, expense: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [exporting, setExporting]           = useState(false);

  const { wallets, fetchWallets } = useWalletStore();

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    loadData();
  }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const mm        = String(month).padStart(2, '0');
      const startDate = `${year}-${mm}-01`;
      const endDate   = new Date(year, month, 0).toISOString().split('T')[0];

      const [txs, summ, cats] = await Promise.all([
        TransactionRepository.getByDateRange(startDate, endDate),
        TransactionRepository.getSummary(startDate, endDate),
        TransactionRepository.getByCategory(startDate, endDate, 'expense'),
      ]);

      setTransactions(txs);
      setSummary(summ);
      setCategoryBreakdown(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const payload = { transactions, summary, categoryBreakdown, wallets, month, year };
      if (type === 'pdf') await exportPDF(payload);
      else await exportCSV(payload);
    } catch (e) {
      Alert.alert('Gagal Export', e.message);
    } finally {
      setExporting(false);
    }
  };

  const periodLabel = new Date(year, month - 1, 1)
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const topExpenseTotal = categoryBreakdown.reduce((s, c) => s + c.total, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 }}>
        <Text style={{ color: Colors.text, fontSize: 24, fontWeight: '700' }}>
          Laporan
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigator */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
            <ChevronLeft size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={{ color: Colors.text, fontSize: 17, fontWeight: '700' }}>
            {periodLabel}
          </Text>
          <TouchableOpacity
            onPress={nextMonth}
            disabled={month === now.getMonth() + 1 && year === now.getFullYear()}
            style={{ padding: 8, opacity: (month === now.getMonth() + 1 && year === now.getFullYear()) ? 0.3 : 1 }}
          >
            <ChevronRight size={22} color={Colors.primary} />
          </TouchableOpacity>
        </Card>

        {loading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ color: Colors.textMuted, marginTop: 12 }}>Memuat laporan...</Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <Card style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <TrendingUp size={16} color={Colors.success} />
                  <Text style={{ color: Colors.textMuted, fontSize: 11, marginLeft: 6 }}>Pemasukan</Text>
                </View>
                <Text style={{ color: Colors.success, fontSize: 18, fontWeight: '800' }}>
                  {formatCurrency(summary.income)}
                </Text>
              </Card>
              <Card style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <TrendingDown size={16} color={Colors.danger} />
                  <Text style={{ color: Colors.textMuted, fontSize: 11, marginLeft: 6 }}>Pengeluaran</Text>
                </View>
                <Text style={{ color: Colors.danger, fontSize: 18, fontWeight: '800' }}>
                  {formatCurrency(summary.expense)}
                </Text>
              </Card>
            </View>

            {/* Net Balance */}
            <Card style={{ marginBottom: 20 }}>
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>Selisih (Net)</Text>
              <Text style={{
                fontSize: 28,
                fontWeight: '800',
                marginTop: 4,
                color: summary.income >= summary.expense ? Colors.success : Colors.danger,
              }}>
                {formatCurrency(summary.income - summary.expense)}
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 4 }}>
                {transactions.length} total transaksi
              </Text>
            </Card>

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
              <Card style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <BarChart2 size={18} color={Colors.primary} />
                  <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                    Pengeluaran per Kategori
                  </Text>
                </View>

                {categoryBreakdown.map((cat, idx) => (
                  <View key={cat.id} style={{ marginBottom: idx < categoryBreakdown.length - 1 ? 16 : 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{
                          width: 10, height: 10, borderRadius: 5,
                          backgroundColor: cat.color || Colors.primary,
                        }} />
                        <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '500' }}>
                          {cat.name}
                        </Text>
                      </View>
                      <Text style={{ color: Colors.danger, fontSize: 14, fontWeight: '700' }}>
                        {formatCurrency(cat.total)}
                      </Text>
                    </View>
                    <ProgressBar
                      current={cat.total}
                      target={topExpenseTotal}
                      showPercentage
                      showAmount={false}
                      color={cat.color || Colors.primary}
                      height={6}
                    />
                    <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 3 }}>
                      {cat.count} transaksi
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Wallet Balances */}
            <Card style={{ marginBottom: 20 }}>
              <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>
                💳 Saldo Dompet
              </Text>
              {wallets.map((w, idx) => (
                <View
                  key={w.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderTopWidth: idx !== 0 ? 1 : 0,
                    borderTopColor: '#2A2D35',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 20 }}>
                      {w.type === 'cash' ? '💵' : w.type === 'bank' ? '🏦' : '📱'}
                    </Text>
                    <Text style={{ color: Colors.text, fontSize: 15 }}>{w.name}</Text>
                  </View>
                  <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 15 }}>
                    {formatCurrency(w.balance)}
                  </Text>
                </View>
              ))}
            </Card>

            {/* Export Buttons */}
            <Text style={{
              color: Colors.textMuted,
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 12,
            }}>
              Ekspor Laporan
            </Text>

            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleExport('pdf')}
                disabled={exporting}
                style={{
                  backgroundColor: Colors.danger + '15',
                  borderRadius: 14,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: Colors.danger + '40',
                  opacity: exporting ? 0.6 : 1,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: Colors.danger + '20',
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <FileText size={22} color={Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '700' }}>
                    Export PDF
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    Laporan lengkap dengan grafik & detail
                  </Text>
                </View>
                {exporting
                  ? <ActivityIndicator size="small" color={Colors.danger} />
                  : <Download size={20} color={Colors.danger} />
                }
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleExport('csv')}
                disabled={exporting}
                style={{
                  backgroundColor: Colors.success + '15',
                  borderRadius: 14,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: Colors.success + '40',
                  opacity: exporting ? 0.6 : 1,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: Colors.success + '20',
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <Download size={22} color={Colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '700' }}>
                    Export CSV / Excel
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                    Data mentah untuk diolah di Excel / Sheets
                  </Text>
                </View>
                {exporting
                  ? <ActivityIndicator size="small" color={Colors.success} />
                  : <Download size={20} color={Colors.success} />
                }
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportScreen;