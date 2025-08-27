    e.g. "src%d" to "src%u" or "src\_%u" or similar, since we don't want
    to see negative numbers in pad names. This mostly affects
    applications that create request pads from elements.

  - some elements that used to have a single dynamic source pad have a
    source pad now. Example: wavparse, id3demux, iceydemux, apedemux.
    (This does not affect applications using decodebin or playbin).

  - playbin now proxies the GstVideoOverlay (former GstXOverlay)
    interface, so most applications can just remove the sync bus handler
    where they would set the window ID, and instead just set the window
    ID on playbin from the application thread before starting playback.

    playbin also proxies the GstColorBalance and GstNavigation
    interfaces, so applications that use this don't need to go fishing
    for elements that may implement those any more, but can just use on
    playbin unconditionally.

  - multifdsink, tcpclientsink, tcpclientsrc, tcpserversrc the protocol
    property is removed, use gdppay and gdpdepay.

### Other

Play a .WAV file that contains raw audio data (PCM):

```
gst-launch-1.0 filesrc location=music.wav ! wavparse ! audioconvert ! audioresample ! pulsesink
```

Convert a .WAV file containing raw audio data into an Ogg Vorbis or mp3 file:

```
gst-launch-1.0 filesrc location=music.wav ! wavparse ! audioconvert ! vorbisenc ! oggmux ! filesink location=music.ogg
```

```
gst-launch-1.0 filesrc location=music.wav ! wavparse ! audioconvert ! lamemp3enc ! xingmux ! id3v2mux ! filesink location=music.mp3
```

Rip all tracks from CD and convert them into a single mp3 file:

```
gst-launch-1.0 cdparanoiasrc mode=continuous ! audioconvert ! lamemp3enc ! mpegaudioparse ! xingmux ! id3v2mux ! filesink location=cd.mp3
```

Rip track 5 from the CD and converts it into a single mp3 file:

```
gst-launch-1.0 cdparanoiasrc track=5 ! audioconvert ! lamemp3enc ! mpegaudioparse ! xingmux ! id3v2mux ! filesink location=track5.mp3
```

Using `gst-inspect-1.0`, it is possible to discover settings like
| `GSTREAMER_PLUGINS_PLAYBACK`   | playback |
| `GSTREAMER_PLUGINS_VIS`        | libvisual goom goom2k1 audiovisualizers |
| `GSTREAMER_PLUGINS_EFFECTS`    | alpha alphacolor audiofx cairo cutter debug deinterlace dtmf effectv equalizer gdkpixbuf imagefreeze interleave level multifile replaygain shapewipe smpte spectrum videobox videocrop videomixer accurip aiff audiofxbad autoconvert bayer coloreffects debugutilsbad fieldanalysis freeverb frei0r gaudieffects geometrictransform inter interlace ivtc rawparse removesilence segmentclip smooth speed soundtouch videofiltersbad audiomixer compositor webrtcdsp |
| `GSTREAMER_PLUGINS_NET`        | tcp rtsp rtp rtpmanager soup udp dataurisrc sdp srtp rtspclientsink |
| `GSTREAMER_PLUGINS_NET_RESTRICTED` | rtmp |
| `GSTREAMER_PLUGINS_CODECS`     | subparse ogg theora vorbis opus alaw apetag audioparsers auparse avi dv flac flv flxdec icydemux id3demux isomp4 jpeg matroska mulaw multipart png speex taglib vpx wavenc wavpack wavparse y4m adpcmdec adpcmenc dashdemux dvbsuboverlay dvdspu hls id3tag kate midi mxf openh264 opusparse pcapparse pnm rfbsrc schro gstsiren smoothstreaming subenc videoparsersbad jpegformat gdp rsvg openjpeg spandsp sbc androidmedia |
| `GSTREAMER_PLUGINS_CODECS_GPL` | assrender |
| `GSTREAMER_PLUGINS_CODECS_RESTRICTED` | asfmux dtsdec faad mpegpsdemux mpegpsmux mpegtsdemux mpegtsmux voaacenc a52dec amrnb amrwbdec asf dvdsub dvdlpcmdec mad mpeg2dec xingmux realmedia x264 lame mpg123 libav |
| `GSTREAMER_PLUGINS_SYS`        | opensles opengl |
| `GSTREAMER_PLUGINS_CAPTURE`    | camerabin |
| `GSTREAMER_PLUGINS_ENCODING`   | encodebin |
| `GSTREAMER_PLUGINS_GES`        | nle |

Build and run your application as explained in the [Building the tutorials] section.

  [information]: images/icons/emoticons/information.svg
  [Android SDK]: http://developer.android.com/sdk/index.html
  [Android NDK]: http://developer.android.com/tools/sdk/ndk/index.html
  [GStreamer binaries]: https://gstreamer.freedesktop.org/download/#android
  [Java Native Interface]: http://en.wikipedia.org/wiki/Java_Native_Interface
  [Android JNI tips here]: http://developer.android.com/guide/practices/jni.html

  - avi : gst-plugins-good/gst/avi

  - mp3 : gst-plugins-good/gst/id3demux

  - wav : gst-plugins-good/gst/wavparse

  - qt : gst-plugins-bad/gst/qtdemux
### Segment looping

Consider the case of a wav file with raw audio.

```
filesrc ! wavparse ! alsasink
```

FIXME!

---

