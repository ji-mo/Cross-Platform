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

#### 1. Based on the user feedback, what technical areas would you investigate first? 根据用户反馈，你会优先调查哪些技术方向？

- Implementation/Structure/Dependencies
第一次接触，需要调查功能实现，是Tab还是Stack，了解组件树结构，确认List、Video组件选型
For this initial encounter, it's necessary to investigate the functionality implementation, determine whether to use Tab or Stack, understand the component tree structure, and confirm the selection of List and Video components.

- State management/Rendering performance：
<!-- 越用越卡、滚动卡顿，说明组件可能在过度重渲染
The progressive lag and choppy scrolling suggest that components are re-rendering excessively, or a list performance issue -->
页面各功能模块可能未组件化，状态管理混乱
1. The various functional modules on the page may not be componentized, resulting in chaotic state management.
父组件状态/全局状态频繁更新，导致视频列表重新渲染
2. Updates to the parent component's state/global state caused video list frequent re-renders. 

- Memory management:
 <!-- "越用越差"说明媒体资源在不可见时未被释放、持续累积，可能是未使用虚拟列表或者列表虚拟化效率低下
"Getting worse with use" indicates that media resources are not being released when they are not visible and continue to accumulate -->
可能未使用虚拟列表或者列表虚拟化效率低下（配置不当）
1. The problem may be that virtual lists are not being used or list virtualization is inefficient (due to improper configuration).
组件性能问题，ScrollView/FlashList的频繁mount/unmount 开销（推荐FlashList），同时存在过多Video实例
2. Component performance issues, frequent mount/unmount overhead of ScrollView/FlashList (FlashList is recommended), and too many Video instances.
针对Video组件，暂停播放，不代表播放器实例、解码器和缓冲区已经被完全释放
3. For the Video component, pausing playback does not mean that the player instance, decoder, and buffer have been completely released.

- Media handling/Video lifecycle
<!-- 切换时黑屏可能是资源加载问题
A black screen during switching may be due to a resource loading issue. -->
视频资源解析加载需要时间，可能未预加载或者无缩略图兜底
1. Video resource parsing and loading takes time; it may not be pre-loaded or may not have thumbnails as a backup.
安卓中视频播放，可能是 Surface 初始化延迟，首帧未展示
2. The video playback issue on Android might be due to a Surface initialization delay, causing the first frame to not be displayed.
部分Video组件沿用Bridge，导致延迟较高
3. Some video components use Bridge, resulting in higher latency.
可能是从 Image 到 Video 的组件切换，存在间隙
4. It might be a transition from Image to Video components, resulting in a gap.

- Navigation / lifecycle behavior
 <!-- "返回感觉重新加载"说明页面在每次导航时被销毁并重建。
 The "reloads on return" complaint suggests the screen is being destroyed and rebuilt on every navigation event. -->
 组件被卸载，返回时导致重新加载
 1. The component was unloaded, and returning caused it to be reloaded.
 状态管理问题导致更新或者存在页面聚焦逻辑，导致页面重加载
 2. State management issues or page focus logic problems may cause page reloading.

- Network loading strategy
<!-- 弱网下缩略图和视频加载慢，可能是资源加载策略不合理。
Slow loading of thumbnails and videos under weak network conditions may be due to an unreasonable resource loading strategy. -->
未首先加载当前正在播放的资源，或者存在并发请求过多
1. The currently playing resource was not loaded first, or there are too many concurrent requests.
是否有对后续n个待播放资源进行预加载
2. Is there a preloading process for the next n resources to be played?
资源可能未压缩，可能过大，或者资源未进行CDN优化
3. The resources may not be compressed, may be too large, or may not have been optimized for CDN.



<!-- 1. Updates to the parent component's state/global state caused frequent re-renders. 父组件状态/全局状态更新，导致频繁重新渲染
- Memory usage
1. List virtualization is inefficient and contains too many resources such as videos(ScrollView or FlatList). 列表虚拟化效率低下，存在过多视频等资源
- Media handling
1. Video mounting/unmounting strategy, Video playback control and buffering behavior. 视频挂载/卸载策略，播放控制以及缓冲行为
- Network performance
1. Thumbnail and video loading delays, or inadequate prioritization and caching settings. 缩略图和视频加载延迟，或者没有设置适当的优先级和缓存 -->


#### 2. What are multiple possible causes of lag in a video-heavy feed? 视频密集型流中，卡顿可能由哪些原因引起？
状态更新引发频繁重渲染
1. Frequent re-renders due to state updates across the list.
列表虚拟化不佳，渲染过多元素
2. Poor list virtualization causing too many items to render.
多个视频资源同时解码缓冲
3. Simultaneous decoding and buffering of multiple video resources.
JS 线程过载，阻塞时导致掉帧
4. JS thread overload causes frame drops when blocked.
内存压力和垃圾回收暂停
5.Memory pressure and garbage collection pauses.
缺少 memo 化和稳定回调
6.Lack of memoization and stable callbacks.


#### 3. Why might some interactions feel slow even if only one visible action was triggered?  为什么有时即使只触发了一个可见操作，交互也会感觉很慢？

局部操作触发全局、父组件状态更新
1. A local action triggers global/parent component state updates
JS 线程正在处理大量任务，被阻塞
2. The JS thread is processing a large number of tasks and is blocked.
缺少 memo 化和稳定回调
3. Lack of memoization and stable callbacks.
存在额外副作用（日志、请求、动画）
4. Additional side effects (logging, network requests, animations)


