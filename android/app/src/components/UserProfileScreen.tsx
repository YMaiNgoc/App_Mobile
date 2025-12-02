import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { User, getUserProfile, updateUserProfile } from './database';

type UserProfileScreenProps = NativeStackScreenProps<HomeStackParamList, 'UserProfile'>;

const UserProfileScreen = ({ navigation }: UserProfileScreenProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const loggedInUser = await AsyncStorage.getItem('loggedInUser');
      if (loggedInUser) {
        const parsedUser = JSON.parse(loggedInUser);
        const userProfile = await getUserProfile(parsedUser.id);
        if (userProfile) {
          setUser(userProfile);
          setFullName(userProfile.fullName || '');
          setPhone(userProfile.phone || '');
          setEmail(userProfile.email || '');
          setAddress(userProfile.address || '');
        }
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const success = await updateUserProfile(user.id, fullName, phone, email, address);
      if (success) {
        Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        setIsEditing(false);
        loadUserProfile();
      } else {
        Alert.alert('Lỗi', 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Không có dữ liệu người dùng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thông Tin Cá Nhân</Text>

      {/* User Info Box */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tên đăng nhập:</Text>
          <Text style={styles.value}>{user.username}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vai trò:</Text>
          <Text style={styles.value}>{user.role === 'admin' ? 'Quản lý' : 'Khách hàng'}</Text>
        </View>
      </View>

      {/* Profile Edit Section */}
      <Text style={styles.sectionTitle}>Thông Tin Chi Tiết</Text>

      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Địa chỉ"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
          />

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.btnDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>💾 Lưu Thay Đổi</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setIsEditing(false)}
            disabled={loading}
          >
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.displayBox}>
            <View style={styles.displayRow}>
              <Text style={styles.displayLabel}>Họ và tên:</Text>
              <Text style={styles.displayValue}>{fullName || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={styles.displayLabel}>Số điện thoại:</Text>
              <Text style={styles.displayValue}>{phone || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={styles.displayLabel}>Email:</Text>
              <Text style={styles.displayValue}>{email || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={styles.displayLabel}>Địa chỉ:</Text>
              <Text style={styles.displayValue}>{address || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editBtnText}>✏️ Chỉnh Sửa</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  displayBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  displayRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  displayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  displayValue: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
  },
  addressInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  editBtn: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#FF5252',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#FF5252',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default UserProfileScreen;
