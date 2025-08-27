This video sink is based on
[OpenGL](http://en.wikipedia.org/wiki/OpenGL) or [OpenGL ES](https://en.wikipedia.org/wiki/OpenGL_ES). It supports rescaling
and filtering of the scaled image to alleviate aliasing. It implements
the VideoOverlay interface, so the video window can be re-parented
(embedded inside other windows). This is the video sink recommended on
most platforms except for Windows (On Windows, `d3d11videosink` is recommended).
In particular, on Android and iOS, it is the only
available video sink. It can be decomposed into
`glupload ! glcolorconvert ! glimagesinkelement` to insert further OpenGL
hardware accelerated processing into the pipeline.

## Linux

### `ximagesink`

A standard RGB only X-based video sink. It implements the VideoOverlay
interface, so the video window can be re-parented (embedded inside
other windows). It does not support scaling or color formats other
than RGB; it has to be performed by different means (using the
`videoscale` element, for example).

--

This is the only audio sink available to GStreamer on Mac OS X.

## Windows

### `d3d11videosink`

This video sink is based on [Direct3D11](https://en.wikipedia.org/wiki/Direct3D#Direct3D_11)
and is the recommended element on Windows.
It supports VideoOverlay interface and rescaling/colorspace conversion
in [zero-copy](https://en.wikipedia.org/wiki/Zero-copy) manner. This element
is the most performant and featureful video sink element on Windows.

### `d3dvideosink`

This video sink is based on
[Direct3D9](https://en.wikipedia.org/wiki/Direct3D#Direct3D_9).
It supports rescaling and filtering of the scaled image to alleviate aliasing.
It implements the VideoOverlay interface, so the video window can be re-parented (embedded inside other windows).
This element is not recommended for applications targetting Windows 8 or more recent.

This video sink is based on
[OpenGL](http://en.wikipedia.org/wiki/OpenGL) or [OpenGL ES](https://en.wikipedia.org/wiki/OpenGL_ES). It supports rescaling
and filtering of the scaled image to alleviate aliasing. It implements
the VideoOverlay interface, so the video window can be re-parented
(embedded inside other windows). This is the video sink recommended on
most platforms except for Windows (On Windows, `d3d11videosink` is recommended).
In particular, on Android and iOS, it is the only
available video sink. It can be decomposed into
`glupload ! glcolorconvert ! glimagesinkelement` to insert further OpenGL
hardware accelerated processing into the pipeline.

## Linux

### `ximagesink`

A standard RGB only X-based video sink. It implements the VideoOverlay
interface, so the video window can be re-parented (embedded inside
other windows). It does not support scaling or color formats other
than RGB; it has to be performed by different means (using the
`videoscale` element, for example).

--

This is the only audio sink available to GStreamer on Mac OS X.

## Windows

### `d3d11videosink`

This video sink is based on [Direct3D11](https://en.wikipedia.org/wiki/Direct3D#Direct3D_11)
and is the recommended element on Windows.
It supports VideoOverlay interface and rescaling/colorspace conversion
in [zero-copy](https://en.wikipedia.org/wiki/Zero-copy) manner. This element
is the most performant and featureful video sink element on Windows.

### `d3dvideosink`

This video sink is based on
[Direct3D9](https://en.wikipedia.org/wiki/Direct3D#Direct3D_9).
It supports rescaling and filtering of the scaled image to alleviate aliasing.
It implements the VideoOverlay interface, so the video window can be re-parented (embedded inside other windows).
This element is not recommended for applications targetting Windows 8 or more recent.


---

