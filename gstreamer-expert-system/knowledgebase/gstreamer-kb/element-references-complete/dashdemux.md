```bash
# Analyze DASH stream
gst-discoverer-1.0 "https://example.com/stream.mpd"

# Test DASH playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.mpd" ! dashdemux ! fakesink
```

## Debugging Commands

### General Pipeline Debugging
```bash
# Enable general debugging
GST_DEBUG=*:3 gst-launch-1.0 [pipeline]

# Debug caps negotiation
GST_DEBUG=caps:5 gst-launch-1.0 [pipeline]

# Debug performance
GST_DEBUG=GST_PERFORMANCE:5 gst-launch-1.0 [pipeline]
```
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
# Adaptive Demuxers for DASH, HLS and Smooth Streaming

There are two sets of elements implementing client-side adaptive streaming
(HLS, DASH, Microsoft Smooth Streaming) in GStreamer:

 - The old legacy elements `dashdemux`, `hlsdemux`, `mssdemux` in the
   gst-plugins-bad module.

 - New `dashdemux2`, `hlsdemux2`, `mssdemux2` elements in gst-plugins-good
   (added in GStreamer 1.22).

The legacy adaptive streaming support in `gst-plugins-bad` had several pitfalls
that prevented improving it easily. The legacy design used a model where an
adaptive streaming element (`dashdemux`, `hlsdemux`) downloaded multiplexed
fragments of media, but then relied on other components in the pipeline to
provide download buffering, demuxing, elementary stream handling and decoding.

The problems with the old design included:

1. An assumption that fragment streams (to download) are equal to output
   (elementary) streams.

   * This made it hard to expose `GstStream` and `GstStreamCollection`
     describing the available media streams, and by extension made it
     difficult to provide efficient stream selection support

2. By performing download buffering outside the adaptive streaming elements,
   the download scheduling had no visibility into the presentation timeline.

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
# Adaptive Demuxers for DASH, HLS and Smooth Streaming

There are two sets of elements implementing client-side adaptive streaming
(HLS, DASH, Microsoft Smooth Streaming) in GStreamer:

 - The old legacy elements `dashdemux`, `hlsdemux`, `mssdemux` in the
   gst-plugins-bad module.

 - New `dashdemux2`, `hlsdemux2`, `mssdemux2` elements in gst-plugins-good
   (added in GStreamer 1.22).

The legacy adaptive streaming support in `gst-plugins-bad` had several pitfalls
that prevented improving it easily. The legacy design used a model where an
adaptive streaming element (`dashdemux`, `hlsdemux`) downloaded multiplexed
fragments of media, but then relied on other components in the pipeline to
provide download buffering, demuxing, elementary stream handling and decoding.

The problems with the old design included:

1. An assumption that fragment streams (to download) are equal to output
   (elementary) streams.

   * This made it hard to expose `GstStream` and `GstStreamCollection`
     describing the available media streams, and by extension made it
     difficult to provide efficient stream selection support

2. By performing download buffering outside the adaptive streaming elements,
   the download scheduling had no visibility into the presentation timeline.


---

