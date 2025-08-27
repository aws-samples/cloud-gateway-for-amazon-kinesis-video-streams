### Example 1

An audio capture/playback pipeline.

* asrc: audio source, provides a clock
* asink audio sink, provides a clock

```
+--------------------------+
| pipeline                 |
| +------+      +-------+  |
| | asrc |      | asink |  |
| |     src -> sink     |  |
| +------+      +-------+  |
+--------------------------+
```

* *NULL→READY*:
    * asink: *NULL→READY*: probes device, returns `SUCCESS`
    * asrc: *NULL→READY*:  probes device, returns `SUCCESS`

* *READY→PAUSED*:
    * asink: *READY:→PAUSED* open device, returns `ASYNC`
    * asrc: *READY→PAUSED*:  open device, returns `NO_PREROLL`

- Since the source is a live source, it will only produce data in
the `PLAYING` state. To note this fact, it returns `NO_PREROLL`
from the state change function.

- This sink returns `ASYNC` because it can only complete the state
change to `PAUSED` when it receives the first buffer.

At this point the pipeline is not processing data and the clock is not
running. Unless a new action is performed on the pipeline, this situation will
never change.

* *PAUSED→PLAYING*: asrc clock selected because it is the most upstream clock
provider. asink can only provide a clock when it received the first buffer and
configured the device with the samplerate in the caps.

* sink: *PAUSED:→PLAYING*, sets pending state to `PLAYING`, returns `ASYNC` because it
is not prerolled. The sink will commit state to `PLAYING` when it prerolls.
* src: *PAUSED→PLAYING*: starts pushing buffers.

- since the sink is still performing a state change from `READY→PAUSED`, it remains `ASYNC`. The pending state will be set to
`PLAYING`.

- The clock starts running as soon as all the elements have been
set to `PLAYING`.

- the source is a live source with a latency. Since it is
synchronized with the clock, it will produce a buffer with
timestamp 0 and duration D after time D, ie. it will only be
--

An audio/video capture/playback pipeline. We capture both audio and video and
have them played back synchronized again.

* asrc: audio source, provides a clock
* asink audio sink, provides a clock
* vsrc: video source
* vsink video sink

```
.--------------------------.
| pipeline                 |
| .------.      .-------.  |
| | asrc |      | asink |  |
| |     src -> sink     |  |
| '------'      '-------'  |
| .------.      .-------.  |
| | vsrc |      | vsink |  |
| |     src -> sink     |  |
| '------'      '-------'  |
'--------------------------'
```

The state changes happen in the same way as example 1. Both sinks end up with
pending state of `PLAYING` and a return value of `ASYNC` until they receive the
first buffer.

For audio and video to be played in sync, both sinks must compensate for the
latency of its source but must also use exactly the same latency correction.
.-----.    .-------.              .------.    .-------.
| src |    | demux |    .-----.   | vdec |    | vsink |
|    src->sink    src1->|queue|->sink   src->sink     |
'-----'    |       |    '-----'   '------'    '-------'
           |       |              .------.    .-------.
           |       |    .-----.   | adec |    | asink |
           |      src2->|queue|->sink   src->sink     |
           '-------'    '-----'   '------'    '-------'
