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
import { Plus, PiggyBank, Target, Calendar, Trash2 } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { ProgressBar } from '../../components/Chart';
import { Colors } from '../../theme/colors';
import { useSavingStore } from '../../store/useSavingStore';
import { formatCurrency } from '../../utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const SavingsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { savings, fetchSavings, deleteSaving } = useSavingStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchSavings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavings();
    setRefreshing(false);
  };

  const handleDelete = (saving) => {
    Alert.alert(
      'Hapus Tabungan',
      `Apakah Anda yakin ingin menghapus tabungan "${saving.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSaving(saving.id);
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus tabungan');
            }
          },
        },
      ]
    );
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getWeeklySuggestion = (saving) => {
    const daysRemaining = getDaysRemaining(saving.deadline);
    if (!daysRemaining || daysRemaining <= 0) return null;
    const remaining = saving.target_amount - saving.current_amount;
    if (remaining <= 0) return null;
    const weeksRemaining = Math.ceil(daysRemaining / 7);
    return Math.ceil(remaining / weeksRemaining);
  };

  const totalSaved = savings.reduce((sum, s) => sum + s.current_amount, 0);
  const totalTarget = savings.reduce((sum, s) => sum + s.target_amount, 0);
  const completedCount = savings.filter(s => s.current_amount >= s.target_amount).length;

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
            Tabungan
          </Text>
          <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
            {savings.length} target tabungan
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddSaving')}
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
        {savings.length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 12 }}>
              Ringkasan Tabungan
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: '700' }}>
                  {savings.length}
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  Total Target
                </Text>
              </View>
              <View style={{
                width: 1,
                backgroundColor: '#2A2D35',
                marginVertical: 4,
              }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: Colors.success, fontSize: 20, fontWeight: '700' }}>
                  {completedCount}
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  Tercapai
                </Text>
              </View>
              <View style={{
                width: 1,
                backgroundColor: '#2A2D35',
                marginVertical: 4,
              }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '700' }}>
                  {totalTarget > 0
                    ? `${((totalSaved / totalTarget) * 100).toFixed(0)}%`
                    : '0%'
                  }
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  Progress
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <ProgressBar
                current={totalSaved}
                target={totalTarget}
                label="Total Terkumpul"
                color={Colors.primary}
                height={10}
              />
            </View>
          </Card>
        )}

        {/* Savings List */}
        {savings.length === 0 ? (
          <View style={{
            backgroundColor: Colors.card,
            borderRadius: 16,
            padding: 40,
            alignItems: 'center',
            elevation: 3,
          }}>
            <PiggyBank size={56} color={Colors.textMuted} />
            <Text style={{
              color: Colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginTop: 16,
            }}>
              Belum Ada Target Tabungan
            </Text>
            <Text style={{
              color: Colors.textMuted,
              fontSize: 13,
              textAlign: 'center',
              marginTop: 8,
            }}>
              Buat target tabungan pertama Anda dan mulai menabung hari ini
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddSaving')}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
                marginTop: 20,
              }}
            >
              <Text style={{ color: Colors.text, fontWeight: '600' }}>
                Buat Target Baru
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          savings.map((saving) => {
            const percentage = saving.target_amount > 0
              ? (saving.current_amount / saving.target_amount) * 100
              : 0;
            const isCompleted = percentage >= 100;
            const daysRemaining = getDaysRemaining(saving.deadline);
            const weeklySuggestion = getWeeklySuggestion(saving);

            return (
              <TouchableOpacity
                key={saving.id}
                onPress={() => navigation.navigate('SavingDetail', {
                  savingId: saving.id
                })}
                activeOpacity={0.85}
              >
                <Card style={{ marginBottom: 16 }}>
                  {/* Card Header */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: (saving.color || Colors.primary) + '25',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <PiggyBank
                          size={22}
                          color={saving.color || Colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: Colors.text,
                          fontSize: 16,
                          fontWeight: '600',
                        }}
                          numberOfLines={1}
                        >
                          {saving.name}
                        </Text>
                        {isCompleted && (
                          <View style={{
                            backgroundColor: Colors.success + '25',
                            borderRadius: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            alignSelf: 'flex-start',
                            marginTop: 4,
                          }}>
                            <Text style={{ color: Colors.success, fontSize: 11, fontWeight: '600' }}>
                              ✓ Tercapai!
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDelete(saving)}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Progress Bar */}
                  <ProgressBar
                    current={saving.current_amount}
                    target={saving.target_amount}
                    showPercentage
                    showAmount
                    color={saving.color || Colors.primary}
                    height={10}
                  />

                  {/* Footer Info */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 14,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: '#2A2D35',
                  }}>
                    {/* Deadline */}
                    {saving.deadline && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Calendar size={14} color={Colors.textMuted} />
                        <Text style={{
                          color: daysRemaining !== null && daysRemaining < 30
                            ? '#FFA726'
                            : Colors.textMuted,
                          fontSize: 12,
                          marginLeft: 4,
                        }}>
                          {daysRemaining !== null
                            ? daysRemaining <= 0
                              ? 'Sudah lewat'
                              : `${daysRemaining} hari lagi`
                            : new Date(saving.deadline).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })
                          }
                        </Text>
                      </View>
                    )}

                    {/* Weekly Suggestion */}
                    {weeklySuggestion && !isCompleted && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Target size={14} color={Colors.primary} />
                        <Text style={{
                          color: Colors.primary,
                          fontSize: 12,
                          marginLeft: 4,
                        }}>
                          {formatCurrency(weeklySuggestion)}/minggu
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SavingsScreen;