// import React, { useCallback, useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { BottomTabParamList } from './AppTabs';

// const Header = () => {
//   const [user, setUser] = useState<{ username: string; role: string } | null>(null);
//   const navigation = useNavigation<NativeStackNavigationProp<BottomTabParamList>>();
//   useFocusEffect(
//     useCallback(() => {
//       const loadUser = async () => {
//         const loggedInUser = await AsyncStorage.getItem('loggedInUser');
//         setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
//       };
//       loadUser();
//     }, [])
//   );

//   const handleLogout = async () => {
//     await AsyncStorage.removeItem('loggedInUser');
//     setUser(null);

//     navigation.navigate('LoginSqlite');
//   };

//   return (
//     <View style={styles.header}>
//       {user ? (
//         <>
//           <Text style={styles.userInfo}>
//             {user.username && user.role ? (
//               <Text style={styles.userInfo}>
//                 Xin chào, {String(user.username)} ({String(user.role)})
//               </Text>
//             ) : null}
//           </Text>
//           <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
//             <Text style={styles.logoutText}>Đăng Xuất</Text>
//           </TouchableOpacity>
//         </>
//       ) : null}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 0,
//     backgroundColor: '#6200ea',
//   },
//   userInfo: {
//     color: 'white',
//     fontSize: 16,
//   },
//   logoutButton: {
//     backgroundColor: '#ff5252',
//     padding: 8,
//     borderRadius: 5,
//   },
//   logoutText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });

// export default Header;
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeStackParamList } from './types';
import { BottomTabParamList } from './AppTabs';

interface HeaderProps {
  showCartIcon?: boolean;
  onCartPress?: () => void;
}

const Header = ({ showCartIcon = false, onCartPress }: HeaderProps) => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const parentNav = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const loggedInUser = await AsyncStorage.getItem('loggedInUser');
        setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
      };
      loadUser();
    }, [])
  );

  const handleGoHome = () => {
    if (!user) return;
    // Navigate to appropriate tab based on user role
    if (user.role === 'admin') {
      parentNav.navigate('AdminTab' as any);
    } else {
      parentNav.navigate('HomeTab' as any);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedInUser');
    setUser(null);
    // Navigate to LoginSqlite tab using parent (bottom tab) navigator
    parentNav.navigate('LoginSqlite' as any);
  };

  return (
    <View style={styles.header} pointerEvents={user ? 'auto' : 'none'}>
      {user ? (
        <>
          <Text style={styles.userInfo}>
            Xin chào, {user.username} ({user.role})
          </Text>

          <View style={styles.rightButtons}>
            {/* Profile Button */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('UserProfile')}
              style={styles.iconButton}
            >
              <Text style={styles.icon}>👤</Text>
            </TouchableOpacity>

            {/* Cart Button - only for non-admin */}
            {user.role !== 'admin' && showCartIcon && (
              <TouchableOpacity 
                onPress={onCartPress}
                style={styles.iconButton}
              >
                <Text style={styles.icon}>🛒</Text>
              </TouchableOpacity>
            )}

            {/* Admin Button */}
            {user.role === 'admin' && (
              <TouchableOpacity onPress={handleGoHome} style={styles.adminButton}>
                <Text style={styles.adminText}>Admin</Text>
              </TouchableOpacity>
            )}

            {/* Logout Button */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Đăng Xuất</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#6200ea',
    minHeight: 50,
  },
  userInfo: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    fontSize: 20,
  },
  adminButton: {
    backgroundColor: '#ff9800',
    padding: 6,
    borderRadius: 5,
  },
  adminText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#ff5252',
    padding: 6,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default Header;
