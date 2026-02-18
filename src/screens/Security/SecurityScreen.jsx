import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Fingerprint, Lock, ChevronRight } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { Colors } from '../../theme/colors';
import { useSecurityStore } from '../../store/useSecurityStore';

const SecurityScreen = ({ navigation }) => {
  const {
    isPinSet,
    isBiometricEnabled,
    isBiometricSupported,
    setBiometricEnabled,
    initSecurity,
  } = useSecurityStore();

  useEffect(() => { initSecurity(); }, []);

  const handleToggleBiometric = async (val) => {
    if (!isPinSet) {
      Alert.alert('Perlu PIN dulu', 'Buat PIN terlebih dahulu sebelum mengaktifkan biometric.');
      return;
    }
    await setBiometricEnabled(val);
  };

  const handlePinAction = () => {
    navigation.navigate('SetupPin', { isChange: isPinSet });
  };

  const rows = [
    {
      icon: Lock,
      iconColor: Colors.primary,
      title: isPinSet ? 'Ubah PIN' : 'Buat PIN',
      subtitle: isPinSet
        ? 'Ubah PIN 4 digit yang aktif'
        : 'Buat PIN untuk mengunci aplikasi',
      onPress: handlePinAction,
      trailing: <ChevronRight size={18} color={Colors.textMuted} />,
    },
    {
      icon: Fingerprint,
      iconColor: '#4ECDC4',
      title: 'Biometric / Fingerprint',
      subtitle: isBiometricSupported
        ? isPinSet
          ? 'Gunakan sidik jari untuk buka aplikasi'
          : 'Aktifkan PIN dulu untuk menggunakan biometric'
        : 'Perangkat tidak mendukung biometric',
      trailing: (
        <Switch
          value={isBiometricEnabled}
          onValueChange={handleToggleBiometric}
          disabled={!isBiometricSupported || !isPinSet}
          trackColor={{ false: '#2A2D35', true: Colors.primary + '80' }}
          thumbColor={isBiometricEnabled ? Colors.primary : '#9FA5B4'}
        />
      ),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700' }}>Keamanan</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Status Banner */}
        <Card style={{
          marginBottom: 24,
          backgroundColor: isPinSet ? Colors.success + '15' : Colors.warning + '15',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: isPinSet ? Colors.success + '25' : '#FFA72625',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={22} color={isPinSet ? Colors.success : '#FFA726'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: isPinSet ? Colors.success : '#FFA726',
              fontWeight: '700', fontSize: 15,
            }}>
              {isPinSet ? 'Aplikasi Terlindungi' : 'Belum Ada Keamanan'}
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
              {isPinSet
                ? `PIN aktif${isBiometricEnabled ? ' · Biometric aktif' : ''}`
                : 'Buat PIN untuk melindungi data keuangan Anda'}
            </Text>
          </View>
        </Card>

        {/* Settings Rows */}
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          {rows.map((row, idx) => {
            const IconComp = row.icon;
            return (
              <TouchableOpacity
                key={idx}
                onPress={row.onPress}
                disabled={!row.onPress}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 16,
                  borderTopWidth: idx !== 0 ? 1 : 0, borderTopColor: '#2A2D35',
                }}
                activeOpacity={row.onPress ? 0.7 : 1}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: (row.iconColor || Colors.primary) + '20',
                  alignItems: 'center', justifyContent: 'center', marginRight: 14,
                }}>
                  <IconComp size={20} color={row.iconColor || Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '500' }}>
                    {row.title}
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                    {row.subtitle}
                  </Text>
                </View>
                {row.trailing}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Info box */}
        <Card style={{ backgroundColor: Colors.primary + '10' }}>
          <Text style={{ color: Colors.textMuted, fontSize: 13, lineHeight: 20 }}>
            💡 PIN disimpan secara aman menggunakan <Text style={{ color: Colors.primary }}>Expo SecureStore</Text> dan tidak dapat dibaca oleh siapapun, termasuk pengembang aplikasi.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecurityScreen;