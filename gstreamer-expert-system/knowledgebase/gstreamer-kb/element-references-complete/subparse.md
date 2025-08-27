element (here: textoverlay) has multiple sink or source pads:

```
gst-launch-1.0 textoverlay name=overlay ! videoconvert ! videoscale ! autovideosink \
filesrc location=movie.avi ! decodebin3 !  videoconvert ! overlay.video_sink \
filesrc location=movie.srt ! subparse ! overlay.text_sink
```

Play an AVI movie with an external text subtitle stream using playbin:

```
gst-launch-1.0 playbin3 uri=<file:///path/to/movie.avi> suburi=<file:///path/to/movie.srt>
```

### Network streaming

Stream video using RTP and network elements

This command would be run on the transmitter:

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
element (here: textoverlay) has multiple sink or source pads:

```
gst-launch-1.0 textoverlay name=overlay ! videoconvert ! videoscale ! autovideosink \
filesrc location=movie.avi ! decodebin3 !  videoconvert ! overlay.video_sink \
filesrc location=movie.srt ! subparse ! overlay.text_sink
```

Play an AVI movie with an external text subtitle stream using playbin:

```
gst-launch-1.0 playbin3 uri=<file:///path/to/movie.avi> suburi=<file:///path/to/movie.srt>
```

### Network streaming

Stream video using RTP and network elements

This command would be run on the transmitter:

```

</div>

## Details

Heap-based buffer overflow in the subparse subtitle parser when handling certain SRT subtitle files in GStreamer versions before 1.22.4 / 1.20.7.

## Impact

It is possible for a malicious third party to trigger a crash in the application, and possibly also effect code execution through heap manipulation.

## Solution

The gst-plugins-base 1.22.4 / 1.20.7 releases address the issue. People using older branches of GStreamer should apply the patch and recompile.

## References

### The GStreamer project

- [https://gstreamer.freedesktop.org](https://gstreamer.freedesktop.org)


---

