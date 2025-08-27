- **osxaudiosrc**: Core Audio capture
- **osxaudiosink**: Core Audio playback

#### Windows  
- **wasapisrc**: Windows Audio Session API capture
- **directsoundsrc**: DirectSound capture (older)

### HARDWARE ACCELERATION ELEMENTS

#### NVIDIA (Cross-platform)
- **nvh264enc, nvh265enc**: NVIDIA hardware encoding
- **nvh264dec, nvh265dec**: NVIDIA hardware decoding
- **Availability**: Systems with NVIDIA GPUs and drivers
- **Requirements**: CUDA toolkit, proper drivers

#### Intel Hardware Acceleration

**Linux/Windows**:
- **qsvh264enc, qsvh265enc**: Intel Quick Sync encoding
- **qsvh264dec, qsvh265dec**: Intel Quick Sync decoding
- **vaapih264enc, vaapih265enc**: VA-API encoding (Linux)
--
#### Assuming hardware acceleration availability:
- **WRONG**: Always recommending nvenc
- **RIGHT**: Ask about hardware, verify availability

#### Using deprecated elements:
- **WRONG**: directsoundsrc on modern Windows
- **RIGHT**: wasapisrc for modern Windows audio

### RESPONSE PATTERN FOR PLATFORM-SPECIFIC REQUESTS

1. **ASK FOR PLATFORM**: "What operating system are you using?"
2. **PROVIDE PLATFORM-SPECIFIC SOLUTION**: Use appropriate elements
3. **EXPLAIN PLATFORM DIFFERENCES**: Why different elements are needed
4. **OFFER ALTERNATIVES**: Suggest cross-platform alternatives when available

Example:
"I see you want to capture video. What operating system are you using? 
- Linux: I'll use v4l2src
- macOS: I'll use avfvideosrc  
- Windows: I'll use ksvideosrc
Each platform has different video capture systems, so the element needs to match your OS."

---

