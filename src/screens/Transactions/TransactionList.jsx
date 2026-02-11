import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Wallet } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { Colors } from '../../theme/colors';
import { useTransactionStore } from '../../store/useTransactionStore';
import { formatCurrency } from '../../utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const TransactionListScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    transactions, 
    fetchTransactions,
    loading 
  } = useTransactionStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 py-6 flex-row items-center justify-between">
        <Text className="text-text text-2xl font-bold">Transaksi</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddTransaction')}
          className="bg-primary rounded-full p-3"
        >
          <Plus size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View className="py-8">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : transactions.length === 0 ? (
          <Card className="items-center py-8">
            <Wallet size={48} color={Colors.textMuted} />
            <Text className="text-textMuted mt-3">Belum ada transaksi</Text>
            <Text className="text-textMuted text-xs mt-1">
              Tap tombol + untuk menambah transaksi
            </Text>
          </Card>
        ) : (
          Object.keys(groupedTransactions).map((date) => (
            <View key={date} className="mb-4">
              <Text className="text-textMuted text-sm mb-2">
                {new Date(date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              
              <Card>
                {groupedTransactions[date].map((transaction, index) => (
                  <TouchableOpacity
                    key={transaction.id}
                    onPress={() => navigation.navigate('TransactionDetail', {
                      transactionId: transaction.id
                    })}
                    className={`flex-row items-center justify-between py-3 ${
                      index !== 0 ? 'border-t border-border' : ''
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="text-text font-medium">
                        {transaction.category_name}
                      </Text>
                      {transaction.note && (
                        <Text className="text-textMuted text-xs mt-1">
                          {transaction.note}
                        </Text>
                      )}
                      <Text className="text-textMuted text-xs mt-1">
                        {transaction.wallet_name}
                      </Text>
                    </View>
                    <Text className={`font-bold text-lg ${
                      transaction.type === 'income' 
                        ? 'text-success' 
                        : 'text-danger'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionListScreen;