

#### Matroska format

KVS is using MKV (Matroska) format as its underlying packaging format due to it being a standard, being “streamable” and being independent from the underlying elementary stream. KVS utilizes a small portion of the MKV specification. The Producer SDK generates sessions as one continuous MKV stream whereas the fragments returned by the KVS in GetMedia API call each have a header, cluster start and frames which belong to the cluster. 
In most usage cases the customers applications have a single Fragment to MKV Cluster mapping and most Fragments for video would be a single GoP (Group of Pictures). MKV has a single timestamp for both clusters and the frames. Frames are encoded in time units relative to the beginning of the cluster. For example, the cluster frame timestamps could be 0, 33, 66, ... in case of default 1ms timescale, 30 fps and no b-frames. The MKV standard requires that the frames be in a decoding order so we use PTS to timestamp the frames against the cluster start. The timestamp field for the frames has signed 16 bits (effective use of 15 bits) to represent the frame timestamp. The clusters, on the other hand, are encoded as 64bit field and can have arbitrary timestamps as long as it’s monotonically increasing. KVS Producer SDK encodes either Absolute or Relative timestamps in the clusters based on the StreamInfo.StreamCaps.absoluteTimestamp structure member. The Absolute timestamp then is produced directly from the frame or the system clock (depending on Producer SDK StreamInfo.StreamCaps.frameTimestamp field). The Relative timestamp is from the beginning of the presentation - aka - the streaming session start. Most use cases call out for Absolute timestamp usage to ensure the fragment timestamps are monotonically increasing across the streaming sessions.

Example of cluster timestamps:

Key-frame timestamps: 1000, 1001, 1002, ...
Absolute: 1000, 1001, 1002, ...
Relative: 0, 1, 2, ...

KVS service has limits in place to allow for min and max fragment durations. Most optimal, the fragment duration should be 1 - 6 seconds long.


#### SDK Timestamp Modes

Producer SDK (PIC in this case) has two modes of generating timestamps which are frame timestamp or SDK timestamp. In the first mode, the SDK gets the frame timestamp from the frame structure passed in (Frame structure) and processes it. In the SDK mode, the frame timestamp is ignored and a current timestamp is used as the frame is produced by putFrame API. The default GETTIME API is used. The frame mode is the default mode which is used by majority of the media pipelines. The SDK timestamp mode is used when the media pipeline timestamps are missing or jittery. The parameter is part of the StreamInfo StreamCaps structure: https://github.com/awslabs/amazon-kinesis-video-streams-pic/blob/master/src/client/include/com/amazonaws/kinesis/video/client/Include.h#L903




#### Matroska format

KVS is using MKV (Matroska) format as its underlying packaging format due to it being a standard, being “streamable” and being independent from the underlying elementary stream. KVS utilizes a small portion of the MKV specification. The Producer SDK generates sessions as one continuous MKV stream whereas the fragments returned by the KVS in GetMedia API call each have a header, cluster start and frames which belong to the cluster. 
In most usage cases the customers applications have a single Fragment to MKV Cluster mapping and most Fragments for video would be a single GoP (Group of Pictures). MKV has a single timestamp for both clusters and the frames. Frames are encoded in time units relative to the beginning of the cluster. For example, the cluster frame timestamps could be 0, 33, 66, ... in case of default 1ms timescale, 30 fps and no b-frames. The MKV standard requires that the frames be in a decoding order so we use PTS to timestamp the frames against the cluster start. The timestamp field for the frames has signed 16 bits (effective use of 15 bits) to represent the frame timestamp. The clusters, on the other hand, are encoded as 64bit field and can have arbitrary timestamps as long as it’s monotonically increasing. KVS Producer SDK encodes either Absolute or Relative timestamps in the clusters based on the StreamInfo.StreamCaps.absoluteTimestamp structure member. The Absolute timestamp then is produced directly from the frame or the system clock (depending on Producer SDK StreamInfo.StreamCaps.frameTimestamp field). The Relative timestamp is from the beginning of the presentation - aka - the streaming session start. Most use cases call out for Absolute timestamp usage to ensure the fragment timestamps are monotonically increasing across the streaming sessions.

Example of cluster timestamps:

Key-frame timestamps: 1000, 1001, 1002, ...
Absolute: 1000, 1001, 1002, ...
Relative: 0, 1, 2, ...

KVS service has limits in place to allow for min and max fragment durations. Most optimal, the fragment duration should be 1 - 6 seconds long.


#### SDK Timestamp Modes

Producer SDK (PIC in this case) has two modes of generating timestamps which are frame timestamp or SDK timestamp. In the first mode, the SDK gets the frame timestamp from the frame structure passed in (Frame structure) and processes it. In the SDK mode, the frame timestamp is ignored and a current timestamp is used as the frame is produced by putFrame API. The default GETTIME API is used. The frame mode is the default mode which is used by majority of the media pipelines. The SDK timestamp mode is used when the media pipeline timestamps are missing or jittery. The parameter is part of the StreamInfo StreamCaps structure: https://github.com/awslabs/amazon-kinesis-video-streams-pic/blob/master/src/client/include/com/amazonaws/kinesis/video/client/Include.h#L903



---

