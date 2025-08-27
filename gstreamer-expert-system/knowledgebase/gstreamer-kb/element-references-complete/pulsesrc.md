nvh264enc       # NVIDIA hardware encoding

# Audio
alsasrc         # ALSA audio input
alsasink        # ALSA audio output
pulsesrc        # PulseAudio input
pulsesink       # PulseAudio output
```

#### Cross-Platform Elements (Safe for all platforms)
```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
autovideosink   # Automatically selects appropriate video sink
autoaudiosrc    # Automatically selects appropriate audio source
autoaudiosink   # Automatically selects appropriate audio sink

# Software codecs (available everywhere)
x264enc         # Software H.264 encoding
avdec_h264      # Software H.264 decoding
```

# 2. Test audio capture (ALSA)
gst-launch-1.0 alsasrc device=hw:0,0 ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10

# 3. Test audio capture (PulseAudio)
gst-launch-1.0 pulsesrc ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10
```

## Hardware Acceleration Discovery

### Check Available Hardware Encoders/Decoders
```bash
# Check for NVIDIA acceleration
gst-inspect-1.0 | grep -i nv

# Check for Intel VAAPI
gst-inspect-1.0 | grep -i vaapi

# Check for Intel QuickSync
gst-inspect-1.0 | grep -i qsv

integrating with Linux or a UNIX-like operating system.

  - For audio input and output, GStreamer provides input and output
    elements for several audio subsystems. Amongst others, GStreamer
    includes elements for ALSA (alsasrc, alsasink), OSS (osssrc,
    osssink) Pulesaudio (pulsesrc, pulsesink) and Sun audio
    (sunaudiosrc, sunaudiomixer, sunaudiosink).

  - For video input, GStreamer contains source elements for Video4linux2
    (v4l2src, v4l2element, v4l2sink).

  - For video output, GStreamer provides elements for output to
    X-windows (ximagesink), Xv-windows (xvimagesink; for
    hardware-accelerated video), direct-framebuffer (dfbimagesink) and
    openGL image contexts (glsink).

## GNOME desktop

GStreamer has been the media backend of the
[GNOME](http://www.gnome.org/) desktop since GNOME-2.2 onwards.
Nowadays, a whole bunch of GNOME applications make use of GStreamer for
--
Juicer](https://wiki.gnome.org/Apps/SoundJuicer).

Most of these GNOME applications make use of some specific techniques to
integrate as closely as possible with the GNOME desktop:

  - GNOME uses Pulseaudio for audio, use the pulsesrc and pulsesink
    elements to have access to all the features.

  - GStreamer provides data input/output elements for use with the GIO
    VFS system. These elements are called “giosrc” and “giosink”. The
    deprecated GNOME-VFS system is supported too but shouldn't be used
    for any new applications.

## KDE desktop

GStreamer has been proposed for inclusion in KDE-4.0. Currently,
GStreamer is included as an optional component, and it's used by several
KDE applications, including [AmaroK](http://amarok.kde.org/),
[KMPlayer](http://www.xs4all.nl/~jjvrieze/kmplayer.html) and
[Kaffeine](http://kaffeine.sourceforge.net/).

```

Record sound from your audio input and encode it into an ogg file:

```
gst-launch-1.0 pulsesrc ! audioconvert ! vorbisenc ! oggmux ! filesink location=input.ogg
```

### Video

**Note:** For audio/video playback it's best to use the `playbin3` or
`uridecodebin3` elements, these are just example pipelines.

Display only the video portion of an MPEG-2 video file, outputting to an X
display window:

```
gst-launch-1.0 filesrc location=JB_FF9_TheGravityOfLove.mpg ! mpegdemux ! mpegvideoparse ! mpeg2dec ! videoconvert ! xvimagesink
```

Display the video portion of a .vob file (used on DVDs), outputting to an SDL
--

Record audio and write it to a .wav file. Force usage of signed 16 to 32 bit
samples and a sample rate between 32kHz and 64KHz:

```
gst-launch-1.0 pulsesrc !  'audio/x-raw,rate=[32000,64000],format={S16LE,S24LE,S32LE}' ! wavenc ! filesink location=recording.wav
```

## Environment Variables

`GST_DEBUG`: Comma-separated list of debug categories and levels, e.g:

```
GST_DEBUG=totem:4,typefind:5
```

`*` is allowed as a wildcard as part of debug category names (e.g.
`GST_DEBUG=*sink:6,*audio*:6`). It is also possible to specify the log level
by name (1=ERROR, 2=WARN, 3=FIXME, 4=INFO, 5=DEBUG, 6=LOG, 7=TRACE, 9=MEMDUMP),
e.g. `GST_DEBUG=*audio*:LOG`.


  - Converter elements such as videoconvert, audioconvert,
    audioresample, videoscale, ...

  - Source elements such as audiotestsrc, videotestsrc, v4l2src,
    pulsesrc, ...

Let's look at the example of an element that can convert between
samplerates, so where input and output samplerate don't have to be the
same:

``` c

static gboolean
gst_my_filter_setcaps (GstMyFilter *filter,
               GstCaps *caps)
{
  if (gst_pad_set_caps (filter->srcpad, caps)) {
    filter->passthrough = TRUE;
  } else {
    GstCaps *othercaps, *newcaps;

---

