// app/index.js
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Dashboard from './dashboard';
import Money from './money';
import Profile from './Profile';
import Reports from './reports';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#10d97f',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { 
          paddingVertical: 8, 
          height: 65,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Money':
              iconName = 'attach-money';
              break;
            case 'Dashboard':
              iconName = 'pie-chart';
              break;
            case 'Reports':
              iconName = 'bar-chart';
              break;
            case 'More':
              iconName = 'more-horiz';
              break;
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Money" component={Money} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Reports" component={Reports} />
      <Tab.Screen name="More" component={Profile} />
    </Tab.Navigator>
  );
}
