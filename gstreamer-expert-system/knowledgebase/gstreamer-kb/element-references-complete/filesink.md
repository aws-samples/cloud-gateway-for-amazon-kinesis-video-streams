This is useful, for example, when you want to retrieve one particular
stream out of a
demuxer:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.video_0 ! matroskamux ! filesink location=sintel_video.mkv
```

This fetches a media file from the internet using `souphttpsrc`, which
is in webm format (a special kind of Matroska container, see [](tutorials/basic/concepts.md)). We
then open the container using `matroskademux`. This media contains both
audio and video, so `matroskademux` will create two output Pads, named
`video_0` and `audio_0`. We link `video_0` to a `matroskamux` element
to re-pack the video stream into a new container, and finally link it to
a `filesink`, which will write the stream into a file named
"sintel\_video.mkv" (the `location` property specifies the name of the
file).

All in all, we took a webm file, stripped it of audio, and generated a
new matroska file with the video. If we wanted to keep only the
audio:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.audio_0 ! vorbisparse ! matroskamux ! filesink location=sintel_audio.mka
```

The `vorbisparse` element is required to extract some information from
the stream and put it in the Pad Caps, so the next element,
`matroskamux`, knows how to deal with the stream. In the case of video
this was not necessary, because `matroskademux` already extracted this
information and added it to the Caps.

Note that in the above two examples no media has been decoded or played.
We have just moved from one container to another (demultiplexing and
re-multiplexing again).

### Caps filters

When an element has more than one output pad, it might happen that the
--

Consider the following
pipeline:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux ! filesink location=test
```

This is the same media file and demuxer as in the previous example. The
input Pad Caps of `filesink` are `ANY`, meaning that it can accept any
kind of media. Which one of the two output pads of `matroskademux` will
be linked against the filesink? `video_0` or `audio_0`? You cannot
know.

You can remove this ambiguity, though, by using named pads, as in the
previous sub-section, or by using **Caps
Filters**:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux ! video/x-vp8 ! matroskamux ! filesink location=sintel_video.mkv
```

A Caps Filter behaves like a pass-through element which does nothing and
only accepts media with the given Caps, effectively resolving the
ambiguity. In this example, between `matroskademux` and `matroskamux` we
added a `video/x-vp8` Caps Filter to specify that we are interested in
the output pad of `matroskademux` which can produce this kind of video.

To find out the Caps an element accepts and produces, use the
`gst-inspect-1.0` tool. To find out the Caps contained in a particular file,
use the `gst-discoverer-1.0` tool. To find out the Caps an element is
producing for a particular pipeline, run `gst-launch-1.0` as usual, with the
`–v` option to print Caps information.

### Examples
--
branch to make sure the pipeline can preroll and start up. Another solution
would be to use `x264enc tune=zerolatency` but that results in lower quality
and is more suitable for live streaming scenarios.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=d ! queue ! videoconvert ! x264enc ! video/x-h264,profile=high ! mp4mux name=m ! filesink location=sintel.mp4 d. ! queue max-size-time=5000000000 max-size-bytes=0 max-size-buffers=0 ! audioconvert ! audioresample ! voaacenc ! m.
```

A rescaling pipeline. The `videoscale` element performs a rescaling
operation whenever the frame size is different in the input and the
output caps. The output caps are set by the Caps Filter to
320x200.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! queue ! videoscale ! video/x-raw,width=320,height=200 ! videoconvert ! autovideosink
```

This short description of `gst-launch-1.0` should be enough to get you
started. Remember that you have the [complete documentation available
here](tools/gst-launch.md).

### Format conversion

Convert an mp3 music file to an Ogg Vorbis file:

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! vorbisenc ! oggmux ! filesink location=music.ogg
```

Convert to the FLAC format:

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! flacenc ! filesink location=test.flac
```

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
the above for "cdparanoiasrc" that will tell it to rip the entire CD or
only tracks of it. Alternatively, you can use an URI and `gst-launch-1.0`
will find an element (such as cdparanoia) that supports that protocol
for you, e.g.:

```
gst-launch-1.0 cdda://5 ! lamemp3enc vbr=new vbr-quality=6 ! xingmux ! id3v2mux ! filesink location=track5.mp3
```

Record sound from your audio input and encode it into an ogg file:

```
gst-launch-1.0 pulsesrc ! audioconvert ! vorbisenc ! oggmux ! filesink location=input.ogg
```

### Video

**Note:** For audio/video playback it's best to use the `playbin3` or
`uridecodebin3` elements, these are just example pipelines.

Display only the video portion of an MPEG-2 video file, outputting to an X
display window:

```
gst-launch-1.0 filesrc location=JB_FF9_TheGravityOfLove.mpg ! mpegdemux ! mpegvideoparse ! mpeg2dec ! videoconvert ! xvimagesink
```

Display the video portion of a .vob file (used on DVDs), outputting to an SDL
--

Record audio and write it to a .wav file. Force usage of signed 16 to 32 bit
samples and a sample rate between 32kHz and 64KHz:

```
gst-launch-1.0 pulsesrc !  'audio/x-raw,rate=[32000,64000],format={S16LE,S24LE,S32LE}' ! wavenc ! filesink location=recording.wav
```

