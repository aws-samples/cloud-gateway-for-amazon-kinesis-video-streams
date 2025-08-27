16 (JellyBean) and GStreamer can use it via the androidmedia plugin
for audio and video decoding. On Android, attaching the hardware
decoder to the `glimagesink` element can produce a high performance
zero-copy decodebin pipeline.

### `ahcsrc`

This video source can capture from the cameras on Android devices, it is part
of the androidmedia plugin and uses the [android.hardware.Camera API](https://developer.android.com/reference/android/hardware/Camera.html).

## iOS

### `osxaudiosink`

This is the only audio sink available to GStreamer on iOS.

### `iosassetsrc`

Source element to read iOS assets, this is, documents stored in the
Library (like photos, music and videos). It can be instantiated
automatically by `playbin` when URIs use the
16 (JellyBean) and GStreamer can use it via the androidmedia plugin
for audio and video decoding. On Android, attaching the hardware
decoder to the `glimagesink` element can produce a high performance
zero-copy decodebin pipeline.

### `ahcsrc`

This video source can capture from the cameras on Android devices, it is part
of the androidmedia plugin and uses the [android.hardware.Camera API](https://developer.android.com/reference/android/hardware/Camera.html).

## iOS

### `osxaudiosink`

This is the only audio sink available to GStreamer on iOS.

### `iosassetsrc`

Source element to read iOS assets, this is, documents stored in the
Library (like photos, music and videos). It can be instantiated
automatically by `playbin` when URIs use the

---

