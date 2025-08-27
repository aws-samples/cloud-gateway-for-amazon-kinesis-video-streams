```

Convert to the FLAC format:

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! flacenc ! filesink location=test.flac
```

### Other

Play a .WAV file that contains raw audio data (PCM):

```
gst-launch-1.0 filesrc location=music.wav ! wavparse ! audioconvert ! audioresample ! pulsesink
```

Convert a .WAV file containing raw audio data into an Ogg Vorbis or mp3 file:

```
gst-launch-1.0 filesrc location=music.wav ! wavparse ! audioconvert ! vorbisenc ! oggmux ! filesink location=music.ogg
```
### print all type of latencies for a pipeline

```
GST_DEBUG="GST_TRACER:7" \
GST_TRACERS="latency(flags=pipeline+element+reported)" gst-launch-1.0 \
alsasrc num-buffers=20 ! flacenc ! identity ! \
fakesink
```

### Raise a warning if a leak is detected

```
GST_TRACERS="leaks" gst-launch-1.0 videotestsrc num-buffers=10 ! \
fakesink
```

### check if any GstEvent or GstMessage is leaked and raise a warning

```
GST_DEBUG="GST_TRACER:7" GST_TRACERS="leaks(GstEvent,GstMessage)" \
gst-launch-1.0 videotestsrc num-buffers=10 ! fakesink
### print all type of latencies for a pipeline

```
GST_DEBUG="GST_TRACER:7" \
GST_TRACERS="latency(flags=pipeline+element+reported)" gst-launch-1.0 \
alsasrc num-buffers=20 ! flacenc ! identity ! \
fakesink
```

### Raise a warning if a leak is detected

```
GST_TRACERS="leaks" gst-launch-1.0 videotestsrc num-buffers=10 ! \
fakesink
```

### check if any GstEvent or GstMessage is leaked and raise a warning

```
GST_DEBUG="GST_TRACER:7" GST_TRACERS="leaks(GstEvent,GstMessage)" \
gst-launch-1.0 videotestsrc num-buffers=10 ! fakesink
```

Convert to the FLAC format:

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! flacenc ! filesink location=test.flac
```

### Other

Play a .WAV file that contains raw audio data (PCM):

```
gst-launch-1.0 filesrc location=music.wav ! wavparse ! audioconvert ! audioresample ! pulsesink
```

Convert a .WAV file containing raw audio data into an Ogg Vorbis or mp3 file:

```
gst-launch-1.0 filesrc location=music.wav ! wavparse ! audioconvert ! vorbisenc ! oggmux ! filesink location=music.ogg
```

---

