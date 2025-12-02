import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from './AdminTabScreen';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from './AppTabs';
// import Header from './Header';
const AdminDashboard = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang Quản Trị</Text>
      {/* <Header/> */}
      <TouchableOpacity
        style={styles.button}
            onPress={() => navigation.navigate('UserManagement')}
      >
        <Text style={styles.buttonText}>Quản lý User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CategoryManagement')}
      >
        <Text style={styles.buttonText}>Quản lý Loại sản phẩm</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProductManagement')}
      >
        <Text style={styles.buttonText}>Quản lý Sản phẩm</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OrderManagement')}
      >
        <Text style={styles.buttonText}>Quản lý Đơn Hàng</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={() => navigation.getParent()?.navigate('HomeTab' as any)}
      >
        <Text style={styles.buttonText}>Quay về trang User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  button: {
    width: '80%',
    backgroundColor: '#6200ea',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default AdminDashboard;
