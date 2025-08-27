$ otool -L /Library/Frameworks/GStreamer.framework/Commands/gst-launch-1.0
/Library/Frameworks/GStreamer.framework/Commands/gst-launch-1.0:
 /System/Library/Frameworks/CoreFoundation.framework/Versions/A/CoreFoundation (compatibility version 150.0.0, current version 550.43.0)
 /Library/Frameworks/GStreamer.framework/Versions/0.10/x86/lib/libgstreamer-1.0.0.dylib (compatibility version 31.0.0, current version 31.0.0)
 /Library/Frameworks/GStreamer.framework/Versions/0.10/x86/lib/libxml2.2.dylib (compatibility version 10.0.0, current version 10.8.0)
...
```

As you might have already noticed, if we move GStreamer to a different
folder, it will stop working because the runtime linker won't be able to
find `gstreamer-1.0` in the previous location
`/Library/Frameworks/GStreamer.framework/Versions/0.10/x86/lib/libgstreamer-1.0.0.dylib`.
locate it, as we saw previously with `gst-launch-1.0`.

Since working exclusively with full paths wouldn't let us install our
binaries anywhere in the path, the linker provides a mechanism of string
substitution, adding three variables that can be used as a path prefix.
At runtime the linker will replace them with the generated path for the
prefix. These variables are `@executable_path`,
`@loader_path` and `@rpath`, described in depth in the DYNAMIC LIBRARY
LOADING section
of [dyld](https://developer.apple.com/library/mac/#documentation/Darwin/Reference/ManPages/man1/dyld.1.html)'s
man page.

For our purpose we will use the `@executable_path` variable, which is
replaced with a fixed path, the path to the directory containing the
main executable: `/Applications/MyApp.app/Contents/MacOS`.
The `@loader_path` variable can't be used in our scope, because it will
be replaced with the path to the directory containing the mach-o binary
that loaded the dynamic library, which can vary.

Therefore, in order to relocate GStreamer we will need to replace all
paths
containing `/Library/Frameworks/GStreamer.framework/` with `@executable_path/../Frameworks/GStreamer.framework/`, which
can be done using
the [install\_name\_tool](http://developer.apple.com/library/mac/#documentation/Darwin/Reference/ManPages/man1/install_name_tool.1.html)
utility

### Relocation of the binaries

As mentioned in the previous section, we can use
the `install_name_tool` in combination with `otool` to list all paths
for dependant dynamic libraries and modify them to use the new location.
However GStreamer has a huge list of binaries and doing it manually would
be a painful task. That's why a simple relocation script is provided
which you can find in cerbero's repository
(`cerbero/tools/osxrelocator.py`). This scripts takes 3 parameters:

1.  `directory`: the directory to parse looking for binaries
2.  `old_prefix`: the old prefix we want to change (eg:
    `/Library/Frameworks/GStreamer.framework`)
3.  `new_prefix`: the new prefix we want to use
    (eg: `@executable_path/../Frameworks/GStreamer.framework/`)

When looking for binaries to fix, we will run the script in the
following
directories:

``` bash
$ osxrelocator.py MyApp.app/Contents/Frameworks/GStreamer.framework/Versions/Current/lib /Library/Frameworks/GStreamer.framework/ @executable_path/../Frameworks/GStreamer.framework/ -r
$ osxrelocator.py MyApp.app/Contents/Frameworks/GStreamer.framework/Versions/Current/libexec /Library/Frameworks/GStreamer.framework/ @executable_path/../Frameworks/GStreamer.framework/ -r
$ osxrelocator.py MyApp.app/Contents/Frameworks/GStreamer.framework/Versions/Current/bin /Library/Frameworks/GStreamer.framework/ @executable_path/../Frameworks/GStreamer.framework/ -r
$ osxrelocator.py MyApp.app/Contents/MacOS /Library/Frameworks/GStreamer.framework/ @executable_path/../Frameworks/GStreamer.framework/ -r
```

### Adjusting environment variables with the new paths

The application also needs to set the following environment variables to
help other libraries finding resources in the new
    path:

  - `GST_PLUGIN_SYSTEM_PATH=/Applications/MyApp.app/Contents/Frameworks/GStreamer.framework/Versions/Current/lib/gstreamer-1.0`
  - `GST_PLUGIN_SCANNER=/Applications/MyApp.app/Contents/Frameworks/GStreamer.framework/Versions/Current/libexec/gstreamer-1.0/gst-plugin-scanner`
  - `GTK_PATH=/Applications/MyApp.app/Contents/Frameworks/GStreamer.framework/Versions/Current/`
  - `GIO_EXTRA_MODULES=/Applications/MyApp.app/Contents/Frameworks/GStreamer.framework/Versions/Current/lib/gio/modules`

You can use the following functions:

  - C: [putenv("VAR=/foo/bar")](http://linux.die.net/man/3/putenv)

  - Python: [os.environ\['VAR'\] =
    '/foo/var'](http://docs.python.org/library/os.html)
