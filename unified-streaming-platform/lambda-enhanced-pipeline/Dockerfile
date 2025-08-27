# Enhanced GStreamer Pipeline Generator Lambda Function
# Uses refactored core implementation for consistent functionality

FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies for OpenCV
RUN yum update -y && \
    yum install -y \
    mesa-libGL \
    glib2 \
    libSM \
    libXext \
    libXrender \
    libgomp \
    && yum clean all

# Copy requirements and install Python dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install --no-cache-dir -r requirements.txt

# Copy the refactored GStreamer expert system
COPY gstreamer-expert-system-core ${LAMBDA_TASK_ROOT}/gstreamer-expert-system/core
COPY gstreamer-expert-system-interfaces ${LAMBDA_TASK_ROOT}/gstreamer-expert-system/interfaces

# Copy the enhanced Lambda function
COPY enhanced_lambda_function.py ${LAMBDA_TASK_ROOT}

# Copy RTSP analysis functions
COPY rtsp_analysis.py ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler
CMD ["enhanced_lambda_function.lambda_handler"]
