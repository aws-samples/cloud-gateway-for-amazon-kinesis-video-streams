if you need to set this, you must set it to point to the directory that
contains the mediasdk `include` and `lib64` dirs.

### Nvidia Hardware Codecs

Since 1.17.1, the `nvcodec` plugin does not need access to the Nvidia Video SDK
or the CUDA SDK. It now loads everything at runtime. Hence, it is now enabled
by default on all platforms.

## Enabling Visual Studio Support

Starting with version 1.15.2, Cerbero supports building all GStreamer recipes,
all mandatory dependencies (such as glib, libffi, zlib, etc), and some external
dependencies with Visual Studio. You must explicitly opt-in to this by [enabling
the `visualstudio` variant](#enabling-optional-features-with-variants):

```sh
$ python ./cerbero-uninstalled -v visualstudio package gstreamer-1.0
```

If you already have a Cerbero build, it is highly recommended to run the `wipe`
if you need to set this, you must set it to point to the directory that
contains the mediasdk `include` and `lib64` dirs.

### Nvidia Hardware Codecs

Since 1.17.1, the `nvcodec` plugin does not need access to the Nvidia Video SDK
or the CUDA SDK. It now loads everything at runtime. Hence, it is now enabled
by default on all platforms.

## Enabling Visual Studio Support

Starting with version 1.15.2, Cerbero supports building all GStreamer recipes,
all mandatory dependencies (such as glib, libffi, zlib, etc), and some external
dependencies with Visual Studio. You must explicitly opt-in to this by [enabling
the `visualstudio` variant](#enabling-optional-features-with-variants):

```sh
$ python ./cerbero-uninstalled -v visualstudio package gstreamer-1.0
```

If you already have a Cerbero build, it is highly recommended to run the `wipe`

---

