if the typical is size is less than 20 bytes, especially if the size is
known at compile time, as these cases are inlined by the compiler.

(Example: sys/ximage/ximagesink.c)

Add $(ORC\_CFLAGS) to libgstximagesink\_la\_CFLAGS and $(ORC\_LIBS) to
libgstximagesink\_la\_LIBADD. Then, in the source file, add:

\#ifdef HAVE\_ORC \#include <orc/orc.h> \#else \#define
orc\_memcpy(a,b,c) memcpy(a,b,c) \#endif

Then switch relevant uses of `memcpy()` to `orc_memcpy()`.

The above example works whether or not Orc is enabled at compile time.

## Normal Usage

The following lines are added near the top of Makefile.am for plugins
that use Orc code in .orc files (this is for the volume plugin):

```
ORC_BASE=volume include $(top_srcdir)/common/orc.mk
if the typical is size is less than 20 bytes, especially if the size is
known at compile time, as these cases are inlined by the compiler.

(Example: sys/ximage/ximagesink.c)

Add $(ORC\_CFLAGS) to libgstximagesink\_la\_CFLAGS and $(ORC\_LIBS) to
libgstximagesink\_la\_LIBADD. Then, in the source file, add:

\#ifdef HAVE\_ORC \#include <orc/orc.h> \#else \#define
orc\_memcpy(a,b,c) memcpy(a,b,c) \#endif

Then switch relevant uses of `memcpy()` to `orc_memcpy()`.

The above example works whether or not Orc is enabled at compile time.

## Normal Usage

The following lines are added near the top of Makefile.am for plugins
that use Orc code in .orc files (this is for the volume plugin):

```
ORC_BASE=volume include $(top_srcdir)/common/orc.mk

---

