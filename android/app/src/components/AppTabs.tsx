import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Text, AppState, AppStateStatus, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import HomeStackScreen from './HomeStackScreen';
import AdminTabScreen from './AdminTabScreen';
import LoginSqlite from './LoginSqlite';
import SignupSqlite from './SignupSqlite';
import PurchaseHistoryScreen from './PurchaseHistoryScreen';

export type BottomTabParamList = {
  HomeTab: undefined;
  PurchaseHistory: undefined;
  AdminTab: undefined;
  SignupSqlite: undefined;
  LoginSqlite: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Protected wrapper for admin tab - redirects non-admins back to HomeTab
const AdminProtected = ({ navigation }: any) => {
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [checking, setChecking] = useState(true);

  const checkRole = useCallback(async () => {
    setChecking(true);
    try {
      const loggedInUser = await AsyncStorage.getItem('loggedInUser');
      if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        setUserRole(user.role);
        if (user.role !== 'admin') {
          // Not authorized, redirect to home
          navigation?.navigate('HomeTab' as any);
        }
      } else {
        // Not logged in
        navigation?.navigate('LoginSqlite' as any);
      }
    } catch (e) {
      console.warn('Error checking user role for admin protection', e);
      navigation?.navigate('LoginSqlite' as any);
    } finally {
      setChecking(false);
    }
  }, [navigation]);

  // check on mount
  useEffect(() => {
    checkRole();
  }, [checkRole]);

  // re-check whenever this tab gains focus
  useFocusEffect(
    useCallback(() => {
      checkRole();
    }, [checkRole])
  );

  if (checking) {
    // while checking, render an empty view to avoid flashing admin UI
    return <View style={{ flex: 1 }} />;
  }

  if (userRole === 'admin') {
    return <AdminTabScreen />;
  }

  // fallback
  return <View style={{ flex: 1 }} />;
};

const AppTabs = () => {
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const appState = useRef(AppState.currentState);

  const checkUserRole = useCallback(async () => {
    const loggedInUser = await AsyncStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setUserRole(user.role);
    } else {
      setUserRole(null);
    }
  }, []);

  // Check user role on component mount
  useEffect(() => {
    checkUserRole();
  }, [checkUserRole]);

  // Listen to app state changes (when app comes to foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground, check user role again
        checkUserRole();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkUserRole]);

  // Also check when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkUserRole();
    }, [checkUserRole])
  );

  return (
    <Tab.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={userRole === 'admin' ? 'AdminTab' : 'HomeTab'}
    >
      {/* User Tabs */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
          // Keep Home visible for both admin and users
        }}
      />

      {/* <Tab.Screen
        name="PurchaseHistory"
        component={PurchaseHistoryScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📦</Text>
          ),
          tabBarStyle: userRole === 'admin' ? { display: 'none' } : {},
        }}
      /> */}

      {/* Admin Tab - Protected & Hidden for users */}
      <Tab.Screen
        name="AdminTab"
        component={AdminProtected}
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
          tabBarStyle: userRole !== 'admin' ? { display: 'none' } : {},
        }}
      />

      {/* Auth Tabs - Always visible */}
      <Tab.Screen
        name="SignupSqlite"
        component={SignupSqlite}
        options={{
          title: 'Signup',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>➕</Text>
          ),
        }}
      />

      <Tab.Screen
        name="LoginSqlite"
        component={LoginSqlite}
        options={{
          title: 'Login',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🔒</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
