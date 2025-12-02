import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { CartItem, createOrder, clearCart, getUserProfile, updateUserProfile } from './database';

type CheckoutScreenProps = NativeStackScreenProps<HomeStackParamList, 'Checkout'>;

const CheckoutScreen = ({ route, navigation }: CheckoutScreenProps) => {
  const { cartItems, totalPrice } = route.params as {
    cartItems: CartItem[];
    totalPrice: number;
  };

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const loggedInUser = await AsyncStorage.getItem('loggedInUser');
      if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        const userProfile = await getUserProfile(user.id);
        
        if (userProfile) {
          setCustomerName(userProfile.fullName || '');
          setCustomerPhone(userProfile.phone || '');
          setCustomerEmail(userProfile.email || '');
          setShippingAddress(userProfile.address || '');
        }
      }
    } catch (error) {
      console.error('❌ Error loading user info:', error);
    }
  };

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await AsyncStorage.getItem('loggedInUser');
      const userId = loggedInUser ? JSON.parse(loggedInUser).id : null;

      const orderId = await createOrder(
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        cartItems
      );

      if (orderId) {
        // Save customer info to user profile
        if (userId) {
          await updateUserProfile(userId, customerName, customerPhone, customerEmail, shippingAddress);
        }

        // Clear cart
        await clearCart();
        
        Alert.alert(
          'Thành công',
          'Đơn hàng của bạn đã được tạo!',
          [
            {
              text: 'Xem đơn hàng',
              onPress: () => {
                navigation.navigate('Orders');
              },
            },
            {
              text: 'Quay về trang chủ',
              onPress: () => {
                navigation.navigate('Home');
              },
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Tạo đơn hàng thất bại');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thông Tin Thanh Toán</Text>

      {/* Order Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Tóm Tắt Đơn Hàng</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Số sản phẩm:</Text>
          <Text style={styles.summaryValue}>{cartItems.length} sản phẩm</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng tiền:</Text>
          <Text style={styles.summaryValue}>{Number(totalPrice).toLocaleString()} đ</Text>
        </View>
      </View>

      {/* Customer Info */}
      <Text style={styles.sectionTitle}>Thông Tin Khách Hàng</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Họ tên"
        placeholderTextColor="#999"
        value={customerName}
        onChangeText={setCustomerName}
      />

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={customerPhone}
        onChangeText={setCustomerPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={customerEmail}
        onChangeText={setCustomerEmail}
      />

      <TextInput
        style={[styles.input, styles.addressInput]}
        placeholder="Địa chỉ giao hàng"
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        value={shippingAddress}
        onChangeText={setShippingAddress}
      />

      {/* Terms */}
      <View style={styles.termsBox}>
        <Text style={styles.termsText}>
          ✓ Tôi đồng ý với các điều khoản & điều kiện của cửa hàng
        </Text>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkoutBtnText}>Đặt Hàng</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelBtnText}>Hủy</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
  },
  addressInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  termsBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  termsText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 20,
  },
  checkoutBtn: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutBtnDisabled: {
    opacity: 0.6,
  },
  checkoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#FF5252',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#FF5252',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CheckoutScreen;
