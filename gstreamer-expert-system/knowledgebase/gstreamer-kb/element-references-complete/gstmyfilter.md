>
> Capitalization is important for the name of the plugin. Keep in mind
> that under some operating systems, capitalization is also important
> when specifying directory and file names in general.

The last command creates two files: `gstmyfilter.c` and `gstmyfilter.h`.

> **Note**
>
> It is recommended that you create a copy of the `gst-plugin` directory
> before continuing.

Now one needs to run `meson setup build` from the parent directory to bootstrap the
build environment. After that, the project can be built and installed using the
well known `ninja -C build` commands.

> **Note**
>
> Be aware that by default `meson` will choose `/usr/local` as a default
> location. One would need to add `/usr/local/lib/gstreamer-1.0` to
> `GST_PLUGIN_PATH` in order to make the new plugin show up in a gstreamer
>
> Capitalization is important for the name of the plugin. Keep in mind
> that under some operating systems, capitalization is also important
> when specifying directory and file names in general.

The last command creates two files: `gstmyfilter.c` and `gstmyfilter.h`.

> **Note**
>
> It is recommended that you create a copy of the `gst-plugin` directory
> before continuing.

Now one needs to run `meson setup build` from the parent directory to bootstrap the
build environment. After that, the project can be built and installed using the
well known `ninja -C build` commands.

> **Note**
>
> Be aware that by default `meson` will choose `/usr/local` as a default
> location. One would need to add `/usr/local/lib/gstreamer-1.0` to
> `GST_PLUGIN_PATH` in order to make the new plugin show up in a gstreamer

---

