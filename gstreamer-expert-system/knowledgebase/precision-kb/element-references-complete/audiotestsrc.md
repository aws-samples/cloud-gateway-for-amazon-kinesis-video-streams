
### multiparty-sendrecv: Multiparty audio conference with N peers

* Run `_builddir/multiparty-sendrecv/gst/mp-webrtc-sendrecv --room-id=ID` with `ID` as a room name. The peer will connect to the signalling server and setup a conference room.
* Run this as many times as you like, each will spawn a peer that sends red noise and outputs the red noise it receives from other peers.
  - To change what a peer sends, find the `audiotestsrc` element in the source and change the `wave` property.
  - You can, of course, also replace `audiotestsrc` itself with `autoaudiosrc` (any platform) or `pulsesink` (on linux).
* TODO: implement JS to do the same, derived from the JS for the `sendrecv` example.

### TODO: Selective Forwarding Unit (SFU) example

* Server routes media between peers
* Participant sends 1 stream, receives n-1 streams

### TODO: Multipoint Control Unit (MCU) example

* Server mixes media from all participants
* Participant sends 1 stream, receives 1 stream

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

### `gst-launch`

`gst-launch` is a simple script-like commandline application that can be
used to test pipelines. For example, the command `gst-launch
audiotestsrc ! audioconvert !
audio/x-raw,channels=2 ! alsasink` will run a pipeline which generates a
sine-wave audio stream and plays it to your ALSA audio card.
`gst-launch` also allows the use of threads (will be used automatically
as required or as queue elements are inserted in the pipeline) and bins
(using brackets, so “(” and “)”). You can use dots to imply padnames on
elements, or even omit the padname to automatically select a pad. Using
all this, the pipeline `gst-launch filesrc location=file.ogg ! oggdemux
name=d
d. ! queue ! theoradec ! videoconvert ! xvimagesink
d. ! queue ! vorbisdec ! audioconvert ! audioresample ! alsasink
` will play an Ogg file containing a Theora video-stream and a Vorbis
audio-stream. You can also use autopluggers such as decodebin on the
commandline. See the manual page of `gst-launch` for more information.

### `gst-inspect`
for example.

**ELEMENT**

Name of an element. This is the name of an element, like
`audiotestsrc` for example

**--help**

Print help synopsis and available FLAGS

**--gst-info-mask=FLAGS**

*GStreamer* info flags to set (list with --help)

 **-a, --print-all**

Print all plugins and elements

 **--print-plugin-auto-install-info**

--

Add directories separated with ':' to the plugin search path

## Example

    gst-inspect-1.0 audiotestsrc

should produce:

    Factory Details:
      Rank                     none (0)
      Long-name                Audio test source
      Klass                    Source/Audio
      Description              Creates audio test signals of given frequency and volume
      Author                   Stefan Kost <ensonic@users.sf.net>

    Plugin Details:
      Name                     audiotestsrc
      Description              Creates audio test signals of given frequency and volume
      Filename                 /usr/lib/gstreamer-1.0/libgstaudiotestsrc.so
      Version                  1.8.1
      License                  LGPL
      Source module            gst-plugins-base
      Source release date      2016-04-20
      Binary package           GStreamer Base Plugins (Arch Linux)
      Origin URL               http://www.archlinux.org/

    GObject
     +----GInitiallyUnowned
           +----GstObject
                 +----GstElement
                       +----GstBaseSrc
                             +----GstAudioTestSrc
```

Generate a pure sine tone to test the audio output:

```
gst-launch-1.0 audiotestsrc ! audioconvert ! audioresample ! osssink
```

Generate a familiar test pattern to test the video output:

```
gst-launch-1.0 videotestsrc ! ximagesink
```

```
gst-launch-1.0 videotestsrc ! xvimagesink
```

### Automatic linking

You can use the "decodebin3" element to automatically select the right

---

