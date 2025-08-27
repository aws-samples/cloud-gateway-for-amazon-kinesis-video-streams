
* when shutting down, videotestsrc will set the pool to the inactive state,
this will cause further allocations to fail and currently allocated buffers to
be freed. videotestsrc will then free the pool and stop streaming.

### `videotestsrc ! queue ! myvideosink`

* In this second use case we have a videosink that can at most allocate 3 video
buffers.

* Again videotestsrc will have to negotiate a bufferpool with the peer element.
For this it will perform the `ALLOCATION` query which queue will proxy to its
downstream peer element.

* The bufferpool returned from myvideosink will have a `max_buffers` set to 3.
queue and videotestsrc can operate with this upper limit because none of those
elements require more than that amount of buffers for temporary storage.

* Myvideosink's bufferpool will then be configured with the size of the buffers
for the negotiated format and according to the padding and alignment rules.
When videotestsrc sets the pool to active, the 3 video buffers will be
preallocated in the pool.

* videotestsrc acquires a buffer from the configured pool on its srcpad and
pushes this into the queue. When videotestsrc has acquired and pushed 3 frames,
the next call to `gst_buffer_pool_acquire_buffer()` will block (assuming the
`GST_BUFFER_POOL_ACQUIRE_FLAG_DONTWAIT` is not specified).

* When the queue has pushed out a buffer and the sink has rendered it, the
refcount of the buffer reaches 0 and the buffer is recycled in the pool. This
--
the old bufferpool.

* The new bufferpool is set as the new bufferpool for the srcpad and sinkpad of
the queue and set to the active state.

### `.. ! myvideodecoder ! queue ! myvideosink`

* myvideodecoder has negotiated a bufferpool with the downstream myvideosink to
handle buffers of size 320x240. It has now detected a change in the video
format and needs to renegotiate to a resolution of 640x480. This requires it to
negotiate a new bufferpool with a larger buffer size.

* When myvideodecoder needs to get the bigger buffer, it starts the negotiation
of a new bufferpool. It queries a bufferpool from downstream, reconfigures it
with the new configuration (which includes the bigger buffer size) and sets the
bufferpool to active. The old pool is inactivated and unreffed, which causes
the old format to drain.

* It then uses the new bufferpool for allocating new buffers of the new
dimension.

* If at some point, the decoder wants to switch to a lower resolution again, it
can choose to use the current pool (which has buffers that are larger than the
required size) or it can choose to renegotiate a new bufferpool.

### `.. ! myvideodecoder ! videoscale ! myvideosink`

* myvideosink is providing a bufferpool for upstream elements and wants to
change the resolution.

* myvideosink sends a `RECONFIGURE` event upstream to notify upstream that a new
format is desirable. Upstream elements try to negotiate a new format and
bufferpool before pushing out a new buffer. The old bufferpools are drained in
the regular way.

* when shutting down, videotestsrc will set the pool to the inactive state,
this will cause further allocations to fail and currently allocated buffers to
be freed. videotestsrc will then free the pool and stop streaming.

### `videotestsrc ! queue ! myvideosink`

* In this second use case we have a videosink that can at most allocate 3 video
buffers.

* Again videotestsrc will have to negotiate a bufferpool with the peer element.
For this it will perform the `ALLOCATION` query which queue will proxy to its
downstream peer element.

* The bufferpool returned from myvideosink will have a `max_buffers` set to 3.
queue and videotestsrc can operate with this upper limit because none of those
elements require more than that amount of buffers for temporary storage.

* Myvideosink's bufferpool will then be configured with the size of the buffers
for the negotiated format and according to the padding and alignment rules.
When videotestsrc sets the pool to active, the 3 video buffers will be
preallocated in the pool.

* videotestsrc acquires a buffer from the configured pool on its srcpad and
pushes this into the queue. When videotestsrc has acquired and pushed 3 frames,
the next call to `gst_buffer_pool_acquire_buffer()` will block (assuming the
`GST_BUFFER_POOL_ACQUIRE_FLAG_DONTWAIT` is not specified).

* When the queue has pushed out a buffer and the sink has rendered it, the
refcount of the buffer reaches 0 and the buffer is recycled in the pool. This
--
the old bufferpool.

* The new bufferpool is set as the new bufferpool for the srcpad and sinkpad of
the queue and set to the active state.

### `.. ! myvideodecoder ! queue ! myvideosink`

* myvideodecoder has negotiated a bufferpool with the downstream myvideosink to
handle buffers of size 320x240. It has now detected a change in the video
format and needs to renegotiate to a resolution of 640x480. This requires it to
negotiate a new bufferpool with a larger buffer size.

* When myvideodecoder needs to get the bigger buffer, it starts the negotiation
of a new bufferpool. It queries a bufferpool from downstream, reconfigures it
with the new configuration (which includes the bigger buffer size) and sets the
bufferpool to active. The old pool is inactivated and unreffed, which causes
the old format to drain.

* It then uses the new bufferpool for allocating new buffers of the new
dimension.

* If at some point, the decoder wants to switch to a lower resolution again, it
can choose to use the current pool (which has buffers that are larger than the
required size) or it can choose to renegotiate a new bufferpool.

### `.. ! myvideodecoder ! videoscale ! myvideosink`

* myvideosink is providing a bufferpool for upstream elements and wants to
change the resolution.

* myvideosink sends a `RECONFIGURE` event upstream to notify upstream that a new
format is desirable. Upstream elements try to negotiate a new format and
bufferpool before pushing out a new buffer. The old bufferpools are drained in
the regular way.

---

