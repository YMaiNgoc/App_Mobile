import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, fetchOrders, updateOrderStatus } from './database';

type PurchaseHistoryScreenProps = NativeStackScreenProps<HomeStackParamList, 'PurchaseHistory'>;

const PurchaseHistoryScreen = ({ navigation }: PurchaseHistoryScreenProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    setLoading(true);
    try {
      const loggedInUser = await AsyncStorage.getItem('loggedInUser');
      if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        setUserId(user.id);
        const fetchedOrders = await fetchOrders(user.id);
        setOrders(fetchedOrders);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    Alert.alert(
      'Hủy đơn hàng?',
      'Bạn chắc chắn muốn hủy?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          onPress: async () => {
            try {
              await updateOrderStatus(orderId, 'cancelled');
              Alert.alert('Thành công', 'Đơn hàng đã bị hủy');
              loadOrders();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy');
            }
          },
        },
      ]
    );
  };

  const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      pending: '⏳ Chờ',
      confirmed: '✅ Xác nhận',
      shipped: '🚚 Giao',
      delivered: '📦 Giao r',
      cancelled: '❌ Hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: { [key: string]: string } = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      shipped: '#9C27B0',
      delivered: '#4CAF50',
      cancelled: '#F44336',
    };
    return colorMap[status] || '#999';
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderCode}>{order.orderCode}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Customer & Items Summary */}
      <View style={styles.contentRow}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.itemCount}>
            {order.items?.length || 0} sản phẩm
          </Text>
        </View>
        <Text style={styles.totalPrice}>
          {Number(order.totalPrice).toLocaleString('vi-VN')} đ
        </Text>
      </View>

      {/* Items List - Compact */}
      <View style={styles.itemsList}>
        {order.items && order.items.slice(0, 2).map((item, idx) => (
          <Text key={idx} style={styles.itemText}>
            • {item.productName} x{item.quantity}
          </Text>
        ))}
        {order.items && order.items.length > 2 && (
          <Text style={styles.itemText}>• +{order.items.length - 2} sản phẩm khác</Text>
        )}
      </View>

      {/* Action Button */}
      {order.status === 'pending' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancelOrder(order.id)}
        >
          <Text style={styles.cancelBtnText}>❌ Hủy</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Đơn Hàng</Text>

      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadOrders} />
          }
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadOrders} />
          }
        >
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có đơn hàng</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  itemCount: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E91E63',
    marginLeft: 10,
  },
  itemsList: {
    marginBottom: 6,
    paddingLeft: 0,
  },
  itemText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    lineHeight: 16,
  },
  cancelBtn: {
    backgroundColor: '#FF5252',
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default PurchaseHistoryScreen;
