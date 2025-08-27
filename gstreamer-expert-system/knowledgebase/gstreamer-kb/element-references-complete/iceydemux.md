    e.g. "src%d" to "src%u" or "src\_%u" or similar, since we don't want
    to see negative numbers in pad names. This mostly affects
    applications that create request pads from elements.

  - some elements that used to have a single dynamic source pad have a
    source pad now. Example: wavparse, id3demux, iceydemux, apedemux.
    (This does not affect applications using decodebin or playbin).

  - playbin now proxies the GstVideoOverlay (former GstXOverlay)
    interface, so most applications can just remove the sync bus handler
    where they would set the window ID, and instead just set the window
    ID on playbin from the application thread before starting playback.

    playbin also proxies the GstColorBalance and GstNavigation
    interfaces, so applications that use this don't need to go fishing
    for elements that may implement those any more, but can just use on
    playbin unconditionally.

  - multifdsink, tcpclientsink, tcpclientsrc, tcpserversrc the protocol
    property is removed, use gdppay and gdpdepay.

    e.g. "src%d" to "src%u" or "src\_%u" or similar, since we don't want
    to see negative numbers in pad names. This mostly affects
    applications that create request pads from elements.

  - some elements that used to have a single dynamic source pad have a
    source pad now. Example: wavparse, id3demux, iceydemux, apedemux.
    (This does not affect applications using decodebin or playbin).

  - playbin now proxies the GstVideoOverlay (former GstXOverlay)
    interface, so most applications can just remove the sync bus handler
    where they would set the window ID, and instead just set the window
    ID on playbin from the application thread before starting playback.

    playbin also proxies the GstColorBalance and GstNavigation
    interfaces, so applications that use this don't need to go fishing
    for elements that may implement those any more, but can just use on
    playbin unconditionally.

  - multifdsink, tcpclientsink, tcpclientsrc, tcpserversrc the protocol
    property is removed, use gdppay and gdpdepay.


---

