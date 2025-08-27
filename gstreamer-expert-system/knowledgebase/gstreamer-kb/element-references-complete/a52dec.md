 - ofa (Open Fingerprint Architecture library plugin)
 - resindvd (Resin DVD playback plugin)
 - x265 (HEVC/H.265 video encoder plugin)

List of plugins with (A)GPL-licensed dependencies (non-exhaustive) in gst-plugins-ugly:
 - a52dec (Dolby Digital (AC-3) audio decoder plugin)
 - cdio (CD audio source plugin based on libcdio)
 - dvdread (DVD video source plugin based on libdvdread)
 - mpeg2dec (MPEG-2 video decoder plugin based on libmpeg2)
 - sidplay (Commodore 64 audio decoder plugin based on libsidplay)
 - x264 (H.264 video encoder plugin based on libx264)

### Static build

Since *1.18.0*, when doing a static build using `--default-library=static`,
a shared library `gstreamer-full-1.0`, in addition to a package config file,
will be produced and includes all enabled GStreamer plugins and libraries.
A list of libraries that needs to be exposed in `gstreamer-full-1.0`
ABI can be set using `gst-full-libraries` option.
glib-2.0, gobject-2.0 and gstreamer-1.0 are always included.


A more complex pipeline looks like:

```
gst-launch filesrc location=redpill.vob ! dvddemux name=demux \
 demux.audio_00 ! queue ! a52dec ! audioconvert ! audioresample ! osssink \
 demux.video_00 ! queue ! mpeg2dec ! videoconvert ! xvimagesink

```

You can also use the parser in you own code. GStreamer provides a
function gst\_parse\_launch () that you can use to construct a pipeline.
The following program lets you create an MP3 pipeline using the
gst\_parse\_launch () function:

``` c
#include <gst/gst.h>

int
main (int argc, char *argv[])
{
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
  [prebuilt binaries]: https://gstreamer.freedesktop.org/data/pkg/android/
  [language bindings]: http://en.wikipedia.org/wiki/Language_binding

A more complex pipeline looks like:

```
gst-launch filesrc location=redpill.vob ! dvddemux name=demux \
 demux.audio_00 ! queue ! a52dec ! audioconvert ! audioresample ! osssink \
 demux.video_00 ! queue ! mpeg2dec ! videoconvert ! xvimagesink

```

You can also use the parser in you own code. GStreamer provides a
function gst\_parse\_launch () that you can use to construct a pipeline.
The following program lets you create an MP3 pipeline using the
gst\_parse\_launch () function:

``` c
#include <gst/gst.h>

int
main (int argc, char *argv[])
{
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
  [prebuilt binaries]: https://gstreamer.freedesktop.org/data/pkg/android/
  [language bindings]: http://en.wikipedia.org/wiki/Language_binding

---

