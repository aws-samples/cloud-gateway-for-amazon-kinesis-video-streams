
# Pre-made base classes

So far, we've been looking at low-level concepts of creating any type of
GStreamer element. Now, let's assume that all you want is to create a
simple audiosink that works exactly the same as, say, “esdsink”, or a
filter that simply normalizes audio volume. Such elements are very
general in concept and since they do nothing special, they should be
easier to code than to provide your own scheduler activation functions
and doing complex caps negotiation. For this purpose, GStreamer provides
base classes that simplify some types of elements. Those base classes
will be discussed in this chapter.

## Writing a sink

Sinks are special elements in GStreamer. This is because sink elements
have to take care of *preroll*, which is the process that takes care
that elements going into the `GST_STATE_PAUSED` state will have buffers
ready after the state change. The result of this is that such elements
can start processing data immediately after going into the
`GST_STATE_PLAYING` state, without requiring to take some time to

---

