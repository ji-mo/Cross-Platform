import { useRouter } from 'expo-router';
import type React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();

  const navigateToVideo = (): void => {
    router.push('/videoPage');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Pressable
        accessibilityRole="button"
        onPress={navigateToVideo}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Open Video Stack</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    flex: 1,
    gap: 24,
    justifyContent: 'center',
    padding: 24,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    minHeight: 48,
    minWidth: 180,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
});
