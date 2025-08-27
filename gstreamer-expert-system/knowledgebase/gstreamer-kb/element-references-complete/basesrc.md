classes: `GstBaseSrc` for the basic source functionality, and
`GstPushSrc`, which is a non-byte exact source base-class. The
pushsource base class itself derives from basesource as well, and thus
all statements about the basesource apply to the pushsource, too.

The basesrc class does several things automatically for derived classes,
so they no longer have to worry about it:

  - Fixes to `GstBaseSrc` apply to all derived classes automatically.

  - Automatic pad activation handling, and task-wrapping in case we get
    assigned to start a task ourselves.

The `GstBaseSrc` may not be suitable for all cases, though; it has
limitations:

  - There is one and only one sourcepad. Source elements requiring
    multiple sourcepads must implement a manager bin and use multiple
    source elements internally or make a manager element that uses a
    source element and a demuxer inside.


---

