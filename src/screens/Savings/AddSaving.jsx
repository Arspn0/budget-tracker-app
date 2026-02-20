import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, PiggyBank } from 'lucide-react-native';
import { TextInput } from '../../components/Input/TextInput';
import { SolidButton, OutlineButton } from '../../components/Button';
import { Card } from '../../components/Card/Card';
import { useThemeStore } from '../../store/useThemeStore';
import { useSavingStore } from '../../store/useSavingStore';

const SAVING_COLORS = [
  '#3ED6C4', '#FF6B6B', '#4ECDC4', '#AA96DA',
  '#F38181', '#4CAF50', '#FFA726', '#A8D8EA',
];

const AddSavingScreen = ({ navigation }) => {
  const Colors = useThemeStore();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedColor, setSelectedColor] = useState(SAVING_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const { addSaving } = useSavingStore();

  const validateDeadline = (dateStr) => {
    if (!dateStr) return true;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama target tidak boleh kosong');
      return;
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      Alert.alert('Error', 'Masukkan target jumlah yang valid');
      return;
    }
    if (deadline && !validateDeadline(deadline)) {
      Alert.alert('Error', 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD');
      return;
    }

    setSaving(true);
    try {
      await addSaving({
        name: name.trim(),
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        deadline: deadline || null,
        color: selectedColor,
        icon: 'piggy-bank',
      });

      Alert.alert(
        'Berhasil',
        'Target tabungan berhasil dibuat!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal membuat target tabungan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Calculate weekly suggestion if deadline is set
  const getWeeklySuggestion = () => {
    if (!targetAmount || !deadline || !validateDeadline(deadline)) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 0) return null;
    const weeksRemaining = Math.ceil(daysRemaining / 7);
    return Math.ceil(parseFloat(targetAmount) / weeksRemaining);
  };

  const weeklySuggestion = getWeeklySuggestion();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon Preview */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: selectedColor + '25',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PiggyBank size={36} color={selectedColor} />
          </View>
        </View>

        {/* Name Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            color: Colors.text,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
          }}>
            Nama Target *
          </Text>
          <View style={{
            backgroundColor: Colors.card,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: name ? Colors.primary : 'transparent',
          }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Contoh: Beli Laptop, Liburan Bali..."
              style={{ marginBottom: 0 }}
            />
          </View>
        </View>

        {/* Target Amount */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            color: Colors.text,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
          }}>
            Target Jumlah *
          </Text>
          <View style={{
            backgroundColor: Colors.card,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: targetAmount ? Colors.primary : 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}>
            <Text style={{ color: Colors.textMuted, fontSize: 16, marginRight: 8 }}>
              Rp
            </Text>
            <TextInput
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="0"
              keyboardType="numeric"
              style={{ flex: 1, marginBottom: 0 }}
            />
          </View>
        </View>

        {/* Deadline */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            color: Colors.text,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
          }}>
            Deadline (Opsional)
          </Text>
          <View style={{
            backgroundColor: Colors.card,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: deadline ? Colors.primary : 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}>
            <Calendar size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              value={deadline}
              onChangeText={setDeadline}
              placeholder="YYYY-MM-DD (contoh: 2025-12-31)"
              style={{ flex: 1, marginBottom: 0 }}
            />
          </View>
        </View>

        {/* Weekly Suggestion */}
        {weeklySuggestion && (
          <Card style={{ marginBottom: 20, backgroundColor: Colors.primary + '15' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 14 }}>
                  Saran Menabung
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
                  Tabung{' '}
                  <Text style={{ color: Colors.text, fontWeight: '700' }}>
                    Rp {weeklySuggestion.toLocaleString('id-ID')}
                  </Text>
                  {' '}per minggu agar target tercapai
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Color Selection */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{
            color: Colors.text,
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 12,
          }}>
            Warna
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {SAVING_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: selectedColor === color ? 3 : 0,
                  borderColor: Colors.text,
                }}
              >
                {selectedColor === color && (
                  <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16 }}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <OutlineButton
              title="Batal"
              onPress={() => navigation.goBack()}
              disabled={saving}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SolidButton
              title={saving ? 'Menyimpan...' : 'Buat Target'}
              onPress={handleSave}
              disabled={saving}
              loading={saving}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddSavingScreen;