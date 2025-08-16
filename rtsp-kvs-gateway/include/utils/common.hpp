#pragma once

#include <memory>
#include <string>
#include <vector>
#include <unordered_map>
#include <functional>
#include <chrono>
#include <atomic>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <future>
#include <queue>

// Third-party includes
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

// GStreamer includes
#include <gst/gst.h>
#include <gst/app/gstappsink.h>
#include <gst/app/gstappsrc.h>
#include <gst/video/video.h>
#include <gst/rtsp/gstrtsp.h>

// Project version and info
#define PROJECT_VERSION_MAJOR 1
#define PROJECT_VERSION_MINOR 0
#define PROJECT_VERSION_PATCH 0
#define PROJECT_VERSION_STRING "1.0.0"

namespace rtsp_kvs_gateway {

// Type aliases for convenience
using json = nlohmann::json;
using Clock = std::chrono::steady_clock;
using TimePoint = std::chrono::time_point<Clock>;
using Duration = std::chrono::milliseconds;

// Forward declarations
class StreamManager;
class GStreamerPipeline;
class MqttClient;
class CvProcessor;
class KvsIntegration;

// Common enums
enum class StreamState {
    STOPPED,
    STARTING,
    RUNNING,
    STOPPING,
    ERROR,
    RECONNECTING
};

enum class LogLevel {
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    CRITICAL
};

enum class CvFramework {
    OPENCV,
    TENSORFLOW_LITE,
    ONNX_RUNTIME,
    OPENVINO,
    CUSTOM
};

// Stream configuration structure
struct StreamConfig {
    std::string stream_id;
    std::string rtsp_url;
    std::string kvs_stream_name;
    std::string webrtc_channel_name;
    
    // Video settings
    std::string resolution = "1920x1080";
    int framerate = 30;
    int bitrate_kbps = 2048;
    int gop_size = 30;
    
    // Computer vision settings
    bool cv_enabled = false;
    std::string cv_model = "yolov5s";
    float confidence_threshold = 0.5f;
    std::vector<std::string> classes_filter;
    
    // WebRTC settings
    bool webrtc_enabled = false;
    
    // Metadata
    std::unordered_map<std::string, std::string> metadata;
    
    // Convert to/from JSON
    json to_json() const;
    static StreamConfig from_json(const json& j);
};

// Performance metrics structure
struct PerformanceMetrics {
    std::atomic<double> fps_input{0.0};
    std::atomic<double> fps_output{0.0};
    std::atomic<int> bitrate_kbps{0};
    std::atomic<double> cpu_usage_percent{0.0};
    std::atomic<int> memory_mb{0};
    std::atomic<double> gpu_usage_percent{0.0};
    std::atomic<int> inference_time_ms{0};
    std::atomic<int> objects_detected{0};
    
    TimePoint last_update = Clock::now();
    
    json to_json() const;
};

// Computer vision detection result
struct Detection {
    std::string class_name;
    float confidence;
    struct BoundingBox {
        int x, y, width, height;
        json to_json() const {
            return json{{"x", x}, {"y", y}, {"width", width}, {"height", height}};
        }
    } bbox;
    
    json to_json() const {
        return json{
            {"class", class_name},
            {"confidence", confidence},
            {"bbox", bbox.to_json()}
        };
    }
};

// Stream status structure
struct StreamStatus {
    std::string stream_id;
    StreamState state = StreamState::STOPPED;
    TimePoint start_time;
    std::string error_message;
    PerformanceMetrics metrics;
    std::vector<Detection> last_detections;
    
    json to_json() const;
};

// MQTT message types
enum class MqttMessageType {
    COMMAND,
    STATUS,
    METRICS,
    HEALTH
};

// MQTT command structure
struct MqttCommand {
    std::string command; // start, stop, configure, status
    std::string stream_id;
    StreamConfig config;
    
    static MqttCommand from_json(const json& j);
    json to_json() const;
};

// Application configuration
struct AppConfig {
    // Application settings
    std::string name = "rtsp-kvs-gateway";
    std::string version = PROJECT_VERSION_STRING;
    LogLevel log_level = LogLevel::INFO;
    std::string log_file;
    
    // Threading settings
    int worker_threads = 0; // 0 = auto-detect
    int io_threads = 2;
    int cv_threads = 2;
    int max_concurrent_streams = 16;
    
    // MQTT settings
    struct {
        std::string host = "localhost";
        int port = 1883;
        std::string client_id = "rtsp-kvs-gateway";
        std::string username;
        std::string password;
        bool use_tls = false;
        std::string ca_cert_path;
        std::string cert_path;
        std::string key_path;
        
        struct {
            std::string command = "kvs/gateway/command";
            std::string status = "kvs/gateway/status";
            std::string metrics = "kvs/gateway/metrics";
            std::string health = "kvs/gateway/health";
        } topics;
    } mqtt;
    
    // AWS settings
    struct {
        std::string region = "us-east-1";
        std::string profile = "default";
        
        struct {
            int default_retention_hours = 24;
            int fragment_duration_ms = 2000;
            bool key_frame_fragmentation = true;
            bool frame_timecodes = true;
            bool absolute_fragment_times = true;
            bool fragment_acks = true;
            bool restart_on_errors = true;
        } kvs;
        
        struct {
            bool enabled = true;
            std::string signaling_channel_role = "MASTER";
            int ice_server_ttl_seconds = 300;
        } webrtc;
    } aws;
    
    // GStreamer settings
    struct {
        int debug_level = 2;
        std::vector<std::string> debug_categories;
        std::vector<std::string> plugin_paths;
        std::unordered_map<std::string, std::string> pipeline_templates;
        
