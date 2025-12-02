import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import CategoryManagement from './CategoryManagement';
import ProductManagementScreen from './ProductManagementScreen';
import OrderManagementScreen from './OrderManagementScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  CategoryManagement: undefined;
  ProductManagement: undefined;
  OrderManagement: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminTabScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#6200ea' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
      initialRouteName="AdminDashboard"
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Trang Quản Trị', headerShown: false }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagement}
        options={{ title: 'Quản lý User' }}
      />
      <Stack.Screen
        name="CategoryManagement"
        component={CategoryManagement}
        options={{ title: 'Quản lý Loại sản phẩm' }}
      />
      <Stack.Screen
        name="ProductManagement"
        component={ProductManagementScreen}
        options={{ title: 'Quản lý Sản phẩm' }}
      />
      <Stack.Screen
        name="OrderManagement"
        component={OrderManagementScreen}
        options={{ title: 'Quản lý Đơn Hàng' }}
      />
    </Stack.Navigator>
  );
};

export default AdminTabScreen;
