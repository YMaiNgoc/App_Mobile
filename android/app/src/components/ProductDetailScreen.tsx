import React from 'react';
import { ScrollView, Image, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product } from './database';
import { RootStackParamList } from './AppNavigatorProduct';

// Typing cho route và navigation
type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { product } = route.params; // Lấy product được truyền từ Sanpham3Sqlite

  // Hàm lấy source hình ảnh (local hoặc remote)
  const getImageSource = (img: string) => {
    if (!img) return require('./hinh1.jpg'); // default
    if (img.startsWith('http') || img.startsWith('file://')) {
      return { uri: img };
    }
    switch (img) {
      case 'hinh1.jpg':
        return require('./hinh1.jpg');
      case 'hinh2.jpg':
        return require('./hinh2.jpg');
      default:
        return require('./hinh1.jpg');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={getImageSource(product.img)} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{Number(product.price).toLocaleString()} đ</Text>
      <Text style={styles.label}>Xem các sản phẩm khác:</Text>
      {/* Bạn có thể thêm danh sách sản phẩm khác ở đây */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    color: 'green',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
});

export default ProductDetailScreen;
