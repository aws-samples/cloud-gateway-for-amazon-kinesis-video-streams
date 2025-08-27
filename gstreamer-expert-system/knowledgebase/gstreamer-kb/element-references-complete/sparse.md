        Image
          default rstride: width * 4
          default size:    rstride (image) * height
```

- **"RGBx"** sparse RGB packed into 32 bit, space last

```
       +--+--+--+--+ +--+--+--+--+
       |R0|G0|B0|X | |R1|G1|B1|X | ...
       +--+--+--+--+ +--+--+--+--+

        Component 0: R
          depth:           8
          pstride:         4
          offset:          0

        Component 1: G
          depth:           8
          pstride:         4
          offset:          1
--
        Image
          default rstride: width * 4
          default size:    rstride (image) * height
```

- **"BGRx"** sparse reverse RGB packed into 32 bit, space last

```
       +--+--+--+--+ +--+--+--+--+
       |B0|G0|R0|X | |B1|G1|R1|X | ...
       +--+--+--+--+ +--+--+--+--+

        Component 0: R
          depth:           8
          pstride:         4
          offset:          2

        Component 1: G
          depth:           8
          pstride:         4
          offset:          1
--
        Image
          default rstride: width * 4
          default size:    rstride (image) * height
```

- **"xRGB"** sparse RGB packed into 32 bit, space first

```
       +--+--+--+--+ +--+--+--+--+
       |X |R0|G0|B0| |X |R1|G1|B1| ...
       +--+--+--+--+ +--+--+--+--+

        Component 0: R
          depth:           8
          pstride:         4
          offset:          1

        Component 1: G
          depth:           8
          pstride:         4
          offset:          2
--
        Image
          default rstride: width * 4
          default size:    rstride (image) * height
```

- **"xBGR"** sparse reverse RGB packed into 32 bit, space first

```
       +--+--+--+--+ +--+--+--+--+
       |X |B0|G0|R0| |X |B1|G1|R1| ...
       +--+--+--+--+ +--+--+--+--+

        Component 0: R
          depth:           8
          pstride:         4
          offset:          3

        Component 1: G
          depth:           8
          pstride:         4
          offset:          2
        Image
          default rstride: width * 4
          default size:    rstride (image) * height
```

- **"RGBx"** sparse RGB packed into 32 bit, space last

```
       +--+--+--+--+ +--+--+--+--+
       |R0|G0|B0|X | |R1|G1|B1|X | ...
       +--+--+--+--+ +--+--+--+--+

        Component 0: R
          depth:           8
          pstride:         4
          offset:          0

        Component 1: G
          depth:           8
          pstride:         4
          offset:          1
--
        Image
          default rstride: width * 4
          default size:    rstride (image) * height
```

- **"BGRx"** sparse reverse RGB packed into 32 bit, space last

```
       +--+--+--+--+ +--+--+--+--+
       |B0|G0|R0|X | |B1|G1|R1|X | ...
       +--+--+--+--+ +--+--+--+--+

        Component 0: R
          depth:           8
          pstride:         4
          offset:          2

        Component 1: G
          depth:           8
          pstride:         4
          offset:          1
--
        Image
          default rstride: width * 4
          default size:    rstride (image) * height
```

- **"xRGB"** sparse RGB packed into 32 bit, space first

```
       +--+--+--+--+ +--+--+--+--+
       |X |R0|G0|B0| |X |R1|G1|B1| ...
       +--+--+--+--+ +--+--+--+--+

        Component 0: R
          depth:           8
          pstride:         4
          offset:          1

        Component 1: G
          depth:           8
          pstride:         4
          offset:          2
--
        Image
          default rstride: width * 4
          default size:    rstride (image) * height
```

- **"xBGR"** sparse reverse RGB packed into 32 bit, space first

```
       +--+--+--+--+ +--+--+--+--+
       |X |B0|G0|R0| |X |B1|G1|R1| ...
       +--+--+--+--+ +--+--+--+--+

        Component 0: R
          depth:           8
          pstride:         4
          offset:          3

        Component 1: G
          depth:           8
          pstride:         4
          offset:          2
# Sparse Streams

## Introduction

In 0.8, there was some support for sparse streams through the use of
`FILLER` events. These were used to mark gaps between buffers so that
downstream elements could know not to expect any more data for that gap.

In 0.10, segment information conveyed through `SEGMENT` events can be used
for the same purpose.

In 1.0, there is a `GAP` event that works in a similar fashion as the
`FILLER` event in 0.8.

## Use cases

### Sub-title streams

Sub-title information from muxed formats such as
Matroska or MPEG consist of irregular buffers spaced far apart compared
navigational purposes, but to attach data to a point in time (envelopes,
loops, …).

API wise there is some overlap between: - exposing multiple audio/video
tracks as pads or as ToC editions. For ToC editions, we have the
TocSelect event. - exposing subtitles as a sparse stream or as ToC
sequence of markers with labels
# Sparse Streams

## Introduction

In 0.8, there was some support for sparse streams through the use of
`FILLER` events. These were used to mark gaps between buffers so that
downstream elements could know not to expect any more data for that gap.

In 0.10, segment information conveyed through `SEGMENT` events can be used
for the same purpose.

In 1.0, there is a `GAP` event that works in a similar fashion as the
`FILLER` event in 0.8.

## Use cases

### Sub-title streams

Sub-title information from muxed formats such as
Matroska or MPEG consist of irregular buffers spaced far apart compared

---

