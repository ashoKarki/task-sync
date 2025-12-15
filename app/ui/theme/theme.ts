import { ColorSchemeName } from 'react-native';

export const getColors = (scheme: ColorSchemeName) => {
    const isDark = scheme === 'dark';

    return {
        background: isDark ? '#121212' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#000000',
        border: isDark ? '#333333' : '#DDDDDD',
        inputBg: isDark ? '#1E1E1E' : '#F5F5F5',
        button: isDark ? '#3B82F6' : '#2563EB',
        button_text: isDark ? '#FFFFFF' : '#FFFFFF'
    };
};
