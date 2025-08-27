or use a different encoder
```
$ gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! x264enc  bframes=0 key-int-max=45 bitrate=500 tune=zerolatency ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```

**Note:** If you are using **Raspberry PI with Bullseye** you have to use another encoder as well as `libcamerasrc` instead of `v4l2src device=/dev/video0`

```
$ gst-launch-1.0 libcamerasrc ! video/x-raw,width=640,height=480,framerate=30/1,format=I420 ! videoconvert ! v4l2h264enc extra-controls="controls,repeat_sequence_header=1" ! video/x-h264,level='(string)4' ! h264parse ! video/x-h264,stream-format=avc, alignment=au,width=640,height=480,framerate=30/1 ! kvssink stream-name="test-stream" access-key="YourAccessKey" secret-key="YourSecretKey" aws-region="YourRegion"
```


###### Running the `gst-launch-1.0` command to start streaming both audio and video:

Please ensure that audio drivers are installed first by running

`apt-get install libasound2-dev`

then you can use the following following command to find the capture card and device number.

`arecord -l (or arecord --list-devices)`

the output should look like the following:

or use a different encoder
```
$ gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! x264enc  bframes=0 key-int-max=45 bitrate=500 tune=zerolatency ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```

**Note:** If you are using **Raspberry PI with Bullseye** you have to use another encoder as well as `libcamerasrc` instead of `v4l2src device=/dev/video0`

```
$ gst-launch-1.0 libcamerasrc ! video/x-raw,width=640,height=480,framerate=30/1,format=I420 ! videoconvert ! v4l2h264enc extra-controls="controls,repeat_sequence_header=1" ! video/x-h264,level='(string)4' ! h264parse ! video/x-h264,stream-format=avc, alignment=au,width=640,height=480,framerate=30/1 ! kvssink stream-name="test-stream" access-key="YourAccessKey" secret-key="YourSecretKey" aws-region="YourRegion"
```


###### Running the `gst-launch-1.0` command to start streaming both audio and video:

Please ensure that audio drivers are installed first by running

`apt-get install libasound2-dev`

then you can use the following following command to find the capture card and device number.

`arecord -l (or arecord --list-devices)`

the output should look like the following:


---

