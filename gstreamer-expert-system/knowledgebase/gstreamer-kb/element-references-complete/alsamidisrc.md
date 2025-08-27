The GStreamer architecture should be able to support the needs of MIDI
applications very well, a full implementation is still missing, however.
If you are a developer interested in adding MIDI support to GStreamer please
get in touch, we would definitely be interested in that.

As for what exists today: the [`alsamidisrc`][alsamidisrc] element can be used
to fetch ALSA MIDI sequencer events and makes them available to elements that
understand the `audio/x-midi-events` format.

MIDI playback is provided by plugins such as `midiparse`, `fluiddec`,
`wildmidi` and `timidity`.

[alsamidisrc]: https://gstreamer.freedesktop.org/data/doc/gstreamer/head/gst-plugins-base-plugins/html/gst-plugins-base-plugins-alsamidisrc.html

## Does GStreamer depend on GNOME or GTK+?

No, it's just that many GStreamer applications, including some of our sample
ones, happen to be GNOME or GTK+ applications, but there are just as many
using the Qt toolkit or written for Mac OS/X, Windows, Android or iOS.

We aim to provide an API that is toolkit-agnostic, so that GStreamer can be used
from any toolkit, desktop environment or operating system.
The GStreamer architecture should be able to support the needs of MIDI
applications very well, a full implementation is still missing, however.
If you are a developer interested in adding MIDI support to GStreamer please
get in touch, we would definitely be interested in that.

As for what exists today: the [`alsamidisrc`][alsamidisrc] element can be used
to fetch ALSA MIDI sequencer events and makes them available to elements that
understand the `audio/x-midi-events` format.

MIDI playback is provided by plugins such as `midiparse`, `fluiddec`,
`wildmidi` and `timidity`.

[alsamidisrc]: https://gstreamer.freedesktop.org/data/doc/gstreamer/head/gst-plugins-base-plugins/html/gst-plugins-base-plugins-alsamidisrc.html

## Does GStreamer depend on GNOME or GTK+?

No, it's just that many GStreamer applications, including some of our sample
ones, happen to be GNOME or GTK+ applications, but there are just as many
using the Qt toolkit or written for Mac OS/X, Windows, Android or iOS.

We aim to provide an API that is toolkit-agnostic, so that GStreamer can be used
from any toolkit, desktop environment or operating system.

---

