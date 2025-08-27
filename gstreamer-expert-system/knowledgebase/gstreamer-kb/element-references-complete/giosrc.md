
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

Although not yet as complete as the GNOME integration bits, there are
already some KDE integration specifics available. This list will
probably grow as GStreamer starts to be used in KDE-4.0:

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

Although not yet as complete as the GNOME integration bits, there are
already some KDE integration specifics available. This list will
probably grow as GStreamer starts to be used in KDE-4.0:

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

---

