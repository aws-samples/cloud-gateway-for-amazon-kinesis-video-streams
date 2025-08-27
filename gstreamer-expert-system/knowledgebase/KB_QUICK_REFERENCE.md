# Knowledge Base Quick Reference Card

## 🚀 Quick Decision Tree

### Should I Add This Content?
```
Is it GStreamer-related? ──NO──> Don't add
         │
        YES
         │
Is it for GStreamer 1.18+? ──NO──> Don't add
         │
        YES
         │
Is it tested and working? ──NO──> Test first, then add
         │
        YES
         │
Does it solve a real problem? ──NO──> Don't add
         │
        YES
         │
Is it already documented? ──YES──> Improve existing doc
         │
        NO
         │
        ADD IT! 🎉
```

## 📁 Where Does It Go?

| Content Type | Directory | Example |
|-------------|-----------|---------|
| GStreamer element docs | `elements/` | `nvh264enc.md` |
| Service integrations | `integration-patterns/` | `kvs-authentication.md` |
| Platform-specific guides | `platform-guides/` | `linux-hardware-accel.md` |
| Complete pipeline examples | `working-examples/` | `webcam-streaming.pipeline.md` |
| Problem solutions | `troubleshooting/` | `format-negotiation.md` |

## ✅ Quality Checklist (30-second check)

- [ ] **Title is specific** (not "Video Encoder" but "nvh264enc")
- [ ] **Examples work** (tested on actual system)
- [ ] **Platform noted** (Linux/macOS/Windows requirements)
- [ ] **Version specified** (GStreamer 1.18+, plugin versions)
- [ ] **Problems addressed** (common issues + solutions)
- [ ] **Related elements** (what works with this)

## 📝 Document Template (Copy-Paste Ready)

```markdown
# ElementName

**Category:** [Sources/Sinks/Encoders/Decoders/Filters/etc.]
**Plugin:** plugin-name
**Rank:** [None/Marginal/Secondary/Primary]
**Since:** GStreamer X.Y

## Description
What it does and why you'd use it.

## Properties
- **property** (type): Description (default: value)

## Usage Examples

### Basic Usage
```bash
gst-launch-1.0 [working command]
```

## Platform Considerations
- **Linux**: Requirements/notes
- **macOS**: Requirements/notes
- **Windows**: Requirements/notes

## Performance Tips
- Optimization suggestions

## Common Issues
- Problem: Solution

## Related Elements
- element: relationship
```

## 🔧 File Naming Rules

| Type | Pattern | Example |
|------|---------|---------|
| Elements | `elementname.md` | `queue.md` |
| Patterns | `service-topic.md` | `kvs-authentication.md` |
| Guides | `platform-topic.md` | `linux-optimization.md` |
| Examples | `description.pipeline.md` | `webcam-rtmp.pipeline.md` |
| Troubleshooting | `issue-name.md` | `format-negotiation.md` |

## 🚫 Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|---------|-------|
| Generic titles | Specific element/topic names |
| Untested examples | Verified, working commands |
| Missing platform info | Clear compatibility notes |
| Duplicate content | Check existing docs first |
| Theoretical examples | Real-world, practical use cases |
| Old GStreamer versions | Current versions (1.18+) |

## ⚡ Quick Commands

### Test an element:
```bash
gst-inspect-1.0 elementname
```

### Test a pipeline:
```bash
gst-launch-1.0 -v [your pipeline]
```

### Check element availability:
```bash
gst-inspect-1.0 | grep elementname
```

### Validate document format:
1. Check title specificity
2. Verify examples work
3. Confirm platform info included
4. Test all commands
5. Review against template

## 📊 Content Priorities

### High Priority (Add These):
- New hardware acceleration elements
- Cloud service integrations (AWS, GCP, Azure)
- AI/ML pipeline elements (OpenVINO, TensorFlow)
- Common troubleshooting solutions
- Platform-specific optimizations

### Medium Priority:
- Specialized format support
- Advanced pipeline patterns
- Performance optimization guides
- Development tools and debugging

### Low Priority:
- Deprecated elements
- Rarely used formats
- Theoretical concepts
- Duplicate information

## 🎯 Success Metrics

A good document should:
- **Solve real problems** users encounter
- **Work immediately** when copy-pasted
- **Save time** for developers
- **Prevent common mistakes**
- **Enable new capabilities**

Remember: One excellent document > Ten mediocre ones!
