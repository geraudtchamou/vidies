import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import BrowserScreen from './screens/BrowserScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'VideoTools',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Browser"
          component={BrowserScreen}
          options={{
            title: 'Browse Platforms',
          }}
        />
        <Stack.Screen
          name="VideoDetails"
          getComponent={() => require('./screens/VideoDetailsScreen').default}
          options={{
            title: 'Video Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
