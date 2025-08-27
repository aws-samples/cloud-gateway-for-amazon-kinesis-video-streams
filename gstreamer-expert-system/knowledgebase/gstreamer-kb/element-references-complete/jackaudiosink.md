
  - `alsasink` for ALSA output

  - `osssink` and `oss4sink` for OSS/OSSv4 output

  - `jackaudiosink` for JACK output

  - `autoaudiosink` for automatic audio output selection

First of all, run gst-inspect-1.0 on the output plug-in you want to use
to make sure you have it installed. For example, if you use Pulseaudio,
run

```
$ gst-inspect-1.0 pulsesink
```
and see if that prints out a bunch of properties for the plug-in.

Then try to play the sine tone by
    running


  - `alsasink` for ALSA output

  - `osssink` and `oss4sink` for OSS/OSSv4 output

  - `jackaudiosink` for JACK output

  - `autoaudiosink` for automatic audio output selection

First of all, run gst-inspect-1.0 on the output plug-in you want to use
to make sure you have it installed. For example, if you use Pulseaudio,
run

```
$ gst-inspect-1.0 pulsesink
```
and see if that prints out a bunch of properties for the plug-in.

Then try to play the sine tone by
    running


---

