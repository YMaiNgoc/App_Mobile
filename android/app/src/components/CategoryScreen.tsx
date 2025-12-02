import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Category, fetchCategories, fetchProductsByCategory, Product } from './database';
import { useNavigation } from '@react-navigation/native';

const CategoriesScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const list = await fetchCategories();
    setCategories(list);
  };

  const handleCategoryPress = async (category: Category) => {
    // Lấy sản phẩm theo category
    const products: Product[] = await fetchProductsByCategory(category.id);
    // navigation.navigate('ProductsByCategory', { category, products });
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item)}>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh mục sản phẩm</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  categoryCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
  categoryText: { fontSize: 18, fontWeight: '600', color: '#333', textAlign: 'center' },
});
