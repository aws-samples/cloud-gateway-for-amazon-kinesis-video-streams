
```
+-------------------------------------------+
| pipeline                                  |
| +---------+   +----------+   +----------+ |
| | filesrc |   | mp3dec   |   | alsasink | |
| |        src-sink       src-sink        | |
| +---------+   +----------+   +----------+ |
+-------------------------------------------+
```

## Pipeline clock

One of the important functions of the pipeline is to select a global
clock for all the elements in the pipeline.

The purpose of the clock is to provide a stricly increasing value at the
rate of one `GST_SECOND` per second. Clock values are expressed in
nanoseconds. Elements use the clock time to synchronize the playback of
data.

--
of its children from the sink elements to the source elements, this to
make sure that no upstream element produces data to an element that is
not yet ready to accept it.

In the mp3 playback pipeline, the state of the elements is changed in
the order alsasink, mp3dec, filesrc.

All intermediate states are traversed for each element resulting in the
following chain of state changes:

* alsasink to `READY`:  the audio device is probed

* mp3dec to `READY`:    nothing happens

* filesrc to `READY`:   the file is probed

* alsasink to `PAUSED`: the audio device is opened. alsasink is a sink and returns `ASYNC` because it did not receive data yet

* mp3dec to `PAUSED`:   the decoding library is initialized

* filesrc to `PAUSED`:  the file is opened and a thread is started to push data to mp3dec

At this point data flows from filesrc to mp3dec and alsasink. Since
mp3dec is `PAUSED`, it accepts the data from filesrc on the sinkpad and
starts decoding the compressed data to raw audio samples.

The mp3 decoder figures out the samplerate, the number of channels and
other audio properties of the raw audio samples and sends out a caps
event with the media type.

Alsasink then receives the caps event, inspects the caps and
reconfigures itself to process the media type.

mp3dec then puts the decoded samples into a Buffer and pushes this
buffer to the next element.

Alsasink receives the buffer with samples. Since it received the first
buffer of samples, it completes the state change to the PAUSED state. At
this point the pipeline is prerolled and all elements have samples.
Alsasink is now also capable of providing a clock to the pipeline.

Since alsasink is now in the `PAUSED` state it blocks while receiving the
first buffer. This effectively blocks both mp3dec and filesrc in their
`gst_pad_push()`.

Since all elements now return `SUCCESS` from the
`gst_element_get_state()` function, the pipeline can be put in the
`PLAYING` state.

Before going to `PLAYING`, the pipeline select a clock and samples the
current time of the clock. This is the `base_time`. It then distributes
this time to all elements. Elements can then synchronize against the
clock using the buffer `running_time`
`base_time` (See also [synchronisation](additional/design/synchronisation.md)).

The following chain of state changes then takes place:

* alsasink to `PLAYING`:  the samples are played to the audio device

* mp3dec to `PLAYING`:    nothing happens

* filesrc to `PLAYING`:   nothing happens

## Pipeline status

The pipeline informs the application of any special events that occur in
the pipeline with the bus. The bus is an object that the pipeline
provides and that can be retrieved with `gst_pipeline_get_bus()`.

The bus can be polled or added to the glib mainloop.

The bus is distributed to all elements added to the pipeline. The
elements use the bus to post messages on. Various message types exist
such as `ERRORS`, `WARNINGS`, `EOS`, `STATE_CHANGED`, etc..

--
following actions occur in the pipeline:

* alsasink to `PAUSED`:  alsasink blocks and completes the state change on the
next sample. If the element was `EOS`, it does not wait for a sample to complete
the state change.
* mp3dec to `PAUSED`:    nothing
* filesrc to `PAUSED`:   nothing

Going to the intermediate `PAUSED` state will block all elements in the
`_push()` functions. This happens because the sink element blocks on the
first buffer it receives.

Some elements might be performing blocking operations in the `PLAYING`
state that must be unblocked when they go into the PAUSED state. This
makes sure that the state change happens very fast.

In the next `PAUSED` to `READY` state change the pipeline has to shut down
and all streaming threads must stop sending data. This happens in the
following sequence:

* alsasink to `READY`:   alsasink unblocks from the `_chain()` function and returns
a `FLUSHING` return value to the peer element. The sinkpad is deactivated and
becomes unusable for sending more data.
* mp3dec to `READY`:     the pads are deactivated and the state change completes
when mp3dec leaves its `_chain()` function.
* filesrc to `READY`:    the pads are deactivated and the thread is paused.

The upstream elements finish their `_chain()` function because the
downstream element returned an error code (`FLUSHING`) from the `_push()`
functions. These error codes are eventually returned to the element that
started the streaming thread (filesrc), which pauses the thread and
completes the state change.

This sequence of events ensure that all elements are unblocked and all
streaming threads stopped.

## Pipeline seeking

Seeking in the pipeline requires a very specific order of operations to
make sure that the elements remain synchronized and that the seek is
--
                                   | a) seek on pipeline
                                   | b) PAUSE pipeline
+----------------------------------V--------+
| pipeline                         | c) seek on sink
| +---------+   +----------+   +---V------+ |
| | filesrc |   | mp3dec   |   | alsasink | |
| |        src-sink       src-sink        | |
| +---------+   +----------+   +----|-----+ |
+-----------------------------------|-------+
           <------------------------+
                 d) seek travels upstream

    --------------------------> 1) FLUSH event
    | 2) stop streaming
    | 3) perform seek
    --------------------------> 4) FLUSH done event
    --------------------------> 5) SEGMENT event

    | e) update running_time to 0
    | f) PLAY pipeline
```

---

