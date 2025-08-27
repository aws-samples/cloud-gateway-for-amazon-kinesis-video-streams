```

**Note:** If you are using **Raspberry PI with Bullseye** you have to use another encoder as well as `libcamerasrc` instead of `v4l2src device=/dev/video0`

```
$ gst-launch-1.0 libcamerasrc ! video/x-raw,width=640,height=480,framerate=30/1,format=I420 ! videoconvert ! v4l2h264enc extra-controls="controls,repeat_sequence_header=1" ! video/x-h264,level='(string)4' ! h264parse ! video/x-h264,stream-format=avc, alignment=au,width=640,height=480,framerate=30/1 ! kvssink stream-name="test-stream" access-key="YourAccessKey" secret-key="YourSecretKey" aws-region="YourRegion"
```


###### Running the `gst-launch-1.0` command to start streaming both audio and video:

Please ensure that audio drivers are installed first by running

`apt-get install libasound2-dev`

then you can use the following following command to find the capture card and device number.

`arecord -l (or arecord --list-devices)`

the output should look like the following:

```

**Note:** If you are using **Raspberry PI with Bullseye** you have to use another encoder as well as `libcamerasrc` instead of `v4l2src device=/dev/video0`

```
$ gst-launch-1.0 libcamerasrc ! video/x-raw,width=640,height=480,framerate=30/1,format=I420 ! videoconvert ! v4l2h264enc extra-controls="controls,repeat_sequence_header=1" ! video/x-h264,level='(string)4' ! h264parse ! video/x-h264,stream-format=avc, alignment=au,width=640,height=480,framerate=30/1 ! kvssink stream-name="test-stream" access-key="YourAccessKey" secret-key="YourSecretKey" aws-region="YourRegion"
```


###### Running the `gst-launch-1.0` command to start streaming both audio and video:

Please ensure that audio drivers are installed first by running

`apt-get install libasound2-dev`

then you can use the following following command to find the capture card and device number.

`arecord -l (or arecord --list-devices)`

the output should look like the following:

to the consumer (dmabuf export) or import them from it (dmabuf import).

In this section we'll outline the steps for how the consumer can inform the
producer of its expected buffer layout for import and export use cases.
Let's consider `v4l2src` (the producer) feeding buffers to
`v4l2h264enc` (the consumer) for encoding.

#### v4l2src importing buffers from v4l2h264enc

  1. *v4l2h264enc*: query the hardware for its requirements and create a
    `GstVideoAlignment` accordingly.
  2. *v4l2h264enc*: in its buffer pool `alloc_buffer` implementation, call
    `gst_buffer_add_video_meta_full()` and then
    `gst_video_meta_set_alignment()` on the returned meta with the
    requested alignment. The alignment will be added to the meta, allowing
    `v4l2src` to configure its driver before trying to import buffers.
``` c
      meta = gst_buffer_add_video_meta_full (buf, GST_VIDEO_FRAME_FLAG_NONE,
          GST_VIDEO_INFO_FORMAT (&pool->video_info),
          GST_VIDEO_INFO_WIDTH (&pool->video_info),
          GST_VIDEO_INFO_HEIGHT (&pool->video_info),
          GST_VIDEO_INFO_N_PLANES (&pool->video_info), offset, stride);

      gst_video_meta_set_alignment (meta, align);
```
  3. *v4l2h264enc*: propose its pool to the producer when replying to the
    `ALLOCATION` query (`propose_allocation()`).
  4. *v4l2src*: when receiving the reply from the `ALLOCATION` query
    (`decide_allocation()`) acquire
    a single buffer from the suggested pool and retrieve its layout
    using `GstVideoMeta.stride` and `gst_video_meta_get_plane_height()`.
  5. *v4l2src*: configure its driver to produce data matching those requirements,
    if possible, then try to import the buffer.
    If not, `v4l2src` won't be able to import from `v4l2h264enc` and so will
    fallback to sending its own buffers to `v4l2h264enc` which will
    have to copy each input buffer to fit its requirements.

#### v4l2src exporting buffers to v4l2h264enc

  1. *v4l2h264enc*: query the hardware for its requirements and create a
    `GstVideoAlignment` accordingly.
  2. *v4l2h264enc*: create a `GstStructure` named `video-meta` serializing the alignment:
``` c
params = gst_structure_new ("video-meta",
    "padding-top", G_TYPE_UINT, align.padding_top,
    "padding-bottom", G_TYPE_UINT, align.padding_bottom,
    "padding-left", G_TYPE_UINT, align.padding_left,
    "padding-right", G_TYPE_UINT, align.padding_right,
    "stride-align0", G_TYPE_UINT, align->stride_align[0],
    "stride-align1", G_TYPE_UINT, align->stride_align[1],
    "stride-align2", G_TYPE_UINT, align->stride_align[2],
    "stride-align3", G_TYPE_UINT, align->stride_align[3],
    NULL);
```
  3. *v4l2h264enc*: when handling the `ALLOCATION` query (`propose_allocation()`),
    pass this structure as parameter when adding the `GST_VIDEO_META_API_TYPE`
    meta:
