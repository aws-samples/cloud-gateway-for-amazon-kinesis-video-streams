
Display only the video portion of an MPEG-2 video file, outputting to an X
display window:

```
gst-launch-1.0 filesrc location=JB_FF9_TheGravityOfLove.mpg ! mpegdemux ! mpegvideoparse ! mpeg2dec ! videoconvert ! xvimagesink
```

Display the video portion of a .vob file (used on DVDs), outputting to an SDL
window:

```
gst-launch-1.0 filesrc location=flflfj.vob ! dvddemux ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink
```

Play both video and audio portions of an MPEG movie:

```
gst-launch-1.0 filesrc location=movie.mpg ! dvddemux name=demuxer  \
\
demuxer. ! queue ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink \

Display only the video portion of an MPEG-2 video file, outputting to an X
display window:

```
gst-launch-1.0 filesrc location=JB_FF9_TheGravityOfLove.mpg ! mpegdemux ! mpegvideoparse ! mpeg2dec ! videoconvert ! xvimagesink
```

Display the video portion of a .vob file (used on DVDs), outputting to an SDL
window:

```
gst-launch-1.0 filesrc location=flflfj.vob ! dvddemux ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink
```

Play both video and audio portions of an MPEG movie:

```
gst-launch-1.0 filesrc location=movie.mpg ! dvddemux name=demuxer  \
\
demuxer. ! queue ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink \

---

