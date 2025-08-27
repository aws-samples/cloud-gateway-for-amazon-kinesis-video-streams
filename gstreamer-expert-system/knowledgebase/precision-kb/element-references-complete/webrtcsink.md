### 4. NON-EXISTENT ELEMENTS

**COMMON MISTAKES**:
- `hlssink` → Correct: `hlssink2`
- `rtspsink` → Correct: `udpsink` or custom RTSP server
- `webrtcsink` → Correct: `webrtcbin` (more complex setup required)

**VERIFICATION**: Always verify element existence with:
```bash
gst-inspect-1.0 elementname
```

## RESPONSE PATTERN FOR IMPOSSIBLE REQUESTS

When a user asks for something technically impossible:

1. **CLEARLY STATE IT'S IMPOSSIBLE**: "This is technically impossible because..."
2. **EXPLAIN WHY**: Provide the technical reason
3. **OFFER ALTERNATIVES**: Suggest valid approaches that achieve similar goals
4. **PROVIDE WORKING EXAMPLE**: Show a correct pipeline


---

