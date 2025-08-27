accessed for reading or writing while the lock is held. All members
should be copied or reffed if they are used after releasing the LOCK.

Note that this does **not** mean that no other thread can modify the
object at the same time that the lock is held. It only means that any
two sections of code that obey the lock are guaranteed to not be running
simultaneously. "The lock is voluntary and cooperative".

This lock will ideally be used for parentage, flags and naming, which is
reasonable, since they are the only possible things to protect in the
`GstObject`.

## Locking order

In parent-child situations the lock of the parent must always be taken
first before taking the lock of the child. It is NOT allowed to hold the
child lock before taking the parent lock.

This policy allows for parents to iterate their children and setting
properties on them.

Whenever a nested lock needs to be taken on objects not involved in a
parent-child relation (eg. pads), an explicit locking order has to be
defined.

## Path Generation
