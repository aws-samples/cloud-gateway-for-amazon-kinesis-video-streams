### KVS SDK handling of the media

Kinesis Video Streams end-to-end streaming is mostly content type agnostic. It handles any time encoded series, similar to audio and video. Some applications use GPS coordinates, others use Lidar or Radar streams. These applications integrate with the SDK via Producer interface which accepts an abstract Frame structure that can represent any time-encoded datum. The SDK as well as the KVS service overall have a few exceptions where the content type matters.

* H264/H265 video frames can be adapted from Annex-B format to AvCC and vice-versa.
* KVS SDK can auto-extract H264/H265 CPD (Codec Private Data) from an Annex-B Idr frames if the CPD has not been already specified by the application and NAL_ADAPTATION_ANNEXB_CPD_NALS flags have been specified in https://github.com/awslabs/amazon-kinesis-video-streams-pic/blob/master/src/client/include/com/amazonaws/kinesis/video/client/Include.h#L916. Many encoders that produce Annex-B format elementary streams include SPS/PPS (and in case of H265 VPS) NALs pre-pended to the Idr frames.
* KVS SDK can adapt CPD from Annex-B format to AvCC format for H264 and H265
* KVS SDK can adapt frames from Annex-B format to AvCC format and in the opposite direction for H264 and H265
* KVS SDK will automatically attempt to extract video pixel width and height (for a number of formats) and include PixelWidth and PixelHeight elements in the generated MKV (https://www.matroska.org/technical/elements.html) as some downstream consumers require it for video.
* KVS SDK will automatically attempt to extract and set Audio specific elements in the MKV for audio streams as those can be required by the downstream consumers.
* KVS SDK has a set of APIs to generate audio specific CPD.
* KVS HLS/MPEG-DASH/Console playback and clip generation require specific elementary stream and packaging formats - for example, the console playback requires H264/H265 elementary stream with CPD in AvCC format. More information on the supported formats and limitations can be found in AWS documentation.


#### Indexing, persistence and low-latency

KVS designed to handle real-time as well as offline scenarios. In both cases, the smallest granularity of data to be indexed is based on the abstract Fragment which is a collection abstract Frames that can be used/replayed individually. In case of H264 for example, the Fragment can correspond to a single GoP or a collection of GoPs. In case of audio, it could be a collection of audio samples a few seconds which comprise a fragment. The backend indexing and persistence happens on a per-fragment granularity. On the SDK-side, the integration happens on a per-frame basis as majority of the use cases have a media pipeline producing a frame at a time. The SDK integrating with the media pipeline would take in the frames (including frame data, flags and timestamps), proceed with on-the-fly packaging it into an MKV format and store the information in the buffer while the networking thread is uploading the content of the buffer. This means that the integration of an application with the SDK is on a frame granularity. The SDK uploads the content of the buffer on a bit-granularity.

In order to achieve a low-latency streaming case, the MKV structure should contain a "streamable" format. This means that the packaging structures would not know the size nor the duration of the fragments at the time of packaging/encoding as the bits would need to be sent out before the entire content of the fragment is generated in real-time. MKV format handles the streamability by using a sentinel value "unknown" for the sizes or durations. For example, the size of the Segment or Cluster element in MKV is set to unknown. This allows KVS to use MKV format in a streamable fashion allowing bit-level granularity and low-latency streaming while still having a fully defined structure allowing for indexing, persistence and ACKs.


