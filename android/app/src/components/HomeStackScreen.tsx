import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import DetailsScreen from './DetailsScreen';
import { HomeStackParamList } from './types';
import AboutScreen from './AboutScreen';
import ProductsByCategoryScreen from './ProductByCategoryScreen';
import CategoryScreen from './CategoryScreen';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderScreen from './OrderScreen';
import UserProfileScreen from './UserProfileScreen';
import PurchaseHistoryScreen from './PurchaseHistoryScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreen = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Categories" component={CategoryScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Orders" component={OrderScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />

    </Stack.Navigator>
  );
};

export default HomeStackScreen;