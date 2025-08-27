
Play the mp3 music file "music.mp3" using a libmpg123-based plug-in and
output it to an audio device via PulseAudio (or PipeWire).

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an Ogg Vorbis format file:

```
gst-launch-1.0 filesrc location=music.ogg ! oggdemux ! vorbisdec ! audioconvert ! audioresample ! pulsesink
```

Play an mp3 file or an http stream using GIO:

```
gst-launch-1.0 giosrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! pulsesink
```

```
gst-launch-1.0 giosrc location=http://domain.com/music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Use GIO to play an mp3 file located on an SMB server:

```
gst-launch-1.0 giosrc location=smb://computer/music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

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
--

```
gst-launch-1.0 filesrc location=movie.mpg ! dvddemux name=demuxer  \
\
demuxer. ! queue ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink \
demuxer. ! queue ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an AVI movie with an external text subtitle stream:

This example shows how to refer to specific pads by name if an
element (here: textoverlay) has multiple sink or source pads:

```
gst-launch-1.0 textoverlay name=overlay ! videoconvert ! videoscale ! autovideosink \
filesrc location=movie.avi ! decodebin3 !  videoconvert ! overlay.video_sink \
filesrc location=movie.srt ! subparse ! overlay.text_sink
```

Play an AVI movie with an external text subtitle stream using playbin:

```

To decode an mp3 audio file and play it through Pulseaudio, you could use:

```
gst-launch-1.0 filesrc location=thesong.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! pulsesink
```

To automatically detect and select the right decoder for a given encoded stream
in a pipeline, try any of the following:

```
gst-launch-1.0 filesrc location=thesong.mp3 ! decodebin ! audioconvert ! pulsesink
```
```
gst-launch-1.0 filesrc location=my-random-media-file.mpeg ! decodebin ! pulsesink
```
```
gst-launch-1.0 filesrc location=my-random-media-file.mpeg ! decodebin ! videoconvert ! xvimagesink
```


Play the mp3 music file "music.mp3" using a libmpg123-based plug-in and
output it to an audio device via PulseAudio (or PipeWire).

```
gst-launch-1.0 filesrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an Ogg Vorbis format file:

```
gst-launch-1.0 filesrc location=music.ogg ! oggdemux ! vorbisdec ! audioconvert ! audioresample ! pulsesink
```

Play an mp3 file or an http stream using GIO:

```
gst-launch-1.0 giosrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! pulsesink
```

```
gst-launch-1.0 giosrc location=http://domain.com/music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Use GIO to play an mp3 file located on an SMB server:

```
gst-launch-1.0 giosrc location=smb://computer/music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

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
--

```
gst-launch-1.0 filesrc location=movie.mpg ! dvddemux name=demuxer  \
\
demuxer. ! queue ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink \
demuxer. ! queue ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an AVI movie with an external text subtitle stream:

This example shows how to refer to specific pads by name if an
element (here: textoverlay) has multiple sink or source pads:

```
gst-launch-1.0 textoverlay name=overlay ! videoconvert ! videoscale ! autovideosink \
filesrc location=movie.avi ! decodebin3 !  videoconvert ! overlay.video_sink \
filesrc location=movie.srt ! subparse ! overlay.text_sink
```

Play an AVI movie with an external text subtitle stream using playbin:

```

To decode an mp3 audio file and play it through Pulseaudio, you could use:

```
gst-launch-1.0 filesrc location=thesong.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! pulsesink
```

To automatically detect and select the right decoder for a given encoded stream
in a pipeline, try any of the following:

```
gst-launch-1.0 filesrc location=thesong.mp3 ! decodebin ! audioconvert ! pulsesink
```
```
gst-launch-1.0 filesrc location=my-random-media-file.mpeg ! decodebin ! pulsesink
```
```
gst-launch-1.0 filesrc location=my-random-media-file.mpeg ! decodebin ! videoconvert ! xvimagesink
```


---

