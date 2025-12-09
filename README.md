# FinTrack - Personal Finance Tracking App

A modern mobile application built with React Native and Firebase for tracking personal expenses and managing budgets.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)

## 📱 Features

### Core Functionalities (CRUD)
- ✅ **Create** - Add expense transactions with amount, description, and category
- ✅ **Read** - View all transactions with filtering and search capabilities
- ✅ **Update** - Edit existing transactions (long-press to edit)
- ✅ **Delete** - Remove transactions with swipe-to-delete gesture

### Advanced Features
- 📊 **Budget Tracking** - Set monthly budget and track safe-to-spend amount
- 🔄 **Recurring Transactions** - Automate bills, rent, and subscriptions
- 📈 **Spending Insights** - Daily averages, trends, and analytics
- 🔍 **Smart Filters** - Filter by date range (Today, Week, Month)
- 🔎 **Search** - Find transactions by description or category
- 📉 **Reports** - Category breakdown with spending percentages
- 🎨 **Circular Progress Chart** - Visual budget consumption indicator

## 🛠️ Tech Stack

**Frontend:**
- React Native (Expo)
- React Navigation (Bottom Tabs)
- react-native-svg (Charts & Graphics)
- Animated API (Swipe Gestures)

**Backend:**
- Firebase Authentication (Email/Password)
- Cloud Firestore (NoSQL Database)
- Firebase Storage (Future: Receipt uploads)

**Development Tools:**
- Node.js & npm
- Git & GitHub
- VS Code
- Expo CLI

## 📂 Project Structure

```
fintrack-app/
├── app/
│   ├── dashboard.js           # Main dashboard with transactions
│   ├── money.js               # Budget setting screen
│   ├── reports.js             # Analytics and insights
│   ├── Profile.js             # User profile and settings
│   ├── AddTransaction.js      # Add/Edit transaction modal
│   ├── RecurringTransactions.js # Manage recurring expenses
│   ├── login.js               # User login
│   └── signup.js              # User registration
├── config/
│   └── firebase.js            # Firebase configuration
├── services/
│   ├── transactionService.js  # CRUD operations for transactions
│   └── authService.js         # Authentication services
├── package.json               # Dependencies
└── SETUP_INSTRUCTIONS.md      # Detailed setup guide
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo Go app (for mobile testing)
- Firebase account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Carell-30/fintrack-app.git
   cd fintrack-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Create Firestore Database (Start in test mode)
   - Copy your Firebase config to `config/firebase.js`

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Install Expo Go from App Store/Play Store
   - Scan the QR code from terminal

For detailed instructions, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

## 🔥 Firebase Collections

### 1. `transactions`
Stores all user expenses:
```javascript
{
  userId: "string",
  amount: number,
  description: "string",
  category: "string",
  type: "expense",
  date: "ISO string",
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

### 2. `userSettings`
Stores user budget:
```javascript
{
  monthlyIncome: number,
  updatedAt: "ISO string"
}
```

### 3. `recurringTransactions`
Stores recurring bills:
```javascript
{
  transactions: [
    {
      id: "string",
      amount: number,
      description: "string",
      category: "string",
      frequency: "monthly|weekly|biweekly",
      dayOfMonth: number,
      isActive: boolean
    }
  ]
}
```

## 💡 How to Use

### Adding an Expense
1. Tap the **+** button on Dashboard
2. Enter amount, description, and category
3. Tap "Add Expense"

### Editing a Transaction
1. **Long-press** any transaction (hold for 0.5 sec)
2. Select "Edit"
3. Modify details and save

### Deleting a Transaction
1. **Swipe left** on any transaction
2. Tap the red delete button
3. Confirm deletion

### Setting Your Budget
1. Go to **Money** tab
2. Enter your monthly income/budget
3. Tap "Save Monthly Budget"

### Filtering Transactions
- Tap filter buttons: **All | Today | This Week | This Month**
- Use search bar to find specific transactions

### Viewing Insights
- Go to **Reports** tab
- See daily averages, spending trends, and category breakdown

## 🎯 CRUD Implementation

### Create
- **File:** `services/transactionService.js` → `addTransaction()`
- **Usage:** AddTransaction.js component
- **Firebase:** `addDoc()` to transactions collection

### Read
- **File:** `services/transactionService.js` → `getTransactions()`
- **Usage:** Dashboard, Reports, Profile
- **Firebase:** `getDocs()` with `where()` clause for user filtering

### Update
- **File:** `services/transactionService.js` → `updateTransaction()`
- **Usage:** AddTransaction.js (when editing)
- **Firebase:** `updateDoc()` to modify existing document

### Delete
- **File:** `services/transactionService.js` → `deleteTransaction()`
- **Usage:** Dashboard swipe-to-delete
- **Firebase:** `deleteDoc()` to remove document

## 🎨 UI/UX Highlights

- **Modern Design** - Clean card-based interface with shadows
- **Circular Progress** - SVG-based budget visualization
- **Smooth Animations** - Pan responder for swipe gestures
- **Intuitive Navigation** - 4-tab bottom navigation
- **Responsive Feedback** - Loading states and success messages
- **Philippine Peso (₱)** - Localized currency display

## 📊 App Screens

1. **Dashboard** - Main overview with circular progress chart
2. **Money** - Set monthly budget
3. **Reports** - Spending analytics and insights
4. **More** - Profile, recurring transactions, settings

## 🔒 Security Features

- User authentication required for all operations
- User-specific data isolation (userId filtering)
- Firestore security rules (configured in Firebase Console)
- Secure password authentication

## 🐛 Troubleshooting

**Expo start fails:**
```bash
$env:EXPO_NO_DOCTOR="1"; npx expo start
```

**Firebase connection issues:**
- Verify `config/firebase.js` has correct credentials
- Check that Authentication and Firestore are enabled

**App won't load on phone:**
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`

## 📈 Future Enhancements

- [ ] Export transactions to CSV/PDF
- [ ] Receipt photo uploads
- [ ] Push notifications for budget alerts
- [ ] Multiple account support (cash, bank, credit card)
- [ ] Savings goals tracker
- [ ] Bill reminders
- [ ] Dark mode theme
- [ ] Biometric authentication

## 👨‍💻 Developer

**Jocelyn Butulan**
- GitHub: [@Carell-30](https://github.com/Carell-30)

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- React Native Community
- Firebase Documentation
- Expo Team
- React Navigation

---

**Built with ❤️ using React Native & Firebase**
