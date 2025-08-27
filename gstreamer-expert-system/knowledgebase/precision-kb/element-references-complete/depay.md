
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

