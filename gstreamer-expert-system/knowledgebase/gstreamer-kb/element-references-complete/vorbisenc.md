### Format conversion

Convert an mp3 music file to an Ogg Vorbis file:

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! vorbisenc ! oggmux ! filesink location=music.ogg
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

```
gst-launch-1.0 filesrc location=music.wav ! wavparse ! audioconvert ! lamemp3enc ! xingmux ! id3v2mux ! filesink location=music.mp3
```

Rip all tracks from CD and convert them into a single mp3 file:

```
gst-launch-1.0 cdparanoiasrc mode=continuous ! audioconvert ! lamemp3enc ! mpegaudioparse ! xingmux ! id3v2mux ! filesink location=cd.mp3
```

Rip track 5 from the CD and converts it into a single mp3 file:

```
--
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
This element writes to a file all the media it receives. Use the
`location` property to specify the file
name.

```
gst-launch-1.0 audiotestsrc ! vorbisenc ! oggmux ! filesink location=test.ogg
```

## Network

### `souphttpsrc`

This element receives data as a client over the network via HTTP using
the [libsoup](https://wiki.gnome.org/Projects/libsoup) library. Set the URL to retrieve through the `location`
property.

``` bash
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! decodebin ! autovideosink
```

## Test media generation
    videoconvert     : Filter/Video             (intended use to convert video with as little
                                                 visible change as possible)
    vertigotv        : Effect/Video             (intended use is to change the video)
    volume           : Effect/Audio             (intended use is to change the audio data)
    vorbisdec        : Decoder/Audio
    vorbisenc        : Encoder/Audio
    oggmux           : Muxer
    adder            : Mixer/Audio
    videobox         : Effect/Video
    alsamixer        : Control/Audio/Device
    audioconvert     : Filter/Audio
    audioresample    : Filter/Audio
    xvimagesink      : Sink/Video/Device
    navseek          : Filter/Debug
    decodebin        : Decoder/Demuxer
    level            : Filter/Analyzer/Audio
    tee              : Connector/Debug

### open issues:

  - how to differentiate physical devices from logical ones?
The output will be something like:

```
decoder-audio/x-vorbis
element-vorbisdec
element-vorbisenc
element-vorbisparse
element-vorbistag
encoder-audio/x-vorbis
```

BUT could also be like this (from the faad element in this case):

```
decoder-audio/mpeg, mpegversion=(int){ 2, 4 }
```

NOTE that this does not exactly match the caps string that the installer
will get from the application. The application will always ever ask for
one of

This element writes to a file all the media it receives. Use the
`location` property to specify the file
name.

```
gst-launch-1.0 audiotestsrc ! vorbisenc ! oggmux ! filesink location=test.ogg
```

## Network

### `souphttpsrc`

This element receives data as a client over the network via HTTP using
the [libsoup](https://wiki.gnome.org/Projects/libsoup) library. Set the URL to retrieve through the `location`
property.

``` bash
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! decodebin ! autovideosink
```

## Test media generation

---

