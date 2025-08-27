a buffer. This is typically done when the resources are allocated from another
subsystem such as OMX or X11.

- **Processing information**: Pan and crop information can be added to the
buffer data when the downstream element can understand and use this metadata.
An imagesink can, for example, use the pan and cropping information when
blitting the image on the screen with little overhead.

## GstMeta

A `GstMeta` is a structure as follows:

``` c
struct _GstMeta {
  GstMetaFlags       flags;
  const GstMetaInfo *info;    /* tag and info for the meta item */
};
```

The purpose of this structure is to serve as a common header for all
metadata information that we can attach to a buffer. Specific metadata,
a buffer. This is typically done when the resources are allocated from another
subsystem such as OMX or X11.

- **Processing information**: Pan and crop information can be added to the
buffer data when the downstream element can understand and use this metadata.
An imagesink can, for example, use the pan and cropping information when
blitting the image on the screen with little overhead.

## GstMeta

A `GstMeta` is a structure as follows:

``` c
struct _GstMeta {
  GstMetaFlags       flags;
  const GstMetaInfo *info;    /* tag and info for the meta item */
};
```

The purpose of this structure is to serve as a common header for all
metadata information that we can attach to a buffer. Specific metadata,

---

