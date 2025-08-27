#!/usr/bin/env python3
"""
Simple health check for AWS deployment - just checks if ports are open
"""

import socket
import sys

def check_ports():
    """Check if RTSP ports are accessible"""
    ports = [8554, 8555, 8556, 8557]
    open_ports = 0
    
    for port in ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            if result == 0:
                open_ports += 1
        except:
            pass
    
    # Require at least 3 out of 4 ports to be open
    if open_ports >= 3:
        print("HEALTHY")
        return True
    else:
        print("UNHEALTHY")
        return False

if __name__ == "__main__":
    if check_ports():
        sys.exit(0)
    else:
        sys.exit(1)
