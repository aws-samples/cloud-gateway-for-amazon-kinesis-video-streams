interrupt to fill a DMA buffer or a Jack[0] port buffer.

- Low-latency effects processing, whereby filters should be applied as
data is transferred from a ring buffer to a sink instead of
beforehand. For example, instead of using the internal alsasink
ringbuffer thread in push-mode wavsrc \! volume \! alsasink, placing
the volume inside the sound card writer thread via wavsrc \!
audioringbuffer \! volume \! alsasink.

[0] <http://jackit.sf.net>

The problem with pull mode is that the sink has to know the format in
order to know how many bytes to pull via `gst_pad_pull_range()`. This
means that before pulling, the sink must initiate negotation to decide
on a format.

Recalling the principles of capsnego, whereby information must flow from
those that have it to those that do not, we see that the three named use
cases have different negotiation requirements:

- RTP and low-latency playback are both like the normal playback case,
in which information flows downstream.

---

