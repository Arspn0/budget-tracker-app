import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  Animated, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fingerprint, Delete } from 'lucide-react-native';
import { useTheme } from '../store/useTheme';
import { useSecurityStore } from '../store/useSecurityStore';

const PIN_LENGTH = 4;
const Colors = useTheme();

const Dot = ({ filled }) => (
  <View style={{
    width: 16, height: 16, borderRadius: 8,
    marginHorizontal: 10,
    backgroundColor: filled ? Colors.primary : 'transparent',
    borderWidth: 2,
    borderColor: filled ? Colors.primary : '#4A4D5A',
  }} />
);

const PAD_KEYS = [
  '1','2','3',
  '4','5','6',
  '7','8','9',
  'bio','0','del',
];

const LockScreen = ({ onUnlock }) => {
  const Colors = useTheme();

  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [attempts, setAttempts] = useState(0);
  const shakeAnim               = useRef(new Animated.Value(0)).current;

  const {
    verifyPin, authenticateWithBiometric,
    isBiometricEnabled, isBiometricSupported, unlock,
  } = useSecurityStore();

  useEffect(() => {
    if (isBiometricEnabled && isBiometricSupported) {
      handleBiometric();
    }
  }, []);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) verifyInput(pin);
  }, [pin]);

  const shake = () => {
    Vibration.vibrate(400);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const verifyInput = async (input) => {
    const ok = await verifyPin(input);
    if (ok) {
      unlock();
      onUnlock?.();
    } else {
      shake();
      const n = attempts + 1;
      setAttempts(n);
      setError(n >= 5 ? `${n}x percobaan salah. Coba lagi.` : 'PIN salah. Coba lagi.');
      setTimeout(() => { setPin(''); setError(''); }, 800);
    }
  };

  const handleBiometric = async () => {
    const ok = await authenticateWithBiometric();
    if (ok) onUnlock?.();
  };

  const handleKey = (key) => {
    if (key === 'del') { setPin(p => p.slice(0, -1)); setError(''); return; }
    if (key === 'bio') { handleBiometric(); return; }
    if (pin.length < PIN_LENGTH) { setPin(p => p + key); setError(''); }
  };

  const showBio = isBiometricEnabled && isBiometricSupported;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 48,
      }}>
        {/* Top */}
        <View style={{ alignItems: 'center' }}>
          <View style={{
            width: 76, height: 76, borderRadius: 22,
            backgroundColor: Colors.primary + '20',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Text style={{ fontSize: 38 }}>💰</Text>
          </View>
          <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700' }}>
            Budget Tracker
          </Text>
          <Text style={{ color: Colors.textMuted, fontSize: 14, marginTop: 6 }}>
            Masukkan PIN untuk melanjutkan
          </Text>
        </View>

        {/* Dots + Error */}
        <View style={{ alignItems: 'center' }}>
          <Animated.View style={{
            flexDirection: 'row',
            marginBottom: 14,
            transform: [{ translateX: shakeAnim }],
          }}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <Dot key={i} filled={i < pin.length} />
            ))}
          </Animated.View>
          <View style={{ height: 20, justifyContent: 'center' }}>
            {error ? (
              <Text style={{ color: Colors.danger, fontSize: 13 }}>{error}</Text>
            ) : null}
          </View>
        </View>

        {/* Numpad */}
        <View style={{ width: '100%', paddingHorizontal: 44 }}>
          {[0, 1, 2, 3].map(row => (
            <View key={row} style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              {PAD_KEYS.slice(row * 3, row * 3 + 3).map(key => {
                const isBio = key === 'bio';
                const isDel = key === 'del';
                const hide  = isBio && !showBio;

                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => !hide && handleKey(key)}
                    style={{
                      width: 76, height: 76, borderRadius: 38,
                      backgroundColor: (isBio || isDel) ? 'transparent' : Colors.card,
                      alignItems: 'center', justifyContent: 'center',
                      elevation: (isBio || isDel) ? 0 : 2,
                      opacity: hide ? 0 : 1,
                    }}
                    activeOpacity={0.65}
                  >
                    {isBio ? (
                      <Fingerprint size={32} color={Colors.primary} />
                    ) : isDel ? (
                      <Delete size={28} color={Colors.textMuted} />
                    ) : (
                      <Text style={{
                        color: Colors.text,
                        fontSize: 28,
                        fontWeight: '400',
                      }}>
                        {key}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LockScreen;