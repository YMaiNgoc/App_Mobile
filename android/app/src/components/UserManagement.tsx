import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal, Alert } from 'react-native';
import { User, fetchUsers, addUser, updateUser, deleteUser } from './database';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await fetchUsers();
    setUsers(list);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setRole('user');
    setModalVisible(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(user.password);
    setRole(user.role);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (editingUser) {
      await updateUser({ id: editingUser.id, username, password, role });
    } else {
      const success = await addUser(username, password, role);
      if (!success) {
        Alert.alert('Lỗi', 'Username đã tồn tại');
        return;
      }
    }

    setModalVisible(false);
    loadUsers();
  };

  const handleDelete = (user: User) => {
    Alert.alert('Xác nhận', `Bạn có muốn xóa user "${user.username}"?`, [
      { text: 'Hủy' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteUser(user.id);
          loadUsers();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Text style={styles.userText}>{item.username} ({item.role})</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý User</Text>
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Thêm User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingUser ? 'Sửa User' : 'Thêm User'}</Text>
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
            <TextInput
              placeholder="Role (admin/user)"
              value={role}
              onChangeText={setRole}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserManagement;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  addButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, marginBottom: 12 },
  addButtonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  userCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userText: { fontSize: 16 },
  buttons: { flexDirection: 'row' },
  editButton: { backgroundColor: '#2196F3', padding: 6, borderRadius: 6, marginRight: 6 },
  deleteButton: { backgroundColor: '#F44336', padding: 6, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  saveButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, flex: 1, marginRight: 6 },
  cancelButton: { backgroundColor: '#F44336', padding: 10, borderRadius: 8, flex: 1, marginLeft: 6 },
});
