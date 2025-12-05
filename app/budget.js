// app/budget.js
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getTransactions } from '../services/transactionService';

export default function Budget() {
  const [transactions, setTransactions] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState({}); // { categoryName: budget }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const data = await getTransactions(); // pull all transactions
    setTransactions(data || []);
  };

  // Calculate total spent per category
  const categoryTotals = transactions.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0;
    acc[t.category] += parseFloat(t.amount);
    return acc;
  }, {});

  const handleBudgetChange = (category, value) => {
    setCategoryBudgets({ ...categoryBudgets, [category]: parseFloat(value) });
  };

  const handleSaveBudget = (category) => {
    Alert.alert('Budget Saved', `Budget for ${category} is set to ₱${categoryBudgets[category] || 0}`);
  };

  const categories = Object.keys(categoryTotals);

  const renderItem = ({ item }) => {
    const spent = categoryTotals[item];
    const budget = categoryBudgets[item] || 0;
    const remaining = budget - spent;

    return (
      <View style={styles.card}>
        <Text style={styles.category}>{item}</Text>
        <Text>Spent: ₱{spent.toFixed(2)}</Text>
        <TextInput
          placeholder="Set budget"
          keyboardType="numeric"
          style={styles.input}
          value={budget ? budget.toString() : ''}
          onChangeText={(value) => handleBudgetChange(item, value)}
        />
        <Text style={{ color: remaining < 0 ? 'red' : 'green' }}>
          Remaining: ₱{remaining.toFixed(2)}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveBudget(item)}>
          <Text style={styles.saveButtonText}>Save Budget</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Budget</Text>
      {categories.length === 0 ? (
        <Text>No transactions yet</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f7fa' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  category: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#4f46e5' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 8,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});
