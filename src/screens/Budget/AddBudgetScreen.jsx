import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SolidButton, OutlineButton } from '../../components/Button';
import { Card } from '../../components/Card/Card';
import { useTheme } from '../../theme/useTheme';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { formatCurrency } from '../../utils/helpers';

const AddBudgetScreen = ({ navigation }) => {
  const Colors = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [limitAmount, setLimitAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const { addBudget, budgets } = useBudgetStore();
  const { categories, fetchCategories } = useCategoryStore();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchCategories('expense');
  }, []);

  // Filter out categories that already have a budget this month
  const existingBudgetCategoryIds = budgets.map(b => b.category_id);
  const availableCategories = categories.filter(
    cat => cat.type === 'expense' && !existingBudgetCategoryIds.includes(cat.id)
  );

  const handleSave = async () => {
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Pilih kategori terlebih dahulu');
      return;
    }
    if (!limitAmount || parseFloat(limitAmount) <= 0) {
      Alert.alert('Error', 'Masukkan limit budget yang valid');
      return;
    }

    setSaving(true);
    try {
      await addBudget({
        category_id: selectedCategoryId,
        limit_amount: parseFloat(limitAmount),
        period: 'monthly',
        month: currentMonth,
        year: currentYear,
      });

      Alert.alert(
        'Berhasil',
        'Budget berhasil dibuat!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal membuat budget: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Month Info */}
        <Card style={{ marginBottom: 24, backgroundColor: Colors.primary + '15' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>📅</Text>
            <View>
              <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Budget untuk</Text>
              <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>
                {currentDate.toLocaleDateString('id-ID', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </Card>

        {/* Category Selection */}
        <Text style={{
          color: Colors.text,
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 12,
        }}>
          Pilih Kategori *
        </Text>

        {availableCategories.length === 0 ? (
          <Card style={{ marginBottom: 20, alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: Colors.textMuted, fontSize: 14, textAlign: 'center' }}>
              Semua kategori sudah memiliki budget bulan ini
            </Text>
          </Card>
        ) : (
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 24,
          }}>
            {availableCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  style={{
                    backgroundColor: isSelected
                      ? (cat.color || Colors.primary) + '25'
                      : Colors.card,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? (cat.color || Colors.primary)
                      : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <View style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: cat.color || Colors.primary,
                  }} />
                  <Text style={{
                    color: isSelected ? Colors.text : Colors.textMuted,
                    fontWeight: isSelected ? '600' : '400',
                    fontSize: 14,
                  }}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Limit Amount */}
        <Text style={{
          color: Colors.text,
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 12,
        }}>
          Limit Budget *
          {selectedCategory && (
            <Text style={{ color: Colors.textMuted, fontWeight: '400' }}>
              {' '}— {selectedCategory.name}
            </Text>
          )}
        </Text>

        <View style={{
          backgroundColor: Colors.card,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: limitAmount ? Colors.primary : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 12,
        }}>
          <Text style={{ color: Colors.textMuted, fontSize: 18, marginRight: 8 }}>
            Rp
          </Text>
          <RNTextInput
            value={limitAmount}
            onChangeText={setLimitAmount}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            style={{
              flex: 1,
              color: Colors.text,
              fontSize: 18,
              fontWeight: '600',
              paddingVertical: 16,
            }}
          />
        </View>

        {/* Quick Amount Chips */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 28,
        }}>
          {[500000, 1000000, 1500000, 2000000, 3000000, 5000000].map((amount) => (
            <TouchableOpacity
              key={amount}
              onPress={() => setLimitAmount(amount.toString())}
              style={{
                backgroundColor: limitAmount === amount.toString()
                  ? Colors.primary
                  : Colors.card,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{
                color: limitAmount === amount.toString()
                  ? Colors.text
                  : Colors.textMuted,
                fontSize: 13,
                fontWeight: '500',
              }}>
                {formatCurrency(amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview */}
        {selectedCategory && limitAmount && parseFloat(limitAmount) > 0 && (
          <Card style={{ marginBottom: 24, backgroundColor: Colors.primary + '10' }}>
            <Text style={{ color: Colors.textMuted, fontSize: 12, marginBottom: 8 }}>
              Preview Budget
            </Text>
            <Text style={{ color: Colors.text, fontSize: 15 }}>
              Kategori{' '}
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                {selectedCategory.name}
              </Text>
              {' '}dengan limit{' '}
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>
                {formatCurrency(parseFloat(limitAmount))}
              </Text>
              {' '}per bulan
            </Text>
          </Card>
        )}

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
              title={saving ? 'Menyimpan...' : 'Simpan Budget'}
              onPress={handleSave}
              disabled={saving || availableCategories.length === 0}
              loading={saving}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddBudgetScreen;