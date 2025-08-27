
Most GStreamer-based applications accept the commandline option
`--gst-debug=LIST` and related family members. The list consists of a
comma-separated list of category/level pairs, which can set the
debugging level for a specific debugging category. For example,
`--gst-debug=oggdemux:5` would turn on debugging for the Ogg demuxer
element. You can use wildcards as well. A debugging level of 0 will turn
off all debugging, and a level of 9 will turn on all debugging.
Intermediate values only turn on some debugging (based on message
severity; 2, for example, will only display errors and warnings). Here's
a list of all available options:

  - `--gst-debug-help` will print available debug categories and exit.

  - `--gst-debug-level=LEVEL` will set the default debug level (which
    can range from 0 (no output) to 9 (everything)).

  - `--gst-debug=LIST` takes a comma-separated list of
    category\_name:level pairs to set specific levels for the individual
    categories. Example: `GST_AUTOPLUG:5,avidemux:3`. Alternatively, you
    can also set the `GST_DEBUG` environment variable, which has the
--
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

`gst-inspect` can be used to inspect all properties, signals, dynamic
parameters and the object hierarchy of an element. This can be very
useful to see which `GObject` properties or which signals (and using
what arguments) an element supports. Run `gst-inspect fakesrc` to get an
idea of what it does. See the manual page of `gst-inspect` for more
information.
can be found in the GStreamer core library API documentation, in the
"Running GStreamer Applications" section.

Use `--gst-debug-help` to show category names

Example: `GST_CAT:LOG,GST_ELEMENT_*:INFO,oggdemux:LOG`

**--gst-debug-level=LEVEL**

Sets the threshold for printing debugging messages.  A higher level
will print more messages.  The useful range is 0-9, with the default
being 0. Level 6 (LOG level) will show all information that is usually
required for debugging purposes. Higher levels are only useful in very
specific cases. See above for the full list of levels.

**--gst-debug-no-color**

`GStreamer` normally prints debugging messages so that the
messages are color-coded when printed to a terminal that handles
ANSI escape sequences.  Using this option causes GStreamer
to print messages without color. Setting the `GST_DEBUG_NO_COLOR=1`
--
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

The first line of each commit message should be a short and concise summary
of the commit. If the commit applies to a specific subsystem, library, plugin
or element, prefix the message with the name of the component, for example:

    oggdemux: fix granulepos query for the old theora bitstream

or

    docs: add new stream API

or

    tests: video: add unit test for converting RGB to XYZ colorspace

This should be a *summary* of the change and _not a description_ of the change.
Meaning: don't say *how* you did something but *what* you fixed, improved or
changed, what the most important practical *effect* of the change is. Example:

    qtdemux: fix crash when doing reverse playback in push mode (good)

```

  - fakesink has a chain function and the peer pad has no loop function,
    no scheduling is done.

  - oggdemuxer and identity expose an () - (l-c) connection, oggdemux
    has to operate in chain mode.

  - identity chan only work chain based and so filesrc creates a thread
    to push data to it.
+-----------------------------------------------------------+
|    ----------> downstream ------------------->            |
|                                                           |
| pipeline                                                  |
| +---------+   +----------+   +-----------+   +----------+ |
| | filesrc |   | oggdemux |   | vorbisdec |   | alsasink | |
| |        src-sink       src-sink        src-sink        | |
| +---------+   +----------+   +-----------+   +----------+ |
|                                                           |
|    <---------< upstream <-------------------<             |
+-----------------------------------------------------------+
```

The filesrc element reads data from a file on disk. The oggdemux element
demultiplexes the data and sends a compressed audio stream to the vorbisdec
element. The vorbisdec element decodes the compressed data and sends it
to the alsasink element. The alsasink element sends the samples to the
audio card for playback.

Downstream and upstream are the terms used to describe the direction in
the Pipeline. From source to sink is called "downstream" and "upstream"
is from sink to source. Dataflow always happens downstream.

The task of the application is to construct a pipeline as above using
existing elements. This is further explained in the pipeline building
topic.

The application does not have to manage any of the complexities of the
actual dataflow/decoding/conversions/synchronisation etc. but only calls
--
demuxer element that has one pad that takes (sinks) data and two source
pads that produce data.

```
 +-----------+
 | oggdemux  |
 |          src0
sink        src1
 +-----------+
```

An element can be in four different states: `NULL`, `READY`, `PAUSED`,
`PLAYING`. In the `NULL` and `READY` state, the element is not processing any
data. In the `PLAYING` state it is processing data. The intermediate
PAUSED state is used to preroll data in the pipeline. A state change can
be performed with `gst_element_set_state()`.

An element always goes through all the intermediate state changes. This
means that when an element is in the `READY` state and is put to `PLAYING`,
it will first go through the intermediate `PAUSED` state.


---

