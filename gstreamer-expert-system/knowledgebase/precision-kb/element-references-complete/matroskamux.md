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
link to the next element is ambiguous: the next element may have more
than one compatible input pad, or its input pad may be compatible with
the Pad Caps of all the output pads. In these cases GStreamer will link
using the first pad that is available, which pretty much amounts to
saying that GStreamer will choose one output pad at random.
--
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

Play a media file using `playbin` (as in [](tutorials/basic/hello-world.md)):

```
gst-launch-1.0 playbin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm
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
link to the next element is ambiguous: the next element may have more
than one compatible input pad, or its input pad may be compatible with
the Pad Caps of all the output pads. In these cases GStreamer will link
using the first pad that is available, which pretty much amounts to
saying that GStreamer will choose one output pad at random.
--
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

Play a media file using `playbin` (as in [](tutorials/basic/hello-world.md)):

```
gst-launch-1.0 playbin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm

##  TOC scope: global and current

There are two main consumers for TOC information: applications and
elements in the pipeline that are TOC writers (such as e.g.
matroskamux).

Applications typically want to know the entire table of contents (TOC)
with all entries that can possibly be selected.

TOC writers in the pipeline, however, would not want to write a TOC for
all possible/available streams, but only for the current stream.

When transcoding a title from a DVD, for example, the application would
still want to know the entire TOC, with all titles, the chapters for
each title, and the available angles. When transcoding to a file, we
only want the TOC information that is relevant to the transcoded stream
to be written into the file structure, e.g. the chapters of the title
being transcoded (or possibly only chapters 5-7 if only those have been
selected for playback/ transcoding).


##  TOC scope: global and current

There are two main consumers for TOC information: applications and
elements in the pipeline that are TOC writers (such as e.g.
matroskamux).

Applications typically want to know the entire table of contents (TOC)
with all entries that can possibly be selected.

TOC writers in the pipeline, however, would not want to write a TOC for
all possible/available streams, but only for the current stream.

When transcoding a title from a DVD, for example, the application would
still want to know the entire TOC, with all titles, the chapters for
each title, and the available angles. When transcoding to a file, we
only want the TOC information that is relevant to the transcoded stream
to be written into the file structure, e.g. the chapters of the title
being transcoded (or possibly only chapters 5-7 if only those have been
selected for playback/ transcoding).


---

