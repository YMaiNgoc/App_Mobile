import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Order, fetchOrders, updateOrderStatus } from './database';

const OrderScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await fetchOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA726'; // Orange
      case 'confirmed':
        return '#42A5F5'; // Blue
      case 'shipped':
        return '#66BB6A'; // Green
      case 'delivered':
        return '#26A69A'; // Teal
      case 'cancelled':
        return '#EF5350'; // Red
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipped':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: async () => {
            await updateOrderStatus(order.id, 'cancelled');
            loadOrders();
            Alert.alert('Thành công', 'Đơn hàng đã được hủy');
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderCode}>{item.orderCode}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Khách hàng:</Text>
        <Text style={styles.infoValue}>{item.customerName}</Text>
        <Text style={styles.infoLabel}>Điện thoại:</Text>
        <Text style={styles.infoValue}>{item.customerPhone}</Text>
        <Text style={styles.infoLabel}>Địa chỉ:</Text>
        <Text style={styles.infoValue}>{item.shippingAddress}</Text>
      </View>

      {/* Items */}
      <View style={styles.itemsSection}>
        <Text style={styles.itemsLabel}>Sản phẩm ({item.items.length}):</Text>
        {item.items.map((orderItem) => (
          <View key={orderItem.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{orderItem.productName}</Text>
            <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
            <Text style={styles.itemPrice}>
              {Number(orderItem.productPrice * orderItem.quantity).toLocaleString()} đ
            </Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Tổng cộng:</Text>
        <Text style={styles.totalPrice}>
          {Number(item.totalPrice).toLocaleString()} đ
        </Text>
      </View>

      {/* Action Buttons */}
      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancelOrder(item)}
        >
          <Text style={styles.cancelBtnText}>Hủy Đơn Hàng</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch Sử Đơn Hàng</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadOrders}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginTop: 6,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
    marginBottom: 4,
  },
  itemsSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E91E63',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  cancelBtn: {
    backgroundColor: '#FF5252',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default OrderScreen;
