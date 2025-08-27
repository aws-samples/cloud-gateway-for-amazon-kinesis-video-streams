```bash
# Analyze HLS stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"

# Test HLS playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink
```

### DASH Streams
```bash
# Analyze DASH stream
gst-discoverer-1.0 "https://example.com/stream.mpd"

# Test DASH playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.mpd" ! dashdemux ! fakesink
```

## Debugging Commands

### General Pipeline Debugging
```bash
```

#### Method 2: Direct pipeline analysis
```bash
# HLS stream analysis
gst-launch-1.0 -v souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink

# HTTP stream analysis
gst-launch-1.0 -v souphttpsrc location="http://example.com/stream" ! decodebin ! fakesink
```

## Introspection Workflow Examples

### Complete RTSP Analysis Workflow

```bash
#!/bin/bash
RTSP_URL="rtsp://camera-ip:554/stream"

echo "=== RTSP Stream Analysis ==="
echo "URL: $RTSP_URL"
# Adaptive Demuxers for DASH, HLS and Smooth Streaming

There are two sets of elements implementing client-side adaptive streaming
(HLS, DASH, Microsoft Smooth Streaming) in GStreamer:

 - The old legacy elements `dashdemux`, `hlsdemux`, `mssdemux` in the
   gst-plugins-bad module.

 - New `dashdemux2`, `hlsdemux2`, `mssdemux2` elements in gst-plugins-good
   (added in GStreamer 1.22).

The legacy adaptive streaming support in `gst-plugins-bad` had several pitfalls
that prevented improving it easily. The legacy design used a model where an
adaptive streaming element (`dashdemux`, `hlsdemux`) downloaded multiplexed
fragments of media, but then relied on other components in the pipeline to
provide download buffering, demuxing, elementary stream handling and decoding.

The problems with the old design included:

1. An assumption that fragment streams (to download) are equal to output
   (elementary) streams.

   * This made it hard to expose `GstStream` and `GstStreamCollection`
     describing the available media streams, and by extension made it
     difficult to provide efficient stream selection support

2. By performing download buffering outside the adaptive streaming elements,
   the download scheduling had no visibility into the presentation timeline.

# Adaptive Demuxers for DASH, HLS and Smooth Streaming

There are two sets of elements implementing client-side adaptive streaming
(HLS, DASH, Microsoft Smooth Streaming) in GStreamer:

 - The old legacy elements `dashdemux`, `hlsdemux`, `mssdemux` in the
   gst-plugins-bad module.

 - New `dashdemux2`, `hlsdemux2`, `mssdemux2` elements in gst-plugins-good
   (added in GStreamer 1.22).

The legacy adaptive streaming support in `gst-plugins-bad` had several pitfalls
that prevented improving it easily. The legacy design used a model where an
adaptive streaming element (`dashdemux`, `hlsdemux`) downloaded multiplexed
fragments of media, but then relied on other components in the pipeline to
provide download buffering, demuxing, elementary stream handling and decoding.

The problems with the old design included:

1. An assumption that fragment streams (to download) are equal to output
   (elementary) streams.

   * This made it hard to expose `GstStream` and `GstStreamCollection`
     describing the available media streams, and by extension made it
     difficult to provide efficient stream selection support

2. By performing download buffering outside the adaptive streaming elements,
   the download scheduling had no visibility into the presentation timeline.


---

