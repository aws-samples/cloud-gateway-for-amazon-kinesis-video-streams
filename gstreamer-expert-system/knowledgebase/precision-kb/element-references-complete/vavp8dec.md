hardware acceleration to build their pipelines; the application does not
need to do anything special to enable it. Almost:

When `playbin3` has to choose among different equally valid elements,
like conventional software decoding (through `vp8dec`, for example) or
hardware accelerated decoding (through `vavp8dec`, for example), it uses
their *rank* to decide. The rank is a property of each element that
indicates its priority; `playbin3` will simply select the element that
is able to build a complete pipeline and has the highest rank.

So, whether `playbin3` will use hardware acceleration or not will depend
on the relative ranks of all elements capable of dealing with that media
type. Therefore, the easiest way to make sure hardware acceleration is
enabled or disabled is by changing the rank of the associated element
via the environment variable `GST_PLUGIN_FEATURE_RANK` (see “Running and
debugging GStreamer Applications” in documentation for more
information). Another way is by setting the rank in your application as
shown in this code:

``` c
static void enable_factory (const gchar *name, gboolean enable) {
hardware acceleration to build their pipelines; the application does not
need to do anything special to enable it. Almost:

When `playbin3` has to choose among different equally valid elements,
like conventional software decoding (through `vp8dec`, for example) or
hardware accelerated decoding (through `vavp8dec`, for example), it uses
their *rank* to decide. The rank is a property of each element that
indicates its priority; `playbin3` will simply select the element that
is able to build a complete pipeline and has the highest rank.

So, whether `playbin3` will use hardware acceleration or not will depend
on the relative ranks of all elements capable of dealing with that media
type. Therefore, the easiest way to make sure hardware acceleration is
enabled or disabled is by changing the rank of the associated element
via the environment variable `GST_PLUGIN_FEATURE_RANK` (see “Running and
debugging GStreamer Applications” in documentation for more
information). Another way is by setting the rank in your application as
shown in this code:

``` c
static void enable_factory (const gchar *name, gboolean enable) {

---

