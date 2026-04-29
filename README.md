# Video Feed Performance Investigation & Optimization

## Investigation

### User Feedback
The app feels more laggy after scrolling videos for a while.
At first it seems okay, but after using it longer, scrolling becomes choppy.
Sometimes tapping Like, Follow, or opening comments causes a visible pause.
On some Android devices, switching videos briefly shows a black screen.
Sometimes when leaving the feed and coming back, it feels like everything reloads again.
On slower networks, thumbnails and videos load noticeably slower than expected.

### Question and Answer

#### 1. Based on the user feedback, what technical areas would you investigate first?

- Implementation/Structure/Dependencies
For this initial encounter, it's necessary to investigate the functionality implementation, determine whether to use Tab or Stack, understand the component tree structure, and confirm the selection of List and Video components.

- State management/Rendering performance
1. The various functional modules on the page may not be componentized, resulting in chaotic state management.
2. Updates to the parent component's state/global state caused video list frequent re-renders. 

- Memory management
1. The problem may be that virtual lists are not being used or list virtualization is inefficient (due to improper configuration).
2. Component performance issues, frequent mount/unmount overhead of ScrollView/FlashList (FlashList is recommended), and too many Video instances.
3. For the Video component, pausing playback does not mean that the player instance, decoder, and buffer have been completely released.

- Media handling/Video lifecycle
1. Video resource parsing and loading takes time; it may not be pre-loaded or may not have thumbnails as a backup.
2. The video playback issue on Android might be due to a Surface initialization delay, causing the first frame to not be displayed.
3. Some video components use Bridge, resulting in higher latency.
4. It might be a transition from Image to Video components, resulting in a gap.

- Navigation/lifecycle behavior
1. The component was unloaded, and returning caused it to be reloaded.
2. State management issues or page focus logic problems may cause page reloading.

- Network loading strategy
1. The currently playing resource was not loaded first, or there are too many concurrent requests.
2. Is there a preloading process for the next n resources to be played?
3. The resources may not be compressed, may be too large, or may not have been optimized for CDN.

#### 2. What are multiple possible causes of lag in a video-heavy feed?
1. Frequent re-renders due to state updates across the list.
2. Poor list virtualization causing too many items to render.
3. Simultaneous decoding and buffering of multiple video resources.
4. JS thread overload causes frame drops when blocked.
5.Memory pressure and garbage collection pauses.
6.Lack of memoization and stable callbacks.

#### 3. Why might some interactions feel slow even if only one visible action was triggered?
1. A local action triggers global/parent component state updates.
2. The JS thread is processing a large number of tasks and is blocked.
3. Lack of memoization and stable callbacks.
4. Additional side effects (logging, network requests, animations)

#### 4. What factors may contribute to black screens during video transitions?
1. Video resource parsing and loading takes time; it may not be pre-loaded or may not have thumbnails as a backup.
2. The video playback issue on Android might be due to a Surface initialization delay, causing the first frame to not be displayed.
3. Some video components use Bridge, resulting in higher latency.
4. It might be a transition from Image to Video components, resulting in a gap.

#### 5. What are possible reasons users feel the page “reloads” after returning?
1. State management issues or page focus logic problems may cause page reloading.
2. In the Tab Navigator, unmountOnBlur: true is set, the component was unloaded.
3. In Stack Navigator, the page is unloaded by default when leaving the navigation.

#### 6. What would you measure before making optimization decisions?
1. Open React Native Performance Monitor, test FPS, frame drops, and rendering time to determine whether the stuttering is due to slow UI rendering or excessive JS thread workload.
2. Open Android Studio Profiler and check the console output, How many list items were re-rendered when liking, following, opening comments, and List scrolling?
3. Utilize the Video component's own callbacks to measure video startup time, first frame time, buffer counts, and buffer duration.
4. Measure thumbnail and video request time, request waterfall chart, failed requests, and duplicate requests using Network.
5. Use events such as useEffect and requestAnimationFrame to view the time taken from page interaction to response completion.

## Prioritization

### Highest priority
- Feed Screen top layer status too heavy
The videos, currentVideoId, visibleVideoIds, and commentVisible are all in the parent component; liking, following, and opening comments will cause the entire VideoFeedScreen to re-render; among the many items, a large number of child components may be passively updated.

- toggleLike / toggleFollow
Both functions modify the videos list each time they are triggered, causing all entries to be re-rendered.

- FlatList has not been configured with proper parameters
Missing parameter configurations for getItemLayout, initialNumToRender, and removeClippedSubviews (Android default) result in rendering too many item instances at once.

- renderItem is an inline element.
Every time the parent component is updated, the renderItem is recreated, making it difficult to memoize the child items and resulting in wasted performance.

- Crude video mounting strategy
Rendering the Video component in visibleVideoIds can increase the load on decoding, memory, and network performance when scrolling quickly, as multiple videos may be mounted simultaneously.

- logic issue with onViewableItemsChanged
Each time it is triggered, setState is executed without checking whether the value has actually changed; all viewableItems are stored, and multiple Videos may be mounted at the same time.

### Medium priority
- There is no preloading strategy for images and videos
The next video/thumbnail was not prepared in advance; a black screen may occur when switching.

- No video loading status
If the video is not ready and the screen is black, the thumbnail should be retained as a poster/fallback.

- Network resources have no priority
There is no distinction in priority between the current video, the next video, and distant videos.

### Low priority
- useEffect no-dependency array
The `useEffect` method, which operates on an array without dependencies, carries the risk of infinite loops, pollutes logs, and impacts performance.

- All styles are inline
It is inconvenient to manage and has poor readability and maintainability.

- There are no error state, loading state, or empty state
This can easily cause issues such as content flashing, black screen, or missing content.


## Changes
1.



## Verification



## Trade-offs