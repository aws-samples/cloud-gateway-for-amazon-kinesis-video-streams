
**-e, --eos-on-shutdown**

Force an EOS event on sources before shutting the pipeline down. This is
useful to make sure muxers create readable files when a muxing pipeline is
shut down forcefully via Control-C (especially in case of `mp4mux` and `qtmux`
where the created file will be unreadable if the file has not been finalised
properly).

**-f, --no\_fault**

Do not install a segfault handler

**--no-position**

Do not print the current position of pipeline.

If this option is unspecified, the position will be printed when stdout is a TTY.
To enable printing position when stdout is not a TTY,
use the "--force-position" option.


**-e, --eos-on-shutdown**

Force an EOS event on sources before shutting the pipeline down. This is
useful to make sure muxers create readable files when a muxing pipeline is
shut down forcefully via Control-C (especially in case of `mp4mux` and `qtmux`
where the created file will be unreadable if the file has not been finalised
properly).

**-f, --no\_fault**

Do not install a segfault handler

**--no-position**

Do not print the current position of pipeline.

If this option is unspecified, the position will be printed when stdout is a TTY.
To enable printing position when stdout is not a TTY,
use the "--force-position" option.


---

