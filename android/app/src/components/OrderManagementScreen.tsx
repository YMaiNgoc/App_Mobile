import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Order, fetchOrders, updateOrderStatus } from './database';

const OrderManagementScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const statusOptions = [
    { value: 'pending', label: '⏳ Chờ xác nhận', color: '#FF9800' },
    { value: 'confirmed', label: '✅ Đã xác nhận', color: '#2196F3' },
    { value: 'shipped', label: '🚚 Đang giao', color: '#9C27B0' },
    { value: 'delivered', label: '📦 Đã giao', color: '#4CAF50' },
    { value: 'cancelled', label: '❌ Đã hủy', color: '#F44336' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await fetchOrders();
      // Sort by newest first
      const sortedOrders = fetchedOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;

    Alert.alert(
      'Cập nhật trạng thái',
      `Thay đổi thành "${statusOptions.find(s => s.value === newStatus)?.label}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await updateOrderStatus(selectedOrder.id, newStatus);
              Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
              setModalVisible(false);
              setSelectedOrder(null);
              loadOrders();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
            }
          },
        },
      ]
    );
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const statusInfo = getStatusInfo(order.status);
    const totalItems = order.items?.length || 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => {
          setSelectedOrder(order);
          setModalVisible(true);
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderCodeSection}>
            <Text style={styles.orderCode}>{order.orderCode}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.orderContent}>
          <View style={styles.customerSection}>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.customerPhone}>{order.customerPhone}</Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.itemCountLabel}>{totalItems} sp</Text>
            <Text style={styles.totalPrice}>
              {Number(order.totalPrice).toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Quản Lý Đơn Hàng</Text>
        <Text style={styles.orderCount}>({orders.length} đơn)</Text>
      </View>

      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadOrders} />
          }
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có đơn hàng</Text>
        </View>
      )}

      {/* Order Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi Tiết Đơn Hàng</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedOrder && (
                <>
                  {/* Order Code */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Mã đơn:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.orderCode}</Text>
                  </View>

                  {/* Status */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Trạng thái:</Text>
                    <View
                      style={[
                        styles.statusBadgeLarge,
                        { backgroundColor: getStatusInfo(selectedOrder.status).color },
                      ]}
                    >
                      <Text style={styles.statusTextLarge}>
                        {getStatusInfo(selectedOrder.status).label}
                      </Text>
                    </View>
                  </View>

                  {/* Customer Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Khách hàng:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.customerName}</Text>
                    <Text style={styles.detailValue}>{selectedOrder.customerPhone}</Text>
                    <Text style={styles.detailValue}>{selectedOrder.customerEmail}</Text>
                  </View>

                  {/* Shipping Address */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Địa chỉ giao:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.shippingAddress}</Text>
                  </View>

                  {/* Order Items */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Sản phẩm ({selectedOrder.items?.length || 0}):</Text>
                    {selectedOrder.items?.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <View style={styles.itemDetail}>
                          <Text style={styles.itemName}>{item.productName}</Text>
                          <Text style={styles.itemQty}>SL: {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>
                          {Number(item.productPrice).toLocaleString('vi-VN')} đ
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalPriceModal}>
                      {Number(selectedOrder.totalPrice).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>

                  {/* Created Date */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ngày đặt:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  {/* Status Update Buttons */}
                  <View style={styles.statusButtonsSection}>
                    <Text style={styles.detailLabel}>Cập nhật trạng thái:</Text>
                    <View style={styles.statusButtons}>
                      {statusOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.statusUpdateBtn,
                            selectedOrder.status === option.value && styles.statusUpdateBtnActive,
                          ]}
                          onPress={() => handleStatusChange(option.value)}
                          disabled={selectedOrder.status === option.value}
                        >
                          <Text
                            style={[
                              styles.statusUpdateBtnText,
                              selectedOrder.status === option.value && styles.statusUpdateBtnTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  orderCount: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderCodeSection: {
    flex: 1,
  },
  orderCode: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerSection: {
    flex: 1,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  customerPhone: {
    fontSize: 11,
    color: '#666',
    marginTop: 3,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  itemCountLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ff3b6b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 20,
    color: '#999',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailSection: {
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    marginBottom: 6,
  },
  itemDetail: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  itemQty: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff3b6b',
    marginLeft: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8F9',
    borderRadius: 6,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  totalPriceModal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3b6b',
  },
  statusButtonsSection: {
    marginBottom: 14,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusUpdateBtn: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  statusUpdateBtnActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  statusUpdateBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  statusUpdateBtnTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  closeModalBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    backgroundColor: '#ff3b6b',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OrderManagementScreen;
