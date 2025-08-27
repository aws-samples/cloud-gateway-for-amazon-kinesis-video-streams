
  - Filtered caps -\> capsfilter element (the pipeline syntax for
    gst-launch has not changed though).

  - libgstgconf-0.10.la does not exist. Use the “gconfvideosink” and
    “gconfaudiosink” elements instead, which will do live-updates and
    require no library linking.

  - The “new-pad” and “state-change” signals on `GstElement` were
    renamed to “pad-added” and “state-changed”.

  - `gst_init_get_popt_table ()` has been removed in favour of the new
    GOption command line option API that was added to GLib 2.6.
    `gst_init_get_option_group ()` is the new GOption-based equivalent
    to `gst_init_get_ptop_table ()`.

[bus]: application-development/basics/bus.md
[threads]: application-development/advanced/threads.md
[queries-and-sevents]: application-development/advanced/queryevents.md

  - Filtered caps -\> capsfilter element (the pipeline syntax for
    gst-launch has not changed though).

  - libgstgconf-0.10.la does not exist. Use the “gconfvideosink” and
    “gconfaudiosink” elements instead, which will do live-updates and
    require no library linking.

  - The “new-pad” and “state-change” signals on `GstElement` were
    renamed to “pad-added” and “state-changed”.

  - `gst_init_get_popt_table ()` has been removed in favour of the new
    GOption command line option API that was added to GLib 2.6.
    `gst_init_get_option_group ()` is the new GOption-based equivalent
    to `gst_init_get_ptop_table ()`.

[bus]: application-development/basics/bus.md
[threads]: application-development/advanced/threads.md
[queries-and-sevents]: application-development/advanced/queryevents.md

---

