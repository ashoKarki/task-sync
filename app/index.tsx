import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { taskEngine } from './application/TaskEngine';
import { initAppLifecycle } from './infra/lifecycle';
import { HomeScreen } from './ui';

export default function App() {
  useEffect(() => {
    taskEngine.init();

    const cleanupLifecycle = initAppLifecycle();

    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
        }
      } catch (err) {
        console.log('Notifications not supported in Expo Go', err);
      }
    })();

    return () => {
      cleanupLifecycle();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen />
    </SafeAreaView>
  );
}
