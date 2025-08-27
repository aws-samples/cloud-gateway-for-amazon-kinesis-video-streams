
The debug output is controlled with the `GST_DEBUG` environment
variable. Here’s an example with `GST_DEBUG=2`:

```
0:00:00.868050000  1592   09F62420 WARN                 filesrc gstfilesrc.c:1044:gst_file_src_start:<filesrc0> error: No such file "non-existing-file.webm"
```

As you can see, this is quite a bit of information. In fact, the
GStreamer debug log is so verbose, that when fully enabled it can render
applications unresponsive (due to the console scrolling) or fill up
megabytes of text files (when redirected to a file). For this reason,
the logs are categorized, and you seldom need to enable all categories
at once.

The first category is the Debug Level, which is a number specifying the
amount of desired output:

```
| # | Name    | Description                                                    |
|---|---------|----------------------------------------------------------------|
--
GStreamer allows for custom debugging information handlers but when
using the default one, the content of each line in the debug output
looks like:

```
0:00:00.868050000  1592   09F62420 WARN                 filesrc gstfilesrc.c:1044:gst_file_src_start:<filesrc0> error: No such file "non-existing-file.webm"
```

And this is how the information formatted:

```
| Example          | Explained                                                 |
|------------------|-----------------------------------------------------------|
|0:00:00.868050000 | Time stamp in HH:MM:SS.sssssssss format since the start of|
|                  | the program.                                              |
|1592              | Process ID from which the message was issued. Useful when |
|                  | your problem involves multiple processes.                 |
|09F62420          | Thread ID from which the message was issued. Useful when  |
|                  | your problem involves multiple threads.                   |
|WARN              | Debug level of the message.                               |
|filesrc           | Debug Category of the message.                            |
|gstfilesrc.c:1044 | Source file and line in the GStreamer source code where   |
|                  | this message was issued.                                  |
|gst_file_src_start| Function that issued the message.                         |
|<filesrc0>        | Name of the object that issued the message. It can be an  |
|                  | element, a pad, or something else. Useful when you have   |
|                  | multiple elements of the same kind and need to distinguish|
|                  | among them. Naming your elements with the name property   |
|                  | makes this debug output more readable but GStreamer       |
|                  | assigns each new element a unique name by default.        |
| error: No such   |                                                           |
| file ....        | The actual message.                                       |
+------------------------------------------------------------------------------+
```

### Adding your own debug information


The debug output is controlled with the `GST_DEBUG` environment
variable. Here’s an example with `GST_DEBUG=2`:

```
0:00:00.868050000  1592   09F62420 WARN                 filesrc gstfilesrc.c:1044:gst_file_src_start:<filesrc0> error: No such file "non-existing-file.webm"
```

As you can see, this is quite a bit of information. In fact, the
GStreamer debug log is so verbose, that when fully enabled it can render
applications unresponsive (due to the console scrolling) or fill up
megabytes of text files (when redirected to a file). For this reason,
the logs are categorized, and you seldom need to enable all categories
at once.

The first category is the Debug Level, which is a number specifying the
amount of desired output:

```
| # | Name    | Description                                                    |
|---|---------|----------------------------------------------------------------|
--
GStreamer allows for custom debugging information handlers but when
using the default one, the content of each line in the debug output
looks like:

```
0:00:00.868050000  1592   09F62420 WARN                 filesrc gstfilesrc.c:1044:gst_file_src_start:<filesrc0> error: No such file "non-existing-file.webm"
```

And this is how the information formatted:

```
| Example          | Explained                                                 |
|------------------|-----------------------------------------------------------|
|0:00:00.868050000 | Time stamp in HH:MM:SS.sssssssss format since the start of|
|                  | the program.                                              |
|1592              | Process ID from which the message was issued. Useful when |
|                  | your problem involves multiple processes.                 |
|09F62420          | Thread ID from which the message was issued. Useful when  |
|                  | your problem involves multiple threads.                   |
|WARN              | Debug level of the message.                               |
|filesrc           | Debug Category of the message.                            |
|gstfilesrc.c:1044 | Source file and line in the GStreamer source code where   |
|                  | this message was issued.                                  |
|gst_file_src_start| Function that issued the message.                         |
|<filesrc0>        | Name of the object that issued the message. It can be an  |
|                  | element, a pad, or something else. Useful when you have   |
|                  | multiple elements of the same kind and need to distinguish|
|                  | among them. Naming your elements with the name property   |
|                  | makes this debug output more readable but GStreamer       |
|                  | assigns each new element a unique name by default.        |
| error: No such   |                                                           |
| file ....        | The actual message.                                       |
+------------------------------------------------------------------------------+
```

### Adding your own debug information


---

