occurs). `gst-launch-1,0` is one such application.

When `gst-launch-1.0` changes state through NULL to PLAYING
and back to NULL, a dot file is generated on each state change. To have
`gst-launch-1.0` write a snapshot of the pipeline state,
send a SIGHUP to the `gst-launch-1.0` process.
from gst-launch-1.0 or other command line applications. However, applications 
should not depend on this variable and should make their own `XInitThreads()`
call as early as possible.
