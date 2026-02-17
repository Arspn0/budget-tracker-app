import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, Tag, Wallet, Shield, Moon, Sun,
  Bell, ChevronRight, HelpCircle, LogOut,
  Database, TrendingDown, FileText, CalendarDays
} from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { Colors } from '../../theme/colors';
import { useWalletStore } from '../../store/useWalletStore';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const { wallets, totalBalance, fetchWallets } = useWalletStore();
  const { isDarkMode, setDarkMode }             = useAppStore();
  const [notifEnabled, setNotifEnabled]         = useState(true);
  const [savingMode, setSavingMode]             = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchWallets();
    }, [])
  );

  // ── Menu Sections ──────────────────────────────────────────────────────
  const sections = [
    {
      title: 'Akun & Dompet',
      items: [
        {
          icon: Wallet,
          label: 'Kelola Dompet',
          subtitle: `${wallets.length} dompet · ${formatCurrency(totalBalance)}`,
          onPress: () => navigation.navigate('WalletManager'),
          iconColor: Colors.primary,
        },
        {
          icon: Tag,
          label: 'Kelola Kategori',
          subtitle: 'Tambah kategori custom',
          onPress: () => navigation.navigate('CategoryManager'),
          iconColor: '#AA96DA',
        },
      ],
    },
    {
      title: 'Laporan & Kalender',
      items: [
        {
          icon: FileText,
          label: 'Laporan Keuangan',
          subtitle: 'Export PDF & CSV',
          onPress: () => navigation.navigate('Report'),
          iconColor: Colors.danger,
        },
        {
          icon: CalendarDays,
          label: 'Kalender Finansial',
          subtitle: 'Lihat transaksi per hari',
          onPress: () => navigation.navigate('FinancialCalendar'),
          iconColor: '#4ECDC4',
        },
      ],
    },
    {
      title: 'Preferensi',
      items: [
        {
          icon: isDarkMode ? Moon : Sun,
          label: 'Dark Mode',
          subtitle: isDarkMode ? 'Aktif' : 'Nonaktif',
          iconColor: '#FFA726',
          trailing: (
            <Switch
              value={isDarkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#2A2D35', true: Colors.primary + '80' }}
              thumbColor={isDarkMode ? Colors.primary : '#9FA5B4'}
            />
          ),
        },
        {
          icon: Bell,
          label: 'Notifikasi',
          subtitle: notifEnabled ? 'Aktif' : 'Nonaktif',
          iconColor: '#4ECDC4',
          trailing: (
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: '#2A2D35', true: Colors.primary + '80' }}
              thumbColor={notifEnabled ? Colors.primary : '#9FA5B4'}
            />
          ),
        },
        {
          icon: TrendingDown,
          label: 'Mode Hemat',
          subtitle: savingMode ? 'Aktif — limit pengeluaran harian' : 'Nonaktif',
          iconColor: Colors.success,
          trailing: (
            <Switch
              value={savingMode}
              onValueChange={setSavingMode}
              trackColor={{ false: '#2A2D35', true: Colors.success + '80' }}
              thumbColor={savingMode ? Colors.success : '#9FA5B4'}
            />
          ),
        },
      ],
    },
    {
      title: 'Keamanan & Data',
      items: [
        {
          icon: Shield,
          label: 'Keamanan',
          subtitle: 'PIN & Biometric',
          onPress: () => Alert.alert('Coming Soon', 'Fitur keamanan akan segera hadir'),
          iconColor: Colors.danger,
        },
        {
          icon: Database,
          label: 'Backup & Restore',
          subtitle: 'Sinkronisasi data',
          onPress: () => Alert.alert('Coming Soon', 'Fitur backup akan segera hadir'),
          iconColor: '#8BC34A',
        },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        {
          icon: HelpCircle,
          label: 'Tentang Aplikasi',
          subtitle: 'Versi 1.0.0',
          onPress: () => Alert.alert(
            'Budget Tracker',
            'Versi 1.0.0\nDibuat dengan ❤️ menggunakan React Native + Expo',
            [{ text: 'OK' }]
          ),
          iconColor: Colors.textMuted,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20 }}>
          <Text style={{ color: Colors.text, fontSize: 24, fontWeight: '700' }}>
            Profile
          </Text>
        </View>

        {/* ── Balance Summary ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <Card style={{ backgroundColor: Colors.primary + '15' }}>
            <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 4 }}>
              Total Saldo Semua Dompet
            </Text>
            <Text style={{ color: Colors.primary, fontSize: 28, fontWeight: '800' }}>
              {formatCurrency(totalBalance)}
            </Text>

            {wallets.length > 0 && (
              <View style={{ marginTop: 16, gap: 10 }}>
                {wallets.map((wallet) => (
                  <View
                    key={wallet.id}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16 }}>
                        {wallet.type === 'cash' ? '💵'
                          : wallet.type === 'bank' ? '🏦'
                          : '📱'}
                      </Text>
                      <Text style={{ color: Colors.text, fontSize: 14 }}>
                        {wallet.name}
                      </Text>
                    </View>
                    <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 14 }}>
                      {formatCurrency(wallet.balance)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        {/* ── Menu Sections ── */}
        {sections.map((section, sIdx) => (
          <View key={sIdx} style={{ marginBottom: 24, paddingHorizontal: 20 }}>
            <Text style={{
              color: Colors.textMuted,
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 10,
            }}>
              {section.title}
            </Text>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {section.items.map((item, iIdx) => {
                const IconComp = item.icon;
                return (
                  <TouchableOpacity
                    key={iIdx}
                    onPress={item.onPress}
                    disabled={!item.onPress}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderTopWidth: iIdx !== 0 ? 1 : 0,
                      borderTopColor: '#2A2D35',
                    }}
                    activeOpacity={item.onPress ? 0.7 : 1}
                  >
                    {/* Icon */}
                    <View style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: (item.iconColor || Colors.primary) + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}>
                      <IconComp size={20} color={item.iconColor || Colors.primary} />
                    </View>

                    {/* Label + Subtitle */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '500' }}>
                        {item.label}
                      </Text>
                      {item.subtitle && (
                        <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>

                    {/* Trailing: chevron or switch */}
                    {item.trailing
                      ? item.trailing
                      : item.onPress
                        ? <ChevronRight size={18} color={Colors.textMuted} />
                        : null
                    }
                  </TouchableOpacity>
                );
              })}
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;