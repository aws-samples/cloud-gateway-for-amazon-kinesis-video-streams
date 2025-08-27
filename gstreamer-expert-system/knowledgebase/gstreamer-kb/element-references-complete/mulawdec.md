  - Identity elements. All elements that don't change the format of the
    data, only the content. Video and audio effects are an example.
    Other examples include elements that inspect the stream.

  - Some decoders and encoders, where the output format is defined by
    input format, like mulawdec and mulawenc. These decoders usually
    have no headers that define the content of the stream. They are
    usually more like conversion elements.

Below is an example of a negotiation steps of a typical transform
element. In the sink pad CAPS event handler, we compute the caps for the
source pad and set those.

``` c

  [...]

static gboolean
gst_my_filter_setcaps (GstMyFilter *filter,
               GstCaps *caps)
{
  - Identity elements. All elements that don't change the format of the
    data, only the content. Video and audio effects are an example.
    Other examples include elements that inspect the stream.

  - Some decoders and encoders, where the output format is defined by
    input format, like mulawdec and mulawenc. These decoders usually
    have no headers that define the content of the stream. They are
    usually more like conversion elements.

Below is an example of a negotiation steps of a typical transform
element. In the sink pad CAPS event handler, we compute the caps for the
source pad and set those.

``` c

  [...]

static gboolean
gst_my_filter_setcaps (GstMyFilter *filter,
               GstCaps *caps)
{

---

