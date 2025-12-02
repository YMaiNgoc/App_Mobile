import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getUserByCredentials } from './database'; // kiểm tra user trong SQLite
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from './AppTabs';

const LoginSqlite = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const user = await getUserByCredentials(username, password);

      if (user) {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));

        Alert.alert('Thành công', `Xin chào, ${user.username}!`, [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to appropriate top-level tab
              if (user.role === 'admin') {
                navigation.navigate('AdminTab' as any);
              } else {
                navigation.navigate('HomeTab' as any);
              }
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Đăng nhập thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>

      <TextInput
        placeholder="Tên đăng nhập"
        style={styles.input}
        onChangeText={setUsername}
        value={username}
      />

      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignupSqlite' as any)}>
        <Text style={styles.switchText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: '#6200ea', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  switchText: { marginTop: 15, color: '#6200ea' },
});

export default LoginSqlite;
