// app/money.js
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebase';

export default function Money() {
  const [income, setIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = auth.currentUser?.uid;

  // Load saved income
  useFocusEffect(
    useCallback(() => {
      loadIncome();
    }, [])
  );

  const loadIncome = async () => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'userSettings', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIncome(data.monthlyIncome?.toString() || '');
      }
    } catch (error) {
      console.error('Error loading income:', error);
    }
  };

  const handleSave = async () => {
    if (!income) {
      Alert.alert('Error', 'Please enter your monthly income/budget');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }

    const incomeValue = parseFloat(income);
    if (isNaN(incomeValue) || incomeValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'userSettings', userId);
      await setDoc(docRef, {
        monthlyIncome: incomeValue,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      Alert.alert('Success', 'Monthly budget saved successfully! ✅');
    } catch (error) {
      console.error('Error saving income:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="account-balance-wallet" size={40} color="#10d97f" />
        <Text style={styles.headerText}>Set Monthly Budget</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Monthly Income / Budget</Text>
        <Text style={styles.description}>
          Enter your total monthly income or budget. This will be used to calculate your safe-to-spend amount.
        </Text>
        <TextInput
          placeholder="Enter amount (e.g., 15000)"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {income && (
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Your Monthly Budget</Text>
          <Text style={styles.previewAmount}>₱{parseFloat(income).toLocaleString()}</Text>
          <Text style={styles.previewSubtext}>
            This amount will be used as your baseline for tracking expenses
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Save Monthly Budget'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={20} color="#6366f1" />
        <Text style={styles.infoText}>
          Your budget is saved and will be used across the app to calculate your safe-to-spend amount and track your expenses.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f7fa' 
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  headerText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginTop: 10,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 8, 
    color: '#2c3e50' 
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#2c3e50',
  },
  previewCard: {
    backgroundColor: '#e8f9f1',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#10d97f',
  },
  previewLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  previewAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10d97f',
    marginBottom: 8,
  },
  previewSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  button: { 
    backgroundColor: '#10d97f', 
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10d97f',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  infoBox: {
    backgroundColor: '#eef2ff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
});
