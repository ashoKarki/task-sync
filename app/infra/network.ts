import * as Network from 'expo-network';

type Listener = (online: boolean) => void;

let listeners: Listener[] = [];

export const subscribeToNetwork = async () => {
  const state = await Network.getNetworkStateAsync();
  notify(state.isConnected ?? false);

  setInterval(async () => {
    const s = await Network.getNetworkStateAsync();
    notify(s.isConnected ?? false);
  }, 3000);
};

const notify = (online: boolean) => {
  listeners.forEach(l => l(online));
};

export const onNetworkChange = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};
