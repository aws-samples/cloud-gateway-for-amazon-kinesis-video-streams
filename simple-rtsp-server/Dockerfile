# Use Ubuntu as base for better GStreamer support
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install GStreamer and related packages
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
    fonts-dejavu-core \
    openssl \
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

# Copy our Python RTSP server script
COPY rtsp-server.py /rtsp-server.py
RUN chmod +x /rtsp-server.py

# Expose RTSP ports (standard and secure)
EXPOSE 8554 8555 8556 8557 8558 8559 8322

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD pgrep -f "python3.*rtsp-server.py" || exit 1

# Run our RTSP server
CMD ["python3", "/rtsp-server.py"]
