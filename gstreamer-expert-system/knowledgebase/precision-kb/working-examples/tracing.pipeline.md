GST_TRACERS=log gst-launch-1.0 fakesrc num-buffers=10 ! fakesink
```

### Print some pipeline stats on exit:
GST_DEBUG_FILE=trace.log gst-launch-1.0 fakesrc num-buffers=10 \
sizetype=fixed ! queue ! fakesink && gst-stats-1.0 trace.log
```

### get ts, average-cpuload, current-cpuload, time and plot

```
GST_DEBUG="GST_TRACER:7" GST_TRACERS="stats;rusage" \
GST_DEBUG_FILE=trace.log /usr/bin/gst-play-1.0 $HOME/Videos/movie.mp4 &&
./scripts/gst-plot-traces.sh --format=png | gnuplot eog trace.log.*.png
```

### print processing latencies

```
GST_DEBUG="GST_TRACER:7" GST_TRACERS=latency gst-launch-1.0 \
audiotestsrc num-buffers=10 ! audioconvert ! volume volume=0.7 ! \
autoaudiosink
```

### print processing latencies for each element

```
GST_DEBUG="GST_TRACER:7" GST_TRACERS="latency(flags=element)" gst-launch-1.0 \
audiotestsrc num-buffers=10 ! audioconvert ! volume volume=0.7 ! \
autoaudiosink
```

### print reported latencies for each element

```
GST_DEBUG="GST_TRACER:7" GST_TRACERS="latency(flags=reported)" gst-launch-1.0 \
audiotestsrc num-buffers=10 ! audioconvert ! volume volume=0.7 ! \
autoaudiosink
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
```

## Performance

```
run ./tests/benchmarks/tracing.sh <tracer(s)> <media>

egrep -c "(proc|thread)-rusage" trace.log 658618 grep -c
"gst_tracer_log_trace" trace.log 823351
```

- we can optimize most of it by using quarks in structures or
eventually avoid structures totally
