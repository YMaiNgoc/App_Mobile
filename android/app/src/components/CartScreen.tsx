import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, fetchCart, removeFromCart, updateCartQuantity, clearCart } from './database';

type CartScreenProps = NativeStackScreenProps<HomeStackParamList, 'Cart'>;

const CartScreen = ({ navigation }: CartScreenProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const loadCart = async () => {
    const loggedInUser = await AsyncStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setUserId(user.id);
      const items = await fetchCart(user.id);
      setCartItems(items);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const handleRemove = async (cartId: number) => {
    Alert.alert('Xác nhận', 'Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await removeFromCart(cartId);
          loadCart();
        },
      },
    ]);
  };

  const handleUpdateQuantity = async (cartId: number, newQuantity: number) => {
    await updateCartQuantity(cartId, newQuantity);
    loadCart();
  };

  const handleClearCart = () => {
    Alert.alert('Xác nhận', 'Bạn có muốn xóa tất cả sản phẩm khỏi giỏ hàng không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa tất cả',
        style: 'destructive',
        onPress: async () => {
          await clearCart();
          loadCart();
        },
      },
    ]);
  };

  const getImageSource = (img: string | null | undefined) => {
    if (!img) return require('./hinh1.jpg');
    if (img.includes('://')) return { uri: img };
    switch (img) {
      case 'hinh1.jpg': return require('./hinh1.jpg');
      case 'giay.jpg': return require('./giay.jpg');
      case 'balo.jpg': return require('./balo.jpg');
      case 'mu.jpg': return require('./mu.jpg');
      case 'tui.jpg': return require('./tui.jpg');
      default: return require('./hinh1.jpg');
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemCard}>
      <Image source={getImageSource(item.productImg)} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemPrice}>{Number(item.productPrice).toLocaleString()} đ</Text>
        
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityBtnText}>−</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityBtnText}>+</Text>
          </TouchableOpacity>
          
          <Text style={styles.subtotal}>
            {Number(item.productPrice * item.quantity).toLocaleString()} đ
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleRemove(item.id)}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
          
          <View style={styles.footerContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalPrice}>{Number(totalPrice).toLocaleString()} đ</Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => {
                if (cartItems.length === 0) {
                  Alert.alert('Thông báo', 'Giỏ hàng trống');
                  return;
                }
                navigation.navigate('Checkout', {
                  cartItems,
                  totalPrice,
                });
              }}
            >
              <Text style={styles.checkoutBtnText}>Thanh Toán</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearCart}
            >
              <Text style={styles.clearBtnText}>Xóa Tất Cả</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.ordersBtn}
              onPress={() => navigation.navigate('Orders')}
            >
              <Text style={styles.ordersBtnText}>📋 Xem Đơn Hàng</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#999', fontWeight: '600' },
  listContainer: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 180 },
  
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 3,
    alignItems: 'flex-start',
  },
  itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#E91E63', fontWeight: 'bold', marginBottom: 8 },
  
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  quantity: { width: 20, textAlign: 'center', fontWeight: '600' },
  subtotal: { fontSize: 13, fontWeight: 'bold', color: '#333', marginLeft: 'auto' },
  
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  deleteText: { fontSize: 18 },
  
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#E91E63' },
  
  checkoutBtn: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  checkoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  clearBtn: {
    backgroundColor: '#FF5252',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  ordersBtn: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  ordersBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default CartScreen;
