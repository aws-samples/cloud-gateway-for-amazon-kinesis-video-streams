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

---

