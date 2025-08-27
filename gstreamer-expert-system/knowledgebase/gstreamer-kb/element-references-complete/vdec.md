
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

