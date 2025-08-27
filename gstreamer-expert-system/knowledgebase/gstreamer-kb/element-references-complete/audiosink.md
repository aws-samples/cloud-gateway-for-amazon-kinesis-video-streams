  - must operate chain based. Most simple playback pipelines will push
    audio from the decoders into the audio sink.

  - must operate getrange based Most professional audio applications
    will operate in a mode where the audio sink pulls samples from the
    pipeline. This is typically done in a callback from the audiosink
    requesting N samples. The callback is either scheduled from a thread
    or from an interrupt from the audio hardware device.

  - Exact sample accurate clocks. the audiosink must be able to provide
    a clock that is sample accurate even if samples are dropped or when
    discontinuities are found in the stream.

  - Exact timing of playback. The audiosink must be able to play samples
    at their exact times.

  - use DMA access when possible. When the hardware can do DMA we should
    use it. This should also work over bufferpools to avoid data copying
    to/from kernel space.

### Design

The design is based on a set of base classes and the concept of a
ringbuffer of samples.

```
+-----------+   - provide preroll, rendering, timing
+ basesink  +   - caps nego
+-----+-----+
--
+-----+----------+   - manages clock/query/seek
      |              - manages scheduling of samples in the ringbuffer
      |              - manages caps parsing
      |
+-----V------+   - default ringbuffer implementation with a GThread
+ audiosink  +   - subclasses provide open/read/close methods
+------------+
```

The ringbuffer is a contiguous piece of memory divided into segtotal
pieces of segments. Each segment has segsize bytes.

```
      play position
        v
+---+---+---+-------------------------------------+----------+
+ 0 | 1 | 2 | ....                                | segtotal |
+---+---+---+-------------------------------------+----------+
<--->
  segsize bytes = N samples * bytes_per_sample.
```

## Live buffering

In live pipelines we usually introduce some fixed latency between the
capture and the playback elements. This latency can be introduced by a
queue (such as a jitterbuffer) or by other means (in the audiosink).

Buffering messages can be emitted in those live pipelines as well and
serve as an indication to the user of the latency buffering. The
application usually does not react to these buffering messages with a
state change.

## Buffering strategies

What follows are some ideas for implementing different buffering
strategies based on the buffering messages and buffering query.

### No-rebuffer strategy

We would like to buffer enough data in the pipeline so that playback
continues without interruptions. What we need to know to implement this
* `$(videosink)`: The GStreamer videosink to use if the test can work with
                  different sinks for the video. It allows the tool to use
                  fakesinks when the user doesn't want to have visual feedback
                  for example.

* `$(audiosink)`: The GStreamer audiosink to use if the test can work with
                  different sinks for the audio. It allows the tool to use
                  fakesinks when the user doesn't want to have audio feedback
                  for example.
  [-p <path>|--sample-path=<path>] [-r <path>|--sample-path-recurse=<path>]
  [-o <uri>|--outputuri=<uri>] [-f <profile>|--format=<profile>]
  [-e <profile-name>|--encoding-profile=<profile-name>]
  [-t <track-types>|--track-types=<track-types>]
  [-v <videosink>|--videosink=<videosink>]
  [-a <audiosink>---audiosink=<audiosink>]
  [-m|--mute] [--inspect-action-type[=<action-type>]]
  [--list-transitions] [--disable-mixing]
  [-r <times>|--repeat=<times>] [--set-scenario=<scenario-name]

## Define a timeline through the command line

The `ges-launch-1.0` tool allows you to simply build a timeline through a dedicated set of commands:

### +clip

Adds a clip to the timeline.

See documentation for the --track-types option to ges-launch-1.0, as it
will affect the result of this command.

--

__-v --videosink=<videosink>:__

Set the videosink used for playback.

__-a --audiosink=<audiosink>:__

Set the audiosink used for playback.


__-m --mute:__

Mute playback output. This has no effect when rendering.


### Helpful options

__--inspect-action-type=<action-type>:__

Inspect the available action types that can be defined in a scenario set with
--set-scenario. Will list all action-types if action-type is empty.


* (c) - (l): impossible
* (c) - (c): impossible

```
+---------+    +------------+    +-----------+
| filesrc |    | mp3decoder |    | audiosink |
|        src--sink         src--sink         |
+---------+    +------------+    +-----------+
        (l-g) (c)           ()   (c)
```

When activating the pads:

  - audiosink has a chain function and the peer pad has no loop
    function, no scheduling is done.

  - mp3decoder and filesrc expose an (l) - (c) connection, a thread is
    created to call the srcpad loop function.

```
+---------+    +------------+    +----------+
| filesrc |    | avidemuxer |    | fakesink |
|        src--sink         src--sink        |
+---------+    +------------+    +----------+
        (l-g) (l)          ()   (c)
```

  - fakesink has a chain function and the peer pad has no loop function,
    no scheduling is done.

---

