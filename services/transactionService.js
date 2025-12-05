// services/transactionService.js
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const transactionsCollection = collection(db, 'transactions');

// ADD transaction
export const addTransaction = async (transaction) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    await addDoc(transactionsCollection, {
      ...transaction,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding transaction: ', error);
    throw error;
  }
};

// GET all transactions for current user
export const getTransactions = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    
    const q = query(transactionsCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching transactions: ', error);
    throw error;
  }
};

// UPDATE transaction
export const updateTransaction = async (id, updates) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const transactionRef = doc(db, 'transactions', id);
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating transaction: ', error);
    throw error;
  }
};

// DELETE transaction
export const deleteTransaction = async (id) => {
  try {
    await deleteDoc(doc(db, 'transactions', id));
  } catch (error) {
    console.error('Error deleting transaction: ', error);
    throw error;
  }
};
