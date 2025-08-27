```

Rip all tracks from CD and convert them into a single mp3 file:

```
gst-launch-1.0 cdparanoiasrc mode=continuous ! audioconvert ! lamemp3enc ! mpegaudioparse ! xingmux ! id3v2mux ! filesink location=cd.mp3
```

Rip track 5 from the CD and converts it into a single mp3 file:

```
gst-launch-1.0 cdparanoiasrc track=5 ! audioconvert ! lamemp3enc ! mpegaudioparse ! xingmux ! id3v2mux ! filesink location=track5.mp3
```

Using `gst-inspect-1.0`, it is possible to discover settings like
the above for "cdparanoiasrc" that will tell it to rip the entire CD or
only tracks of it. Alternatively, you can use an URI and `gst-launch-1.0`
will find an element (such as cdparanoia) that supports that protocol
for you, e.g.:

```
gst-launch-1.0 cdda://5 ! lamemp3enc vbr=new vbr-quality=6 ! xingmux ! id3v2mux ! filesink location=track5.mp3
```

Record sound from your audio input and encode it into an ogg file:

```
gst-launch-1.0 pulsesrc ! audioconvert ! vorbisenc ! oggmux ! filesink location=input.ogg
```

### Video
```

Rip all tracks from CD and convert them into a single mp3 file:

```
gst-launch-1.0 cdparanoiasrc mode=continuous ! audioconvert ! lamemp3enc ! mpegaudioparse ! xingmux ! id3v2mux ! filesink location=cd.mp3
```

Rip track 5 from the CD and converts it into a single mp3 file:

```
gst-launch-1.0 cdparanoiasrc track=5 ! audioconvert ! lamemp3enc ! mpegaudioparse ! xingmux ! id3v2mux ! filesink location=track5.mp3
```

Using `gst-inspect-1.0`, it is possible to discover settings like
the above for "cdparanoiasrc" that will tell it to rip the entire CD or
only tracks of it. Alternatively, you can use an URI and `gst-launch-1.0`
will find an element (such as cdparanoia) that supports that protocol
for you, e.g.:

```
gst-launch-1.0 cdda://5 ! lamemp3enc vbr=new vbr-quality=6 ! xingmux ! id3v2mux ! filesink location=track5.mp3
```

Record sound from your audio input and encode it into an ogg file:

```
gst-launch-1.0 pulsesrc ! audioconvert ! vorbisenc ! oggmux ! filesink location=input.ogg
```

### Video

---

