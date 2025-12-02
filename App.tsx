import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppTabs from './android/app/src/components/AppTabs';

function App() {
  return (
    <NavigationContainer>
      <AppTabs/>
    </NavigationContainer>
  );
}

export default App;
