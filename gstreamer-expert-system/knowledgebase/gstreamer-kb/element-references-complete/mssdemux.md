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

---

