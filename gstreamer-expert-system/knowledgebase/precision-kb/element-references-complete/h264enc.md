presets using one string and a well-known separator ('/').

This change only requires changes in the core preset handling code.

This would allow doing the following: `gst_preset_load_preset
(h264enc, "pass:1/profile:baseline/quality:high")`

### Points to be determined

This document hasn't determined yet how to solve the following problems:

#### Storage of profiles

One proposal for storage would be to use a system wide directory (like
$prefix/share/gstreamer-0.10/profiles) and store XML files for every
individual profiles.

Users could then add their own profiles in ~/.gstreamer-0.10/profiles

This poses some limitations as to what to do if some applications want
to have some profiles limited to their own usage.
presets using one string and a well-known separator ('/').

This change only requires changes in the core preset handling code.

This would allow doing the following: `gst_preset_load_preset
(h264enc, "pass:1/profile:baseline/quality:high")`

### Points to be determined

This document hasn't determined yet how to solve the following problems:

#### Storage of profiles

One proposal for storage would be to use a system wide directory (like
$prefix/share/gstreamer-0.10/profiles) and store XML files for every
individual profiles.

Users could then add their own profiles in ~/.gstreamer-0.10/profiles

This poses some limitations as to what to do if some applications want
to have some profiles limited to their own usage.

---

