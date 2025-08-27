
##  TOC scope: global and current

There are two main consumers for TOC information: applications and
elements in the pipeline that are TOC writers (such as e.g.
matroskamux).

Applications typically want to know the entire table of contents (TOC)
with all entries that can possibly be selected.

TOC writers in the pipeline, however, would not want to write a TOC for
all possible/available streams, but only for the current stream.

When transcoding a title from a DVD, for example, the application would
still want to know the entire TOC, with all titles, the chapters for
each title, and the available angles. When transcoding to a file, we
only want the TOC information that is relevant to the transcoded stream
to be written into the file structure, e.g. the chapters of the title
being transcoded (or possibly only chapters 5-7 if only those have been
selected for playback/ transcoding).

This is why we may need to create two different TOCs for those two types
of consumers.

Elements that extract TOC information should send TOC events downstream.

