in SSRC-multiplexed mode this signal action is called only one time.

The user has to call those action signals before to request the
differents rtpbin pads. rtpbin is in charge to link those auxiliary
elements with the sessions, and on receiver side, rtpbin has also to
handle the link with ssrcdemux.

rtpbin never knows if the given rtpauxsend is actually a rtprtxsend
element or another aux element. rtpbin never knows if the given
rtpauxreceive is actually a rtprtxreceive element or another aux
element. rtpbin has to be kept generic so that more aux elements can be
added later without changing rtpbin.

It's currently not possible to use rtpbin with auxiliary stream from
gst-launch. We can discuss about having the ability for rtpbin to
instanciate itself the special aux elements rtprtxsend and rtprtxreceive
but they need to be configured ("payload-type" and "payload-types"
properties) to make retransmission work. So having several rtprtxsend
and rtprtxreceive in a rtpbin would require a lot of properties to
manage them form rtpbin. And for each auxiliary elements.

If you want to use rtprtxreceive and rtprtpsend from gst-launch you have
to use rtpsession, ssrcdemux and rtpjitterbuffer elements yourself. See
gtk-doc of rtprtxreceive for an example.

### Requesting the rtpbin's pads on the pipeline receiver side

If rtpauxreceive is set for session, i, j, k then it has to call
rtpbin::"set-aux-receive" 3 times giving those ids and this aux element.
It has to be done before requesting the `recv_rtp_sink_i`,
`recv_rtp_sink_j`, `recv_rtp_sink_k`. For a concrete case
rtprtxreceive, if the user wants it for session i, then it has to call
rtpbin::"set-aux-receive" one time giving i and this aux element. Then
the user can request `recv_rtp_sink_i` pad.

Calling rtpbin::"set-aux-receive" does not create the session. It add
the given session id and aux element to a hashtable(key:session id,
value: aux element). Then when the user ask for
`rtpbin.recv_rtp_sink_i`, rtpbin lookup if there is an aux element for
this i session id. If yes it requests a sink pad to this aux element and
links it with the `recv_rtp_src` pad of the new gstrtpsession. rtpbin
also checks that this aux element is connected only one time to
ssrcdemux. Because rtpauxreceive has only one source pad. Each call to
request `rtpbin.recv_rtp_sink_k` will also creates
`rtpbin.recv_rtp_src_k_ssrc_pt` as usual. So that the user have it
when then it requests rtpbin. (from gst-launch) or using
`on_rtpbinreceive_pad_added` callback from an application.

### Requesting the rtpbin's pads on the pipeline sender side

For the sender this is similar but a bit more complicated to implement.
When the user asks for `rtpbin.send_rtp_sink_i`, rtpbin will lookup in
its second map (key:session id, value: aux send element). If there is
one aux element, then it will set the sink pad of this aux sender
element to be the ghost pad `rtpbin.send_rtp_sink_i` that the user
asked. rtpbin will also request a src pad of this aux element to connect
it to `gstrtpsession_i`. It will automatically create
`rtpbin.send_rtp_src_i` the usuall way. Then if the user asks

---

