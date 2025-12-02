import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  initDatabase,
  fetchCategories,
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
  Category,
  searchProductsByNameOrCategory,
} from './database';

const ProductManagementScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    initDatabase(() => loadData());
  }, []);

  const loadData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods.reverse());
  };

  const handleAddOrUpdate = async () => {
    if (!name || !price) return;
    const productData = { name, price: parseFloat(price), img: imageUri || 'hinh1.jpg', categoryId };
    try {
      if (editingId !== null) {
        await updateProduct({ id: editingId, ...productData });
        setEditingId(null);
      } else {
        await addProduct(productData);
      }
      setName(''); setPrice(''); setCategoryId(1); setImageUri(null);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (id: number) => {
    const p = products.find(x => x.id === id);
    if (p) {
      setName(p.name); setPrice(p.price.toString()); setCategoryId(p.categoryId); setImageUri(p.img);
      setEditingId(p.id);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa sản phẩm này không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => { await deleteProduct(id); loadData(); } },
    ]);
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, response => {
      if (response.assets && response.assets[0]) setImageUri(response.assets[0].uri ?? null);
    });
  };

//   const getImageSource = (img: string) => {
//     if (img.startsWith('file://')) return { uri: img };
//     switch (img) {
//       case 'hinh1.jpg': return require('./hinh1.jpg');
//       case 'hinh2.jpg': return require('./hinh2.jpg');
//       default: return require('./hinh1.jpg');
//     }
//   };
const getImageSource = (img: string | null | undefined)  => {
    if (!img) return require('./hinh1.jpg'); // fallback nếu img null

    if (img.startsWith('file://')) {
        return { uri: img };
    }

    switch (img) {
        case 'hinh1.jpg': return require('./hinh1.jpg');
        case 'hinh2.jpg': return require('./hinh2.jpg');
        default: return require('./hinh1.jpg');
    }
    };


  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) loadData();
    else {
      const results = await searchProductsByNameOrCategory(keyword);
      setProducts(results.reverse());
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={getImageSource(item.img)} style={styles.image} />
      <View style={styles.cardInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{Number(item.price).toLocaleString()} đ</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.iconButton}>
            <Text style={styles.icon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.iconButton, { backgroundColor: '#FF5252' }]}>
            <Text style={styles.icon}>❌</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Quản lý sản phẩm</Text>
          <TextInput style={styles.input} placeholder="Tên sản phẩm" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Giá sản phẩm" keyboardType="numeric" value={price} onChangeText={setPrice} />
          <View style={styles.pickerContainer}>
            <Picker selectedValue={categoryId} onValueChange={value => setCategoryId(value)} style={styles.picker}>
              {categories.map(c => (<Picker.Item label={c.name} value={c.id} key={c.id} />))}
            </Picker>
          </View>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            <Text style={styles.buttonText}>{imageUri ? 'Chọn lại hình ảnh' : 'Chọn hình ảnh'}</Text>
          </TouchableOpacity>
          {imageUri && <Image source={getImageSource(imageUri)} style={styles.selectedImage} />}
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={handleAddOrUpdate}>
            <Text style={styles.buttonText}>{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</Text>
          </TouchableOpacity>
          <TextInput style={styles.input} placeholder="Tìm theo tên sản phẩm hoặc loại" onChangeText={handleSearch} />
        </>
      }
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có sản phẩm nào</Text>}
    />
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#333' },
  input: { height: 45, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: {width:0, height:2}, shadowRadius: 4 },
  button: { padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: {width:0,height:3}, shadowRadius:5, elevation:3 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', borderRadius: 12, backgroundColor: '#fff', marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width:0,height:3}, shadowRadius:6, elevation:3 },
  image: { width: 90, height: 90, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  selectedImage: { width: 120, height: 120, marginVertical: 12, alignSelf: 'center', borderRadius: 12 },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  productName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  productPrice: { color: '#555', marginTop: 4 },
  iconRow: { flexDirection: 'row', marginTop: 10 },
  iconButton: { padding: 6, backgroundColor: '#2196F3', borderRadius: 6, marginRight: 10 },
  icon: { color: '#fff', fontSize: 16 },
  imagePicker: { backgroundColor: '#FF9800', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 12, overflow: 'hidden', backgroundColor: '#fff' },
  picker: { height: 45 },
});

export default ProductManagementScreen;
