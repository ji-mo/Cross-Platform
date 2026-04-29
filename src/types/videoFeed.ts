export interface VideoItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  liked: boolean;
  likeCount: number;
  followed: boolean;
}

export interface VideoFeedItemProps {
  item: VideoItem;
  itemHeight: number;
  shouldMountVideo: boolean;
  shouldPlayVideo: boolean;
  onLike: (id: string) => void;
  onFollow: (id: string) => void;
  onOpenComments: (id: string) => void;
}

export interface VideoCommentsModalProps {
  visible: boolean;
  videoId: string | null;
  onClose: () => void;
}
