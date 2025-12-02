import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Modal, 
  Alert 
} from 'react-native';
import { 
  Category, 
  fetchCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from './database';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const list = await fetchCategories();
    setCategories(list);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên danh mục không được để trống');
      return;
    }

    if (editingCategory) {
      await updateCategory(editingCategory.id, name.trim());
    } else {
      await addCategory(name.trim());
    }

    setModalVisible(false);
    loadCategories();
  };

  const handleDelete = (category: Category) => {
    Alert.alert('Xác nhận', `Bạn có muốn xóa danh mục "${category.name}"?`, [
      { text: 'Hủy' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteCategory(category.id);
          loadCategories();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <Text style={styles.categoryText}>{item.name}</Text>
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
      <Text style={styles.title}>Quản lý Danh mục</Text>
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Thêm Danh mục</Text>
      </TouchableOpacity>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục'}</Text>
            <TextInput
              placeholder="Tên danh mục"
              value={name}
              onChangeText={setName}
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

export default CategoryManagement;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  addButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, marginBottom: 12 },
  addButtonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  categoryCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryText: { fontSize: 16 },
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
