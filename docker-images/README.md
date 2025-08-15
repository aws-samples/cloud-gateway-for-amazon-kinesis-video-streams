
docker build -t kvs-dlstreamer:v1 .

Run the container:
docker run --rm -u 0 -it -v "$PWD":/work -w /work kvs-dlstreamer:v1 /bin/bash




Use the intel/dlstreamer image from scratch:

docker run --rm -u 0 -it -v "$PWD":/work -w /work intel/dlstreamer:v1 /bin/bash

Then, within the container instance:
```
source venv/bin/activate
source set-gst-env
source set-aws-env
./run-kvs-rtsp-pipeline
```


Within the Docker container, Open Model Zoo models needed to be downloaded
https://github.com/openvinotoolkit/open_model_zoo/blob/master/tools/model_tools/README.md

```
python -m venv venv
source venv/bin/activate
python3 -m pip install --upgrade openvino-dev
omz_downloader --name person-detection-retail-0013
omz_converter  --name person-detection-retail-0013  # produces FP32/FP16 IR: *.xml/*.bin
```

Then, the selected models can be set in the environment variables of the run-*-pipeline scripts