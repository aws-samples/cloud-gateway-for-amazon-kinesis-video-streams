
There are a number of elements that make use of the OpenGL API for their
functionality.  A non-comprehensive list is provided below.

 - `glimagesinkelement` - Display a video using OpenGL
 - `glcolorconvert` - Convert between diferent color spaces
 - `glviewconvert` - Convert between different stereo view formats
 - `gltransformation` - Perfom transformations in 3D space of the 2D video plane
 - `gleffects` - Various OpenGL effects
 - `glvideomixerelement` - Mix video using OpenGL (roughly equivalent to compositor)
 - `glcolorbalance` - Color balance filtering
 - `gltestsrc` - OpenGL equivalent to videotestsrc
 - `glshader` - Execute an arbitrary OpenGL shader
 - `gloverlay` - Overlay an image onto a video stream
 - `glupload` - Upload data into OpenGL
 - `gldownload` - Download data from OpenGL

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

### `xvimagesink`

An X-based video sink, using the [X Video

There are a number of elements that make use of the OpenGL API for their
functionality.  A non-comprehensive list is provided below.

 - `glimagesinkelement` - Display a video using OpenGL
 - `glcolorconvert` - Convert between diferent color spaces
 - `glviewconvert` - Convert between different stereo view formats
 - `gltransformation` - Perfom transformations in 3D space of the 2D video plane
 - `gleffects` - Various OpenGL effects
 - `glvideomixerelement` - Mix video using OpenGL (roughly equivalent to compositor)
 - `glcolorbalance` - Color balance filtering
 - `gltestsrc` - OpenGL equivalent to videotestsrc
 - `glshader` - Execute an arbitrary OpenGL shader
 - `gloverlay` - Overlay an image onto a video stream
 - `glupload` - Upload data into OpenGL
 - `gldownload` - Download data from OpenGL

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

### `xvimagesink`

An X-based video sink, using the [X Video

---

