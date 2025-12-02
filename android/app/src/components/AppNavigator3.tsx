import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AppTabs from './AppTabs';
// import AccessoryScreen from './AccessoryScreen';
// import FashionScreen from './FashionScreen';
import DetailsScreen from './DetailsScreen';

import { HomeStackParamList } from './types';
const Stack = createNativeStackNavigator<HomeStackParamList>(); // ✅ Thêm kiểu dữ liệu

const AppNavigator3 = () => {
  return (
    <NavigationContainer>
      {/* <Stack.Navigator>
        <Stack.Screen name="Main" component={AppTabs} options={{ headerShown: false }} />
      </Stack.Navigator> */}
      {/* ko cần phải viết như trên nếu chỉ có AppTabs */}
      <AppTabs/>
      {/* phải bọc Apptabs trong NavigationContainer */}
    </NavigationContainer>
  );
};

export default AppNavigator3;