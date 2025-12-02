// HomeScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import Header from './Header';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Product, initDatabase, fetchProducts, addToCart } from './database';

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const getImageSource = (img: string | null | undefined) => {
  if (!img) return require('./hinh1.jpg');
  // Treat any uri (file://, content://, https:// etc.) as a remote/local uri
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

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const [searchText, setSearchText] = useState('');
  const [maxPrice, setMaxPrice] = useState(''); // chỉ 1 ô lọc theo giá

  useEffect(() => {
    initDatabase(loadProducts);
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const loggedInUser = await AsyncStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setUserId(user.id);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Reload products each time screen comes into focus (e.g., after adding a product)
      loadProducts();
      loadUserId();
    }, [])
  );

  const loadProducts = async () => {
    const prods = await fetchProducts();
    setProducts(prods);
    setFilteredProducts(prods);
  };

  const applyFilters = () => {
    let data = [...products];

    // Lọc theo tên
    if (searchText.trim() !== '') {
      data = data.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lọc theo giá ≤ maxPrice
    if (maxPrice.trim() !== '') {
      // Remove spaces and parse as number to handle both "500000" and "500 000"
      const max = parseFloat(maxPrice.replace(/\s/g, '')) || 0;
      data = data.filter(p => {
        const productPrice = Number(p.price);
        return productPrice <= max;
      });
    }

    setFilteredProducts(data);
  };

  // Tự động lọc khi nhập
  useEffect(() => {
    applyFilters();
  }, [searchText, maxPrice, products]);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Details', { product: item })}
      style={styles.productCard}
    >
      <Image source={getImageSource(item.img)} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>{Number(item.price).toLocaleString()} đ</Text>
      <TouchableOpacity
        style={styles.buyButton}
        onPress={async () => {
          await addToCart(item, 1, userId || undefined);
          Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng', [
            { text: 'Tiếp tục mua', style: 'cancel' },
            { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
          ]);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.buyButtonText}>Mua Ngay</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image source={require('./banner.jpg')} style={styles.banner} />
      <Header 
        showCartIcon={true}
        onCartPress={() => navigation.navigate('Cart')}
      />

      {/* 🔎 Tìm kiếm + Lọc giá (1 ô) */}
      <View style={styles.filterBox}>
        <TextInput
          placeholder="Tìm sản phẩm..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />

        <View style={styles.priceRow}>
          <TextInput
            placeholder="Giá tối đa..."
            keyboardType="numeric"
            style={styles.priceInput}
            value={maxPrice}
            onChangeText={setMaxPrice}
          />

          {/* <TouchableOpacity style={styles.filterButton} onPress={applyFilters}>
            <Text style={styles.filterButtonText}>Lọc</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có sản phẩm nào.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 10 },

  banner: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 12,
    marginVertical: 8
  },

  filterBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    elevation: 3,
  },

  searchInput: {
    backgroundColor: '#F0F0F0',
    padding: 5,
    borderRadius: 10,
    fontSize: 12,
    marginBottom: 8,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  priceInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 5,
    borderRadius: 10,
    fontSize: 12,
    marginRight: 8,
  },

  filterButton: {
    backgroundColor: '#ff3b6b',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  filterButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },

  listContainer: { paddingBottom: 25 },

  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    elevation: 4
  },

  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#fafafa'
  },

  productName: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center'
  },

  productPrice: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: 'bold',
    marginVertical: 6
  },

  buyButton: {
    width: '100%',
    backgroundColor: '#ff3b6b',
    paddingVertical: 8,
    borderRadius: 8
  },

  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
});

export default HomeScreen;
