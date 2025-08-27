
## High-level overview of the new internal AdaptiveDemux2 base class:

* Buffering is handled inside the adaptive streaming element, based on
  elementary streams (i.e. de-multiplexed from the downloaded fragments) and
  stored inside the `adaptivedemux`-based element.

* The download strategy has full visibility on bitrates, bandwidth, per-stream
  queueing level (in time and bytes), playback position, etc. This opens up the
  possibility of much more intelligent adaptive download strategies.

* Output pads are not handled directly by the subclasses. Instead subclasses
  specify which `tracks` of elementary streams they can provide and what
  "download streams" can provide contents for those tracks. The baseclass
  handles usage and activation of the `tracks` based on application
  `select-streams` requests, and activation of the `stream` needed to feed each
  selected `track`.

* Output is done from a single thread, with the various elementary streams
  packets being output in time order (i.e. behaving like a regular demuxer, with
  interleaving reduced to its minimum). There is minimal buffering downstream

## High-level overview of the new internal AdaptiveDemux2 base class:

* Buffering is handled inside the adaptive streaming element, based on
  elementary streams (i.e. de-multiplexed from the downloaded fragments) and
  stored inside the `adaptivedemux`-based element.

* The download strategy has full visibility on bitrates, bandwidth, per-stream
  queueing level (in time and bytes), playback position, etc. This opens up the
  possibility of much more intelligent adaptive download strategies.

* Output pads are not handled directly by the subclasses. Instead subclasses
  specify which `tracks` of elementary streams they can provide and what
  "download streams" can provide contents for those tracks. The baseclass
  handles usage and activation of the `tracks` based on application
  `select-streams` requests, and activation of the `stream` needed to feed each
  selected `track`.

* Output is done from a single thread, with the various elementary streams
  packets being output in time order (i.e. behaving like a regular demuxer, with
  interleaving reduced to its minimum). There is minimal buffering downstream

---

