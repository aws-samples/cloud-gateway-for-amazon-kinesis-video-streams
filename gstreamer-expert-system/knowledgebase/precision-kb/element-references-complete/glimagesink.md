
After setting up [binfmt] to use wine for windows binaries,
you can run GStreamer tools under wine by running:

```
gst-launch-1.0.exe videotestsrc ! glimagesink
```

[binfmt]: http://man7.org/linux/man-pages/man5/binfmt.d.5.html
    endif
    GSTREAMER_ROOT            := $(GSTREAMER_ROOT_ANDROID)
    endif

    GSTREAMER_NDK_BUILD_PATH  := $(GSTREAMER_ROOT)/share/gst-android/ndk-build/
    GSTREAMER_PLUGINS         := coreelements ogg theora vorbis videoconvert audioconvert audioresample playback glimagesink soup opensles
    G_IO_MODULES              := gnutls
    GSTREAMER_EXTRA_DEPS      := gstreamer-video-1.0

    include $(GSTREAMER_NDK_BUILD_PATH)/gstreamer.mk

Where line 7 specifies an extra library to be included in the project:
`libgstreamer_android.so`. This library contains all GStreamer code,
tailored for your application’s needs, as shown below.

Line 8 specifies additional system libraries, in this case, in order to
access android-specific functionality.

Lines 12 and 13 simply define some convenient macros.

Line 20 lists the plugins you want statically linked into
sinks that are only available on specific platforms, this tutorial hints
you some of their peculiarities.

## Cross Platform

### `glimagesink`

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
--
## Mac OS X

### `osxvideosink`

This is the  video sink available to GStreamer on Mac OS X. It is also
possible to draw using `glimagesink` using OpenGL.

### `osxaudiosink`

This is the only audio sink available to GStreamer on Mac OS X.

## Windows

### `d3d11videosink`

This video sink is based on [Direct3D11](https://en.wikipedia.org/wiki/Direct3D#Direct3D_11)
and is the recommended element on Windows.
It supports VideoOverlay interface and rescaling/colorspace conversion
in [zero-copy](https://en.wikipedia.org/wiki/Zero-copy) manner. This element
is the most performant and featureful video sink element on Windows.

--
[android.media.MediaCodec](http://developer.android.com/reference/android/media/MediaCodec.html)
is an Android specific API to access the codecs that are available on
the device, including hardware codecs. It is available since API level
16 (JellyBean) and GStreamer can use it via the androidmedia plugin
for audio and video decoding. On Android, attaching the hardware
decoder to the `glimagesink` element can produce a high performance
zero-copy decodebin pipeline.

### `ahcsrc`

This video source can capture from the cameras on Android devices, it is part
of the androidmedia plugin and uses the [android.hardware.Camera API](https://developer.android.com/reference/android/hardware/Camera.html).

## iOS

### `osxaudiosink`

This is the only audio sink available to GStreamer on iOS.

### `iosassetsrc`


Then, in the `app_function`, the pipeline is constructed. This time we
build a video pipeline using a simple `videotestsrc` element with a
`warptv` to add some spice. The video sink is `autovideosink`, which
choses the appropriate sink for the platform (currently,
`glimagesink` is the only option for
iOS).

```
/* Set the pipeline to READY, so it can already accept a window handle */
gst_element_set_state(pipeline, GST_STATE_READY);

video_sink = gst_bin_get_by_interface(GST_BIN(pipeline), GST_TYPE_VIDEO_OVERLAY);
if (!video_sink) {
    GST_ERROR ("Could not retrieve video sink");
    return;
}
gst_video_overlay_set_window_handle(GST_VIDEO_OVERLAY(video_sink), (guintptr) (id) ui_video_view);
```

Once the pipeline is built, we set it to READY. In this state, dataflow
--
Once we have the video sink, we inform it of the `UIView` to use for
rendering, through the `gst_video_overlay_set_window_handle()` method.

## EaglUIView

One last detail remains. In order for `glimagesink` to be able to draw
on the
[`UIView`](http://developer.apple.com/library/ios/#documentation/UIKit/Reference/UIView_Class/UIView/UIView.html),
the
[`Layer`](http://developer.apple.com/library/ios/#documentation/GraphicsImaging/Reference/CALayer_class/Introduction/Introduction.html#//apple_ref/occ/cl/CALayer) associated
with this view must be of the
[`CAEAGLLayer`](http://developer.apple.com/library/ios/#documentation/QuartzCore/Reference/CAEAGLLayer_Class/CAEGLLayer/CAEGLLayer.html#//apple_ref/occ/cl/CAEAGLLayer) class.
To this avail, we create the `EaglUIView` class, derived from
`UIView `and overriding the `layerClass` method:

**EaglUIView.m**

```
#import "EaglUIVIew.h"

#import <QuartzCore/QuartzCore.h>
The meta is optional, and probably only useful later for MVC


## Outputting stereo content

The initial implementation for output will be stereo content in glimagesink

### Output Considerations with OpenGL

 - If we have support for stereo GL buffer formats, we can output separate
   left/right eye images and let the hardware take care of display.

 - Otherwise, glimagesink needs to render one window with left/right in a
   suitable frame packing and that will only show correctly in fullscreen on a
   device set for the right 3D packing -> requires app intervention to set the
   video mode.

 - Which could be done manually on the TV, or with HDMI 1.4 by setting the
   right video mode for the screen to inform the TV or third option, we support
   rendering to two separate overlay areas on the screen - one for left eye,
   one for right which can be supported using the 'splitter' element and two
   output sinks or, better, add a 2nd window overlay for split stereo output

 - Intel hardware doesn't do stereo GL buffers - only nvidia and AMD, so
   initial implementation won't include that

## Other elements for handling multiview content


---