#### 4. What factors may contribute to black screens during video transitions?  视频切换时出现黑屏可能与哪些因素有关？

视频资源解析加载需要时间，可能未预加载或者无缩略图兜底
1. Video resource parsing and loading takes time; it may not be pre-loaded or may not have thumbnails as a backup.
安卓中视频播放，可能是 Surface 初始化延迟，首帧未展示
2. The video playback issue on Android might be due to a Surface initialization delay, causing the first frame to not be displayed.
部分Video组件沿用Bridge，导致延迟较高
3. Some video components use Bridge, resulting in higher latency.
可能是从 Image 到 Video 的组件切换，存在间隙
4. It might be a transition from Image to Video components, resulting in a gap.

#### 5. What are possible reasons users feel the page “reloads” after returning?  用户感觉页面"重新加载"的可能原因是什么

状态管理问题导致更新或者存在页面聚焦逻辑，导致页面重加载
1. State management issues or page focus logic problems may cause page reloading.
在 Tab Navigator 中，设置了unmountOnBlur: true，组件被卸载
2. In the Tab Navigator, unmountOnBlur: true is set, the component was unloaded.
在 Stack Navigator 中，导航离开时页面默认被卸载
3. In Stack Navigator, the page is unloaded by default when leaving the navigation.


#### 6. What would you measure before making optimization decisions?  在做优化决策之前，你会测量哪些指标？

先打开React Native Performance Monitor，测 FPS、掉帧和渲染耗时，用来判断卡顿到底是 UI 渲染慢，还是 JS 线程任务太重.
1. Open React Native Performance Monitor, test FPS, frame drops, and rendering time to determine whether the stuttering is due to slow UI rendering or excessive JS thread workload.
打开Android Studio Profiler，结合控制台输出，测点赞、关注、打开评论、列表滚动时，有多少列表项发生了重渲染
2. Open Android Studio Profiler and check the console output, How many list items were re-rendered when liking, following, opening comments, and List scrolling?
利用Video组件自身的回调测视频启动时间、首帧时间、缓冲次数和缓冲时长
3. Utilize the Video component's own callbacks to measure video startup time, first frame time, buffer counts, and buffer duration.
通过Network测缩略图和视频请求耗时、请求瀑布图、失败请求和重复请求
4. Measure thumbnail and video request time, request waterfall chart, failed requests, and duplicate requests using Network.
通过useEffect、requestAnimationFrame等事件，查看页面动作交互到响应完成的耗时
5. Use events such as useEffect and requestAnimationFrame to view the time taken from page interaction to response completion.

## Prioritization

### Highest priority
- Feed Screen top layer status too heavy
videos、currentVideoId、visibleVideoIds、commentVisible 都在父组件；点赞、关注、打开评论都会导致整个 VideoFeedScreen 重新渲染；
众多 item 中，大量子组件可能被动更新。
The videos, currentVideoId, visibleVideoIds, and commentVisible are all in the parent component; liking, following, and opening comments will cause the entire VideoFeedScreen to re-render; among the many items, a large number of child components may be passively updated.

- toggleLike / toggleFollow
这两个功能每次触发时都会修改视频列表，导致所有条目重新渲染。
Both functions modify the videos list each time they are triggered, causing all entries to be re-rendered.

- FlatList has not been configured with proper parameters
缺少getItemLayout、initialNumToRender、removeClippedSubviews（安卓默认）等参数配置，一次渲染过多item实例
Missing parameter configurations for getItemLayout, initialNumToRender, and removeClippedSubviews (Android default) result in rendering too many item instances at once.

- renderItem is an inline element
每次父组件更新都会重新创建 renderItem，子项难以 memo 化，。
Every time the parent component is updated, the renderItem is recreated, making it difficult to memoize the child items and resulting in wasted performance.

- Crude video mounting strategy
只要在 visibleVideoIds 中就渲染Video组件，快速滑动时可能多个视频同时挂载，会增加解码、内存、网络压力
Rendering the Video component in visibleVideoIds can increase the load on decoding, memory, and network performance when scrolling quickly, as multiple videos may be mounted simultaneously.

- logic issue with onViewableItemsChanged
每次触发都会 setState，没有判断值是否真的变化；所有viewableItems都存下来，可能同时挂载多个Video.
Each time it is triggered, setState is executed without checking whether the value has actually changed; all viewableItems are stored, and multiple Videos may be mounted at the same time.

### Medium priority
- There is no preloading strategy for images and videos
下一个视频 / 缩略图未提前准备，切换时可能黑屏
The next video/thumbnail was not prepared in advance; a black screen may occur when switching.

- No video loading status
视频未 ready 时直接显示黑屏，应该保留 thumbnail 作为 poster / fallback
If the video is not ready and the screen is black, the thumbnail should be retained as a poster/fallback.

- Network resources have no priority
当前视频、下一个视频、远处视频没有区分优先级
There is no distinction in priority between the current video, the next video, and distant videos.

### Low priority
- useEffect no-dependency array
The `useEffect` method, which operates on an array without dependencies, carries the risk of infinite loops, pollutes logs, and impacts performance.

- All styles are inline
It is inconvenient to manage and has poor readability and maintainability.

- There are no error state, loading state, or empty state
This can easily cause issues such as content flashing, black screen, or missing content.

## Changes



## Verification



## Trade-offs