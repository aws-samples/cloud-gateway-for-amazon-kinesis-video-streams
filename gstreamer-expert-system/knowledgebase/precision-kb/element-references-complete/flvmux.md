## ELEMENT EXISTENCE VERIFICATION

### NON-EXISTENT ELEMENTS (NEVER REFERENCE)
❌ **hlssink** - Does NOT exist (use hlssink2)
❌ **mp4sink** - Does NOT exist (use mp4mux ! filesink)
❌ **rtmpsink** - Does NOT exist (use rtmp2sink or flvmux ! rtmpsink)

### PLATFORM-SPECIFIC ELEMENT CORRECTIONS

**macOS (Darwin):**
❌ v4l2src - Does NOT exist on macOS (use avfvideosrc)
❌ alsasrc - Does NOT exist on macOS (use osxaudiosrc)
❌ xvimagesink - Does NOT exist on macOS (use osxvideosink)

**Linux:**
❌ avfvideosrc - Does NOT exist on Linux (use v4l2src)
❌ osxaudiosrc - Does NOT exist on Linux (use alsasrc or pulsesrc)
❌ osxvideosink - Does NOT exist on Linux (use xvimagesink)

## MANDATORY PIPELINE VALIDATION RULES


---

