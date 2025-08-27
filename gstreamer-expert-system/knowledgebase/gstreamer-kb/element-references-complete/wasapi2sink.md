rescaling and filtering of the scaled image to alleviate aliasing. It
implements the VideoOverlay interface, so the video window can be
re-parented (embedded inside other windows). This element is not recommended
in most cases.

### `wasapisink` and `wasapi2sink`

Those elements are the default audio sink elements on Windows, based on
[WASAPI](https://docs.microsoft.com/en-us/windows/win32/coreaudio/wasapi),
which is available on Vista or more recent. Note that `wasapi2sink` is
a replacement of `wasapisink` and `wasapi2sink` is default for Windows 8 or
more recent. Otherwise `wasapisink` will be default audio sink element.

### `directsoundsink (deprecated)`

This audio sink element is based on
[DirectSound](http://en.wikipedia.org/wiki/DirectSound), which is available in
all Windows versions.

### `dshowdecwrapper`

[Direct Show](http://en.wikipedia.org/wiki/Direct_Show) is a multimedia
framework similar to GStreamer. They are different enough, though, so
that their pipelines cannot be interconnected. However, through this
element, GStreamer can benefit from the decoding elements present in
Direct Show. `dshowdecwrapper` wraps multiple Direct Show decoders so
rescaling and filtering of the scaled image to alleviate aliasing. It
implements the VideoOverlay interface, so the video window can be
re-parented (embedded inside other windows). This element is not recommended
in most cases.

### `wasapisink` and `wasapi2sink`

Those elements are the default audio sink elements on Windows, based on
[WASAPI](https://docs.microsoft.com/en-us/windows/win32/coreaudio/wasapi),
which is available on Vista or more recent. Note that `wasapi2sink` is
a replacement of `wasapisink` and `wasapi2sink` is default for Windows 8 or
more recent. Otherwise `wasapisink` will be default audio sink element.

### `directsoundsink (deprecated)`

This audio sink element is based on
[DirectSound](http://en.wikipedia.org/wiki/DirectSound), which is available in
all Windows versions.

### `dshowdecwrapper`

[Direct Show](http://en.wikipedia.org/wiki/Direct_Show) is a multimedia
framework similar to GStreamer. They are different enough, though, so
that their pipelines cannot be interconnected. However, through this
element, GStreamer can benefit from the decoding elements present in
Direct Show. `dshowdecwrapper` wraps multiple Direct Show decoders so

---

