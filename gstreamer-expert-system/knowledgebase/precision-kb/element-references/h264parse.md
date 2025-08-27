  ```sh
  gst-launch-1.0 -v videotestsrc is-live=true \
    ! video/x-raw,framerate=10/1,width=640,height=480 \
    ! clockoverlay time-format="%a %B %d, %Y %I:%M:%S %p" \
    ! x264enc bframes=0 key-int-max=10 \
    ! h264parse \
    ! kvssink stream-name="YourStreamName" aws-region="us-west-2" access-key="YourAccessKey" secret-key="YourSecretKey"
  ```

</details>

### How to run sample applications for sending media to KVS using [GStreamer](https://gstreamer.freedesktop.org/):

##### Setting credentials in environment variables
Define AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables with the AWS access key id and secret key:

```
$ export AWS_ACCESS_KEY_ID=YourAccessKeyId
$ export AWS_SECRET_ACCESS_KEY=YourSecretAccessKey
```
optionally, set `AWS_SESSION_TOKEN` if integrating with temporary token and `AWS_DEFAULT_REGION` for the region other than `us-west-2`

###### Discovering audio and video devices available in your system.
Run the `gst-device-monitor-1.0` command to identify available media devices in your system. An example output as follows:
```
Probing devices...
--
	gst-launch-1.0 v4l2src device=/dev/video4 ! ...
```

###### Running the `gst-launch-1.0` command to start streaming from a RTSP camera source.
```
$ gst-launch-1.0 -v rtspsrc location=rtsp://YourCameraRtspUrl short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name=YourStreamName storage-size=128
```

**Note:** If you are using **IoT credentials** then you can pass them as parameters to the gst-launch-1.0 command
```
$ gst-launch-1.0 -v rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name="iot-stream" iot-certificate="iot-certificate,endpoint=endpoint,cert-path=/path/to/certificate,key-path=/path/to/private/key,ca-path=/path/to/ca-cert,role-aliases=role-aliases"
```
You can find the RTSP URL from your IP camera manual or manufacturers product page. For more information on how to set up IoT/role policies and role-aliases, please refer to [iot-based-credential-provider](auth.md#iot-based-credential-provider) and https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/how-iot.html.

###### Running the `gst-launch-1.0` command to start streaming from USB camera source in **Ubuntu**.
```
$ gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! x264enc  bframes=0 key-int-max=45 bitrate=500 tune=zerolatency ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```
###### Running the `gst-launch-1.0` command to start streaming from USB camera source which has h264 encoded stream already:
```
$ gst-launch-1.0 -v v4l2src device=/dev/video0 ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```


###### Running the `gst-launch-1.0` command to start streaming both audio and video:

Please ensure that audio drivers are installed first by running

`apt-get install libasound2-dev`

then you can use the following following command to find the capture card and device number.

`arecord -l (or arecord --list-devices)`

the output should look like the following:

```
**** List of CAPTURE Hardware Devices ****
card 2: U0x46d0x825 [USB Device 0x46d:0x825], device 0: USB Audio [USB Audio]
  Subdevices: 1/1
  Subdevice #0: subdevice #0
--
```

The audio recording device is represented by `hw:card_number,device_number`. So to use the second device in the example, use `hw:3,0` as the device in `gst-launch-1.0` command.

```
gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! video/x-raw,width=640,height=480,framerate=30/1,format=I420 ! x264enc  bframes=0 key-int-max=45 bitrate=500 tune=zerolatency ! h264parse ! video/x-h264,stream-format=avc,alignment=au,profile=baseline ! kvssink name=sink stream-name="my-stream-name" access-key="YourAccessKey" secret-key="YourSecretKey" alsasrc device=hw:1,0 ! audioconvert ! avenc_aac ! queue ! sink.
```

if your camera supports outputting h264 encoded stream directly, then you can use this command:

```
gst-launch-1.0 -v v4l2src device=/dev/video0 ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="my-stream-name" access-key="YourAccessKey" secret-key="YourSecretKey" alsasrc device=hw:1,0 ! audioconvert ! avenc_aac ! queue ! sink.
```

##### Running the `gst-launch-1.0` command with Iot-certificate and different stream-names than the thing-name

**Note:** Supply a the matching iot-thing-name (that the certificate points to) and we can stream to multiple stream-names (without the stream-name needing to be the same as the thing-name) using the same certificate credentials. iot-thing-name and stream-name can be completely different as long as there is a policy that allows the thing to write to the kinesis stream
```
$ gst-launch-1.0 -v rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! video/x-h264, format=avc,alignment=au !
 h264parse ! kvssink name=aname storage-size=512 iot-certificate="iot-certificate,endpoint=xxxxx.credentials.iot.ap-southeast-2.amazonaws.com,cert-path=/greengrass/v2/thingCert.crt,key-path=/greengrass/v2/privKey.key,ca-path=/greengrass/v2/rootCA.pem,role-aliases=KvsCameraIoTRoleAlias,iot-thing-name=myThingName123" aws-region="ap-southeast-2" log-config="/etc/mtdata/kvssink-log.config" stream-name=myThingName123-video1
```

##### Running the GStreamer webcam sample application
The sample application `kvs_gstreamer_sample` in the `build` directory uses GStreamer pipeline to get video data from the camera. Launch it with a stream name and it will start streaming from the camera. The user can also supply a streaming resolution (width and height) through command line arguments.

```
Usage: AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my_stream_name> -w <width> -h <height> -f <framerate> -b <bitrateInKBPS>
```
* **A.** If **resolution is provided** then the sample will try to check if the camera supports that resolution. If it does detect that the camera can support the resolution supplied in command line, then streaming starts; else, it will fail with an error message `Resolution not supported`.
* **B.** If **no resolution is specified**, the sample application will try to use these three resolutions **640x480, 1280x720 and 1920x1080** and will **start streaming** once the camera supported resolution is detected.

##### Running the GStreamer RTSP sample application
`kvs_gstreamer_sample` supports sending video from a RTSP URL (IP camera). You can find the RTSP URL from your IP camera manual or manufacturers product page. Change your current working direcctory to `build` directory. Launch it with a stream name and `rtsp_url`  and it will start streaming.

```
AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my-rtsp-stream> <my_rtsp_url>
```

##### Running the GStreamer sample application to upload a *video* file