## Environment Variables

`GST_DEBUG`: Comma-separated list of debug categories and levels, e.g:

```
GST_DEBUG=totem:4,typefind:5
```

`*` is allowed as a wildcard as part of debug category names (e.g.
`GST_DEBUG=*sink:6,*audio*:6`). It is also possible to specify the log level
by name (1=ERROR, 2=WARN, 3=FIXME, 4=INFO, 5=DEBUG, 6=LOG, 7=TRACE, 9=MEMDUMP),
e.g. `GST_DEBUG=*audio*:LOG`.

This is useful, for example, when you want to retrieve one particular
stream out of a
demuxer:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.video_0 ! matroskamux ! filesink location=sintel_video.mkv
```

This fetches a media file from the internet using `souphttpsrc`, which
is in webm format (a special kind of Matroska container, see [](tutorials/basic/concepts.md)). We
then open the container using `matroskademux`. This media contains both
audio and video, so `matroskademux` will create two output Pads, named
`video_0` and `audio_0`. We link `video_0` to a `matroskamux` element
to re-pack the video stream into a new container, and finally link it to
a `filesink`, which will write the stream into a file named
"sintel\_video.mkv" (the `location` property specifies the name of the
file).

All in all, we took a webm file, stripped it of audio, and generated a
new matroska file with the video. If we wanted to keep only the
audio:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.audio_0 ! vorbisparse ! matroskamux ! filesink location=sintel_audio.mka
```

The `vorbisparse` element is required to extract some information from
the stream and put it in the Pad Caps, so the next element,
`matroskamux`, knows how to deal with the stream. In the case of video
this was not necessary, because `matroskademux` already extracted this
information and added it to the Caps.

Note that in the above two examples no media has been decoded or played.
We have just moved from one container to another (demultiplexing and
re-multiplexing again).

### Caps filters

When an element has more than one output pad, it might happen that the
--

Consider the following
pipeline:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux ! filesink location=test
```

This is the same media file and demuxer as in the previous example. The
input Pad Caps of `filesink` are `ANY`, meaning that it can accept any
kind of media. Which one of the two output pads of `matroskademux` will
be linked against the filesink? `video_0` or `audio_0`? You cannot
know.

You can remove this ambiguity, though, by using named pads, as in the
previous sub-section, or by using **Caps
Filters**:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux ! video/x-vp8 ! matroskamux ! filesink location=sintel_video.mkv
```

A Caps Filter behaves like a pass-through element which does nothing and
only accepts media with the given Caps, effectively resolving the
ambiguity. In this example, between `matroskademux` and `matroskamux` we
added a `video/x-vp8` Caps Filter to specify that we are interested in
the output pad of `matroskademux` which can produce this kind of video.

To find out the Caps an element accepts and produces, use the
`gst-inspect-1.0` tool. To find out the Caps contained in a particular file,
use the `gst-discoverer-1.0` tool. To find out the Caps an element is
producing for a particular pipeline, run `gst-launch-1.0` as usual, with the
`–v` option to print Caps information.

### Examples
--
branch to make sure the pipeline can preroll and start up. Another solution
would be to use `x264enc tune=zerolatency` but that results in lower quality
and is more suitable for live streaming scenarios.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=d ! queue ! videoconvert ! x264enc ! video/x-h264,profile=high ! mp4mux name=m ! filesink location=sintel.mp4 d. ! queue max-size-time=5000000000 max-size-bytes=0 max-size-buffers=0 ! audioconvert ! audioresample ! voaacenc ! m.
```

A rescaling pipeline. The `videoscale` element performs a rescaling
operation whenever the frame size is different in the input and the
output caps. The output caps are set by the Caps Filter to
320x200.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! queue ! videoscale ! video/x-raw,width=320,height=200 ! videoconvert ! autovideosink
```

This short description of `gst-launch-1.0` should be enough to get you
started. Remember that you have the [complete documentation available
here](tools/gst-launch.md).


``` c
gst-launch-1.0 filesrc location=f:\\media\\sintel\\sintel_trailer-480p.webm ! decodebin ! autovideosink
```

### `filesink`

This element writes to a file all the media it receives. Use the
`location` property to specify the file
name.

```
gst-launch-1.0 audiotestsrc ! vorbisenc ! oggmux ! filesink location=test.ogg
```

## Network

### `souphttpsrc`

This element receives data as a client over the network via HTTP using
the [libsoup](https://wiki.gnome.org/Projects/libsoup) library. Set the URL to retrieve through the `location`
property.

``` bash
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! decodebin ! autovideosink
```

## Test media generation
encode a source for a given profile:

```c
encbin = gst_element_factory_make ("encodebin, NULL);
g_object_set (encbin, "profile", "N900/H264 HQ", NULL);
gst_element_link (encbin, filesink);

vsrcpad = gst_element_get_src_pad (source, "src1");
vsinkpad = gst_element_request_pad_simple (encbin, "video\_%u");
gst_pad_link (vsrcpad, vsinkpad);
```

### Explanation of the Various stages in EncodeBin

This describes the various stages which can happen in order to end up
with a multiplexed stream that can then be stored or streamed.

#### Incoming streams

The streams fed to EncodeBin can be of various types:


---

