The design is based on a set of base classes and the concept of a
ringbuffer of samples.

```
+-----------+   - provide preroll, rendering, timing
+ basesink  +   - caps nego
+-----+-----+
      |
+-----V----------+   - manages ringbuffer
+ audiobasesink  +   - manages scheduling (push/pull)
+-----+----------+   - manages clock/query/seek
      |              - manages scheduling of samples in the ringbuffer
      |              - manages caps parsing
      |
+-----V------+   - default ringbuffer implementation with a GThread
+ audiosink  +   - subclasses provide open/read/close methods
+------------+
```

The ringbuffer is a contiguous piece of memory divided into segtotal
pieces of segments. Each segment has segsize bytes.
The design is based on a set of base classes and the concept of a
ringbuffer of samples.

```
+-----------+   - provide preroll, rendering, timing
+ basesink  +   - caps nego
+-----+-----+
      |
+-----V----------+   - manages ringbuffer
+ audiobasesink  +   - manages scheduling (push/pull)
+-----+----------+   - manages clock/query/seek
      |              - manages scheduling of samples in the ringbuffer
      |              - manages caps parsing
      |
+-----V------+   - default ringbuffer implementation with a GThread
+ audiosink  +   - subclasses provide open/read/close methods
+------------+
```

The ringbuffer is a contiguous piece of memory divided into segtotal
pieces of segments. Each segment has segsize bytes.
    video formats out of the box, add SIMD-optimised rendering using
    ORC, or handle corner cases correctly.
    
    (Note: side-effect of overlaying raw video at the video sink is that
    if e.g. a screnshotter gets the last buffer via the last-buffer
    property of basesink, it would get an image without the subtitles on
    top. This could probably be fixed by re-implementing the property in
    `GstVideoSink` though. Playbin2 could handle this internally as well).

```
        void
        gst_video_overlay_composition_blend (GstVideoOverlayComposition * comp
                                             GstBuffer                  * video_buf)
        {
          guint n;
        
          g_return_if_fail (gst_buffer_is_writable (video_buf));
          g_return_if_fail (GST_BUFFER_CAPS (video_buf) != NULL);
        
          ... parse video_buffer caps into BlendVideoFormatInfo ...
        
    video formats out of the box, add SIMD-optimised rendering using
    ORC, or handle corner cases correctly.
    
    (Note: side-effect of overlaying raw video at the video sink is that
    if e.g. a screnshotter gets the last buffer via the last-buffer
    property of basesink, it would get an image without the subtitles on
    top. This could probably be fixed by re-implementing the property in
    `GstVideoSink` though. Playbin2 could handle this internally as well).

```
        void
        gst_video_overlay_composition_blend (GstVideoOverlayComposition * comp
                                             GstBuffer                  * video_buf)
        {
          guint n;
        
          g_return_if_fail (gst_buffer_is_writable (video_buf));
          g_return_if_fail (GST_BUFFER_CAPS (video_buf) != NULL);
        
          ... parse video_buffer caps into BlendVideoFormatInfo ...
        

---

