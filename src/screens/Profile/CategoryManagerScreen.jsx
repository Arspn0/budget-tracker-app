import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Lock } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { SolidButton, OutlineButton } from '../../components/Button';
import { Colors } from '../../theme/colors';
import { useCategoryStore } from '../../store/useCategoryStore';

const CAT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#AA96DA', '#F38181',
  '#95E1D3', '#FCBAD3', '#A8D8EA', '#3ED6C4',
  '#4CAF50', '#FFA726', '#8BC34A', '#9FA5B4',
];

const AddCategoryModal = ({ visible, onClose, onSave, type }) => {
  const [name, setName]   = useState('');
  const [color, setColor] = useState(CAT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) { setName(''); setColor(CAT_COLORS[0]); }
  }, [visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama kategori tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), type, color, icon: 'tag' });
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: Colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
        }}>
          <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 20 }}>
            Tambah Kategori {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          </Text>

          <Text style={{ color: Colors.text, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            Nama Kategori *
          </Text>
          <View style={{
            backgroundColor: Colors.background,
            borderRadius: 12,
            paddingHorizontal: 14,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: name ? Colors.primary : 'transparent',
          }}>
            <RNTextInput
              value={name}
              onChangeText={setName}
              placeholder="Contoh: Kopi, Gym, Freelance..."
              placeholderTextColor={Colors.textMuted}
              style={{ color: Colors.text, fontSize: 15, paddingVertical: 13 }}
            />
          </View>

          <Text style={{ color: Colors.text, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>
            Warna
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {CAT_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: c,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: color === c ? 3 : 0,
                  borderColor: Colors.text,
                }}
              >
                {color === c && (
                  <Text style={{ color: Colors.text, fontWeight: '700' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.background,
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
          }}>
            <View style={{
              width: 10, height: 10, borderRadius: 5,
              backgroundColor: color, marginRight: 10,
            }} />
            <Text style={{ color: Colors.text, fontSize: 14 }}>
              {name || 'Preview Kategori'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <OutlineButton title="Batal" onPress={onClose} disabled={saving} />
            </View>
            <View style={{ flex: 1 }}>
              <SolidButton
                title={saving ? 'Menyimpan...' : 'Tambah'}
                onPress={handleSave}
                disabled={saving}
                loading={saving}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CategoryManagerScreen = () => {
  const [activeTab, setActiveTab]   = useState('expense');
  const [showModal, setShowModal]   = useState(false);
  const hasFetched = useRef(false);

  const { categories, fetchCategories, addCategory, deleteCategory } = useCategoryStore();

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCategories();
    }
  }, []);

  const filtered = categories.filter(c => c.type === activeTab);

  const handleDelete = (cat) => {
    if (!cat.is_custom) {
      Alert.alert('Tidak Bisa Dihapus', 'Kategori default tidak bisa dihapus.');
      return;
    }
    Alert.alert(
      'Hapus Kategori',
      `Hapus kategori "${cat.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(cat.id);
            } catch (e) {
              Alert.alert('Error', 'Gagal menghapus kategori');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700' }}>
          Kelola Kategori
        </Text>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={{ backgroundColor: Colors.primary, borderRadius: 50, padding: 12 }}
        >
          <Plus size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Toggle */}
      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 20 }}>
        {[
          { key: 'expense', label: 'Pengeluaran' },
          { key: 'income',  label: 'Pemasukan' },
        ].map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: active ? Colors.primary : Colors.card,
                marginHorizontal: 4,
              }}
            >
              <Text style={{
                color: active ? Colors.text : Colors.textMuted,
                fontWeight: active ? '700' : '400',
                fontSize: 14,
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Count */}
        <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 12 }}>
          {filtered.length} kategori ·{' '}
          {filtered.filter(c => c.is_custom).length} custom
        </Text>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ color: Colors.textMuted }}>Belum ada kategori</Text>
            </View>
          ) : (
            filtered.map((cat, idx) => (
              <View
                key={cat.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderTopWidth: idx !== 0 ? 1 : 0,
                  borderTopColor: '#2A2D35',
                }}
              >
                {/* Color dot */}
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: (cat.color || Colors.primary) + '25',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <View style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: cat.color || Colors.primary,
                  }} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '500' }}>
                    {cat.name}
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                    {cat.is_custom ? 'Custom' : 'Default'}
                  </Text>
                </View>

                {cat.is_custom ? (
                  <TouchableOpacity
                    onPress={() => handleDelete(cat)}
                    style={{ padding: 8 }}
                  >
                    <Trash2 size={18} color={Colors.danger} />
                  </TouchableOpacity>
                ) : (
                  <View style={{ padding: 8 }}>
                    <Lock size={16} color={Colors.textMuted} />
                  </View>
                )}
              </View>
            ))
          )}
        </Card>

        {/* Hint */}
        <Text style={{
          color: Colors.textMuted,
          fontSize: 12,
          textAlign: 'center',
          marginTop: 16,
        }}>
          🔒 Kategori default tidak dapat dihapus
        </Text>
      </ScrollView>

      <AddCategoryModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        type={activeTab}
        onSave={addCategory}
      />
    </SafeAreaView>
  );
};

export default CategoryManagerScreen;