
list(APPEND CMAKE_MODULE_PATH "${GSTREAMER_ROOT}/share/cmake")

set(GSTREAMER_NDK_BUILD_PATH  "${GSTREAMER_ROOT}/share/gst-android/ndk-build/")
include("${GSTREAMER_NDK_BUILD_PATH}/plugins.cmake")
set(GSTREAMER_PLUGINS_CORE_CUSTOM coreelements app audioconvert audiorate audioresample videorate videoconvertscale videotestsrc audiotestsrc volume autodetect)
set(GSTREAMER_PLUGINS_CODECS_CUSTOM videoparsersbad vpx opus audioparsers opusparse androidmedia)
set(GSTREAMER_PLUGINS_NET_CUSTOM soup tcp rtsp rtp rtpmanager udp srtp webrtc dtls nice)
set(GSTREAMER_PLUGINS         ${GSTREAMER_PLUGINS_CORE_CUSTOM} ${GSTREAMER_PLUGINS_CODECS_CUSTOM} ${GSTREAMER_PLUGINS_NET_CUSTOM} ${GSTREAMER_PLUGINS_ENCODING} ${GSTREAMER_PLUGINS_SYS} ${GSTREAMER_PLUGINS_PLAYBACK})
set(GStreamer_EXTRA_DEPS gstreamer-webrtc-1.0 gstreamer-sdp-1.0 gstreamer-video-1.0 libsoup-3.0 json-glib-1.0 glib-2.0)
set(G_IO_MODULES openssl)
find_library(ANDROID_LIB android REQUIRED)
find_library(LOG_LIB log REQUIRED)
find_package(GStreamerMobile COMPONENTS ${GSTREAMER_PLUGINS} fonts ca_certificates REQUIRED)

add_library(gstwebrtc SHARED webrtc.c dummy.cpp)
target_link_libraries(gstwebrtc
    PUBLIC
        GStreamer::mobile
        ${ANDROID_LIB}
        ${LOG_LIB}
`ximagesink`, `sdlvideosink`, `osxvideosink`, or `aasink`.

Keep in mind though that different sinks might accept different formats and
even the same sink might accept different formats on different machines, so
you might need to add converter elements like `audioconvert` and `audioresample`
for audio or `videoconvertscale` in front of the sink to make things work.

### Audio playback

**Note:** For audio/video playback it's best to use the `playbin3` or
`uridecodebin3` elements, these are just example pipelines.

Play the mp3 music file "music.mp3" using a libmpg123-based plug-in and
output it to an audio device via PulseAudio (or PipeWire).

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an Ogg Vorbis format file:

`ximagesink`, `sdlvideosink`, `osxvideosink`, or `aasink`.

Keep in mind though that different sinks might accept different formats and
even the same sink might accept different formats on different machines, so
you might need to add converter elements like `audioconvert` and `audioresample`
for audio or `videoconvertscale` in front of the sink to make things work.

### Audio playback

**Note:** For audio/video playback it's best to use the `playbin3` or
`uridecodebin3` elements, these are just example pipelines.

Play the mp3 music file "music.mp3" using a libmpg123-based plug-in and
output it to an audio device via PulseAudio (or PipeWire).

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an Ogg Vorbis format file:


---

