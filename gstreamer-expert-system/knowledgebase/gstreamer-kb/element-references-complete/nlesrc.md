We will assume that the `GstElement` that the `nleoperation` wraps is applying its time effect to `seg.time`, `seg.start` and `buffer.timestamp`, which is given by the function `g`. Note that this is what `pitch` currently does. Its not clear to me what `videorate` does to the `buffer.timestamp`, but it does transform `seg.start` the same way as `seg.time`.

The following is a table of what the `seg.time`, `seg.start` and `buffer.timestamp` values are when *leaving* a pad. The "internal src pad" refers to the source pad of the internal `GstElement`. `s` is the `start` of the objects, and `i` is the `in-point` of the `nlesource`. Following these is what the corresponding stream time would be using these values. The final row is what the corresponding seek position would be coming *into* the pad, if were seeking to the same media time `T`.

```
           nlesrc       nlesrc       nleop        nleop        nleop
           internal     external     external     internal     external
           src pad      src pad      sink pad     src pad      src pad

seg.time   i            s            0            g (0)        g (0) + s

seg.start  i            i            i            g (i)        g (i)

buffer.    T            T            T            g (T)        g (T)
timestamp
------------------------------------------------------------------------
stream     T            T            T            g (T)        g (T)
time                    - i          - i          - g (i)      - g (i)
                        + s                       + g (0)      + g (0)
                                                               + s
------------------------------------------------------------------------

---

