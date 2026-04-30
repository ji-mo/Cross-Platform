import VideoCommentsModal from '@/components/VideoCommentsModal';
import VideoFeedItem from '@/components/VideoFeedItem';
import styles from '@/styles/videoTabStyles';
import type { VideoItem } from '@/types/videoFeed';
import {
  FlashList,
  type FlashListProps,
  type ListRenderItemInfo,
} from '@shopify/flash-list';
import type React from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppStateStatus, ViewabilityConfig } from 'react-native';
import { AppState, Text, useWindowDimensions, View } from 'react-native';

const MOCK_VIDEO_COUNT = 120;
const VIDEO_PRELOAD_DISTANCE = 1;
const VIEWABILITY_CONFIG: ViewabilityConfig = {
  itemVisiblePercentThreshold: 80,
  minimumViewTime: 300,
};

interface VideoFeedExtraData {
  currentIndex: number;
  isAppActive: boolean;
  screenHeight: number;
}

function createMockVideos(): VideoItem[] {
  return Array.from({ length: MOCK_VIDEO_COUNT }, (_, index): VideoItem => ({
    id: `video_${index}`,
    authorName: `Creator ${index}`,
    authorAvatar: `https://dummyimage.com/720x1280/000/fff&text=Sample+5s`,
    videoUrl: `https://www.w3schools.com/html/mov_bbb.mp4`,
    thumbnailUrl: `https://peach.blender.org/wp-content/uploads/title_anouncement.jpg`,
    title: `Video title ${index}`,
    liked: false,
    likeCount: Math.floor(Math.random() * 5000),
    followed: false,
  }));
}

function keyExtractor(item: VideoItem): string {
  return item.id;
}

export default function VideoFeedScreen(): React.JSX.Element {
  const currentIndexRef = useRef(0);
  const { height: screenHeight } = useWindowDimensions();

  const [videos, setVideos] = useState<VideoItem[]>(createMockVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  const [isAppActive, setIsAppActive] = useState<boolean>(
    (): boolean => AppState.currentState === 'active',
  );

  useEffect((): (() => void) => {
    const handleAppStateChange = (nextState: AppStateStatus): void => {
      setIsAppActive(nextState === 'active');
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return (): void => {
      subscription.remove();
    };
  }, []);

  const onViewableItemsChanged = useRef<
    NonNullable<FlashListProps<VideoItem>['onViewableItemsChanged']>
  >(({ viewableItems }): void => {
    const firstVisible = viewableItems.find(
      (item): boolean => item.isViewable && typeof item.index === 'number',
    );
    if (firstVisible?.index === null || firstVisible?.index === undefined) {
      return;
    }
    const nextIndex = firstVisible.index;
    if (nextIndex === currentIndexRef.current) {
      return;
    }
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
  }).current;

  const handleLike = useCallback((id: string): void => {
    setVideos((prev): VideoItem[] =>
      prev.map((item): VideoItem => {
        if (item.id !== id) {
          return item;
        }
        const liked = !item.liked;
        return {
          ...item,
          liked,
          likeCount: liked
            ? item.likeCount + 1
            : Math.max(0, item.likeCount - 1),
        };
      }),
    );
  }, []);

  const handleFollow = useCallback((id: string): void => {
    setVideos((prev): VideoItem[] =>
      prev.map((item): VideoItem =>
        item.id === id
          ? {
              ...item,
              followed: !item.followed,
            }
          : item,
      ),
    );
  }, []);

  const handleOpenComments = useCallback((id: string): void => {
    setCommentVideoId(id);
  }, []);

  const handleCloseComments = useCallback((): void => {
    setCommentVideoId(null);
  }, []);

  const renderItem = useCallback(
    ({
      item,
      index,
      target,
    }: ListRenderItemInfo<VideoItem>): React.JSX.Element => {
      const distance = Math.abs(index - currentIndex);
      const isCell = target === 'Cell';

      return (
        <VideoFeedItem
          item={item}
          itemHeight={screenHeight}
          shouldMountVideo={isCell && distance <= VIDEO_PRELOAD_DISTANCE}
          shouldPlayVideo={isCell && index === currentIndex && isAppActive}
          onLike={handleLike}
          onFollow={handleFollow}
          onOpenComments={handleOpenComments}
        />
      );
    },
    [
      currentIndex,
      handleFollow,
      handleLike,
      handleOpenComments,
      isAppActive,
      screenHeight,
    ],
  );

  const renderEmptyList = useCallback(
    (): React.JSX.Element => (
      <View style={[styles.emptyState, { height: screenHeight }]}>
        <Text style={styles.emptyText}>No videos</Text>
      </View>
    ),
    [screenHeight],
  );

  const extraData = useMemo<VideoFeedExtraData>(
    (): VideoFeedExtraData => ({
      currentIndex,
      isAppActive,
      screenHeight,
    }),
    [currentIndex, isAppActive, screenHeight],
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyList}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewableItemsChanged}
        drawDistance={screenHeight}
        extraData={extraData}
        removeClippedSubviews={false}
      />

      <VideoCommentsModal
        visible={commentVideoId !== null}
        videoId={commentVideoId}
        onClose={handleCloseComments}
      />
    </View>
  );
}
