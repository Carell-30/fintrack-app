// services/authService.js
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from '../config/firebase'; // or just import firebase config

const auth = getAuth(app);

// SIGN UP
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign Up Error:', error.message);
    throw error;
  }
};

// LOG IN
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Log In Error:', error.message);
    throw error;
  }
};

// LOG OUT
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Log Out Error:', error.message);
  }
};
