import styles from '@/styles/videoTabStyles';
import type { VideoCommentsModalProps } from '@/types/videoFeed';
import type React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export default function VideoCommentsModal({
  visible,
  videoId,
  onClose,
}: VideoCommentsModalProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>
          {videoId === null ? 'Comments' : `Comments for ${videoId}`}
        </Text>

        <TouchableOpacity
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close comments"
        >
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
