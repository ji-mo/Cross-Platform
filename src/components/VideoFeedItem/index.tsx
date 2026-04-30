import styles from '@/styles/videoTabStyles';
import type { VideoFeedItemProps } from '@/types/videoFeed';
import type { ImageSource } from 'expo-image';
import { Image } from 'expo-image';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  OnBufferData,
  OnProgressData,
  OnVideoErrorData,
  ReactVideoSource,
} from 'react-native-video';
import Video from 'react-native-video';

const VideoFeedItem = memo(function VideoFeedItem({
  item,
  itemHeight,
  shouldMountVideo,
  shouldPlayVideo,
  onLike,
  onFollow,
  onOpenComments,
}: VideoFeedItemProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [videoReady, setVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect((): void => {
    setVideoReady(false);
    setIsBuffering(false);
    setHasVideoError(false);
  }, [item.id, item.videoUrl]);

  const thumbnailSource = useMemo<ImageSource>(
    (): ImageSource => ({ uri: item.thumbnailUrl }),
    [item.thumbnailUrl],
  );
  const videoSource = useMemo<ReactVideoSource>(
    (): ReactVideoSource => ({ uri: item.videoUrl }),
    [item.videoUrl],
  );
  const canMountVideo = shouldMountVideo && !hasVideoError;
  const shouldShowThumbnail = !canMountVideo || !videoReady;
  const overlayBottom = Math.max(60, insets.bottom + 44);

  const handleVideoLoadStart = useCallback((): void => {
    setVideoReady(false);
    setIsBuffering(true);
    setHasVideoError(false);
  }, []);

  const markVideoReady = useCallback((): void => {
    setVideoReady(true);
    setIsBuffering(false);
  }, []);

  const handleVideoLoad = useCallback((): void => {
    markVideoReady();
  }, [markVideoReady]);

  const handleVideoReadyForDisplay = useCallback((): void => {
    markVideoReady();
  }, [markVideoReady]);

  const handleVideoBuffer = useCallback((event: OnBufferData): void => {
    setIsBuffering(event.isBuffering);
  }, []);

  const handleVideoProgress = useCallback(
    (event: OnProgressData): void => {
      if (event.currentTime < 0) {
        return;
      }
      markVideoReady();
    },
    [markVideoReady],
  );

  const handleVideoError = useCallback(
    (error: OnVideoErrorData): void => {
      console.warn('Video load failed', {
        error,
        videoId: item.id,
        videoUrl: item.videoUrl,
      });
      setHasVideoError(true);
      setIsBuffering(false);
      setVideoReady(false);
    },
    [item.id, item.videoUrl],
  );

  const handleLikePress = useCallback((): void => {
    onLike(item.id);
  }, [item.id, onLike]);

  const handleFollowPress = useCallback((): void => {
    onFollow(item.id);
  }, [item.id, onFollow]);

  const handleOpenCommentsPress = useCallback((): void => {
    onOpenComments(item.id);
  }, [item.id, onOpenComments]);

  return (
    <View style={[styles.item, { height: itemHeight }]}>
      {shouldShowThumbnail && (
        <Image
          source={thumbnailSource}
          style={styles.cover}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority={shouldPlayVideo ? 'high' : 'normal'}
          recyclingKey={item.thumbnailUrl}
        />
      )}

      {canMountVideo && (
        <Video
          source={videoSource}
          style={styles.media}
          resizeMode="cover"
          repeat
          paused={!shouldPlayVideo}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onLoadStart={handleVideoLoadStart}
          onLoad={handleVideoLoad}
          onReadyForDisplay={handleVideoReadyForDisplay}
          onBuffer={handleVideoBuffer}
          onProgress={handleVideoProgress}
          onError={handleVideoError}
        />
      )}

      {canMountVideo && (!videoReady || isBuffering) && (
        <View style={styles.loadingLayer} pointerEvents="none">
          <ActivityIndicator color="#fff" />
        </View>
      )}

      <View style={[styles.overlay, { bottom: overlayBottom }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.authorName}</Text>

        <TouchableOpacity
          onPress={handleLikePress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${item.liked ? 'Unlike' : 'Like'} ${
            item.title
          }`}
        >
          <Text style={styles.actionText}>
            {item.liked ? 'Unlike' : 'Like'} - {item.likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFollowPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${item.followed ? 'Unfollow' : 'Follow'} ${
            item.authorName
          }`}
        >
          <Text style={styles.actionText}>
            {item.followed ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpenCommentsPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Open comments for ${item.title}`}
        >
          <Text style={styles.actionText}>Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default VideoFeedItem;
