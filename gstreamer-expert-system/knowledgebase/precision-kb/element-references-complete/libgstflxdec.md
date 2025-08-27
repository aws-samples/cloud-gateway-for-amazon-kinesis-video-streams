
Exploitation requires the user to access an FLC/FLI/FLX stream or file.

## Workarounds

The user should refrain from opening files from untrusted third parties or accessing untrusted remote sites, or disable the FLC/FLI/FLX decoder plugin by removing the plugin binary file libgstflxdec.so or libgstflxdec.dll.

## Solution

The gst-plugins-bad 1.10.2 release addresses the issue. The upcoming gst-plugins-bad 1.8.4 release will also address the issue. People using older branches of GStreamer should apply the patch and recompile or disable the FLC/FLI/FLX plugin.

## References

### The GStreamer project

- [https://gstreamer.freedesktop.org](https://gstreamer.freedesktop.org)

### CVE Database Entries

- [CVE-2016-9634](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2016-9634)
- [CVE-2016-9635](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2016-9635)

---

