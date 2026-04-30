# Engineering Reflection: Controlled Video Mounting And Playback Window

## Optimization Chosen

The most important optimization in the current `videoPage` implementation is the controlled video mounting and playback window.

Instead of rendering a `Video` component for every visible or recently visible item, the screen now tracks a single `currentIndex` and only allows videos near that index to mount:

```tsx
const VIDEO_PRELOAD_DISTANCE = 1;

const distance = Math.abs(index - currentIndex);
const isCell = target === 'Cell';

<VideoFeedItem
  item={item}
  itemHeight={screenHeight}
  shouldMountVideo={isCell && distance <= VIDEO_PRELOAD_DISTANCE}
  shouldPlayVideo={isCell && index === currentIndex && isAppActive}
  onLike={handleLike}
  onFollow={handleFollow}
  onOpenComments={handleOpenComments}
/>
```

Inside `VideoFeedItem`, the native video player is only mounted when `shouldMountVideo` is true and no video error has occurred:

```tsx
const canMountVideo = shouldMountVideo && !hasVideoError;

{canMountVideo && (
  <Video
    source={videoSource}
    paused={!shouldPlayVideo}
    repeat
    resizeMode="cover"
  />
)}
```

## What Problem It Solves

The original implementation made video rendering too closely tied to list visibility. In a vertical feed with 120 items, that creates several performance risks:

- Multiple native video players can be mounted during fast scrolling.
- Off-screen or nearly off-screen videos may still consume memory, decoding resources, buffering work, and native view resources.
- Rapid visibility changes can frequently update playback state.
- The JS thread and native player layer both receive more work than needed.
- Fast scrolling can produce black frames, delayed playback, wrong active video state, or visible jank.

The optimized implementation narrows the active playback responsibility to one current item and a small preload window around it. The current video is the only item allowed to play. Neighboring items may mount for smoother transition, but distant items fall back to thumbnail-only rendering.

This directly targets the most expensive part of the feed: video player lifecycle management.

## Why This Approach Was Chosen

This approach was chosen because video components are much more expensive than normal React Native views. Optimizing list rendering alone is not enough if too many native video players are mounted at the same time.

The current solution has several practical advantages:

- It keeps the feed behavior predictable: one active index controls playback.
- It limits native video player count without removing preloading completely.
- It works well with `FlashList` recycling because `target === 'Cell'` avoids mounting video for non-cell measurement/rendering paths.
- It improves app lifecycle behavior because `isAppActive` can pause playback when the app goes to the background.
- It keeps the fallback UI simple: thumbnails stay visible until the video is ready or when the video cannot be mounted.
- It is easy to tune by changing `VIDEO_PRELOAD_DISTANCE`.

This is a targeted optimization. It does not require a large architecture change, a new video service, or global state management.

## Alternatives Rejected

### Alternative 1: Mount Video For Every Visible Item

This is close to the original behavior. It is simple, but it does not scale well in a video feed.

It was rejected because visible-item tracking can include multiple items during scroll transitions. That means several `Video` instances may exist at the same time, even though only one should play. The implementation would remain vulnerable to memory pressure and playback-state churn.

### Alternative 2: Mount Only The Current Video With No Preload

This would minimize resource usage further by setting the preload distance to zero.

It was rejected because it may make swiping feel worse. The next video would start mounting only after it becomes the current item, increasing the chance of a blank state, delayed first frame, or visible loading spinner on every swipe.

The current `VIDEO_PRELOAD_DISTANCE = 1` is a compromise: it keeps the current and neighboring items ready while still preventing the whole feed from mounting players.

### Alternative 3: Keep FlatList And Only Add useCallback / memo

This would reduce some React re-render cost but would not address the most expensive resource: native video players.

It was rejected as the primary optimization because callback stability and memoization cannot fix excessive native player mounting. They are useful supporting improvements, but they are not enough for a long video feed.

### Alternative 4: Preload Many Videos Ahead

This could reduce first-frame delay when the user swipes quickly.

It was rejected because it moves the bottleneck from startup delay to memory, network, decoder, and native resource pressure. On lower-end devices, aggressive preloading can make the app less stable and increase buffering contention.

## Trade-offs Introduced

### More State Coordination

The feed now has more explicit playback state:

- `currentIndex`
- `currentIndexRef`
- `isAppActive`
- `shouldMountVideo`
- `shouldPlayVideo`

This makes the behavior more controlled, but it also means bugs can happen if these values get out of sync.

### More Conditional Rendering

`VideoFeedItem` now has separate states for thumbnail display, video readiness, buffering, and video errors. This improves user feedback, but it increases component complexity.

### Possible First-Frame Delay For Non-Preloaded Items

Only nearby videos mount. If a user jumps far through the list very quickly, the destination video may need to mount from scratch. The thumbnail and loading indicator make this acceptable, but it is still a trade-off.

### A Tunable Magic Number

`VIDEO_PRELOAD_DISTANCE = 1` is a product and performance trade-off. A higher value may improve perceived readiness but increase memory and native workload. A lower value may reduce resource usage but increase loading visibility.

This number should be validated with profiling, not treated as permanently correct.

### More Dependency On Viewability Accuracy

Playback correctness now depends on `VIEWABILITY_CONFIG` and `onViewableItemsChanged`. The current configuration requires an item to be 80% visible for 300ms before becoming active. This reduces noisy switching during fast scrolls, but it can also delay active-video changes slightly.

## Expected Impact

The expected impact is:

- Fewer mounted native video players during scrolling.
- Lower memory pressure compared with mounting videos based only on visibility.
- Fewer playback state transitions during fast swipes.
- More stable active-video behavior.
- Better background behavior because playback is tied to `isAppActive`.
- Better user feedback because thumbnails and loading states cover video startup.

These are expected results, not final proof. The improvement must be validated with the performance evaluation plan: FPS, dropped frames, frame time percentiles, mounted video count, memory growth, buffer count, and React re-render counts should be compared against the original implementation.

## Engineering Takeaway

The key lesson is that video-feed performance is not only a React rendering problem. It is also a native resource lifecycle problem.

Using `FlashList`, `memo`, and stable callbacks helps, but the most meaningful change is controlling when expensive native video players exist at all. The best optimization here is not making every item render faster; it is preventing most items from mounting a video player in the first place.
