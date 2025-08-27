gst-launch-1.0 \
   videotestsrc ! video/x-raw,width=640,height=480,pixel-aspect-ratio=1/1 \
     ! textoverlay text=Hello font-desc=72 ! xvimagesink \
   videotestsrc ! video/x-raw,width=320,height=480,pixel-aspect-ratio=2/1 \
     ! textoverlay text=Hello font-desc=72 ! xvimagesink \
   videotestsrc ! video/x-raw,width=640,height=240,pixel-aspect-ratio=1/2 \
     ! textoverlay text=Hello font-desc=72 ! xvimagesink
```
