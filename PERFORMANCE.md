# Performance Evaluation Plan

## 1. Evaluation Goals

| Evaluation Goals |
| --- |
| This plan verifies whether the current `videoPage` video-feed optimizations produce measurable performance gains. |
| The focus is not whether the code looks optimized, but whether real user interactions improve in scroll smoothness, playback stability, memory usage, and render cost. |
| The comparison is between the original `FlatList + inline item` implementation and the current `FlashList + memoized item + controlled video mounting` implementation. |

## 2. Problems To Measure

| Problem |
| --- |
| Whether long video-feed scrolling drops frames or stutters. |
| Whether fast scrolling causes excessive active-video switching, increasing JS thread and player workload. |
| Whether off-screen videos are mounted too early, increasing memory and native player resource usage. |
| Whether like, follow, and comments modal actions cause excessive list item re-renders. |
| Whether first frame, buffering, and load failures are observable. |
| Whether video pauses in the background and only the current video resumes in the foreground. |
| Whether memory keeps growing after extended usage. |

## 3. Test Environment

| Environment |
| --- |
| Use the same physical Android device, preferably a mid-range or low-end device. |
| Do not use Expo Go as the final source of performance data. |
| Do not enable Remote JS Debugger. |
| Collect performance metrics from release-like or profile builds; React render reasons can be collected separately in dev builds with DevTools. |
| Baseline and optimized builds must use the same video count, video URLs, thumbnail URLs, and network environment. |
| Run each scenario at least 3 times, record the median, and document outliers. |

## 4. Core Metrics

| Metric | Description |
| --- | --- |
| Average FPS | Average frame rate during continuous video-feed scrolling. |
| Dropped frames | Dropped frames reported by `gfxinfo` or profiling tools. |
| p95 / p99 frame time | Used to identify visible jank spikes. |
| JS thread cost | Checks whether React rendering, state updates, or list recycling block JS. |
| UI thread cost | Checks whether native rendering, video components, or image layers stress the main thread. |
| `VideoFeedItem` re-render count | Checks whether list items re-render broadly during interactions. |
| Mounted video count | Verifies that only the current item and nearby items mount videos. |
| Time to first frame | Time from `onLoadStart` to `onReadyForDisplay`. |
| Buffer count and total buffering time | Tracks playback stability through `onBuffer`. |
| Video error count | Counts video load failures through `onError`. |
| Memory usage | Memory before entering the page, after scrolling, after long playback, and after background recovery. |
| CPU usage | CPU usage while scrolling, playing, and opening modals. |

## 5. Data Collection Methods

### 5.1 Android FPS And Dropped Frames

| Method |
| --- |
| Use `adb shell dumpsys gfxinfo` to collect frame data. |
| Reset before each run, perform a fixed swipe script or fixed manual swipe rhythm, then export results. |

```powershell
adb shell dumpsys gfxinfo com.weldonlei.CrossPlatform reset
adb shell dumpsys gfxinfo com.weldonlei.CrossPlatform framestats > reports/gfxinfo-video-feed.txt
```

### 5.2 React Re-render Profiling

| Method |
| --- |
| Use React Native DevTools Profiler. |
| Enable “Highlight updates when components render” and “Record why each component rendered”. |
| Record four scenarios separately: scrolling, liking, following, and opening the comments modal. |
| Focus on render counts and the heaviest commit for `VideoFeedScreen`, `VideoFeedItem`, and `VideoCommentsModal`. |

### 5.3 Video Lifecycle Instrumentation

| Method |
| --- |
| Record timestamps in `VideoFeedItem` for `onLoadStart`, `onReadyForDisplay`, `onBuffer`, and `onError`. |
| For each video item, record `videoId`, `index`, whether it is the active video, and event time. |
| Calculate time to first frame, buffer count, total buffering time, and error count. |

### 5.4 Memory And CPU

| Method |
| --- |
| Use Android Studio Profiler to observe CPU and Memory. |
| Use `adb shell dumpsys meminfo` to save snapshots at key checkpoints. |

```powershell
adb shell dumpsys meminfo com.weldonlei.CrossPlatform > reports/meminfo-video-feed.txt
```

Checkpoints:

| Checkpoint |
| --- |
| After cold start, before entering the video page. |
| After entering the video page and showing the first video. |
| After scrolling through 30 videos. |
| After fast scrolling for 60 seconds. |
| After staying on playback for 3 minutes. |
| After sending the app to background for 30 seconds and returning to foreground. |

## 6. Test Scenarios

| Scenario | Action | Observations |
| --- | --- | --- |
| Cold start to video page | Launch the app and enter `videoPage`. | First thumbnail time, first frame time, CPU peak. |
| Slow continuous scroll | Stay about 1 second per video and scroll through 30 videos. | Average FPS, dropped frames, active-video correctness. |
| Fast continuous scroll | Fast scroll for 60 seconds. | Switch frequency, black frames, wrong playback, JS/UI spikes. |
| Like and follow | Toggle like and follow 50 times each. | `Re-render scope and JS commit time. |
| Comments modal | Open and close the comments modal 20 times. | Modal smoothness and unrelated list re-renders. |
| Long playback | Play the current video for 3 minutes. | Memory growth, buffer count, CPU stability. |
| Background recovery | Background for 30 seconds, foreground again, repeat 10 times. | Pause in background, resume only current video, memory recovery. |

## 7. Before-And-After Comparison

| Comparison Method |
| --- |
| Create `baseline-original` using the original `FlatList` implementation. |
| Create `optimized-current` using the current `FlashList`, `memo(VideoFeedItem)`, and distance-based video mounting implementation. |
| Both versions must use the same build type, device, test script, and network. |
| Run each scenario 3 times and compare medians. |
| Record both absolute values and percentage changes for each metric. |

### Comparison Template:

| Metric | Baseline | Optimized | Change | Pass |
| --- | ---: | ---: | ---: | --- |
| Average FPS |  |  |  |  |
| Dropped frames |  |  |  |  |
| p95 frame time |  |  |  |  |
| Time to first frame |  |  |  |  |
| `VideoFeedItem` Re-render count |  |  |  |  |
| Peak memory |  |  |  |  |
| Memory growth after 5 min |  |  |  |  |
| Buffer count |  |  |  |  |
| Video error count |  |  |  |  |

## 8. Criteria For Substantial Improvement

| Criteria |
| --- |
| Average FPS improves and stays above 55 FPS. |
| Dropped frames decrease by at least 30% compared with the baseline. |
| p95 frame time stays below 33ms, with no obvious long p99 spikes. |
| Fast scrolling shows no obvious black frames, wrong playback, or playback state mismatch. |
| Mounted video components stay around the current and nearby items, and do not grow continuously while scrolling. |
| Like, follow, and comments actions do not re-render many invisible video items. |
| Memory growth stays below 20% after 5 minutes, with no continuous growth after backgrounding. |
| Video pauses in background and only the current video resumes in foreground. |
| Errors and buffering are observable instead of failing silently. |

## 9. Result Report Format

| Result Report Format |
| --- |
| The final report must include test environment, build type, device model, OS version, and app version. |
| It must include a metric comparison table between baseline and optimized builds. |
| It must state which metrics improved, which did not, and which are noisy or need more validation. |
| If the criteria are not met, continue profiling bottlenecks instead of declaring success based only on code structure. |
