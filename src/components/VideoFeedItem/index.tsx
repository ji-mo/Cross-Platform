import styles from '@/styles/videoTabStyles';
import type { VideoFeedItemProps } from '@/types/videoFeed';
import type { ImageSource } from 'expo-image';
import { Image } from 'expo-image';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  OnBufferData,
  OnVideoErrorData,
  ReactVideoPoster,
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
  const [videoReady, setVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect((): void => {
    setVideoReady(false);
    setIsBuffering(false);
    setHasVideoError(false);
  }, [item.id, item.videoUrl]);

  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    (): StyleProp<ViewStyle> => [styles.item, { height: itemHeight }],
    [itemHeight],
  );
  const thumbnailSource = useMemo<ImageSource>(
    (): ImageSource => ({ uri: item.thumbnailUrl }),
    [item.thumbnailUrl],
  );
  const videoSource = useMemo<ReactVideoSource>(
    (): ReactVideoSource => ({ uri: item.videoUrl }),
    [item.videoUrl],
  );
  const poster = useMemo<ReactVideoPoster>(
    (): ReactVideoPoster => ({
      source: { uri: item.thumbnailUrl },
      resizeMode: 'cover' as const,
    }),
    [item.thumbnailUrl],
  );
  const canMountVideo = shouldMountVideo && !hasVideoError;
  const shouldShowThumbnail = !canMountVideo || !videoReady;

  const handleVideoLoadStart = useCallback((): void => {
    console.log('Video load start');
    setVideoReady(false);
    setIsBuffering(true);
    setHasVideoError(false);
  }, []);

  const handleVideoLoad = useCallback((): void => {
    console.log('Video load end');
    setVideoReady(true);
    setIsBuffering(false);
  }, []);

  const handleVideoReadyForDisplay = useCallback((): void => {
    console.log('Video ready for display');
    setVideoReady(true);
    setIsBuffering(false);
  }, []);

  const handleVideoBuffer = useCallback((event: OnBufferData): void => {
    setIsBuffering(event.isBuffering);
  }, []);

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
    <View style={containerStyle}>
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
          poster={poster}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onLoadStart={handleVideoLoadStart}
          onLoad={handleVideoLoad}
          onReadyForDisplay={handleVideoReadyForDisplay}
          onBuffer={handleVideoBuffer}
          onError={handleVideoError}
        />
      )}

      {canMountVideo && (!videoReady || isBuffering) && (
        <View style={styles.loadingLayer}>
          <ActivityIndicator color="#fff" />
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.authorName}</Text>

        <TouchableOpacity
          onPress={handleLikePress}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>
            {item.liked ? 'Unlike' : 'Like'} - {item.likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFollowPress}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>
            {item.followed ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpenCommentsPress}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}, areVideoFeedItemPropsEqual);

function areVideoFeedItemPropsEqual(
  prevProps: VideoFeedItemProps,
  nextProps: VideoFeedItemProps,
): boolean {
  return (
    prevProps.item === nextProps.item &&
    prevProps.itemHeight === nextProps.itemHeight &&
    prevProps.shouldMountVideo === nextProps.shouldMountVideo &&
    prevProps.shouldPlayVideo === nextProps.shouldPlayVideo &&
    prevProps.onLike === nextProps.onLike &&
    prevProps.onFollow === nextProps.onFollow &&
    prevProps.onOpenComments === nextProps.onOpenComments
  );
}

export default VideoFeedItem;
