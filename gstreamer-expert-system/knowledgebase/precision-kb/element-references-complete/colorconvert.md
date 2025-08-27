
### Possible future enhancements

- Make GLupload split to separate textures at upload time?
  - Needs new API to extract multiple textures from the upload. Currently only outputs 1 result RGBA texture.
- Make GLdownload able to take 2 input textures, pack them and colorconvert / download as needed.
  - current done by packing then downloading which isn't OK overhead for RGBA download
- Think about how we integrate GLstereo - do we need to do anything special,
  or can the app just render to stereo/quad buffers if they're available?

### Possible future enhancements

- Make GLupload split to separate textures at upload time?
  - Needs new API to extract multiple textures from the upload. Currently only outputs 1 result RGBA texture.
- Make GLdownload able to take 2 input textures, pack them and colorconvert / download as needed.
  - current done by packing then downloading which isn't OK overhead for RGBA download
- Think about how we integrate GLstereo - do we need to do anything special,
  or can the app just render to stereo/quad buffers if they're available?

---

