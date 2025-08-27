
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
--
### Example 2

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

Suppose asrc has a latency of 20ms and vsrc a latency of 33ms, the total
latency in the pipeline has to be at least 33ms. This also means that the
pipeline must have at least a `33 - 20 = 13ms` buffering on the audio stream or
else the audio src will underrun while the audiosink waits for the previous
sample to play.

### Example 3

An example of the combination of a non-live (file) and a live source (vsrc)
connected to live sinks (vsink, sink).

```
.--------------------------.
| pipeline                 |
| .------.      .-------.  |
| | file |      | sink  |  |

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
--
### Example 2

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

Suppose asrc has a latency of 20ms and vsrc a latency of 33ms, the total
latency in the pipeline has to be at least 33ms. This also means that the
pipeline must have at least a `33 - 20 = 13ms` buffering on the audio stream or
else the audio src will underrun while the audiosink waits for the previous
sample to play.

### Example 3

An example of the combination of a non-live (file) and a live source (vsrc)
connected to live sinks (vsink, sink).

```
.--------------------------.
| pipeline                 |
| .------.      .-------.  |
| | file |      | sink  |  |

---

