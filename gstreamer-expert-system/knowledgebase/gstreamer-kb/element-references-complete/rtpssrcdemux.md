* <tt><a href="/data/doc/gstreamer/head/gst-plugins-good-plugins/html/gst-plugins-good-plugins-rtpptdemux.html">rtpptdemux</a></tt>
  is an element that usually sits on the rtpbin src
  pad and will detect any new payload types that arrive in the RTP stream.
  It will then create a pad for that new payload and you can connect a
  depayloader/decoder pipeline to that pad.
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-good-plugins/html/gst-plugins-good-plugins-rtpssrcdemux.html">rtpssrcdemux</a></tt>
  is an element that usually sits on the rtpbin src
  pad and will detect any new SSRCs that arrive in the RTP stream.
  It will then create a pad for that new SSRC and you can connect a
  depayloader/decoder pipeline to that pad.
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-base-libs/html/gst-plugins-base-libs-gstrtpbasedepayload.html">GstRTPBaseDepayload</a></tt>
  is a base class for RTP depayloaders
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-base-libs/html/gst-plugins-base-libs-gstrtpbasepayload.html">GstRTPBasePayload</a></tt>
  is a base class for RTP payloaders
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-base-libs/html/gst-plugins-base-libs-gstrtpbaseaudiopayload.html">GstRTPBaseAudioPayload</a>
  is a base class for audio RTP payloaders



Note that many RTP elements assume they receive RTP buffers with
<a href="/data/doc/gstreamer/head/gstreamer-libs/html/gstreamer-libs-GstNetAddressMeta.html">GstNetAddressMeta</a>
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-good-plugins/html/gst-plugins-good-plugins-rtpptdemux.html">rtpptdemux</a></tt>
  is an element that usually sits on the rtpbin src
  pad and will detect any new payload types that arrive in the RTP stream.
  It will then create a pad for that new payload and you can connect a
  depayloader/decoder pipeline to that pad.
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-good-plugins/html/gst-plugins-good-plugins-rtpssrcdemux.html">rtpssrcdemux</a></tt>
  is an element that usually sits on the rtpbin src
  pad and will detect any new SSRCs that arrive in the RTP stream.
  It will then create a pad for that new SSRC and you can connect a
  depayloader/decoder pipeline to that pad.
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-base-libs/html/gst-plugins-base-libs-gstrtpbasedepayload.html">GstRTPBaseDepayload</a></tt>
  is a base class for RTP depayloaders
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-base-libs/html/gst-plugins-base-libs-gstrtpbasepayload.html">GstRTPBasePayload</a></tt>
  is a base class for RTP payloaders
* <tt><a href="/data/doc/gstreamer/head/gst-plugins-base-libs/html/gst-plugins-base-libs-gstrtpbaseaudiopayload.html">GstRTPBaseAudioPayload</a>
  is a base class for audio RTP payloaders



Note that many RTP elements assume they receive RTP buffers with
<a href="/data/doc/gstreamer/head/gstreamer-libs/html/gstreamer-libs-GstNetAddressMeta.html">GstNetAddressMeta</a>

---

