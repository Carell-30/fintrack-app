import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert, Animated, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { auth, db } from '../config/firebase';
import { deleteTransaction, getTransactions } from '../services/transactionService';
import AddTransaction from './AddTransaction';

// Swipeable Transaction Component
function SwipeableTransaction({ transaction, onDelete, onLongPress, formatDate }) {
  const pan = useState(new Animated.ValueXY())[0];
  const [swiped, setSwiped] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        pan.setValue({ x: gestureState.dx, y: 0 });
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -80) {
        Animated.timing(pan, {
          toValue: { x: -80, y: 0 },
          duration: 200,
          useNativeDriver: false,
        }).start();
        setSwiped(true);
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        setSwiped(false);
      }
    },
  });

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          onPress={() => onDelete(transaction.id, transaction.description)}
          style={styles.deleteAction}
        >
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[
          styles.transactionItem,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.transactionContent}
          onLongPress={() => onLongPress(transaction)}
          delayLongPress={500}
        >
          <View style={styles.transactionLeft}>
            <View style={[styles.transactionIcon, { backgroundColor: '#fee2e2' }]}>
              <MaterialIcons name="arrow-downward" size={20} color="#ef4444" />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionCategory}>{transaction.category}</Text>
              <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: '#ef4444' }]}>
              -₱{parseFloat(transaction.amount).toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const router = useRouter();

  const loadBudget = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'Please login to continue');
        return;
      }
      
      const docRef = doc(db, 'userSettings', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setMonthlyBudget(docSnap.data().monthlyIncome || 0);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      Alert.alert('Error', 'Failed to load budget data');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBudget(), fetchTransactions()]);
  };

  useFocusEffect(
    useCallback(() => {
      loadBudget();
      fetchTransactions();
      // Update current date when screen is focused
      setCurrentDate(new Date());
    }, [])
  );

  // Filter transactions by date range
  const getFilteredByDate = (trans) => {
    const now = new Date();
    const transDate = new Date(trans.date);
    
    switch (dateFilter) {
      case 'today':
        return transDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transDate >= weekAgo;
      case 'month':
        return transDate.getMonth() === now.getMonth() && 
               transDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  // Calculate totals - filter by search query and date
  const filteredTransactions = transactions
    .filter(getFilteredByDate)
    .filter(t => {
      if (!searchQuery) return true;
      return t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             t.category?.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Only calculate expenses - no income transactions anymore
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  
  const safeToSpend = monthlyBudget - totalExpense;

  // Calculate category spending
  const categorySpending = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { total: 0, count: 0, icon: getCategoryIcon(t.category) };
      }
      acc[t.category].total += parseFloat(t.amount);
      acc[t.category].count += 1;
      return acc;
    }, {});

  const categoryList = Object.entries(categorySpending)
    .map(([name, data]) => ({
      name,
      total: data.total,
      average: data.total / data.count,
      icon: data.icon,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  // Get current week days
  const getWeekDays = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();
    return days.map((day, index) => ({
      day,
      isToday: index === today,
    }));
  };

  // Calculate progress percentage based on budget
  const spendingPercentage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
  
  // Circular progress
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(spendingPercentage, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  function getCategoryIcon(category) {
    const icons = {
      'Shopping': '🛍️',
      'Food': '🍔',
      'Groceries': '🛒',
      'Gas': '⛽',
      'Transport': '🚗',
      'Eating out': '🍕',
      'Bills': '📄',
      'Entertainment': '🎬',
      'Other': '💰',
    };
    return icons[category] || '💰';
  }

  // Handle delete transaction
  const handleDelete = async (id, description) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              await fetchTransactions();
              Alert.alert('Success', 'Transaction deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
  };

  // Handle edit transaction
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  // Handle long press on transaction
  const handleLongPress = (transaction) => {
    Alert.alert(
      'Transaction Options',
      `${transaction.description} - ₱${parseFloat(transaction.amount).toFixed(2)}`,
      [
        {
          text: 'Edit',
          onPress: () => handleEdit(transaction)
        },
        {
          text: 'Delete',
          onPress: () => handleDelete(transaction.id, transaction.description),
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format current date
  const formatCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return currentDate.toLocaleDateString('en-US', options);
  };

  // Get date range for the week (Sunday to Saturday)
  const getWeekDateRange = () => {
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // Calculate first day of the week (Sunday)
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - dayOfWeek);
    
    // Calculate last day of the week (Saturday)
    const lastDay = new Date(today);
    lastDay.setDate(today.getDate() + (6 - dayOfWeek));

    const options = { month: 'short', day: 'numeric' };
    return `${firstDay.toLocaleDateString('en-US', options)} - ${lastDay.toLocaleDateString('en-US', options)}`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <View style={{ paddingTop: 20 }}>
          {refreshing && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Refreshing...</Text>
            </View>
          )}
        </View>
      }
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Dashboard</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleRefresh}
          >
            <MaterialIcons name="refresh" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <MaterialIcons name="search" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <MaterialIcons name="calendar-today" size={24} color="#2c3e50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.filterButton, dateFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setDateFilter('all')}
          >
            <Text style={[styles.filterButtonText, dateFilter === 'all' && styles.filterButtonTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, dateFilter === 'today' && styles.filterButtonActive]}
            onPress={() => setDateFilter('today')}
          >
            <Text style={[styles.filterButtonText, dateFilter === 'today' && styles.filterButtonTextActive]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, dateFilter === 'week' && styles.filterButtonActive]}
            onPress={() => setDateFilter('week')}
          >
            <Text style={[styles.filterButtonText, dateFilter === 'week' && styles.filterButtonTextActive]}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, dateFilter === 'month' && styles.filterButtonActive]}
            onPress={() => setDateFilter('month')}
          >
            <Text style={[styles.filterButtonText, dateFilter === 'month' && styles.filterButtonTextActive]}>This Month</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions by name or category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Search Results Info */}
      {searchQuery.length > 0 && (
        <View style={styles.searchResultsInfo}>
          <MaterialIcons name="filter-list" size={18} color="#10d97f" />
          <Text style={styles.searchResultsText}>
            {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''} found for "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Calendar Info */}
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <MaterialIcons name="event" size={24} color="#10d97f" />
          <View style={styles.calendarInfo}>
            <Text style={styles.calendarDate}>{formatCurrentDate()}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowCalendar(false)}>
            <MaterialIcons name="close" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      )}

      {/* New Transactions Alert */}
      {transactions.length > 0 && !showSearch && (
        <TouchableOpacity style={styles.alertBanner}>
          <MaterialIcons name="sync" size={24} color="#fff" />
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>{filteredTransactions.length} New Transactions</Text>
            <Text style={styles.alertSubtitle}>Review to update your budget.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Circular Progress - Safe to Spend */}
      <View style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size/2}, ${size/2}`}>
              {/* Background Circle */}
              <Circle
                cx={size/2}
                cy={size/2}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress Circle */}
              <Circle
                cx={size/2}
                cy={size/2}
                r={radius}
                stroke="#10d97f"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          <View style={styles.progressTextContainer}>
            <Text style={styles.safeToSpendAmount}>₱{safeToSpend.toFixed(2)}</Text>
            <Text style={styles.safeToSpendLabel}>Safe-to-Spend</Text>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.dateRangeContainer}>
          <Text style={styles.dateRange}>{getWeekDateRange()}</Text>
        </View>

        {/* Week Days */}
        <View style={styles.weekDaysContainer}>
          {getWeekDays().map((item, index) => (
            <View
              key={index}
              style={[
                styles.dayButton,
                item.isToday && styles.dayButtonActive,
              ]}
            >
              <Text style={[
                styles.dayText,
                item.isToday && styles.dayTextActive,
              ]}>
                {item.day}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.expandButton}>
            <MaterialIcons name="expand-less" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Spending List */}
      <View style={styles.categoriesContainer}>
        {categoryList.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAverage}>
                  Average: ₱{category.average.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.categoryRight}>
              <Text style={styles.categoryAmount}>-₱{category.total.toFixed(0)}</Text>
              <View style={styles.categoryProgressBar}>
                <View 
                  style={[
                    styles.categoryProgressFill,
                    { width: `${Math.min((category.total / totalExpense) * 100, 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* All Transactions - Swipe to Delete */}
      <View style={styles.transactionsSection}>
        <Text style={styles.transactionsSectionTitle}>Transactions</Text>
        {filteredTransactions.filter(t => t.type === 'expense').length === 0 ? (
          <View style={styles.emptyTransactions}>
            <MaterialIcons name="receipt-long" size={50} color="#d1d5db" />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first expense</Text>
          </View>
        ) : (
          filteredTransactions
            .filter(t => t.type === 'expense')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
            .map((transaction, index) => (
              <SwipeableTransaction
                key={transaction.id || index}
                transaction={transaction}
                onDelete={handleDelete}
                onLongPress={handleLongPress}
                formatDate={formatDate}
              />
            ))
        )}
      </View>

      {/* Floating Add Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => {
            setEditingTransaction(null);
            setShowAddModal(true);
          }}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Add/Edit Transaction Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingTransaction(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              setEditingTransaction(null);
            }}>
              <MaterialIcons name="close" size={28} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </Text>
            <View style={{ width: 28 }} />
          </View>
          <AddTransaction 
            transaction={editingTransaction}
            onSuccess={() => { 
              setShowAddModal(false); 
              setEditingTransaction(null);
              fetchTransactions(); 
            }} 
          />
        </View>
      </Modal>

      {/* Loading Indicator */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your financial data...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#2c3e50',
  },
  calendarContainer: {
    backgroundColor: '#e8f9f1',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10d97f',
  },
  calendarInfo: {
    flex: 1,
    marginLeft: 12,
  },
  calendarDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  calendarSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  searchResultsInfo: {
    backgroundColor: '#e8f9f1',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchResultsText: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '500',
  },
  alertBanner: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  alertText: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  alertSubtitle: {
    color: '#e0e7ff',
    fontSize: 13,
  },
  progressContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  progressCard: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeToSpendAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10d97f',
    marginBottom: 4,
  },
  safeToSpendLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dateRangeContainer: {
    marginBottom: 15,
  },
  dateRange: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#10d97f',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  dayTextActive: {
    color: '#fff',
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  categoryItem: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  categoryAverage: {
    fontSize: 13,
    color: '#9ca3af',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  categoryProgressBar: {
    width: 80,
    height: 4,
    backgroundColor: '#fee2e2',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 2,
  },
  transactionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    marginTop: 10,
  },
  transactionsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 5,
    textAlign: 'center',
  },
  swipeContainer: {
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  deleteAction: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteBtn: {
    padding: 4,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10d97f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10d97f',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#10d97f',
    borderColor: '#10d97f',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
  },
  loadingOverlay: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