```

  - app sets the pipeline to `PAUSED` to block on the preroll picture

  - app seeks to required position in the stream. This can be done
    with a positive or negative rate depending on the required frame
    stepping direction.

  - app steps frames (in `GST_FORMAT_DEFAULT` or `GST_FORMAT_BUFFER`) or an
  amount of time on the video sink. The pipeline loses its `PAUSED` state until
  the required number of frames have been skipped, it then prerolls again. This
  skipping is purely done in the sink.


- boost the priority of the udp receiver streaming thread

```
.--------.    .-------.    .------.    .-------.
| udpsrc |    | depay |    | adec |    | asink |
|       src->sink    src->sink   src->sink     |
'--------'    '-------'    '------'    '-------'
```

- when going from `READY` to `PAUSED` state, udpsrc will require a
streaming thread for pushing data into the depayloader. It will
post a `STREAM_STATUS` message indicating its requirement for a
streaming thread.

- The application will usually react to the `STREAM_STATUS`
messages with a sync bus handler.

- The application can configure the `GstTask` with a custom
`GstTaskPool` to manage the streaming thread or it can ignore the
message which will make the element use its default `GstTaskPool`.
### Example 1

An audio capture/playback pipeline.

* asrc: audio source, provides a clock
* asink audio sink, provides a clock

```
+--------------------------+
| pipeline                 |
| +------+      +-------+  |
| | asrc |      | asink |  |
| |     src -> sink     |  |
| +------+      +-------+  |
+--------------------------+
```

* *NULL→READY*:
    * asink: *NULL→READY*: probes device, returns `SUCCESS`
    * asrc: *NULL→READY*:  probes device, returns `SUCCESS`

* *READY→PAUSED*:
    * asink: *READY:→PAUSED* open device, returns `ASYNC`
    * asrc: *READY→PAUSED*:  open device, returns `NO_PREROLL`

- Since the source is a live source, it will only produce data in
the `PLAYING` state. To note this fact, it returns `NO_PREROLL`
from the state change function.

- This sink returns `ASYNC` because it can only complete the state
change to `PAUSED` when it receives the first buffer.

At this point the pipeline is not processing data and the clock is not
running. Unless a new action is performed on the pipeline, this situation will
never change.

* *PAUSED→PLAYING*: asrc clock selected because it is the most upstream clock
provider. asink can only provide a clock when it received the first buffer and
configured the device with the samplerate in the caps.

* sink: *PAUSED:→PLAYING*, sets pending state to `PLAYING`, returns `ASYNC` because it
is not prerolled. The sink will commit state to `PLAYING` when it prerolls.
* src: *PAUSED→PLAYING*: starts pushing buffers.

- since the sink is still performing a state change from `READY→PAUSED`, it remains `ASYNC`. The pending state will be set to
`PLAYING`.

- The clock starts running as soon as all the elements have been
set to `PLAYING`.

- the source is a live source with a latency. Since it is
synchronized with the clock, it will produce a buffer with
timestamp 0 and duration D after time D, ie. it will only be
--

An audio/video capture/playback pipeline. We capture both audio and video and
have them played back synchronized again.

* asrc: audio source, provides a clock
* asink audio sink, provides a clock
* vsrc: video source
* vsink video sink

```
.--------------------------.
| pipeline                 |
| .------.      .-------.  |
| | asrc |      | asink |  |
| |     src -> sink     |  |
| '------'      '-------'  |
| .------.      .-------.  |
| | vsrc |      | vsink |  |
| |     src -> sink     |  |
| '------'      '-------'  |
'--------------------------'
```

The state changes happen in the same way as example 1. Both sinks end up with
pending state of `PLAYING` and a return value of `ASYNC` until they receive the
first buffer.

For audio and video to be played in sync, both sinks must compensate for the
latency of its source but must also use exactly the same latency correction.
.-----.    .-------.              .------.    .-------.
| src |    | demux |    .-----.   | vdec |    | vsink |
|    src->sink    src1->|queue|->sink   src->sink     |
'-----'    |       |    '-----'   '------'    '-------'
           |       |              .------.    .-------.
           |       |    .-----.   | adec |    | asink |
           |      src2->|queue|->sink   src->sink     |
           '-------'    '-----'   '------'    '-------'
```

  - app sets the pipeline to `PAUSED` to block on the preroll picture

  - app seeks to required position in the stream. This can be done
    with a positive or negative rate depending on the required frame
    stepping direction.

  - app steps frames (in `GST_FORMAT_DEFAULT` or `GST_FORMAT_BUFFER`) or an
  amount of time on the video sink. The pipeline loses its `PAUSED` state until
  the required number of frames have been skipped, it then prerolls again. This
  skipping is purely done in the sink.


---

