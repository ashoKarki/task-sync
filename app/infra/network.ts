import * as Network from 'expo-network';

type Listener = (online: boolean) => void;
let listeners: Listener[] = [];

export const onNetworkChange = (listener: Listener) => {
    listeners.push(listener);
    Network.getNetworkStateAsync().then(state => listener(state.isConnected ?? false));
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};

setInterval(async () => {
    const state = await Network.getNetworkStateAsync();
    listeners.forEach(l => l(state.isConnected ?? false));
}, 3000);
