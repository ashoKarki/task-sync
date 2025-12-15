import { useEffect, useState } from 'react';
import {
    Button,
    ScrollView,
    Text,
    TextInput,
    useColorScheme,
    View
} from 'react-native';
import { taskEngine } from '../application/TaskEngine';
import { getColors } from './theme';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);

  const [tasks, setTasks] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const unsubTasks = taskEngine.subscribe(setTasks);
    const unsubNetwork = taskEngine.subscribeNetwork(setOnline);

    return () => {
      unsubTasks();
      unsubNetwork();
    };
  }, []);
  
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
      {/* Network Status */}
      <Text
        style={{
          color: online ? 'limegreen' : 'tomato',
          fontWeight: 'bold',
          marginBottom: 10
        }}
      >
        {online ? '🟢 Online' : '🔴 Offline'}
      </Text>

      {/* Input */}
      <TextInput
        placeholder="Message"
        placeholderTextColor={colors.border}
        value={text}
        onChangeText={setText}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.inputBg,
          color: colors.text,
          padding: 10,
          marginVertical: 10
        }}
      />

      <Button
        title="Queue Message"
        onPress={() => {
          if (!text.trim()) return;
          taskEngine.queueMessage(text);
          setText('');
        }}
        color={colors.button}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Process Queue"
        onPress={() => taskEngine.processQueue()}
        color={colors.button}
      />

      {/* Task Status List */}
      <ScrollView style={{ marginTop: 20, flex: 1 }}>
        {tasks.map((task) => (
          <View
            key={task.id}
            style={{
              padding: 10,
              marginVertical: 5,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor:
                task.status === 'processing'
                  ? '#28ea0eff'
                  : task.status === 'failed'
                  ? '#f41a2cff'
                  : colors.inputBg,
            }}
          >
            <Text style={{ color: colors.text }}>{task.payload.message}</Text>
            <Text style={{ color: colors.text, fontSize: 12 }}>
              Status: {task.status.toUpperCase()} | Retries: {task.retries}/{task.maxRetries}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
