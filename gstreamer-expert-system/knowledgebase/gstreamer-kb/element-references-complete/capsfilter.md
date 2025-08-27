
  - audio convertors (audioconvert, audioresample,…)

  - video convertors (colorspace, videoscale, …)

  - filters (capsfilter, volume, colorbalance, …)

The implementation of the transform element has to take care of the
following things:

  - efficient negotiation both up and downstream

  - efficient buffer alloc and other buffer management

Some transform elements can operate in different modes:

  - passthrough (no changes are done on the input buffers)

  - in-place (changes made directly to the incoming buffers without
    requiring a copy or new buffer allocation)

So decodebin needs to communicate to the parser the set of available
decoder caps (which would contain the relevant capabilities/restrictions
such as supported profiles, resolutions, etc.), after the usual
"autoplug-\*" signal filtering/sorting of course.

This is done by plugging a capsfilter element right after the parser,
and constructing set of filter caps from the list of available decoders
(one appends at the end just the name(s) of the caps structures from the
parser pad template caps to function as an 'ANY other' caps equivalent).
This let the parser negotiate to a supported stream format in the same
way as with the static pipeline mentioned above, but of course incur
some overhead through the additional capsfilter element.

gst-launch-1.0 audiotestsrc ! tee name=t ! queue ! audioconvert ! autoaudiosink t. ! queue ! wavescope ! videoconvert ! autovideosink
```

## Capabilities

### `capsfilter`
[](tutorials/basic/gstreamer-tools.md) already
explained how to use Caps filters with `gst-launch-1.0`. When building a
pipeline programmatically, Caps filters are implemented with
the `capsfilter` element. This element does not modify data as such,
but enforces limitations on the data format.

``` bash
gst-launch-1.0 videotestsrc ! video/x-raw, format=GRAY8 ! videoconvert ! autovideosink
```

### `typefind`

This element determines the type of media a stream contains. It applies
typefind functions in the order of their rank. Once the type has been
detected it sets its source Pad Caps to the found media type and emits
the `have-type` signal.

It is instantiated internally by `decodebin`, and you can use it too to
find the media type, although you can normally use the
enabled, but, unfortunately, this option is not available in all audio
drivers.

Another solution involves, using a custom sinkbin (see
[](tutorials/playback/custom-playbin-sinks.md)) which includes a
`capsfilter` element (see [](tutorials/basic/handy-elements.md))
and an audio sink. The caps that the external decoder supports are
then set in the capsfiler so the wrong format is not output. This
allows the application to enforce the appropriate format instead of
relying on the user to have the system correctly configured. Still
requires user intervention, but can be used regardless of the options
the audio driver offers.

Please do not use `autoaudiosink` as the audio sink, as it currently
only supports raw audio, and will ignore any compressed format.

## Conclusion

This tutorial has shown a bit of how GStreamer deals with digital audio.
In particular, it has shown that:


  - audio convertors (audioconvert, audioresample,…)

  - video convertors (colorspace, videoscale, …)

  - filters (capsfilter, volume, colorbalance, …)

The implementation of the transform element has to take care of the
following things:

  - efficient negotiation both up and downstream

  - efficient buffer alloc and other buffer management

Some transform elements can operate in different modes:

  - passthrough (no changes are done on the input buffers)

  - in-place (changes made directly to the incoming buffers without
    requiring a copy or new buffer allocation)


---

