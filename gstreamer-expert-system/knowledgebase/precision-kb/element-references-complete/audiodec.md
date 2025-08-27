  +---------------------+
  | parsebin            |
  | ---------           | +-------------+
  | | demux |--[parser]-+-| multiqueue  |--[videodec]---[
]-+-|       |--[parser]-+-|             |
  | |       |--[parser]-+-|             |--[audiodec]---[
  | ---------           | +-------------+
  +---------------------+
```

### Generating GstStreamCollection

When parsing the initial PAT/PMT, the demuxer will:

1. create the various `GstStream` objects for each stream.

2. create the `GstStreamCollection` for that initial PMT

3. post the `GST_MESSAGE_STREAM_COLLECTION`. Decodebin will intercept that
   message and know what the demuxer will be exposing.

--
```
  +-----------+               + decodebin3 -----------------------------+
  | hlsdemux2 |               |                                         |
  |           |               |             +------------+              |
  |           +-   `video`   -+-[parsebin]--+ multiqueue +--[videodec]--[
  |           +- `audio-eng` -+-[parsebin]--+------------+--[audiodec]--[
  |           |               |                                         |
  +-----------+               +-----------------------------------------+
```

The user might want to use the korean audio track instead of the default english
one.

```
  => SELECT_STREAMS ("video", "kor")
```

0) When `decodebin3` received `GST_EVENT_STREAM_START` on the *initial* incoming
  streams, it sent a `GST_QUERY_SELECTABLE` which `hlsdemux2` answered
  succesfully. `decodebin3` therefore knows that the upstream of that stream can
  handle stream-selection itself.
--
```
  +-----------+               + decodebin3 -----------------------------+
  | hlsdemux2 |               |                                         |
  |           |               |             +------------+              |
  |           +-   `video`   -+-[parsebin]--+ multiqueue +--[videodec]--[
  |           +- `audio-kor` -+-[parsebin]--+------------+--[audiodec]--[
  |           |               |                                         |
  +-----------+               +-----------------------------------------+
```


#### Multi-program MPEG-TS

**NOTE:** Not properly handled yet.

Assuming the case of a MPEG-TS stream which contains multiple programs.

There would be three "levels" of collection:
1. The collection of programs presents in the stream
2. The collection of elementary streams presents in a stream
3. The collection of streams decodebin can expose
  +---------------------+
  | parsebin            |
  | ---------           | +-------------+
  | | demux |--[parser]-+-| multiqueue  |--[videodec]---[
]-+-|       |--[parser]-+-|             |
  | |       |--[parser]-+-|             |--[audiodec]---[
  | ---------           | +-------------+
  +---------------------+
```

### Generating GstStreamCollection

When parsing the initial PAT/PMT, the demuxer will:

1. create the various `GstStream` objects for each stream.

2. create the `GstStreamCollection` for that initial PMT

3. post the `GST_MESSAGE_STREAM_COLLECTION`. Decodebin will intercept that
   message and know what the demuxer will be exposing.

--
```
  +-----------+               + decodebin3 -----------------------------+
  | hlsdemux2 |               |                                         |
  |           |               |             +------------+              |
  |           +-   `video`   -+-[parsebin]--+ multiqueue +--[videodec]--[
  |           +- `audio-eng` -+-[parsebin]--+------------+--[audiodec]--[
  |           |               |                                         |
  +-----------+               +-----------------------------------------+
```

The user might want to use the korean audio track instead of the default english
one.

```
  => SELECT_STREAMS ("video", "kor")
```

0) When `decodebin3` received `GST_EVENT_STREAM_START` on the *initial* incoming
  streams, it sent a `GST_QUERY_SELECTABLE` which `hlsdemux2` answered
  succesfully. `decodebin3` therefore knows that the upstream of that stream can
  handle stream-selection itself.
--
```
  +-----------+               + decodebin3 -----------------------------+
  | hlsdemux2 |               |                                         |
  |           |               |             +------------+              |
  |           +-   `video`   -+-[parsebin]--+ multiqueue +--[videodec]--[
  |           +- `audio-kor` -+-[parsebin]--+------------+--[audiodec]--[
  |           |               |                                         |
  +-----------+               +-----------------------------------------+
```


#### Multi-program MPEG-TS

**NOTE:** Not properly handled yet.

Assuming the case of a MPEG-TS stream which contains multiple programs.

There would be three "levels" of collection:
1. The collection of programs presents in the stream
2. The collection of elementary streams presents in a stream
3. The collection of streams decodebin can expose

---

