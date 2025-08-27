### Example
Simple hypothetical example of an analytic pipeline.

```
+---------+    +----------+    +---------------+    +----------------+
| v4l2src |    | video    |    | onnxinference |    | tensor-decoder |
|         |    |  convert |    |               |    |                |
|        src-sink  scale src-sink1           src1-sink              src---
|         |    |(pre-proc)|    | (analysis)    |    | (post-proc)    |   /
+---------+    +----------+    +---------------+    +----------------+  /
                                                                       /
----------------------------------------------------------------------
|  +-------------+    +------+
|  | Analytic-   |    | sink |
|  |  overlay    |    |      |
-sink           src-sink     |
   | (analysis   |    |      |
   |  -results   |    +------+
   |  -consumer) |
   +-------------+

```

## Supporting Neural Network Inference

There are multiple frameworks supporting neural network inference. Those can be
described more generally as computing graphs, as they are generally not limited
to NN inference applications. Existing NN inference or computing graph frameworks,
like ONNX-Runtime, are encapsulated into a GstElement/Filter. The inference element loads
a model, describing the computing graph, specified by a property. The model
expects inputs in a specific format and produce outputs in specific
format. Depending on the model format, input/output formats can be extracted
from the model, like with ONNX, but it is not always the case.

### Inference Element
Inference elements are an encapsulation of an NN Inference framework. Therefore
they are specific to a framework, like ONNX-Runtime or TensorFlow-Lite.
Other inference elements can be added.

### Inference Input(s)
The input format is defined by the model. Using the model input format the
inference element can constrain its sinkpad(s) capabilities. Note, because tensors
are very generic, the term also encapsulates images/frames, and the term input tensor is
also used to describe inference input.

### Inference Output(s)
Output(s) of the inference are tensors and their format are also dictated by the
model. Analysis results are generally encoded in the output tensor in a way that
is specific to the model. Even models that target the same type of analysis
encode results in different ways.

### Models Format Not Describing Inputs/Outputs Tensor Format
With some models, the input/output tensor format are not described. In
this context, it's the responsibility of the analytics pipeline to push input
tensors with the correct format into the inference process. In this context,
the inference element designer is left with two choices: supporting a model manifest
where inputs/outputs are described or leaving the constraining/fixing the
inputs/outputs to analytics pipeline designer who can use caps filters to
constrain inputs/outputs of the model.

### Tensor Decoders
In order to preserve the generality of the inference element, tensor decoding is
omitted from the inference element and left to specialized elements that have a
specific task of decoding tensor from a specific model. Additionally
tensor decoding does not depend on a specific NN framework or inference element,
this allow reusing the tensor decoders with a same model used with a
different inference element. For example, a YOLOv3 tensor decoder can used to
decode tensor from inference using YOLOv3 model with an element encapsulating
ONNX or TFLite. Note that a tensor decoder can handle multiple tensors that have
similar encoding.

### Tensor
N-dimensional vector.

#### Tensor Type Identifier
This is an identifier, string or quark, that uniquely identifies a tensor type. The
tensor type describes the specific format used to encode analysis result in
memory. This identifier is used by tensor-decoders to know if they can handle
the decoding of a tensor. For this reason, from an implementation perspective,
the tensor decoder is the ideal location to store the tensor type identifier as the code
is already model specific. Since the tensor decoder is by design specific to a
model, no generality is lost by storing it the tensor type identifier.

--
In general, we're mostly interested in the most probable class or few most
probable class, but there's little value in transport all classes
probability. In addition to keeping only most the probable class (or classes), we
often want the probability to be above a certain threshold, otherwise we're
not interested in the result. Because a significant portion of analytics results
from the inference process don't have much value, we want to filter them out
as early as possible. Since analytics results are only available after tensor
decoding, the tensor decoder is tasked with this type filtering (NMS). The same
concept exists for object detection, where NMS generally involves calculating
the intersection-of-union (IoU) in combination with location and class probability.
Because ML-based analytics are probabilistic by nature, they generally need a form of
NMS post-processing.

#### Handling Multiple Tensors Simultaneously In A Tensor Decoder
Sometimes, it is needed or more efficient to have a tensor decoder handle
multiple tensors simultaneously. In some cases, the tensors are complementary and a
tensor decoder needs to have both tensors to decode analytics result. In other
cases, it's just more efficient to do it simultaneously because of the
tensor-decoder's second job doing NMS. Let's consider YOLOv3, where 3 output tensors are
produced for each input. One tensor represents detection of small objects, a second
tensor medium size objects and a third tensor large size objects. In this context,
--
decoding the same tensor multiple times. However, we can think of two models
specifically designed to work together where the output of one model becomes the
input of the downstream model. In this context the downstream model is not
re-usable without the upstream model but they bypass the need for
tensor-decoding and are very efficient. Another variation is that multiple
models are merged into one model removing the need the multi-level inference,
but again, this is a design decision involving compromise on re-usability,
performance and effort. We aim to provide support for all these use cases,
and to allow the analytics pipeline designer to make the best design decisions based
on his specific context.

#### Analytics Meta
The Analytics Meta (GstAnalyticsRelationMeta) is the foundation of re-usability of
analytics results and its goal is to store analytics results (GstAnalyticsMtd)
in an efficient way, and to allow to define relations between them. GstAnalyticsMtd
is very primitive and is meant to be expanded. GstAnalyticsMtdClassification (storage
for classification result), GstAnalyticsMtdObjectDetection (storage for
object detection result), GstAnalyticsMtdTracking (storage for
object tracking) are specialization and can used as reference to create other
storage, based on GstAnalyticsMtd, for other types of analytics result.

--
which the analysis was performed is available and easily identifiable. Another
advantage is the ability to keep a relation description between tensors in a
refinement context On the other hand this mode of transporting analytics result
make negotiation of tensor-decoder in particular difficult.

### Inference Sinkpad(s) Capabilities
Sinkpad capability, before been constrained based on model, can be any
media type.

### Inference Srcpad(s) Capabilities

Srcpads capabilities, will be identical to sinkpads capabilities.

# Reference
- [Onnx-Refactor-MR](https://gitlab.freedesktop.org/gstreamer/gstreamer/-/merge_requests/4916)
- [Analytics-Meta MR](https://gitlab.freedesktop.org/gstreamer/gstreamer/-/merge_requests/4962)


