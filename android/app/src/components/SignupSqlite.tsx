import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { addUser } from './database'; 
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabParamList } from './AppTabs';

const SignupSqlite = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('user'); 
  // const [role] = useState('admin'); 

  const navigation = useNavigation<NativeStackNavigationProp<BottomTabParamList>>();

  const handleSignup = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const success = await addUser(username, password, role);

      if (success) {
        Alert.alert('Thành công', 'Đăng ký thành công!', [
          { text: 'OK', onPress: () => navigation.navigate('LoginSqlite') },
        ]);
      } else {
        Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại hoặc đăng ký thất bại');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Đăng ký thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Ký</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Đăng Ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('LoginSqlite')}>
        <Text style={styles.switchText}>Đã có tài khoản? Đăng nhập ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  button: { backgroundColor: '#6200ea', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  switchText: { marginTop: 15, color: '#6200ea' },
});

export default SignupSqlite;
