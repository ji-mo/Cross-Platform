import { StyleSheet } from 'react-native';

const absoluteFill = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  item: {
    backgroundColor: '#000',
  },
  media: {
    ...absoluteFill,
    width: '100%',
    height: '100%',
  },
  loadingLayer: {
    ...absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 4,
  },
  author: {
    color: '#fff',
    marginBottom: 12,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
  modal: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 24,
  },
  closeText: {
    fontSize: 16,
  },
});

export default styles;
