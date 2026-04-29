import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';

type VideoItem = {
  id: string;
  authorName: string;
  authorAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  liked: boolean;
  likeCount: number;
  followed: boolean;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

const mockVideos: VideoItem[] = Array.from({ length: 120 }).map((_, index) => ({
  id: `video_${index}`,
  authorName: `Creator ${index}`,
  authorAvatar: `https://placehold.co/80x80?text=${index}`,
  videoUrl: `https://media.example.com/video-${index}.mp4`,
  thumbnailUrl: `https://cdn.example.com/thumb-${index}.jpg`,
  title: `Video title ${index}`,
  liked: false,
  likeCount: Math.floor(Math.random() * 5000),
  followed: false,
}));

export default function VideoFeedTsb(): React.JSX.Element {
  const [videos, setVideos] = useState(mockVideos);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [visibleVideoIds, setVisibleVideoIds] = useState<string[]>([]);
  const [commentVisible, setCommentVisible] = useState(false);
  const [selectedCommentVideoId, setSelectedCommentVideoId] = useState<string | null>(null);

  useEffect((): void => {
    console.log('Feed rendered');
  });

  const toggleLike = (id: string): void => {
    setVideos(
      videos.map(item =>
        item.id === id
          ? {
              ...item,
              liked: !item.liked,
              likeCount: item.liked ? item.likeCount - 1 : item.likeCount + 1,
            }
          : item
      )
    );
  };

  const toggleFollow = (id: string): void => {
    setVideos(
      videos.map(item =>
        item.id === id
          ? {
              ...item,
              followed: !item.followed,
            }
          : item
      )
    );
  };

  const openComments = (id: string): void => {
    setSelectedCommentVideoId(id);
    setCommentVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={videos}
        pagingEnabled
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => {
          const isCurrent = currentVideoId === item.id;
          const isVisible = visibleVideoIds.includes(item.id);

          return (
            <View style={{ height: SCREEN_HEIGHT, backgroundColor: '#000' }}>
              {isVisible ? (
                <Video
                  source={{ uri: item.videoUrl }}
                  style={{ width: '100%', height: '100%' }}
                  paused={!isCurrent}
                  repeat
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}

              <View
                style={{
                  position: 'absolute',
                  bottom: 60,
                  left: 16,
                  right: 16,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18 }}>{item.title}</Text>
                <Text style={{ color: '#fff' }}>{item.authorName}</Text>

                <TouchableOpacity onPress={() => toggleLike(item.id)}>
                  <Text style={{ color: '#fff' }}>
                    {item.liked ? 'Unlike' : 'Like'} 路 {item.likeCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => toggleFollow(item.id)}>
                  <Text style={{ color: '#fff' }}>
                    {item.followed ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openComments(item.id)}>
                  <Text style={{ color: '#fff' }}>Comments</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        onViewableItemsChanged={({ viewableItems }) => {
          const ids = viewableItems.map(v => v.item.id);
          setVisibleVideoIds(ids);
          setCurrentVideoId(ids[0]);
        }}
      />

      <Modal visible={commentVisible} animationType="slide">
        <View style={{ flex: 1, padding: 24 }}>
          <Text>Comments for {selectedCommentVideoId}</Text>

          <TouchableOpacity onPress={() => setCommentVisible(false)}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
