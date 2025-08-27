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
  please prefix the issue summary with `element-name:`, `plugin-name:` or `lib:`
  and keep the rest of the description as short and precise as possible.

  Examples:

   - `id3demux: fails to extract composer tags`
   - `tsdemux: does not detect audio stream`
   - `Internal flow error when playing matroska file`

  This makes sure developers looking through the list of open issues or issue
  notification mails can quickly identify what your issue is about. If your text
  is too long and only contains fill words at the beginning, the important
  information will be cut off and not show up in the list view or mail client.

- If you don't know which component to file the issue against, just pick the one
  that seems the most likely to you, or file it against the gstreamer-project
  component. If in doubt just pop into our [Matrix Discussion channel][matrix].
  In any case, if it's not the right component someone will move the issue once
  they have a better idea what the problem is and where it belongs.

- Please mention:
--
  please prefix the Merge Request summary with `element-name:`, `plugin-name:`
  or `lib:` and keep the rest of the description as short and precise as possible.

  Examples:

   - `id3demux: add support for WCOP frame`
   - `riff: add RGB16 support`
   - `playbin: detect if video-sink supports deinterlacing`
   - `tests: rtprtx unit test is racy`

  This makes sure developers looking through the list of open merge requests or
  notification mails can quickly identify what your change is about. If your text
  is too long and only contains fill words at the beginning, the important
  information will be cut off and not show up in the list view or mail client.

- Make liberal use of the reference syntax available to help cross-linking
  different issues and merge requests. e.g. `#100` references issue 100 in the
  current project, and `!100` references merge request 100 in the current project.
  A complete list is available from [gitlab's documentation][special-md-references].

- Please create separate merge requests for separate issues.

## Use Cases

  - mp3 with id3- and apetags

  - plug id3demux \! apedemux

  - avi with vorbis audio

  - plug avidemux

  - new pad → audio/vorbis

  - plug vorbisdec or special vorbiscomment reader

## Additional Thoughts

  - would it make sense to have 2-phase tag-reading (property on tagbin
    and/or tagread elements)

  - 1st phase: get tag-data that are directly embedded in the data
--

  - ogg : gst-plugins-base/ext/ogg

  - avi : gst-plugins-good/gst/avi

  - mp3 : gst-plugins-good/gst/id3demux

  - wav : gst-plugins-good/gst/wavparse

  - qt : gst-plugins-bad/gst/qtdemux
    autoaudiosink    : Sink/Audio/Device
    cairotimeoverlay : Mixer/Video/Text
    dvdec            : Decoder/Video
    dvdemux          : Demuxer
    goom             : Converter/Audio/Video
    id3demux         : Extracter/Metadata
    udpsrc           : Source/Network/Protocol/Device
    videomixer       : Mixer/Video
    videoconvert     : Filter/Video             (intended use to convert video with as little
                                                 visible change as possible)
    vertigotv        : Effect/Video             (intended use is to change the video)
    volume           : Effect/Audio             (intended use is to change the audio data)
    vorbisdec        : Decoder/Audio
    vorbisenc        : Encoder/Audio
    oggmux           : Muxer
    adder            : Mixer/Audio
    videobox         : Effect/Video
    alsamixer        : Control/Audio/Device
    audioconvert     : Filter/Audio
    audioresample    : Filter/Audio
    xvimagesink      : Sink/Video/Device

---