``` c
gst_query_add_allocation_meta (query, GST_VIDEO_META_API_TYPE, params);
```
  4. *v4l2src*: when receiving the reply from the `ALLOCATION` query
    (`decide_allocation()`) retrieve the `GST_VIDEO_META_API_TYPE` parameters
    to compute the expected buffers layout:
``` c
guint video_idx;
GstStructure *params;

if (gst_query_find_allocation_meta (query, GST_VIDEO_META_API_TYPE, &video_idx)) {
  gst_query_parse_nth_allocation_meta (query, video_idx, &params);

--
```
  5. *v4l2src*: retrieve the requested buffers layout using
    `GstVideoInfo.stride` and `GST_VIDEO_INFO_PLANE_HEIGHT()`.
  6. *v4l2src*: configure its driver to produce data matching those requirements,
    if possible.
    If not, driver will produce buffers using its own layout but `v4l2h264enc` will
    have to copy each input buffer to fit its requirements.
to the consumer (dmabuf export) or import them from it (dmabuf import).

In this section we'll outline the steps for how the consumer can inform the
producer of its expected buffer layout for import and export use cases.
Let's consider `v4l2src` (the producer) feeding buffers to
`v4l2h264enc` (the consumer) for encoding.

#### v4l2src importing buffers from v4l2h264enc

  1. *v4l2h264enc*: query the hardware for its requirements and create a
    `GstVideoAlignment` accordingly.
  2. *v4l2h264enc*: in its buffer pool `alloc_buffer` implementation, call
    `gst_buffer_add_video_meta_full()` and then
    `gst_video_meta_set_alignment()` on the returned meta with the
    requested alignment. The alignment will be added to the meta, allowing
    `v4l2src` to configure its driver before trying to import buffers.
``` c
      meta = gst_buffer_add_video_meta_full (buf, GST_VIDEO_FRAME_FLAG_NONE,
          GST_VIDEO_INFO_FORMAT (&pool->video_info),
          GST_VIDEO_INFO_WIDTH (&pool->video_info),
          GST_VIDEO_INFO_HEIGHT (&pool->video_info),
          GST_VIDEO_INFO_N_PLANES (&pool->video_info), offset, stride);

      gst_video_meta_set_alignment (meta, align);
```
  3. *v4l2h264enc*: propose its pool to the producer when replying to the
    `ALLOCATION` query (`propose_allocation()`).
  4. *v4l2src*: when receiving the reply from the `ALLOCATION` query
    (`decide_allocation()`) acquire
    a single buffer from the suggested pool and retrieve its layout
    using `GstVideoMeta.stride` and `gst_video_meta_get_plane_height()`.
  5. *v4l2src*: configure its driver to produce data matching those requirements,
    if possible, then try to import the buffer.
    If not, `v4l2src` won't be able to import from `v4l2h264enc` and so will
    fallback to sending its own buffers to `v4l2h264enc` which will
    have to copy each input buffer to fit its requirements.

#### v4l2src exporting buffers to v4l2h264enc

  1. *v4l2h264enc*: query the hardware for its requirements and create a
    `GstVideoAlignment` accordingly.
  2. *v4l2h264enc*: create a `GstStructure` named `video-meta` serializing the alignment:
``` c
params = gst_structure_new ("video-meta",
    "padding-top", G_TYPE_UINT, align.padding_top,
    "padding-bottom", G_TYPE_UINT, align.padding_bottom,
    "padding-left", G_TYPE_UINT, align.padding_left,
    "padding-right", G_TYPE_UINT, align.padding_right,
    "stride-align0", G_TYPE_UINT, align->stride_align[0],
    "stride-align1", G_TYPE_UINT, align->stride_align[1],
    "stride-align2", G_TYPE_UINT, align->stride_align[2],
    "stride-align3", G_TYPE_UINT, align->stride_align[3],
    NULL);
```
  3. *v4l2h264enc*: when handling the `ALLOCATION` query (`propose_allocation()`),
    pass this structure as parameter when adding the `GST_VIDEO_META_API_TYPE`
    meta:
``` c
gst_query_add_allocation_meta (query, GST_VIDEO_META_API_TYPE, params);
```
  4. *v4l2src*: when receiving the reply from the `ALLOCATION` query
    (`decide_allocation()`) retrieve the `GST_VIDEO_META_API_TYPE` parameters
    to compute the expected buffers layout:
``` c
guint video_idx;
GstStructure *params;

if (gst_query_find_allocation_meta (query, GST_VIDEO_META_API_TYPE, &video_idx)) {
  gst_query_parse_nth_allocation_meta (query, video_idx, &params);

--
```
  5. *v4l2src*: retrieve the requested buffers layout using
    `GstVideoInfo.stride` and `GST_VIDEO_INFO_PLANE_HEIGHT()`.
  6. *v4l2src*: configure its driver to produce data matching those requirements,
    if possible.
    If not, driver will produce buffers using its own layout but `v4l2h264enc` will
    have to copy each input buffer to fit its requirements.

---

