
### Since v3.1.0
By default we have automatic handling for intermittent streaming.  This means client applications don't need to do anything other than just put frames when they have them and simply do nothing when there are no frames to send, the SDK will take care of making sure the back-end is notified when there are gaps in the stream and even if it's hours between streaming the client application doesn't need to do anything simply continue putting frames as you would normally.  
This comes at a cost of using 1 extra thread to manage the timer used by the SDK to automatically signal to the KVS back-end that a fragment can be closed out.  If on a prior release of the SDK you were manually setting fields like `stream_info_.streamCaps.frameOrderingMode` you no longer should do that.  

If for some reason you would like to opt-out of this functionality (which is enabled by default) then in the method `KinesisVideoProducer::create` right after we create `device_info` you can set the following:

```
device_info.clientInfo.automaticStreamingFlags = AUTOMATIC_STREAMING_ALWAYS_CONTINUOUS
```




