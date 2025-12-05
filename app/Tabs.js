import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddTransaction from './AddTransaction';
import Budget from './budget';
import Dashboard from './dashboard';
import Money from './money';
import Profile from './Profile';

import { MaterialIcons } from '@expo/vector-icons'; // For tab icons

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingVertical: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Budget':
              iconName = 'account-balance-wallet';
              break;
            case 'Money':
              iconName = 'attach-money';
              break;
            case 'AddTransaction':
              iconName = 'add-circle-outline';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Budget" component={Budget} />
      <Tab.Screen name="Money" component={Money} />
      <Tab.Screen name="AddTransaction" component={AddTransaction} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
