
## Stream buffering

```
      +---------+     +---------+     +-------+
      | httpsrc |     | buffer  |     | demux |
      |        src - sink      src - sink     ....
      +---------+     +---------+     +-------+

```

In this case we are reading from a slow network source into a buffer
element (such as queue2).

The buffer element has a low and high watermark expressed in bytes. The
buffer uses the watermarks as follows:

  - The buffer element will post BUFFERING messages until the high
    watermark is hit. This instructs the application to keep the
    pipeline PAUSED, which will eventually block the srcpad from pushing
    while data is prerolled in the sinks.
--

## Download buffering

```
      +---------+     +---------+     +-------+
      | httpsrc |     | buffer  |     | demux |
      |        src - sink      src - sink     ....
      +---------+     +----|----+     +-------+
                           V
                          file

```

If we know the server is streaming a fixed length file to the client,
the application can choose to download the entire file on disk. The
buffer element will provide a push or pull based srcpad to the demuxer
to navigate in the downloaded file.

This mode is only suitable when the client can determine the length of
the file on the server.

--

## Timeshift buffering

```
      +---------+     +---------+     +-------+
      | httpsrc |     | buffer  |     | demux |
      |        src - sink      src - sink     ....
      +---------+     +----|----+     +-------+
                           V
                       file-ringbuffer

```

In this mode, a fixed size ringbuffer is kept to download the server
content. This allows for seeking in the buffered data. Depending on the
size of the ringbuffer one can seek further back in time.

This mode is suitable for all live streams. As with the incremental
download mode, buffering messages are emitted along with an indication
that timeshifting download is in progress.


### Stream buffering

```
+---------+     +---------+     +-------+
| httpsrc |     | buffer  |     | demux |
|        src - sink      src - sink     ....
+---------+     +---------+     +-------+
```

In this case we are reading from a slow network source into a buffer element
(such as queue2).

The buffer element has a low and high watermark expressed in bytes. The
buffer uses the watermarks as follows:

- The buffer element will post `BUFFERING` messages until the high
watermark is hit. This instructs the application to keep the
pipeline `PAUSED`, which will eventually block the srcpad from
pushing while data is prerolled in the sinks.

--

### Incremental download

```
+---------+     +---------+     +-------+
| httpsrc |     | buffer  |     | demux |
|        src - sink      src - sink     ....
+---------+     +----|----+     +-------+
                     V
                    file
```
In this case, we know the server is streaming a fixed length file to the
client. The application can choose to download the file to disk. The buffer
element will provide a push or pull based srcpad to the demuxer to navigate in
the downloaded file.

This mode is only suitable when the client can determine the length of the
file on the server.

In this case, buffering messages will be emitted as usual when the requested
range is not within the downloaded area + buffersize. The buffering message
--

### Timeshifting

```
+---------+     +---------+     +-------+
| httpsrc |     | buffer  |     | demux |
|        src - sink      src - sink     ....
+---------+     +----|----+     +-------+
                     V
              file-ringbuffer
```

In this mode, a fixed size ringbuffer is kept to download the server content.
This allows for seeking in the buffered data. Depending on the size of the
buffer one can seek further back in time.

This mode is suitable for all live streams.

As with the incremental download mode, buffering messages are emitted along
with an indication that timeshifting download is in progress.

   * The code was complicated and interwoven in ways that were hard to follow
     and reason about.

5. Use of GStreamer pipeline sources for downloading.

   * An internal download pipeline that contained a `httpsrc -> queue2 -> src`
     chain made download management, bandwidth estimation and stream parsing
     more difficult, and used a new thread for each download.

# New design

The rest of this document describes the new adaptive streaming client
implementation that landed in gst-plugins-good in GStreamer 1.22.

The new elements only work in combination with the "streams-aware"
`playbin3` and `uridecodebin3` elements that support advanced stream
selection functionality, they won't work with the legacy `playbin`
element.

## High-level overview of the new internal AdaptiveDemux2 base class:


## Stream buffering

```
      +---------+     +---------+     +-------+
      | httpsrc |     | buffer  |     | demux |
      |        src - sink      src - sink     ....
      +---------+     +---------+     +-------+

```

In this case we are reading from a slow network source into a buffer
element (such as queue2).

The buffer element has a low and high watermark expressed in bytes. The
buffer uses the watermarks as follows:

  - The buffer element will post BUFFERING messages until the high
    watermark is hit. This instructs the application to keep the
    pipeline PAUSED, which will eventually block the srcpad from pushing
    while data is prerolled in the sinks.
--

## Download buffering

```
      +---------+     +---------+     +-------+
      | httpsrc |     | buffer  |     | demux |
      |        src - sink      src - sink     ....
      +---------+     +----|----+     +-------+
                           V
                          file

```

If we know the server is streaming a fixed length file to the client,
the application can choose to download the entire file on disk. The
buffer element will provide a push or pull based srcpad to the demuxer
to navigate in the downloaded file.

This mode is only suitable when the client can determine the length of
the file on the server.

--

## Timeshift buffering

```
      +---------+     +---------+     +-------+
      | httpsrc |     | buffer  |     | demux |
      |        src - sink      src - sink     ....
      +---------+     +----|----+     +-------+
                           V
                       file-ringbuffer

```

In this mode, a fixed size ringbuffer is kept to download the server
content. This allows for seeking in the buffered data. Depending on the
size of the ringbuffer one can seek further back in time.

This mode is suitable for all live streams. As with the incremental
download mode, buffering messages are emitted along with an indication
that timeshifting download is in progress.

   * The code was complicated and interwoven in ways that were hard to follow
     and reason about.

5. Use of GStreamer pipeline sources for downloading.

   * An internal download pipeline that contained a `httpsrc -> queue2 -> src`
     chain made download management, bandwidth estimation and stream parsing
     more difficult, and used a new thread for each download.

# New design

The rest of this document describes the new adaptive streaming client
implementation that landed in gst-plugins-good in GStreamer 1.22.

The new elements only work in combination with the "streams-aware"
`playbin3` and `uridecodebin3` elements that support advanced stream
selection functionality, they won't work with the legacy `playbin`
element.

## High-level overview of the new internal AdaptiveDemux2 base class:


---

