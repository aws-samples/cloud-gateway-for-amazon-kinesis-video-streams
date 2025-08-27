  - Elements that are aimed for inclusion into one of the GStreamer
    modules should ensure consistent naming of the element name,
    structures and function names. For example, if the element type is
    GstYellowFooDec, functions should be prefixed with
    gst\_yellow\_foo\_dec\_ and the element should be registered as
    'yellowfoodec'. Separate words should be separate in this scheme, so
    it should be GstFooDec and gst\_foo\_dec, and not GstFoodec and
    gst\_foodec.

## Querying, events and the like

  - All elements to which it applies (sources, sinks, demuxers) should
    implement query functions on their pads, so that applications and
    neighbour elements can request the current position, the stream
    length (if known) and so on.

  - Elements should make sure they forward events they do not handle
    with gst\_pad\_event\_default (pad, parent, event) instead of just
    dropping them. Events should never be dropped unless specifically
    intended.


---

