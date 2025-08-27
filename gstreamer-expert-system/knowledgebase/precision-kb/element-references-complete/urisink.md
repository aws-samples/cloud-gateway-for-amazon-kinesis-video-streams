# GStreamer level

Elements will use a "missing-plugin" element message to report
missing plugins, with the following fields set:

* **`type`**: (string) { "urisource", "urisink", "decoder", "encoder",
"element" } (we do not distinguish between demuxer/decoders/parsers etc.)

* **`detail`**: (string) or (caps) depending on the type { ANY } ex: "rtsp,
"rtspt", "audio/x-mp3,rate=48000,…"

* **`name`**: (string) { ANY } ex: "RTSP protocol handler",..

### missing uri handler

ex. rtsp://some.camera/stream1

When no protocol handler is installed for rtsp://, the application will not be
able to instantiate an element for that uri (`gst_element_make_from_uri()`
returns NULL).

# GStreamer level

Elements will use a "missing-plugin" element message to report
missing plugins, with the following fields set:

* **`type`**: (string) { "urisource", "urisink", "decoder", "encoder",
"element" } (we do not distinguish between demuxer/decoders/parsers etc.)

* **`detail`**: (string) or (caps) depending on the type { ANY } ex: "rtsp,
"rtspt", "audio/x-mp3,rate=48000,…"

* **`name`**: (string) { ANY } ex: "RTSP protocol handler",..

### missing uri handler

ex. rtsp://some.camera/stream1

When no protocol handler is installed for rtsp://, the application will not be
able to instantiate an element for that uri (`gst_element_make_from_uri()`
returns NULL).


---

