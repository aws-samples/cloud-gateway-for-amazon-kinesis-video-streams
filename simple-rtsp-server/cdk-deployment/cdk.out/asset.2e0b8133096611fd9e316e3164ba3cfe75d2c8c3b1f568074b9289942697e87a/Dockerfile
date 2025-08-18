# Use Ubuntu as base for better GStreamer support
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install GStreamer, health check dependencies, and AWS deployment tools
RUN apt-get update && apt-get install -y \
    gstreamer1.0-tools \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    libgstreamer-plugins-base1.0-dev \
    libgstrtspserver-1.0-0 \
    libgstrtspserver-1.0-dev \
    python3 \
    python3-gi \
    python3-gst-1.0 \
    python3-pip \
    fonts-dejavu-core \
    openssl \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create directories for certificates and configs
RUN mkdir -p /etc/rtsp-server/certs /etc/rtsp-server/auth

# Generate self-signed certificate for RTSPS
RUN openssl req -x509 -newkey rsa:2048 -keyout /etc/rtsp-server/certs/server.key \
    -out /etc/rtsp-server/certs/server.crt -days 365 -nodes \
    -subj "/C=US/ST=Test/L=Test/O=Test/CN=localhost"

# Create auth files for different authentication methods
RUN echo "testuser:testpass" > /etc/rtsp-server/auth/basic.txt && \
    echo "digestuser:digestpass" > /etc/rtsp-server/auth/digest.txt && \
    echo "adminuser:adminpass123" > /etc/rtsp-server/auth/admin.txt

# Copy application files
COPY rtsp-server-streamlined.py /rtsp-server-streamlined.py
COPY health-check.py /health-check.py
COPY simple-health-check.py /simple-health-check.py

# Make scripts executable
RUN chmod +x /rtsp-server-streamlined.py /health-check.py /simple-health-check.py

# Test GStreamer installation
RUN echo "Testing GStreamer installation..." && \
    gst-inspect-1.0 --version && \
    python3 -c "import gi; gi.require_version('Gst', '1.0'); gi.require_version('GstRtspServer', '1.0'); from gi.repository import Gst, GstRtspServer; print('GStreamer Python bindings OK')" && \
    echo "GStreamer test completed successfully"

# Expose RTSP ports (standard and secure)
EXPOSE 8554 8555 8556 8557 8558 8559 8322

# Enhanced health check for AWS deployment - tests actual RTSP functionality
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD python3 /simple-health-check.py || exit 1

# Add startup script with debugging
RUN echo '#!/bin/bash\necho "🚀 Starting RTSP Server Container..."\necho "Environment: $RTSP_SERVER_MODE"\necho "Region: $AWS_DEFAULT_REGION"\necho "Starting Python RTSP server..."\npython3 /rtsp-server-streamlined.py' > /start.sh && \
    chmod +x /start.sh

# Run our startup script
CMD ["/start.sh"]
