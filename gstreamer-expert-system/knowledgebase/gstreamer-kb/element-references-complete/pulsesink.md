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

# Audio
alsasrc         # ALSA audio input
alsasink        # ALSA audio output
pulsesrc        # PulseAudio input
pulsesink       # PulseAudio output
```

#### Cross-Platform Elements (Safe for all platforms)
```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
autovideosink   # Automatically selects appropriate video sink
autoaudiosrc    # Automatically selects appropriate audio source
autoaudiosink   # Automatically selects appropriate audio sink

# Software codecs (available everywhere)
x264enc         # Software H.264 encoding
avdec_h264      # Software H.264 decoding
```

integrating with Linux or a UNIX-like operating system.

  - For audio input and output, GStreamer provides input and output
    elements for several audio subsystems. Amongst others, GStreamer
    includes elements for ALSA (alsasrc, alsasink), OSS (osssrc,
    osssink) Pulesaudio (pulsesrc, pulsesink) and Sun audio
    (sunaudiosrc, sunaudiomixer, sunaudiosink).

  - For video input, GStreamer contains source elements for Video4linux2
    (v4l2src, v4l2element, v4l2sink).

  - For video output, GStreamer provides elements for output to
    X-windows (ximagesink), Xv-windows (xvimagesink; for
    hardware-accelerated video), direct-framebuffer (dfbimagesink) and
    openGL image contexts (glsink).

## GNOME desktop

GStreamer has been the media backend of the
[GNOME](http://www.gnome.org/) desktop since GNOME-2.2 onwards.
Nowadays, a whole bunch of GNOME applications make use of GStreamer for
--
Juicer](https://wiki.gnome.org/Apps/SoundJuicer).

Most of these GNOME applications make use of some specific techniques to
integrate as closely as possible with the GNOME desktop:

  - GNOME uses Pulseaudio for audio, use the pulsesrc and pulsesink
    elements to have access to all the features.

  - GStreamer provides data input/output elements for use with the GIO
    VFS system. These elements are called “giosrc” and “giosink”. The
    deprecated GNOME-VFS system is supported too but shouldn't be used
    for any new applications.

## KDE desktop

GStreamer has been proposed for inclusion in KDE-4.0. Currently,
GStreamer is included as an optional component, and it's used by several
KDE applications, including [AmaroK](http://amarok.kde.org/),
[KMPlayer](http://www.xs4all.nl/~jjvrieze/kmplayer.html) and
[Kaffeine](http://kaffeine.sourceforge.net/).

Lists use this format: `{VALUE [, VALUE ...]}`, e.g. `width={1920,1280,640}`

## Pipeline Examples

The examples below assume that you have the correct plug-ins available.
In general, "pulsesink" can be substituted with another audio output
plug-in such as "alsasink", "osxaudiosink", or "wasapisink"

Likewise, `xvimagesink` can be substituted with `d3dvideosink`,
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

```
gst-launch-1.0 filesrc location=music.ogg ! oggdemux ! vorbisdec ! audioconvert ! audioresample ! pulsesink
```

Play an mp3 file or an http stream using GIO:

```
gst-launch-1.0 giosrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! pulsesink
```

```
gst-launch-1.0 giosrc location=http://domain.com/music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Use GIO to play an mp3 file located on an SMB server:

```
gst-launch-1.0 giosrc location=smb://computer/music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

### Format conversion

Convert an mp3 music file to an Ogg Vorbis file:

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! vorbisenc ! oggmux ! filesink location=music.ogg
```

Convert to the FLAC format:

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! flacenc ! filesink location=test.flac
```
--
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
--

```
gst-launch-1.0 filesrc location=movie.mpg ! dvddemux name=demuxer  \
\
demuxer. ! queue ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink \
demuxer. ! queue ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an AVI movie with an external text subtitle stream:

This example shows how to refer to specific pads by name if an
element (here: textoverlay) has multiple sink or source pads:

```
gst-launch-1.0 textoverlay name=overlay ! videoconvert ! videoscale ! autovideosink \
filesrc location=movie.avi ! decodebin3 !  videoconvert ! overlay.video_sink \
filesrc location=movie.srt ! subparse ! overlay.text_sink
```

Play an AVI movie with an external text subtitle stream using playbin:

--
elements to get a working pipeline.

Play any supported audio format:

```
gst-launch-1.0 filesrc location=musicfile ! decodebin3 ! audioconvert ! audioresample ! pulsesink
```

Play any supported video format with video and audio output. Threads are used
automatically:

```
gst-launch-1.0 filesrc location=videofile ! decodebin name=decoder decoder. ! queue ! audioconvert ! audioresample ! pulsesink   decoder. !  videoconvert ! xvimagesink
```

You can also support different inputs by using an URI and uridecodebin3, e.g.:

```
gst-launch-1.0 uridecodebin3 uri=file:///path/to/video.mp4 name=decoder decoder. ! queue ! audioconvert ! audioresample ! pulsesink   decoder. !  videoconvert ! xvimagesink
```

```
gst-launch-1.0 uridecodebin3 uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=decoder decoder. ! queue ! audioconvert ! audioresample ! pulsesink   decoder. !  videoconvert ! xvimagesink
```

To make the above even easier, you can use the playbin element:

```
gst-launch-1.0 playbin3 uri=file:///home/joe/foo.avi
```

```
gst-launch-1.0 playbin3 uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm
```

### Filtered connections

These examples show you how to use filtered caps.
Architecture). This sink is available on almost every Linux platform. It
is often seen as a “low level” interface to the sound card, and can be
complicated to configure (See the comment on
[](tutorials/playback/digital-audio-pass-through.md)).

### `pulsesink`

This sink plays audio to a [PulseAudio](http://www.pulseaudio.org/)
server. It is a higher level abstraction of the sound card than ALSA,
and is therefore easier to use and offers more advanced features. It has
been known to be unstable on some older Linux distributions, though.

## Mac OS X

### `osxvideosink`

This is the  video sink available to GStreamer on Mac OS X. It is also
possible to draw using `glimagesink` using OpenGL.

### `osxaudiosink`


---

