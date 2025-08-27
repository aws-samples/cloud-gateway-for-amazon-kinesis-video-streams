    return;
}
```

The first parameter passed to this method is the name of the element to
modify, for example, `vavp9dec` or `fluvadec`.

The key method is `gst_plugin_feature_set_rank()`, which will set the
rank of the requested element factory to the desired level. For
convenience, ranks are divided in NONE, MARGINAL, SECONDARY and PRIMARY,
but any number will do. When enabling an element, we set it to
PRIMARY+1, so it has a higher rank than the rest of elements which
commonly have PRIMARY rank. Setting an element’s rank to NONE will make
the auto-plugging mechanism to never select it.

> ![warning] The GStreamer developers often rank hardware decoders lower than
> the software ones when they are defective. This should act as a warning.

## Conclusion

This tutorial has shown a bit how GStreamer internally manages hardware
    return;
}
```

The first parameter passed to this method is the name of the element to
modify, for example, `vavp9dec` or `fluvadec`.

The key method is `gst_plugin_feature_set_rank()`, which will set the
rank of the requested element factory to the desired level. For
convenience, ranks are divided in NONE, MARGINAL, SECONDARY and PRIMARY,
but any number will do. When enabling an element, we set it to
PRIMARY+1, so it has a higher rank than the rest of elements which
commonly have PRIMARY rank. Setting an element’s rank to NONE will make
the auto-plugging mechanism to never select it.

> ![warning] The GStreamer developers often rank hardware decoders lower than
> the software ones when they are defective. This should act as a warning.

## Conclusion

This tutorial has shown a bit how GStreamer internally manages hardware

---