        struct {
            int max_size_buffers = 200;
            int max_size_bytes = 10485760;
            int64_t max_size_time_ns = 2000000000;
        } buffer_settings;
    } gstreamer;
    
    // Computer vision settings
    struct {
        CvFramework framework = CvFramework::OPENCV;
        bool enabled = true;
        int max_inference_threads = 2;
        int batch_size = 1;
        int skip_frames = 5;
        
        std::unordered_map<std::string, json> models;
    } cv;
    
    // Load from JSON file
    static AppConfig load_from_file(const std::string& config_file);
    json to_json() const;
};

// Utility functions
namespace utils {

// String utilities
std::string to_lower(const std::string& str);
std::string to_upper(const std::string& str);
std::vector<std::string> split(const std::string& str, char delimiter);
std::string join(const std::vector<std::string>& strings, const std::string& delimiter);
std::string replace_all(std::string str, const std::string& from, const std::string& to);

// Time utilities
std::string format_timestamp(const TimePoint& tp);
std::string format_duration(const Duration& duration);
TimePoint now();

// System utilities
std::string get_hostname();
std::string get_process_id();
int get_cpu_count();
double get_cpu_usage();
int get_memory_usage_mb();

// GStreamer utilities
std::string gst_state_to_string(GstState state);
std::string gst_message_type_to_string(GstMessageType type);
void gst_debug_bin_to_dot_file(GstBin* bin, const std::string& filename);

// JSON utilities
json merge_json(const json& base, const json& overlay);
bool validate_json_schema(const json& data, const json& schema);

} // namespace utils

// Exception classes
class GatewayException : public std::exception {
public:
    explicit GatewayException(const std::string& message) : message_(message) {}
    const char* what() const noexcept override { return message_.c_str(); }
    
private:
    std::string message_;
};

class StreamException : public GatewayException {
public:
    explicit StreamException(const std::string& stream_id, const std::string& message)
        : GatewayException("Stream " + stream_id + ": " + message), stream_id_(stream_id) {}
    
    const std::string& stream_id() const { return stream_id_; }
    
private:
    std::string stream_id_;
};

class ConfigException : public GatewayException {
public:
    explicit ConfigException(const std::string& message)
        : GatewayException("Configuration error: " + message) {}
};

class MqttException : public GatewayException {
public:
    explicit MqttException(const std::string& message)
        : GatewayException("MQTT error: " + message) {}
};

class CvException : public GatewayException {
public:
    explicit CvException(const std::string& message)
        : GatewayException("Computer vision error: " + message) {}
};

// RAII wrapper for GStreamer objects
template<typename T>
class GstObjectPtr {
public:
    explicit GstObjectPtr(T* ptr = nullptr) : ptr_(ptr) {}
    
    ~GstObjectPtr() {
        if (ptr_) {
            gst_object_unref(ptr_);
        }
    }
    
    // Move constructor
    GstObjectPtr(GstObjectPtr&& other) noexcept : ptr_(other.ptr_) {
        other.ptr_ = nullptr;
    }
    
    // Move assignment
    GstObjectPtr& operator=(GstObjectPtr&& other) noexcept {
        if (this != &other) {
            if (ptr_) {
                gst_object_unref(ptr_);
            }
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }
    
    // Disable copy
    GstObjectPtr(const GstObjectPtr&) = delete;
    GstObjectPtr& operator=(const GstObjectPtr&) = delete;
    
    // Access operators
    T* get() const { return ptr_; }
    T* operator->() const { return ptr_; }
    T& operator*() const { return *ptr_; }
    
    // Release ownership
    T* release() {
        T* tmp = ptr_;
        ptr_ = nullptr;
        return tmp;
    }
    
    // Reset with new pointer
    void reset(T* ptr = nullptr) {
        if (ptr_) {
            gst_object_unref(ptr_);
        }
        ptr_ = ptr;
    }
    
    // Boolean conversion
    explicit operator bool() const { return ptr_ != nullptr; }
    
private:
    T* ptr_;
};

// Type aliases for common GStreamer objects
using GstElementPtr = GstObjectPtr<GstElement>;
using GstPipelinePtr = GstObjectPtr<GstPipeline>;
using GstBusPtr = GstObjectPtr<GstBus>;
using GstCapsPtr = GstObjectPtr<GstCaps>;

// Thread-safe queue template
template<typename T>
class ThreadSafeQueue {
public:
    void push(const T& item) {
        std::lock_guard<std::mutex> lock(mutex_);
        queue_.push(item);
        condition_.notify_one();
    }
    
    void push(T&& item) {
        std::lock_guard<std::mutex> lock(mutex_);
        queue_.push(std::move(item));
        condition_.notify_one();
    }
    
    bool try_pop(T& item) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (queue_.empty()) {
            return false;
        }
        item = std::move(queue_.front());
        queue_.pop();
        return true;
    }
    
    bool wait_and_pop(T& item, const Duration& timeout = Duration::max()) {
        std::unique_lock<std::mutex> lock(mutex_);
        if (timeout == Duration::max()) {
            condition_.wait(lock, [this] { return !queue_.empty(); });
        } else {
            if (!condition_.wait_for(lock, timeout, [this] { return !queue_.empty(); })) {
                return false;
            }
        }
        item = std::move(queue_.front());
        queue_.pop();
        return true;
    }
    
    bool empty() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return queue_.empty();
    }
    
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return queue_.size();
    }
    
private:
    mutable std::mutex mutex_;
    std::queue<T> queue_;
    std::condition_variable condition_;
};

} // namespace rtsp_kvs_gateway
