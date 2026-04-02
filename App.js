import 'react-native-gesture-handler';

import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import UploadScreen from './src/screens/UploadScreen';
import ResultScreen from './src/screens/ResultScreen';
import { lightTheme, darkTheme } from './src/utils/theme';

const Stack = createStackNavigator();

function App() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack.Navigator
          initialRouteName="UploadScreen"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            },
            headerTintColor: theme.primary,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
              color: theme.text,
            },
            cardStyle: { backgroundColor: theme.background },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen
            name="UploadScreen"
            component={UploadScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResultScreen"
            component={ResultScreen}
            options={{
              title: 'Extraction Results',
              headerLeft: () => null,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
