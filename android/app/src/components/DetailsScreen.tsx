// DetailsScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { Product, Category, fetchCategories, fetchProductsByCategory } from './database';
import CategorySelector from './CategorySelector';

type DetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'Details'>;

const getImageSource = (img: string) => {
  if (img && img.startsWith('file://')) {
    return { uri: img };
  }
  switch (img) {
    case 'hinh1.jpg': return require('./hinh1.jpg');
    case 'hinh2.jpg': return require('./hinh2.jpg');
    default: return require('./giay.jpg');
  }
};

const DetailsScreen = ({ route, navigation }: DetailsScreenProps) => {
  const { product } = route.params;
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    if (product.categoryId) {
      fetchProductsByCategory(product.categoryId).then(products => {
        setRelatedProducts(products.filter(p => p.id !== product.id));
      });
    }
  }, [product]);

  const handleSelectCategory = (id: number) => {
    const selectedCategory = categories.find(c => c.id === id);
    if (selectedCategory) {
      navigation.push('ProductsByCategory', {
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
      });
    }
  };
  
  const renderRelatedProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => navigation.push('Details', { product: item })}
    >
      <Image source={getImageSource(item.img)} style={styles.relatedImage} />
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.relatedPrice}>{Number(item.price).toLocaleString()} đ</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>⬅️ Quay lại</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>{product.name}</Text>
      <Image source={getImageSource(product.img)} style={styles.productImage} />
      <Text style={styles.price}>{Number(product.price).toLocaleString()} đ</Text>
      <Text style={styles.sectionTitle}>Mô tả</Text>
      <Text style={styles.description}>Đây là mô tả chi tiết cho sản phẩm {product.name}. Nội dung này sẽ được cập nhật sớm.</Text>
      
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Danh mục khác</Text>
      <CategorySelector
        categories={categories}
        selectedId={product.categoryId}
onSelect={handleSelectCategory}
      />

      {relatedProducts.length > 0 && (
        <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
            <FlatList
                data={relatedProducts}
                renderItem={renderRelatedProduct}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
            />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
    backButton: { paddingVertical: 10 },
    backButtonText: { fontSize: 16, color: '#007bff' },
    title: { fontSize: 24, fontWeight: 'bold', marginVertical: 10, color: '#333' },
    price: { fontSize: 20, color: '#E91E63', fontWeight: 'bold', marginBottom: 15 },
    productImage: { width: '100%', height: 250, borderRadius: 10, marginBottom: 20, resizeMode: 'contain' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#444' },
    description: { fontSize: 16, lineHeight: 24, color: '#666' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    relatedCard: { width: 150, marginRight: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9' },
    relatedImage: { width: '100%', height: 100, borderTopLeftRadius: 8, borderTopRightRadius: 8, resizeMode: 'contain' },
    relatedInfo: { padding: 8 },
    relatedName: { fontWeight: '600', fontSize: 14 },
    relatedPrice: { color: '#E91E63', marginTop: 5 }
});

export default DetailsScreen;