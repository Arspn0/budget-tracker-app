import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { useThemeStore } from '../../store/useThemeStore';
import { TransactionRepository } from '../../data/repositories/TransactionRepository';
import { formatCurrency } from '../../utils/helpers';

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const FinancialCalendarScreen = ({ navigation }) => {
  const Colors = useThemeStore();
  const now = new Date();
  const [month, setMonth]                 = useState(now.getMonth() + 1);
  const [year, setYear]                   = useState(now.getFullYear());
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedDate, setSelectedDate]   = useState(null);
  const [showModal, setShowModal]         = useState(false);

  useEffect(() => { loadData(); }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const mm        = String(month).padStart(2, '0');
      const startDate = `${year}-${mm}-01`;
      const endDate   = new Date(year, month, 0).toISOString().split('T')[0];
      const txs       = await TransactionRepository.getByDateRange(startDate, endDate);
      setTransactions(txs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Calendar grid helpers ────────────────────────────────────────────────
  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const getFirstDay    = (m, y) => new Date(y, m - 1, 1).getDay(); // 0=Sun

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay    = getFirstDay(month, year);

  // Build grid: leading empty cells + day cells
  const grid = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Group transactions by date string
  const byDate = transactions.reduce((acc, tx) => {
    const d = tx.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(tx);
    return acc;
  }, {});

  const dateKey = (day) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDayStatus = (day) => {
    const key = dateKey(day);
    const txs = byDate[key] || [];
    if (!txs.length) return null;

    const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    if (income > 0 && expense > 0) return 'both';
    if (income > 0)  return 'income';
    if (expense > 0) return 'expense';
    return null;
  };

  const handleDayPress = (day) => {
    const key = dateKey(day);
    const txs = byDate[key] || [];
    if (!txs.length) return;
    setSelectedDate({ day, key, txs });
    setShowModal(true);
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === now.getMonth() + 1 && year === now.getFullYear()) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const periodLabel = new Date(year, month - 1, 1)
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Monthly totals
  const monthIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const todayStr     = now.toISOString().split('T')[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 }}>
        <Text style={{ color: Colors.text, fontSize: 24, fontWeight: '700' }}>
          Kalender
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigator */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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

        {/* Monthly Summary */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Pemasukan</Text>
            <Text style={{ color: Colors.success, fontSize: 16, fontWeight: '800', marginTop: 4 }}>
              {formatCurrency(monthIncome)}
            </Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Pengeluaran</Text>
            <Text style={{ color: Colors.danger, fontSize: 16, fontWeight: '800', marginTop: 4 }}>
              {formatCurrency(monthExpense)}
            </Text>
          </Card>
        </View>

        {/* Calendar */}
        <Card style={{ marginBottom: 20 }}>
          {/* Day Labels */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {DAY_LABELS.map(d => (
              <View key={d} style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ color: Colors.textMuted, fontSize: 12, fontWeight: '600' }}>
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            // Grid rows
            Array.from({ length: Math.ceil(grid.length / 7) }).map((_, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: 'row' }}>
                {grid.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
                  if (!day) {
                    return <View key={colIdx} style={{ flex: 1, aspectRatio: 1 }} />;
                  }

                  const status    = getDayStatus(day);
                  const key       = dateKey(day);
                  const isToday   = key === todayStr;
                  const hasTx     = !!status;
                  const txCount   = (byDate[key] || []).length;

                  // Dot color
                  const dotColor =
                    status === 'income'  ? Colors.success :
                    status === 'expense' ? Colors.danger  :
                    status === 'both'    ? Colors.primary : 'transparent';

                  return (
                    <TouchableOpacity
                      key={colIdx}
                      onPress={() => handleDayPress(day)}
                      disabled={!hasTx}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 2,
                        borderRadius: 10,
                        backgroundColor: isToday
                          ? Colors.primary + '25'
                          : hasTx
                            ? dotColor + '12'
                            : 'transparent',
                        borderWidth: isToday ? 1.5 : 0,
                        borderColor: isToday ? Colors.primary : 'transparent',
                      }}
                    >
                      <Text style={{
                        color: isToday ? Colors.primary : Colors.text,
                        fontSize: 14,
                        fontWeight: isToday ? '800' : hasTx ? '600' : '400',
                      }}>
                        {day}
                      </Text>

                      {/* Transaction dot indicator */}
                      {hasTx && (
                        <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                          {status === 'both' ? (
                            <>
                              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.success }} />
                              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.danger }} />
                            </>
                          ) : (
                            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: dotColor }} />
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </Card>

        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          {[
            { color: Colors.success, label: 'Pemasukan' },
            { color: Colors.danger,  label: 'Pengeluaran' },
            { color: Colors.primary, label: 'Keduanya' },
          ].map(l => (
            <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: l.color }} />
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Active days summary */}
        {transactions.length > 0 && (
          <Card>
            <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 12 }}>
              Hari Aktif Transaksi
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
              {Object.keys(byDate).length} hari dari {daysInMonth} hari ada transaksi
            </Text>
            <View style={{ marginTop: 10 }}>
              <View style={{ height: 6, backgroundColor: '#2A2D35', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{
                  height: '100%',
                  width: `${(Object.keys(byDate).length / daysInMonth) * 100}%`,
                  backgroundColor: Colors.primary,
                  borderRadius: 3,
                }} />
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Day Detail Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: Colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '70%',
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#2A2D35',
            }}>
              <View>
                <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>
                  {selectedDate && new Date(selectedDate.key).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
                  {selectedDate?.txs.length} transaksi
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{ padding: 8 }}
              >
                <X size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Day Summary */}
            {selectedDate && (
              <>
                <View style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
                  {(() => {
                    const inc = selectedDate.txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                    const exp = selectedDate.txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                    return (
                      <>
                        {inc > 0 && (
                          <View style={{ flex: 1, backgroundColor: Colors.success + '15', borderRadius: 10, padding: 12 }}>
                            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Pemasukan</Text>
                            <Text style={{ color: Colors.success, fontWeight: '700', fontSize: 15, marginTop: 2 }}>
                              +{formatCurrency(inc)}
                            </Text>
                          </View>
                        )}
                        {exp > 0 && (
                          <View style={{ flex: 1, backgroundColor: Colors.danger + '15', borderRadius: 10, padding: 12 }}>
                            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>Pengeluaran</Text>
                            <Text style={{ color: Colors.danger, fontWeight: '700', fontSize: 15, marginTop: 2 }}>
                              -{formatCurrency(exp)}
                            </Text>
                          </View>
                        )}
                      </>
                    );
                  })()}
                </View>

                {/* Transaction List */}
                <ScrollView style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                  {selectedDate.txs.map((tx, idx) => (
                    <TouchableOpacity
                      key={tx.id}
                      onPress={() => {
                        setShowModal(false);
                        navigation.navigate('TransactionDetail', { transactionId: tx.id });
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 14,
                        borderTopWidth: idx !== 0 ? 1 : 0,
                        borderTopColor: '#2A2D35',
                      }}
                    >
                      <View style={{
                        width: 38, height: 38, borderRadius: 19,
                        backgroundColor: (tx.category_color || Colors.primary) + '25',
                        alignItems: 'center', justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <View style={{
                          width: 12, height: 12, borderRadius: 6,
                          backgroundColor: tx.category_color || Colors.primary,
                        }} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 14 }}>
                          {tx.category_name || '—'}
                        </Text>
                        {tx.note ? (
                          <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>{tx.note}</Text>
                        ) : null}
                      </View>
                      <Text style={{
                        fontWeight: '700', fontSize: 15,
                        color: tx.type === 'income' ? Colors.success : Colors.danger,
                      }}>
                        {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FinancialCalendarScreen;