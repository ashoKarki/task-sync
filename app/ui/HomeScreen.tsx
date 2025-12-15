import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    LayoutAnimation,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    useColorScheme,
    View
} from 'react-native';
import { taskEngine } from '../application/TaskEngine';
import { styles } from './styles/HomeScreen.styles';
import { getColors } from './theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
    const scheme = useColorScheme();
    const colors = getColors(scheme);

    const [tasks, setTasks] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [online, setOnline] = useState(false);
    const [showOnlineToast, setShowOnlineToast] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const toastAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const unsubTasks = taskEngine.subscribe((updatedTasks) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setTasks(updatedTasks);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
        });

        const unsubNetwork = taskEngine.subscribeNetwork((status) => {
            if (!status) {
                setOnline(false);
            } else {
                if (!online) {
                    console.warn('network just came up');

                    setOnline(true);
                    setShowOnlineToast(true);
                    Animated.timing(toastAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true
                    }).start();


                    setTimeout(() => {
                        Animated.timing(toastAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true
                        }).start(() => setShowOnlineToast(false));
                    }, 3000);
                } else {
                    setOnline(true);
                }
            }
        });

        return () => {
            unsubTasks();
            unsubNetwork();
        };
    }, [online]);

    const renderItem = ({ item }: { item: any }) => {
        const date = new Date(item.payload.createdAt);
        const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

        const isFailedMaxRetries = item.status === 'failed' && item.retries >= item.maxRetries;

        return (
            <View
                style={[
                    styles.taskCard,
                    {
                        borderColor: colors.border,
                        backgroundColor:
                            item.status === 'processing'
                                ? '#f6de05ff'
                                : item.status === 'failed'
                                    ? '#f6071bff'
                                    : colors.inputBg,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 1,
                        elevation: 2,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                ]}
            >
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 14, marginBottom: 2 }}>
                        {item.payload.message}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 12 }}>
                        Status: {item.status.toUpperCase()} | | Retries: {item.retries}/{item.maxRetries}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 10, marginTop: 2 }}>
                        Created at: {time}
                    </Text>
                </View>


                {isFailedMaxRetries && (
                    <TouchableOpacity
                        onPress={() => {

                            item.status = 'pending';
                            item.retries = 0;
                            taskEngine['tasks'] = [...taskEngine['tasks']];
                            taskEngine.processQueue();
                        }}
                        style={{ marginLeft: 10 }}
                    >
                        <Ionicons name="refresh-circle" size={24} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {!online && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 40,
                        backgroundColor: 'red',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}> 😭 we are offline</Text>
                </View>
            )}


            {showOnlineToast && (
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 40,
                        backgroundColor: 'green',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2,
                        opacity: toastAnim
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>😊 finally online</Text>
                </Animated.View>
            )}

            <TextInput
                placeholder="Enter message"
                placeholderTextColor={colors.border}
                value={text}
                onChangeText={setText}
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBg, color: colors.text }]}
            />
            <TouchableOpacity
                onPress={() => {
                    if (!text.trim()) return;
                    taskEngine.queueMessage(text);
                    setText('');
                }}
                disabled={text.length>0 ? false : true}
                style={[styles.button, { backgroundColor: colors.button }]}
            >
                <Text style={{ color: colors.button_text }}>Queue Message</Text>
            </TouchableOpacity>


            <FlatList
                ref={flatListRef}
                data={tasks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ marginTop: 20, paddingBottom: 20 }}
            />
        </View>
    );
}
