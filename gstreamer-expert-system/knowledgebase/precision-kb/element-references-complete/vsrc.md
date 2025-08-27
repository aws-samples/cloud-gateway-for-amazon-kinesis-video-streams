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
| |     src -> sink     |  |
| '------'      '-------'  |
| .------.      .-------.  |
| | vsrc |      | vsink |  |
| |     src -> sink     |  |
| '------'      '-------'  |
'--------------------------'
```

The state changes happen in the same way as example 1. Except sink will be
able to preroll (commit its state to `PAUSED`).

In this case sink will have no latency but vsink will. The total latency
should be that of vsink.

Note that because of the presence of a live source (vsrc), the pipeline can be
set to playing before the sink is able to preroll. Without compensation for the
live source, this might lead to synchronisation problems because the latency
should be configured in the element before it can go to `PLAYING`.

### Example 4

An example of the combination of a non-live and a live source. The non-live
source is connected to a live sink and the live source to a non-live sink.

```
.--------------------------.
| pipeline                 |
| .------.      .-------.  |
| | file |      | sink  |  |
| |     src -> sink     |  |
| '------'      '-------'  |
| .------.      .-------.  |
| | vsrc |      | files |  |
| |     src -> sink     |  |
| '------'      '-------'  |
'--------------------------'
```

The state changes happen in the same way as example 3. Sink will be
able to preroll (commit its state to `PAUSED`). files will not be able to
preroll.

sink will have no latency since it is not connected to a live source. files
does not do synchronisation so it does not care about latency.

The total latency in the pipeline is 0. The vsrc captures in sync with the
playback in sink.

As in example 3, sink can only be set to `PLAYING` after it successfully
prerolled.

## State Changes

A sink is never set to `PLAYING` before it is prerolled. In order to do
this, the pipeline (at the `GstBin` level) keeps track of all elements
that require preroll (the ones that return `ASYNC` from the state change).
These elements posted an `ASYNC_START` message without a matching
`ASYNC_DONE` one.

The pipeline will not change the state of the elements that are still
doing an `ASYNC` state change.
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
| |     src -> sink     |  |
| '------'      '-------'  |
| .------.      .-------.  |
| | vsrc |      | vsink |  |
| |     src -> sink     |  |
| '------'      '-------'  |
'--------------------------'
```

The state changes happen in the same way as example 1. Except sink will be
able to preroll (commit its state to `PAUSED`).

In this case sink will have no latency but vsink will. The total latency
should be that of vsink.

Note that because of the presence of a live source (vsrc), the pipeline can be
set to playing before the sink is able to preroll. Without compensation for the
live source, this might lead to synchronisation problems because the latency
should be configured in the element before it can go to `PLAYING`.

### Example 4

An example of the combination of a non-live and a live source. The non-live
source is connected to a live sink and the live source to a non-live sink.

```
.--------------------------.
| pipeline                 |
| .------.      .-------.  |
| | file |      | sink  |  |
| |     src -> sink     |  |
| '------'      '-------'  |
| .------.      .-------.  |
| | vsrc |      | files |  |
| |     src -> sink     |  |
| '------'      '-------'  |
'--------------------------'
```

The state changes happen in the same way as example 3. Sink will be
able to preroll (commit its state to `PAUSED`). files will not be able to
preroll.

sink will have no latency since it is not connected to a live source. files
does not do synchronisation so it does not care about latency.

The total latency in the pipeline is 0. The vsrc captures in sync with the
playback in sink.

As in example 3, sink can only be set to `PLAYING` after it successfully
prerolled.

## State Changes

A sink is never set to `PLAYING` before it is prerolled. In order to do
this, the pipeline (at the `GstBin` level) keeps track of all elements
that require preroll (the ones that return `ASYNC` from the state change).
These elements posted an `ASYNC_START` message without a matching
`ASYNC_DONE` one.

The pipeline will not change the state of the elements that are still
doing an `ASYNC` state change.

---

