
        Image
          default size: RU4 (width) * RU2 (height) * 3 / 2
```

- **"GRAY8"** 8-bit grayscale "Y800" same as "GRAY8"

```
        Component 0: Y
          depth:           8
          offset:          0
          pstride:         1
          default rstride: RU4 (width)
          default size:    rstride (component0) * height

        Image
          default size:    size (component0)
```

- **"GRAY16\_BE"** 16-bit grayscale, most significant byte first

```
        Component 0: Y
          depth:           16
          offset:          0
          pstride:         2
          default rstride: RU4 (width * 2)
          default size:    rstride (component0) * height

        Image
          default size:    size (component0)
```

- **"GRAY16\_LE"** 16-bit grayscale, least significant byte first
- **"Y16"** same as "GRAY16\_LE"

```
        Component 0: Y
          depth:           16 LE
          offset:          0
          pstride:         2
          default rstride: RU4 (width * 2)
          default size:    rstride (component0) * height

        Image
          default size:    size (component0)
```

- **"v308"** packed 4:4:4 YUV

        Image
          default size: RU4 (width) * RU2 (height) * 3 / 2
```

- **"GRAY8"** 8-bit grayscale "Y800" same as "GRAY8"

```
        Component 0: Y
          depth:           8
          offset:          0
          pstride:         1
          default rstride: RU4 (width)
          default size:    rstride (component0) * height

        Image
          default size:    size (component0)
```

- **"GRAY16\_BE"** 16-bit grayscale, most significant byte first

```
        Component 0: Y
          depth:           16
          offset:          0
          pstride:         2
          default rstride: RU4 (width * 2)
          default size:    rstride (component0) * height

        Image
          default size:    size (component0)
```

- **"GRAY16\_LE"** 16-bit grayscale, least significant byte first
- **"Y16"** same as "GRAY16\_LE"

```
        Component 0: Y
          depth:           16 LE
          offset:          0
          pstride:         2
          default rstride: RU4 (width * 2)
          default size:    rstride (component0) * height

        Image
          default size:    size (component0)
```

- **"v308"** packed 4:4:4 YUV
                 if (gst_video_format_is_yuv (video_buf_format)) {
                   overlay_format = FORMAT_AYUV;
                 } else if (gst_video_format_is_rgb (video_buf_format)) {
                   overlay_format = FORMAT_ARGB;
                 } else {
                   /* FIXME: grayscale? */
                   return;
                 }
        
                 /* this will scale and convert AYUV<->ARGB if needed */
                 pixels = rectangle_get_pixels_scaled (rectangle, overlay_format);
        
                 ... clip output rectangle ...
        
                 __do_blend (video_buf_format, video_buf->data,
                             overlay_format, pixels->data,
                             x, y, width, height, stride);
        
                 gst_buffer_unref (pixels);
          }
        }
                 if (gst_video_format_is_yuv (video_buf_format)) {
                   overlay_format = FORMAT_AYUV;
                 } else if (gst_video_format_is_rgb (video_buf_format)) {
                   overlay_format = FORMAT_ARGB;
                 } else {
                   /* FIXME: grayscale? */
                   return;
                 }
        
                 /* this will scale and convert AYUV<->ARGB if needed */
                 pixels = rectangle_get_pixels_scaled (rectangle, overlay_format);
        
                 ... clip output rectangle ...
        
                 __do_blend (video_buf_format, video_buf->data,
                             overlay_format, pixels->data,
                             x, y, width, height, stride);
        
                 gst_buffer_unref (pixels);
          }
        }

---

