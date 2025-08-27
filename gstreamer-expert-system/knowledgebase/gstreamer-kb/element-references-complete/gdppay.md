    interfaces, so applications that use this don't need to go fishing
    for elements that may implement those any more, but can just use on
    playbin unconditionally.

  - multifdsink, tcpclientsink, tcpclientsrc, tcpserversrc the protocol
    property is removed, use gdppay and gdpdepay.

  - XML serialization was removed.

  - Probes and pad blocking was merged into new pad probes.

  - Position, duration and convert functions no longer use an inout
    parameter for the destination format.

  - Video and audio caps were simplified. audio/x-raw-int and
    audio/x-raw-float are now all under the audio/x-raw media type.
    Similarly, video/x-raw-rgb and video/x-raw-yuv are now video/x-raw.

  - ffmpegcolorspace was removed and replaced with videoconvert.

  - GstMixerInterface / GstTunerInterface were removed without
    interfaces, so applications that use this don't need to go fishing
    for elements that may implement those any more, but can just use on
    playbin unconditionally.

  - multifdsink, tcpclientsink, tcpclientsrc, tcpserversrc the protocol
    property is removed, use gdppay and gdpdepay.

  - XML serialization was removed.

  - Probes and pad blocking was merged into new pad probes.

  - Position, duration and convert functions no longer use an inout
    parameter for the destination format.

  - Video and audio caps were simplified. audio/x-raw-int and
    audio/x-raw-float are now all under the audio/x-raw media type.
    Similarly, video/x-raw-rgb and video/x-raw-yuv are now video/x-raw.

  - ffmpegcolorspace was removed and replaced with videoconvert.

  - GstMixerInterface / GstTunerInterface were removed without

---

