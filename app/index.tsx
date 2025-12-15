import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { taskEngine } from './application/TaskEngine';
import { HomeScreen } from './ui';

export default function Index() {
  useEffect(() => {
    taskEngine.init();
  }, []);
  return (
    <>

      <HomeScreen />
      <StatusBar style="inverted" />
    </>
  );
}
