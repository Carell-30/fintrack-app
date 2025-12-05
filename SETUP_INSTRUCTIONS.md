# FinTrack App - Complete Setup Instructions

Welcome! Follow these steps to get the FinTrack app running on your laptop.

---

## **📋 Prerequisites**

Before starting, make sure you have these installed:

### 1. **Node.js** (Required)
- Download from: https://nodejs.org/
- Get the **LTS version** (Long Term Support)
- During installation, check the box that says "Automatically install necessary tools"
- After install, verify by opening PowerShell/Command Prompt and running:
  ```
  node --version
  npm --version
  ```
  You should see version numbers.

### 2. **Git** (Optional - only if you want to clone instead of download)
- Download from: https://git-scm.com/
- Use default settings during installation

---

## **🚀 Step-by-Step Setup**

### **Step 1: Download the Project**

#### Option A: Download ZIP (Easier)
1. Go to: https://github.com/Carell-30/fintrack-app
2. Click the green **Code** button
3. Click **Download ZIP**
4. Extract the ZIP file to a location like:
   - `C:\Users\YourName\Documents\fintrack-app`
   - Or anywhere you prefer

#### Option B: Clone with Git
```powershell
cd C:\Users\YourName\Documents
git clone https://github.com/Carell-30/fintrack-app.git
cd fintrack-app
```

---

### **Step 2: Open Project in Terminal**

1. Open **PowerShell** or **Command Prompt**
2. Navigate to the project folder:
   ```powershell
   cd "C:\Users\YourName\Documents\fintrack-app"
   ```
   (Replace with your actual path)

---

### **Step 3: Install Dependencies**

Run this command to install all required packages:

```powershell
npm install
```

This will take 2-5 minutes. You'll see a progress bar installing packages.

**What it installs:**
- React Native & Expo framework
- Firebase SDK
- Navigation libraries
- SVG graphics library
- All other dependencies

---

### **Step 4: Set Up Firebase (IMPORTANT)**

The app needs Firebase for user authentication and data storage.

#### 4.1 Create Firebase Project
1. Go to: https://console.firebase.google.com/
2. Click **Add Project**
3. Name it: "FinTrack" (or anything you want)
4. Disable Google Analytics (optional)
5. Click **Create Project**

#### 4.2 Enable Authentication
1. In your Firebase project, click **Authentication** in sidebar
2. Click **Get Started**
3. Click **Email/Password** tab
4. Toggle **Enable** and click **Save**

#### 4.3 Enable Firestore Database
1. Click **Firestore Database** in sidebar
2. Click **Create Database**
3. Select **Start in test mode** (for development)
4. Choose a location close to you
5. Click **Enable**

#### 4.4 Get Firebase Config
1. Click the **Gear icon** ⚙️ (Project Settings)
2. Scroll down to **Your apps**
3. Click the **Web icon** `</>`
4. Register app name: "FinTrack Web"
5. Copy the **firebaseConfig** object (looks like this):
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc123"
   };
   ```

#### 4.5 Update Config File
1. Open the project folder in a code editor (VS Code, Notepad++, etc.)
2. Go to: `config/firebase.js`
3. Replace the existing `firebaseConfig` with YOUR config from step 4.4
4. Save the file

---

### **Step 5: Start the App**

Run this command:

```powershell
npx expo start
```

**If you get an error**, try this instead:
```powershell
$env:EXPO_NO_DOCTOR="1"; npx expo start
```

You should see:
- A QR code in the terminal
- Text saying "Metro waiting on..."
- A browser window might open with Expo Dev Tools

---

### **Step 6: Test on Your Phone**

#### For Android:
1. Install **Expo Go** from Google Play Store
2. Open Expo Go app
3. Tap **Scan QR Code**
4. Scan the QR code from your terminal
5. App will load on your phone

#### For iOS (iPhone):
1. Install **Expo Go** from App Store
2. Open Camera app
3. Point at the QR code
4. Tap the notification to open in Expo Go

#### Alternative - Test in Browser (Limited):
- Press **W** in the terminal to open in web browser
- Note: Some features work better on mobile

---

## **🎯 Using the App**

1. **Sign Up**: Create an account with email/password
2. **Set Budget**: Go to "Money" tab, enter monthly budget
3. **Add Expenses**: Tap the **+** button on Dashboard
4. **View Reports**: Check spending insights in Reports tab
5. **Recurring Bills**: Set up in More tab → Recurring Transactions

---

## **❗ Troubleshooting**

### Problem: "npm: command not found"
- **Solution**: Node.js not installed. Download from https://nodejs.org/

### Problem: "Expo start" fails
- **Solution**: Run `npm install` again
- Or try: `$env:EXPO_NO_DOCTOR="1"; npx expo start`

### Problem: Can't connect to Firebase
- **Solution**: Check that you updated `config/firebase.js` with YOUR Firebase config
- Make sure Authentication and Firestore are enabled in Firebase Console

### Problem: QR code doesn't work
- **Solution**: Make sure phone and laptop are on the same WiFi network
- Try pressing **Tunnel** mode in the terminal

### Problem: App crashes on phone
- **Solution**: Check terminal for error messages
- Make sure you're using the latest Expo Go app

---

## **📁 Project Structure**

```
fintrack-app/
├── app/                      # All app screens
│   ├── login.js             # Login screen
│   ├── signup.js            # Sign up screen
│   ├── dashboard.js         # Main dashboard
│   ├── money.js             # Budget setting
│   ├── reports.js           # Financial reports
│   ├── Profile.js           # Profile/Settings
│   ├── AddTransaction.js    # Add/Edit transactions
│   └── RecurringTransactions.js
├── config/
│   └── firebase.js          # Firebase configuration (UPDATE THIS!)
├── services/
│   ├── authService.js       # Authentication functions
│   └── transactionService.js # Transaction CRUD
├── package.json             # Dependencies list
└── README.md               # Project info
```

---

## **🔧 Stopping the App**

To stop the development server:
1. Go to the terminal
2. Press `Ctrl + C`
3. Type `Y` and press Enter

---

## **🔄 Running It Again Later**

Next time you want to run the app:

```powershell
cd "C:\Users\YourName\Documents\fintrack-app"
npx expo start
```

That's it! No need to install dependencies again unless you update the code.

---

## **📱 Features**

✅ User authentication (login/signup)  
✅ Monthly budget tracking  
✅ Add/Edit/Delete transactions with swipe  
✅ Filter by date (Today, Week, Month)  
✅ Search transactions  
✅ Recurring transactions (bills, rent, subscriptions)  
✅ Spending insights and analytics  
✅ Category breakdown  
✅ Safe-to-spend calculator  

---

## **💡 Tips**

- Keep the terminal window open while using the app
- Press **R** in terminal to reload the app
- Press **M** to toggle menu
- Check terminal for error messages if something breaks

---

## **🆘 Need Help?**

If you get stuck:
1. Check the error message in the terminal
2. Make sure Firebase is set up correctly
3. Verify all dependencies installed (`npm install`)
4. Contact the app developer (your friend!)

---

**Enjoy tracking your finances! 💰📱**
