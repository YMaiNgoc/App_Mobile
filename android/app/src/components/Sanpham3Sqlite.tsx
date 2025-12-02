import React, {useEffect, useState} from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
// import RNPickerSelect from 'react-native-picker-select';
import {Picker} from '@react-native-picker/picker';
import {launchImageLibrary} from 'react-native-image-picker';
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

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './AppNavigatorProduct';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sanpham3Sqlite'>;

const Sanpham3Sqlite = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    initDatabase(() => {
      loadData();
    });
  }, []);

  const loadData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods.reverse());
  };

  const handleAddOrUpdate = async () => {
    if (!name || !price) return;

    const productData = {
      name,
      price: parseFloat(price),
      img: imageUri || 'hinh1.jpg', 
      categoryId,
    };

    try {
      if (editingId !== null) {
        await updateProduct({id: editingId, ...productData});
        setEditingId(null);
      } else {
        await addProduct(productData);
      }
      setName('');
      setPrice('');
      setCategoryId(1);
      setImageUri(null);
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (id: number) => {
    const p = products.find(x => x.id === id);
    if (p) {
      setName(p.name);
      setPrice(p.price.toString());
      setCategoryId(p.categoryId);
      setImageUri(p.img);
      setEditingId(p.id);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(id);
            loadData();
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handlePickImage = () => {
    launchImageLibrary({mediaType: 'photo', includeBase64: false}, response => {
if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri ?? null);
      }
    });
  };

  const getImageSource = (img: string) => {
    if (img.startsWith('file://')) {
      return {uri: img};
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

  const handleSearch = async (keyword: string) => {
    if (keyword.trim() === '') {
      loadData();
    } else {
      const results = await searchProductsByNameOrCategory(keyword);
      setProducts(results.reverse());
    }
  };

  const renderItem = ({item}: {item: Product}) => (
    <View style={styles.card}>
      <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { product: item })}>
      <Image source={getImageSource(item.img)} style={styles.image} />
    </TouchableOpacity>
      <View style={styles.cardInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{Number(item.price).toLocaleString()} đ</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => handleEdit(item.id)}>
            <Text style={styles.icon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
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
          <TextInput
            style={styles.input}
            placeholder="Tên sản phẩm"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Giá sản phẩm"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={value => setCategoryId(value)}
              style={styles.input}>
              {categories.map(c => (
                <Picker.Item label={c.name} value={c.id} key={c.id} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handlePickImage}>
            <Text style={styles.buttonText}>
              {imageUri ? 'Chọn lại hình ảnh' : 'Chọn hình ảnh'}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <Image
source={getImageSource(imageUri)}
              style={styles.selectedImage}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleAddOrUpdate}>
            <Text style={styles.buttonText}>
              {editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Tìm theo tên sản phẩm hoặc loại"
            onChangeText={handleSearch}
          />
        </>
      }
      contentContainerStyle={{padding: 16, paddingBottom: 100}}
      ListEmptyComponent={
        <Text style={{textAlign: 'center'}}>Không có sản phẩm nào</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 100},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#28a',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {color: '#fff', fontWeight: 'bold'},
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {width: 80, height: 80},
  selectedImage: {width: 100, height: 100, marginVertical: 10},
  cardInfo: {flex: 1, padding: 10, justifyContent: 'center'},
  productName: {fontWeight: 'bold', fontSize: 16},
  productPrice: {color: '#000'},
  iconRow: {flexDirection: 'row', marginTop: 10},
  icon: {fontSize: 20, marginRight: 10},
  imagePicker: {
    backgroundColor: 'rgba(153, 33, 17, 1)',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    marginBottom: 10,
  },
});

export default Sanpham3Sqlite;