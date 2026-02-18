import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Vibration, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Delete, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/useTheme';
import { useSecurityStore } from '../../store/useSecurityStore';

const PIN_LENGTH = 4;
const Dot = ({ filled }) => (
  <View style={{
    width: 16, height: 16, borderRadius: 8, marginHorizontal: 10,
    backgroundColor: filled ? Colors.primary : 'transparent',
    borderWidth: 2, borderColor: filled ? Colors.primary : '#4A4D5A',
  }} />
);
const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];

export const SetupPinScreen = ({ navigation, route }) => {
  const Colors = useTheme();
  const isChange = route?.params?.isChange ?? false;
  const [step, setStep]         = useState(isChange ? 'verify' : 'enter');
  const [pin, setPin]           = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError]       = useState('');
  const shakeAnim               = useRef(new Animated.Value(0)).current;
  const { setPin: savePin, verifyPin, removePin } = useSecurityStore();

  useEffect(() => { if (pin.length === PIN_LENGTH) handleComplete(); }, [pin]);

  const shake = () => {
    Vibration.vibrate(300);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleComplete = async () => {
    if (step === 'verify') {
      const ok = await verifyPin(pin);
      if (ok) { setStep('enter'); setPin(''); setError(''); }
      else { shake(); setError('PIN lama salah'); setTimeout(() => { setPin(''); setError(''); }, 800); }
      return;
    }
    if (step === 'enter') { setFirstPin(pin); setStep('confirm'); setPin(''); setError(''); return; }
    if (step === 'confirm') {
      if (pin === firstPin) {
        await savePin(pin);
        Alert.alert('Berhasil', isChange ? 'PIN berhasil diubah' : 'PIN berhasil dibuat',
          [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        shake();
        setError('PIN tidak cocok. Ulangi.');
        setTimeout(() => { setStep('enter'); setFirstPin(''); setPin(''); setError(''); }, 900);
      }
    }
  };

  const handleKey = (key) => {
    if (key === 'del') { setPin(p => p.slice(0, -1)); setError(''); return; }
    if (key === '') return;
    if (pin.length < PIN_LENGTH) { setPin(p => p + key); setError(''); }
  };

  const titles    = { verify: 'Masukkan PIN Lama', enter: 'Buat PIN Baru', confirm: 'Konfirmasi PIN' };
  const subtitles = { verify: 'Verifikasi PIN aktif', enter: 'Pilih 4 digit PIN', confirm: 'Ketik ulang PIN yang sama' };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 32 }}>
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700' }}>{titles[step]}</Text>
          <Text style={{ color: Colors.textMuted, fontSize: 14, marginTop: 6 }}>{subtitles[step]}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
            {['enter','confirm'].map((s, i) => (
              <View key={s} style={{
                width: 28, height: 4, borderRadius: 2,
                backgroundColor: (step === 'enter' && i === 0) || step === 'confirm' ? Colors.primary : '#2A2D35',
              }} />
            ))}
          </View>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Animated.View style={{ flexDirection: 'row', marginBottom: 14, transform: [{ translateX: shakeAnim }] }}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => <Dot key={i} filled={i < pin.length} />)}
          </Animated.View>
          <View style={{ height: 20, justifyContent: 'center' }}>
            {error ? <Text style={{ color: Colors.danger, fontSize: 13 }}>{error}</Text> : null}
          </View>
        </View>

        <View style={{ width: '100%', paddingHorizontal: 44 }}>
          {[0,1,2,3].map(row => (
            <View key={row} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              {KEYS.slice(row*3, row*3+3).map((key, ci) => {
                const isDel = key === 'del', isEmpty = key === '';
                return (
                  <TouchableOpacity key={`${row}-${ci}`} onPress={() => handleKey(key)} style={{
                    width: 76, height: 76, borderRadius: 38,
                    backgroundColor: (isDel||isEmpty) ? 'transparent' : Colors.card,
                    alignItems: 'center', justifyContent: 'center',
                    elevation: (isDel||isEmpty) ? 0 : 2, opacity: isEmpty ? 0 : 1,
                  }} activeOpacity={0.65}>
                    {isDel
                      ? <Delete size={28} color={Colors.textMuted} />
                      : <Text style={{ color: Colors.text, fontSize: 28, fontWeight: '400' }}>{key}</Text>
                    }
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {isChange && (
          <TouchableOpacity onPress={() => Alert.alert('Hapus PIN','Hapus PIN? Aplikasi tidak akan terkunci.',[
            { text: 'Batal', style: 'cancel' },
            { text: 'Hapus', style: 'destructive', onPress: async () => { await removePin(); navigation.goBack(); }},
          ])}>
            <Text style={{ color: Colors.danger, fontSize: 14, fontWeight: '600' }}>Hapus PIN</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};