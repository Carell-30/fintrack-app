import { MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function RecurringTransactions({ onSuccess }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [loading, setLoading] = useState(false);
  const [recurringTransactions, setRecurringTransactions] = useState([]);

  const categories = ['Rent', 'Bills', 'Utilities', 'Subscriptions', 'Insurance', 'Loan Payment', 'Other'];
  const frequencies = ['monthly', 'weekly', 'biweekly'];

  useEffect(() => {
    loadRecurringTransactions();
  }, []);

  const loadRecurringTransactions = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      const docRef = doc(db, 'recurringTransactions', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setRecurringTransactions(docSnap.data().transactions || []);
      }
    } catch (error) {
      console.error('Error loading recurring transactions:', error);
    }
  };

  const handleAddRecurring = async () => {
    if (!amount || !description || !category) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const recurring = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description,
      category,
      frequency,
      dayOfMonth: frequency === 'monthly' ? parseInt(dayOfMonth) : null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const updatedRecurring = [...recurringTransactions, recurring];
      
      const docRef = doc(db, 'recurringTransactions', userId);
      await setDoc(docRef, {
        transactions: updatedRecurring,
        updatedAt: new Date().toISOString(),
      });

      setRecurringTransactions(updatedRecurring);
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setDayOfMonth('1');
      
      Alert.alert('Success', 'Recurring transaction added');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add recurring transaction');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecurring = async (id, isActive) => {
    try {
      const updatedRecurring = recurringTransactions.map(r =>
        r.id === id ? { ...r, isActive: !isActive } : r
      );

      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const docRef = doc(db, 'recurringTransactions', userId);
      await setDoc(docRef, {
        transactions: updatedRecurring,
        updatedAt: new Date().toISOString(),
      });

      setRecurringTransactions(updatedRecurring);
    } catch (error) {
      Alert.alert('Error', 'Failed to update recurring transaction');
    }
  };

  const deleteRecurring = async (id) => {
    Alert.alert(
      'Delete Recurring Transaction',
      'Are you sure you want to delete this recurring transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedRecurring = recurringTransactions.filter(r => r.id !== id);
              
              const userId = auth.currentUser?.uid;
              if (!userId) return;

              const docRef = doc(db, 'recurringTransactions', userId);
              await setDoc(docRef, {
                transactions: updatedRecurring,
                updatedAt: new Date().toISOString(),
              });

              setRecurringTransactions(updatedRecurring);
              Alert.alert('Success', 'Recurring transaction deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recurring transaction');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBox}>
        <MaterialIcons name="repeat" size={20} color="#6366f1" />
        <Text style={styles.infoText}>
          Set up recurring transactions for bills, rent, and subscriptions. They'll be automatically tracked each period.
        </Text>
      </View>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount (₱)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Description Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Netflix Subscription"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Category Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Frequency Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyGrid}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyButton,
                frequency === freq && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency(freq)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  frequency === freq && styles.frequencyTextActive,
                ]}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Day of Month (for monthly) */}
      {frequency === 'monthly' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Day of Month</Text>
          <TextInput
            style={styles.input}
            placeholder="1-31"
            keyboardType="number-pad"
            value={dayOfMonth}
            onChangeText={setDayOfMonth}
            placeholderTextColor="#9ca3af"
          />
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleAddRecurring}
        disabled={loading}
      >
        <MaterialIcons name="add" size={20} color="#fff" />
        <Text style={styles.submitText}>
          {loading ? 'Adding...' : 'Add Recurring Transaction'}
        </Text>
      </TouchableOpacity>

      {/* List of Recurring Transactions */}
      {recurringTransactions.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Active Recurring Transactions</Text>
          {recurringTransactions.map((item) => (
            <View key={item.id} style={styles.recurringItem}>
              <View style={styles.recurringInfo}>
                <View style={styles.recurringHeader}>
                  <Text style={styles.recurringDescription}>{item.description}</Text>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => toggleRecurring(item.id, item.isActive)}
                    trackColor={{ false: '#d1d5db', true: '#10d97f' }}
                    thumbColor="#fff"
                  />
                </View>
                <Text style={styles.recurringCategory}>{item.category}</Text>
                <Text style={styles.recurringAmount}>₱{item.amount.toFixed(2)} / {item.frequency}</Text>
                {item.frequency === 'monthly' && (
                  <Text style={styles.recurringDay}>Every {item.dayOfMonth}{getDaySuffix(item.dayOfMonth)} of the month</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteRecurring(item.id)}
              >
                <MaterialIcons name="delete" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  infoBox: {
    backgroundColor: '#eef2ff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  frequencyGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#10d97f',
    borderColor: '#10d97f',
  },
  frequencyText: {
    fontSize: 14,
    color: '#666',
  },
  frequencyTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  recurringItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recurringInfo: {
    flex: 1,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  recurringDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  recurringCategory: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 3,
  },
  recurringAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 3,
  },
  recurringDay: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deleteButton: {
    padding: 8,
  },
});
