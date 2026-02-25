import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Switch, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, BellOff, Clock, TrendingDown, PieChart } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { SolidButton } from '../../components/Button';
import { useThemeStore } from '../../store/useThemeStore';
import {
  requestNotificationPermissions,
  scheduleSavingsReminder,
  scheduleDailySummary,
  cancelAllNotifications,
  getScheduledNotifications,
} from '../../utils/notificationUtils';
import { useNotificationStore } from '../../store/useNotificationStore';

const TimePickerRow = ({ label, value, onChange }) => {
  const Colors = useThemeStore();
  
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const [hour, min] = value.split(':');

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Hour Picker */}
        <View style={{ flex: 1 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {hours.map(h => (
              <TouchableOpacity
                key={h}
                onPress={() => onChange(`${h}:${min}`)}
                style={{
                  backgroundColor: h === hour ? Colors.primary : Colors.card,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{
                  color: h === hour ? '#FFFFFF' : Colors.text,
                  fontWeight: h === hour ? '700' : '400',
                }}>
                  {h}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>:</Text>

        {/* Minute Picker */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {minutes.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => onChange(`${hour}:${m}`)}
                style={{
                  flex: 1,
                  backgroundColor: m === min ? Colors.primary : Colors.card,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: m === min ? '#FFFFFF' : Colors.text,
                  fontWeight: m === min ? '700' : '400',
                }}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const NotificationSettingsScreen = () => {
  const Colors = useTheme();

  const {
    budgetAlertEnabled,
    budgetAlertThreshold,
    savingsReminderEnabled,
    savingsReminderFrequency,
    savingsReminderTime,
    dailySummaryEnabled,
    dailySummaryTime,
    setBudgetAlert,
    setSavingsReminder,
    setDailySummary,
    initNotifications,
  } = useNotificationStore();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    initNotifications();
    checkPermissions();
    loadScheduledCount();
  }, []);

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
  };

  const loadScheduledCount = async () => {
    const notifications = await getScheduledNotifications();
    setScheduledCount(notifications.length);
  };

  const handleBudgetAlertToggle = async (val) => {
    if (val && !permissionGranted) {
      Alert.alert('Permission Required', 'Izinkan notifikasi di Settings');
      return;
    }
    await setBudgetAlert(val, budgetAlertThreshold);
  };

  const handleSavingsReminderToggle = async (val) => {
    if (val && !permissionGranted) {
      Alert.alert('Permission Required', 'Izinkan notifikasi di Settings');
      return;
    }
    await setSavingsReminder(val, savingsReminderFrequency, savingsReminderTime);
    if (val) {
      await scheduleSavingsReminder({
        frequency: savingsReminderFrequency,
        time: savingsReminderTime,
      });
    }
    loadScheduledCount();
  };

  const handleDailySummaryToggle = async (val) => {
    if (val && !permissionGranted) {
      Alert.alert('Permission Required', 'Izinkan notifikasi di Settings');
      return;
    }
    await setDailySummary(val, dailySummaryTime);
    await scheduleDailySummary({ enabled: val, time: dailySummaryTime });
    loadScheduledCount();
  };

  const handleSavingsFrequencyChange = async (freq) => {
    await setSavingsReminder(savingsReminderEnabled, freq, savingsReminderTime);
    if (savingsReminderEnabled) {
      await scheduleSavingsReminder({ frequency: freq, time: savingsReminderTime });
      loadScheduledCount();
    }
  };

  const handleSavingsTimeChange = async (time) => {
    await setSavingsReminder(savingsReminderEnabled, savingsReminderFrequency, time);
    if (savingsReminderEnabled) {
      await scheduleSavingsReminder({ frequency: savingsReminderFrequency, time });
    }
  };

  const handleDailySummaryTimeChange = async (time) => {
    await setDailySummary(dailySummaryEnabled, time);
    if (dailySummaryEnabled) {
      await scheduleDailySummary({ enabled: true, time });
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Hapus semua notifikasi yang dijadwalkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            await setBudgetAlert(false, budgetAlertThreshold);
            await setSavingsReminder(false, savingsReminderFrequency, savingsReminderTime);
            await setDailySummary(false, dailySummaryTime);
            loadScheduledCount();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700' }}>
            Notifikasi
          </Text>
          <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4 }}>
            {scheduledCount} notifikasi terjadwal
          </Text>
        </View>

        {/* Permission Status */}
        {!permissionGranted && (
          <Card style={{ backgroundColor: Colors.warning + '15', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <BellOff size={22} color={Colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.warning, fontWeight: '700' }}>
                  Notifikasi Diblokir
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  Izinkan notifikasi di Settings untuk menerima alert
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* 1. Budget Alerts */}
        <Card style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: Colors.danger + '20',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingDown size={20} color={Colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '600' }}>
                  Budget Alert
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                  Peringatan saat budget terlampaui
                </Text>
              </View>
            </View>
            <Switch
              value={budgetAlertEnabled}
              onValueChange={handleBudgetAlertToggle}
              trackColor={{ false: Colors.border, true: Colors.danger + '80' }}
              thumbColor={budgetAlertEnabled ? Colors.danger : '#9FA5B4'}
            />
          </View>

          {budgetAlertEnabled && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 10 }}>
                Threshold Alert
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[50, 80, 90, 100].map(threshold => (
                  <TouchableOpacity
                    key={threshold}
                    onPress={() => setBudgetAlert(true, threshold)}
                    style={{
                      flex: 1,
                      backgroundColor: budgetAlertThreshold === threshold ? Colors.danger + '20' : Colors.card,
                      borderWidth: 2,
                      borderColor: budgetAlertThreshold === threshold ? Colors.danger : 'transparent',
                      borderRadius: 8,
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: budgetAlertThreshold === threshold ? Colors.danger : Colors.text,
                      fontWeight: budgetAlertThreshold === threshold ? '700' : '400',
                      fontSize: 13,
                    }}>
                      {threshold}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 8, textAlign: 'center' }}>
                Notifikasi muncul saat pengeluaran ≥ {budgetAlertThreshold}% dari budget
              </Text>
            </View>
          )}
        </Card>

        {/* 2. Savings Reminder */}
        <Card style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: Colors.success + '20',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <PieChart size={20} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '600' }}>
                  Savings Reminder
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                  Pengingat rutin untuk nabung
                </Text>
              </View>
            </View>
            <Switch
              value={savingsReminderEnabled}
              onValueChange={handleSavingsReminderToggle}
              trackColor={{ false: Colors.border, true: Colors.success + '80' }}
              thumbColor={savingsReminderEnabled ? Colors.success : '#9FA5B4'}
            />
          </View>

          {savingsReminderEnabled && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 10 }}>
                Frekuensi
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { key: 'daily', label: 'Harian' },
                  { key: 'weekly', label: 'Mingguan' },
                  { key: 'monthly', label: 'Bulanan' },
                ].map(freq => (
                  <TouchableOpacity
                    key={freq.key}
                    onPress={() => handleSavingsFrequencyChange(freq.key)}
                    style={{
                      flex: 1,
                      backgroundColor: savingsReminderFrequency === freq.key ? Colors.success + '20' : Colors.card,
                      borderWidth: 2,
                      borderColor: savingsReminderFrequency === freq.key ? Colors.success : 'transparent',
                      borderRadius: 8,
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      color: savingsReminderFrequency === freq.key ? Colors.success : Colors.text,
                      fontWeight: savingsReminderFrequency === freq.key ? '700' : '400',
                      fontSize: 13,
                    }}>
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TimePickerRow
                label="Waktu"
                value={savingsReminderTime}
                onChange={handleSavingsTimeChange}
              />
            </View>
          )}
        </Card>

        {/* 3. Daily Summary */}
        <Card style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: Colors.primary + '20',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Clock size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '600' }}>
                  Daily Summary
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                  Ringkasan transaksi harian
                </Text>
              </View>
            </View>
            <Switch
              value={dailySummaryEnabled}
              onValueChange={handleDailySummaryToggle}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={dailySummaryEnabled ? Colors.primary : '#9FA5B4'}
            />
          </View>

          {dailySummaryEnabled && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <TimePickerRow
                label="Waktu Ringkasan"
                value={dailySummaryTime}
                onChange={handleDailySummaryTimeChange}
              />
            </View>
          )}
        </Card>

        {/* Clear All */}
        {scheduledCount > 0 && (
          <SolidButton
            title="Clear All Notifications"
            onPress={handleClearAll}
            variant="danger"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;