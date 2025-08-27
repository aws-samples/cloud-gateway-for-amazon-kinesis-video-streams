    (v4l2src, v4l2element, v4l2sink).

  - For video output, GStreamer provides elements for output to
    X-windows (ximagesink), Xv-windows (xvimagesink; for
    hardware-accelerated video), direct-framebuffer (dfbimagesink) and
    openGL image contexts (glsink).

## GNOME desktop

GStreamer has been the media backend of the
[GNOME](http://www.gnome.org/) desktop since GNOME-2.2 onwards.
Nowadays, a whole bunch of GNOME applications make use of GStreamer for
media-processing, including (but not limited to)
[Rhythmbox](http://www.rhythmbox.org/),
[Videos](https://wiki.gnome.org/Apps/Videos) and [Sound
Juicer](https://wiki.gnome.org/Apps/SoundJuicer).

Most of these GNOME applications make use of some specific techniques to
integrate as closely as possible with the GNOME desktop:

  - GNOME uses Pulseaudio for audio, use the pulsesrc and pulsesink
   to any output packing.

 - In implementations that support quad buffers, having separate textures
   makes it trivial to do `GL_LEFT`/`GL_RIGHT` output

For either option, we'll need new glsink output API to pass more
information to applications about multiple views for the draw signal/callback.

I don't know if it's desirable to support *both* methods of representing
views. If so, that should be signalled in the caps too. That could be a
new multiview-mode for passing views in separate `GstMemory` objects
attached to a `GstBuffer`, which would not be GL specific.

### Overriding frame packing interpretation

Most sample videos available are frame packed, with no metadata
to say so. How should we override that interpretation?

 - Simple answer: Use capssetter + new properties on playbin to
   override the multiview fields. *Basically implemented in playbin, using*
   *a pad probe. Needs more work for completeness*
    (v4l2src, v4l2element, v4l2sink).

  - For video output, GStreamer provides elements for output to
    X-windows (ximagesink), Xv-windows (xvimagesink; for
    hardware-accelerated video), direct-framebuffer (dfbimagesink) and
    openGL image contexts (glsink).

## GNOME desktop

GStreamer has been the media backend of the
[GNOME](http://www.gnome.org/) desktop since GNOME-2.2 onwards.
Nowadays, a whole bunch of GNOME applications make use of GStreamer for
media-processing, including (but not limited to)
[Rhythmbox](http://www.rhythmbox.org/),
[Videos](https://wiki.gnome.org/Apps/Videos) and [Sound
Juicer](https://wiki.gnome.org/Apps/SoundJuicer).

Most of these GNOME applications make use of some specific techniques to
integrate as closely as possible with the GNOME desktop:

  - GNOME uses Pulseaudio for audio, use the pulsesrc and pulsesink
   to any output packing.

 - In implementations that support quad buffers, having separate textures
   makes it trivial to do `GL_LEFT`/`GL_RIGHT` output

For either option, we'll need new glsink output API to pass more
information to applications about multiple views for the draw signal/callback.

I don't know if it's desirable to support *both* methods of representing
views. If so, that should be signalled in the caps too. That could be a
new multiview-mode for passing views in separate `GstMemory` objects
attached to a `GstBuffer`, which would not be GL specific.

### Overriding frame packing interpretation

Most sample videos available are frame packed, with no metadata
to say so. How should we override that interpretation?

 - Simple answer: Use capssetter + new properties on playbin to
   override the multiview fields. *Basically implemented in playbin, using*
   *a pad probe. Needs more work for completeness*

---

