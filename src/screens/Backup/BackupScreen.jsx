import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Upload, Download, Database, AlertCircle,
  CheckCircle, Archive, RefreshCw,
} from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { SolidButton, OutlineButton } from '../../components/Button';
import { useThemeStore } from '../../store/useThemeStore';
import { exportBackup, importBackup, getBackupStats } from '../../utils/backupUtils';

const BackupScreen = ({ navigation }) => {
  const Colors = useThemeStore();

  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const s = await getBackupStats();
    setStats(s);
    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportBackup();
      Alert.alert(
        '✅ Backup Berhasil',
        `${result.recordCount} data berhasil di-backup.\n\nFile: ${result.path.split('/').pop()}`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('❌ Gagal Export', e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = () => {
    Alert.alert(
      '⚠️ Peringatan',
      'Restore akan MENGHAPUS semua data saat ini dan menggantinya dengan data dari backup.\n\nLanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjutkan',
          style: 'destructive',
          onPress: async () => {
            setImporting(true);
            try {
              const result = await importBackup();
              if (result.success) {
                Alert.alert(
                  '✅ Restore Berhasil',
                  `${result.recordCount} data berhasil di-restore.\n\nBackup dari: ${new Date(result.timestamp).toLocaleString('id-ID')}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        loadStats();
                        // Force reload app state
                        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                      },
                    },
                  ]
                );
              }
            } catch (e) {
              Alert.alert('❌ Gagal Import', e.message);
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Text style={{ color: Colors.text, fontSize: 22, fontWeight: '700' }}>
          Backup & Restore
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <Card style={{
          marginBottom: 24,
          backgroundColor: Colors.info + '15',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <Database size={22} color={Colors.info} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.info, fontWeight: '700', fontSize: 15 }}>
              Amankan Data Anda
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
              Export backup sebagai file JSON yang bisa disimpan di Google Drive, Dropbox, atau cloud storage lainnya.
            </Text>
          </View>
        </Card>

        {/* Stats Card */}
        <Card style={{ marginBottom: 24 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>
              Data Saat Ini
            </Text>
            <TouchableOpacity onPress={loadStats} disabled={loading}>
              <RefreshCw
                size={18}
                color={Colors.primary}
                style={{ opacity: loading ? 0.5 : 1 }}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <View style={{ gap: 12 }}>
              {[
                { label: 'Transaksi',  value: stats?.transactions || 0, icon: '💸' },
                { label: 'Dompet',     value: stats?.wallets      || 0, icon: '💳' },
                { label: 'Tabungan',   value: stats?.savings      || 0, icon: '🐷' },
                { label: 'Budget',     value: stats?.budgets      || 0, icon: '📊' },
              ].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderTopWidth: idx !== 0 ? 1 : 0,
                    borderTopColor: Colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                    <Text style={{ color: Colors.text, fontSize: 15 }}>{item.label}</Text>
                  </View>
                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 16 }}>
                    {item.value}
                  </Text>
                </View>
              ))}

              <View style={{
                marginTop: 8,
                paddingTop: 16,
                borderTopWidth: 2,
                borderTopColor: Colors.border,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '700' }}>
                    Total Data
                  </Text>
                  <Text style={{ color: Colors.primary, fontSize: 18, fontWeight: '800' }}>
                    {stats?.total || 0}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Export Button */}
        <TouchableOpacity
          onPress={handleExport}
          disabled={exporting || loading}
          style={{
            backgroundColor: Colors.success + '15',
            borderRadius: 16,
            padding: 18,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.success + '40',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: Colors.success + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}>
            {exporting ? (
              <ActivityIndicator size="small" color={Colors.success} />
            ) : (
              <Upload size={24} color={Colors.success} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>
              Export Backup
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
              Simpan semua data ke file JSON
            </Text>
          </View>
        </TouchableOpacity>

        {/* Import Button */}
        <TouchableOpacity
          onPress={handleImport}
          disabled={importing || loading}
          style={{
            backgroundColor: Colors.primary + '15',
            borderRadius: 16,
            padding: 18,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.primary + '40',
            opacity: importing ? 0.6 : 1,
          }}
        >
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: Colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}>
            {importing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Download size={24} color={Colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>
              Restore Backup
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
              Pulihkan data dari file backup
            </Text>
          </View>
        </TouchableOpacity>

        {/* Warning Card */}
        <Card style={{ backgroundColor: Colors.warning + '10' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={20} color={Colors.warning} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.warning, fontWeight: '700', fontSize: 14 }}>
                ⚠️ Perhatian
              </Text>
              <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
                • Restore akan menghapus semua data saat ini{'\n'}
                • Pastikan backup sudah tersimpan aman{'\n'}
                • Backup tidak terenkripsi — jangan bagikan sembarangan
              </Text>
            </View>
          </View>
        </Card>

        {/* Tips */}
        <View style={{ marginTop: 24 }}>
          <Text style={{
            color: Colors.textMuted,
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 12,
          }}>
            Tips Backup
          </Text>

          {[
            { icon: CheckCircle, text: 'Export backup secara rutin (mingguan/bulanan)' },
            { icon: Archive,      text: 'Simpan backup di cloud storage (Google Drive, Dropbox)' },
            { icon: Database,     text: 'Buat backup sebelum update aplikasi' },
          ].map((tip, idx) => {
            const IconComp = tip.icon;
            return (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <IconComp size={16} color={Colors.success} />
                <Text style={{ color: Colors.textMuted, fontSize: 13, flex: 1 }}>
                  {tip.text}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BackupScreen;