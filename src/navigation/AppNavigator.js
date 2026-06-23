import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { COLORS } from '../constants/colors';
import JobSheetScreen from '../screens/JobSheetScreen';
import KanbanScreen from '../screens/KanbanScreen';
import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import { auth } from '../services/firebaseConfig';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('[Auth] Sesi ditemukan:', firebaseUser.email);
        setInitialRoute('JobSheet');
      } else {
        console.log('[Auth] Tidak ada sesi aktif');
        setInitialRoute('Login');
      }
      setIsCheckingSession(false);
    });

    return unsubscribe;
  }, []);

  if (isCheckingSession) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle:      { backgroundColor: COLORS.primary },
        headerTintColor:  COLORS.white,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        animation:        'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="JobSheet"
        component={JobSheetScreen}
        options={{ title: 'AutoBoard', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Kanban"
        component={KanbanScreen}
        options={{ title: 'Kanban Board', headerBackTitle: 'Kembali' }}
      />
    </Stack.Navigator>
  );
}