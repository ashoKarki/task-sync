import { AppState, AppStateStatus } from 'react-native';
import { taskEngine } from '../application/TaskEngine';

let currentState: AppStateStatus = AppState.currentState;

export const initAppLifecycle = () => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
        if (currentState.match(/inactive|background/) && nextState === 'active') {
            console.log('App has come to the foreground!');
            taskEngine.processQueue();
        }
        currentState = nextState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
        subscription.remove();
    };
};
