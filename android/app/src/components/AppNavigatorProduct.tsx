import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import Sanpham3Sqlite from './Sanpham3Sqlite';
import ProductDetailScreen from './ProductDetailScreen';
// import AboutScreen from './AboutScreen';
import ProductsByCategoryScreen from './ProductByCategoryScreen';
import { Product } from './database';

export type RootStackParamList = {
  Home: undefined;
  Sanpham3Sqlite: undefined;
  About: undefined;
  ProductDetail: { product: Product };
  Details: { product: Product };
  ProductsByCategory: { categoryId: number; categoryName?: string };
  ProductManagement: undefined; 
  UserManagement: undefined;
  CategoryManagement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigatorProduct() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* <Stack.Screen name="About" component={AboutScreen} /> */}
      <Stack.Screen name="Sanpham3Sqlite" component={Sanpham3Sqlite} />
      <Stack.Screen name="Details" component={ProductDetailScreen} />
      <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />
      
    </Stack.Navigator>
  );
}
