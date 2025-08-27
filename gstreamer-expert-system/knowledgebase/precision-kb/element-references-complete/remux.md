
Example applications: Rygel, Coherence

### Transmuxing

Given a certain file, the aim is to remux the contents WITHOUT decoding
into either a different container format or the same container format.
Remuxing into the same container format is useful when the file was not
created properly (for example, the index is missing). Whenever
available, parsers should be applied on the encoded streams to validate
and/or fix the streams before muxing them.

Metadata from the original file must be kept in the newly created file.

Example applications: Arista, Transmaggedon

### Loss-less cutting

Given a certain file, the aim is to extract a certain part of the file
without going through the process of decoding and re-encoding that file.
This is similar to the transmuxing use-case.

Example applications: Rygel, Coherence

### Transmuxing

Given a certain file, the aim is to remux the contents WITHOUT decoding
into either a different container format or the same container format.
Remuxing into the same container format is useful when the file was not
created properly (for example, the index is missing). Whenever
available, parsers should be applied on the encoded streams to validate
and/or fix the streams before muxing them.

Metadata from the original file must be kept in the newly created file.

Example applications: Arista, Transmaggedon

### Loss-less cutting

Given a certain file, the aim is to extract a certain part of the file
without going through the process of decoding and re-encoding that file.
This is similar to the transmuxing use-case.
  will override the GST\_VALIDATE\_SCENARIO environment variable.
* `-e`, `--eos-on-shutdown`: If an EOS event should be sent to the pipeline if an interrupt is
  received, instead of forcing the pipeline to stop. Sending an EOS
  will allow the transcoding to finish the files properly before
  exiting.
* `-r`, `--force-reencoding`: Whether to try to force reencoding, meaning trying to only remux if
  possible, defaults to `TRUE`.

---

