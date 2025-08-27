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
--
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

### video only pipeline in PAUSED

```
.-----.    .-------.              .------.    .-------.
| src |    | demux |    .-----.   | vdec |    | vsink |
|    src->sink    src1->|queue|->sink   src->sink     |
'-----'    '-------'    '-----'   '------'    '-------'
```

  - app sets the pipeline to `PAUSED` to block on the preroll picture

  - app seeks to required position in the stream. This can be done
    with a positive or negative rate depending on the required frame
    stepping direction.

  - app steps frames (in `GST_FORMAT_DEFAULT` or `GST_FORMAT_BUFFER)`. The
  pipeline loses its `PAUSED` state until the required number of frames have been
  skipped, it then prerolls again. This skipping is purely done in the sink.

  - sink posts `STEP_DONE` with amount of frames stepped and
--

### audio/video pipeline in PAUSED

```
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
--
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

### video only pipeline in PAUSED

```
.-----.    .-------.              .------.    .-------.
| src |    | demux |    .-----.   | vdec |    | vsink |
|    src->sink    src1->|queue|->sink   src->sink     |
'-----'    '-------'    '-----'   '------'    '-------'
```

  - app sets the pipeline to `PAUSED` to block on the preroll picture

  - app seeks to required position in the stream. This can be done
    with a positive or negative rate depending on the required frame
    stepping direction.

  - app steps frames (in `GST_FORMAT_DEFAULT` or `GST_FORMAT_BUFFER)`. The
  pipeline loses its `PAUSED` state until the required number of frames have been
  skipped, it then prerolls again. This skipping is purely done in the sink.

  - sink posts `STEP_DONE` with amount of frames stepped and
--

### audio/video pipeline in PAUSED

```
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

---

