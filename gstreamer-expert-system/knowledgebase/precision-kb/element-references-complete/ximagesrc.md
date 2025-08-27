the `foo` and` bar` plugin feature rank values are `PRIMARY`(256)
and `SECONDARY`(128) rank value will be assigned to `foobar`.

**`GST_XINITTHREADS`.**

Set this variable when using components that rely on X11, such as ximagesrc, 
from gst-launch-1.0 or other command line applications. However, applications 
should not depend on this variable and should make their own `XInitThreads()`
call as early as possible.
    
    This possibility was hinted at already in the digression in section
    1. It would satisfy the goal of keeping subtitle format knowledge in
    the subtitle plugins and video backend knowledge in the video
    backend plugin. It would also add a concept that might be generally
    useful (think ximagesrc capture with xdamage). However, it would
    require adding foorender variants of all the existing overlay
    elements, and changing playbin to that new design, which is somewhat
    intrusive. And given the general nature of such a new format/API, we
    would need to take a lot of care to be able to accommodate all
    possible use cases when designing the API, which makes it
    considerably more ambitious. Lastly, we would need to write
    videomixer variants for the various accelerated video backends as
    well.

Overall (c) appears to be the most promising solution. It is the least
intrusive and should be fairly straight-forward to implement with
reasonable effort, requiring only small changes to existing elements and
requiring no new elements.

Doing the final overlaying in the sink as opposed to a videomixer or
    
    This possibility was hinted at already in the digression in section
    1. It would satisfy the goal of keeping subtitle format knowledge in
    the subtitle plugins and video backend knowledge in the video
    backend plugin. It would also add a concept that might be generally
    useful (think ximagesrc capture with xdamage). However, it would
    require adding foorender variants of all the existing overlay
    elements, and changing playbin to that new design, which is somewhat
    intrusive. And given the general nature of such a new format/API, we
    would need to take a lot of care to be able to accommodate all
    possible use cases when designing the API, which makes it
    considerably more ambitious. Lastly, we would need to write
    videomixer variants for the various accelerated video backends as
    well.

Overall (c) appears to be the most promising solution. It is the least
intrusive and should be fairly straight-forward to implement with
reasonable effort, requiring only small changes to existing elements and
requiring no new elements.

Doing the final overlaying in the sink as opposed to a videomixer or

### Linux Elements
```bash
# Video Sources
v4l2src              # Video4Linux2 cameras
ximagesrc            # X11 screen capture

# Video Sinks
xvimagesink          # X11 video display
glimagesink          # OpenGL video display

# Hardware Encoding/Decoding
vaapih264enc         # Intel VAAPI H.264 encoder
nvh264enc            # NVIDIA H.264 encoder
nvh264dec            # NVIDIA H.264 decoder

# Audio
alsasrc              # ALSA audio input
alsasink             # ALSA audio output
pulsesrc             # PulseAudio input
pulsesink            # PulseAudio output

---

