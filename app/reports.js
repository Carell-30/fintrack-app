// app/reports.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../config/firebase';
import { getTransactions } from '../services/transactionService';

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  const loadBudget = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      const docRef = doc(db, 'userSettings', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setMonthlyBudget(docSnap.data().monthlyIncome || 0);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  };

  const fetchTransactions = async () => {
    const data = await getTransactions();
    setTransactions(data || []);
  };

  useFocusEffect(
    useCallback(() => {
      loadBudget();
      fetchTransactions();
    }, [])
  );

  // Calculate statistics - only expenses now
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const remaining = monthlyBudget - totalExpense;

  // Category breakdown for expenses
  const categoryBreakdown = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += parseFloat(t.amount);
      return acc;
    }, {});

  const categoryData = Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  // Get current month stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const monthlySavings = monthlyBudget - monthlyExpense;

  // Calculate daily average spending
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const dailyAverage = currentDay > 0 ? monthlyExpense / currentDay : 0;
  const projectedMonthly = dailyAverage * daysInMonth;

  // Get spending trend (last 7 days)
  const last7Days = transactions.filter(t => {
    const transDate = new Date(t.date);
    const daysDiff = Math.floor((new Date() - transDate) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff < 7 && t.type === 'expense';
  });

  const last7DaysSpending = last7Days.reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const weeklyAverage = last7DaysSpending / 7;

  // Top spending day
  const spendingByDay = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!acc[day]) acc[day] = 0;
      acc[day] += parseFloat(t.amount);
      return acc;
    }, {});

  const topSpendingDay = Object.entries(spendingByDay).length > 0
    ? Object.entries(spendingByDay).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Financial Reports</Text>

      {/* Insights Section */}
      <View style={styles.insightsSection}>
        <Text style={styles.insightsSectionTitle}>💡 Insights</Text>
        
        <View style={styles.insightCard}>
          <MaterialIcons name="show-chart" size={24} color="#10d97f" />
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>Daily Average</Text>
            <Text style={styles.insightValue}>₱{dailyAverage.toFixed(2)}/day</Text>
            <Text style={styles.insightSubtext}>
              {projectedMonthly > monthlyBudget 
                ? `⚠️ On track to exceed budget by ₱${(projectedMonthly - monthlyBudget).toFixed(2)}`
                : `✅ Staying within budget`}
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <MaterialIcons name="calendar-today" size={24} color="#4f46e5" />
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>Last 7 Days</Text>
            <Text style={styles.insightValue}>₱{last7DaysSpending.toFixed(2)}</Text>
            <Text style={styles.insightSubtext}>
              ₱{weeklyAverage.toFixed(2)}/day average
            </Text>
          </View>
        </View>

        {topSpendingDay && (
          <View style={styles.insightCard}>
            <MaterialIcons name="event-note" size={24} color="#f59e0b" />
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Highest Spending Day</Text>
              <Text style={styles.insightValue}>{topSpendingDay[0]}</Text>
              <Text style={styles.insightSubtext}>
                ₱{topSpendingDay[1].toFixed(2)} total
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
          <MaterialIcons name="account-balance-wallet" size={30} color="#fff" />
          <Text style={styles.summaryLabel}>Monthly Budget</Text>
          <Text style={styles.summaryAmount}>₱{monthlyBudget.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#ef4444' }]}>
          <MaterialIcons name="trending-down" size={30} color="#fff" />
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>₱{totalExpense.toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.netBalanceCard, { backgroundColor: remaining >= 0 ? '#4f46e5' : '#f59e0b' }]}>
        <Text style={styles.netBalanceLabel}>Remaining Budget</Text>
        <Text style={styles.netBalanceAmount}>₱{remaining.toFixed(2)}</Text>
      </View>

      {/* Monthly Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.monthlyStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Budget</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              ₱{monthlyBudget.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>
              ₱{monthlyExpense.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, { color: '#4f46e5' }]}>
              ₱{monthlySavings.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {categoryData.length === 0 ? (
          <Text style={styles.emptyText}>No expense data available</Text>
        ) : (
          categoryData.map((item, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.category}</Text>
                <Text style={styles.categoryAmount}>₱{item.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${item.percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.percentage}>{item.percentage}%</Text>
            </View>
          ))
        )}
      </View>

      {/* Transaction Count */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Summary</Text>
        <View style={styles.countCard}>
          <MaterialIcons name="receipt-long" size={40} color="#4f46e5" />
          <View style={styles.countInfo}>
            <Text style={styles.countNumber}>{transactions.length}</Text>
            <Text style={styles.countLabel}>Total Transactions</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    color: '#2c3e50',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  netBalanceCard: {
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  netBalanceLabel: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  netBalanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  monthlyStats: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
  countCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  countInfo: {
    flex: 1,
  },
  countNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  countLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  insightsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  insightsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 12,
    gap: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 3,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  insightSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
