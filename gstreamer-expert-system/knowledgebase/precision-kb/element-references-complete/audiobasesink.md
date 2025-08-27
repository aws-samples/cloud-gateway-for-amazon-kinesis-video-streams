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

```
      play position
        v
--
to start from the sink to when it is played can be kept low but at least
one context switch has to be made between read and write.

#### getrange based mode

In getrange based mode, the audiobasesink will use the callback
function of the ringbuffer to get a segsize samples from the peer
element. These samples will then be placed in the ringbuffer at the
next play position. It is assumed that the getrange function returns
fast enough to fill the ringbuffer before the play pointer reaches
the write pointer.

In this mode, the ringbuffer is usually kept as empty as possible.
There is no context switch needed between the elements that create
the samples and the actual writing of the samples to the device.

#### DMA mode

Elements that can do DMA based access to the audio device have to
subclass from the `GstAudioBaseSink` class and wrap the DMA ringbuffer
in a subclass of `GstRingBuffer`.
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

```
      play position
        v
--
to start from the sink to when it is played can be kept low but at least
one context switch has to be made between read and write.

#### getrange based mode

In getrange based mode, the audiobasesink will use the callback
function of the ringbuffer to get a segsize samples from the peer
element. These samples will then be placed in the ringbuffer at the
next play position. It is assumed that the getrange function returns
fast enough to fill the ringbuffer before the play pointer reaches
the write pointer.

In this mode, the ringbuffer is usually kept as empty as possible.
There is no context switch needed between the elements that create
the samples and the actual writing of the samples to the device.

#### DMA mode

Elements that can do DMA based access to the audio device have to
subclass from the `GstAudioBaseSink` class and wrap the DMA ringbuffer
in a subclass of `GstRingBuffer`.
pipeline against the clock of the audio device and calculate and
compensate for drift and jitter.

There are two audio base classes that you can choose to derive from,
depending on your needs: `GstAudioBasesink` and `GstAudioSink`. The
audiobasesink provides full control over how synchronization and
scheduling is handled, by using a ringbuffer that the derived class
controls and provides. The audiosink base-class is a derived class of
the audiobasesink, implementing a standard ringbuffer implementing
default synchronization and providing a standard audio-sample clock.
Derived classes of this base class merely need to provide a `_open
()`, `_close ()` and a `_write
()` function implementation, and some optional functions. This should
suffice for many sound-server output elements and even most interfaces.
More demanding audio systems, such as Jack, would want to implement the
`GstAudioBaseSink` base-class.

The `GstAudioBaseSink` has little to no limitations and should fit
virtually every implementation, but is hard to implement. The
`GstAudioSink`, on the other hand, only fits those systems with a simple
`open
()` / `close ()` / `write
()` API (which practically means pretty much all of them), but has the
advantage that it is a lot easier to implement. The benefits of this

---

