#include <iostream>
#include <csignal>
#include <cstdlib>
#include <getopt.h>

#include "utils/common.hpp"
#include "utils/logger.hpp"
#include "utils/config.hpp"
#include "stream_manager.hpp"
#include "mqtt_client.hpp"

using namespace rtsp_kvs_gateway;

// Global application state
static std::unique_ptr<StreamManager> g_stream_manager;
static std::unique_ptr<MqttClient> g_mqtt_client;
static std::atomic<bool> g_shutdown_requested{false};

// Signal handler for graceful shutdown
void signal_handler(int signal) {
    const char* signal_name = "UNKNOWN";
    switch (signal) {
        case SIGINT: signal_name = "SIGINT"; break;
        case SIGTERM: signal_name = "SIGTERM"; break;
        case SIGUSR1: signal_name = "SIGUSR1"; break;
        case SIGUSR2: signal_name = "SIGUSR2"; break;
    }
    
    spdlog::info("Received signal {} ({}), initiating graceful shutdown...", signal, signal_name);
    g_shutdown_requested = true;
}

// Setup signal handlers
void setup_signal_handlers() {
    struct sigaction sa;
    sa.sa_handler = signal_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    
    sigaction(SIGINT, &sa, nullptr);   // Ctrl+C
    sigaction(SIGTERM, &sa, nullptr);  // Termination request
    sigaction(SIGUSR1, &sa, nullptr); // User-defined signal 1
    sigaction(SIGUSR2, &sa, nullptr); // User-defined signal 2
    
    // Ignore SIGPIPE (broken pipe)
    signal(SIGPIPE, SIG_IGN);
}

// Print application banner
void print_banner() {
    std::cout << R"(
╔══════════════════════════════════════════════════════════════════════════════╗
║                    RTSP to Kinesis Video Streams Gateway                     ║
║                          with Computer Vision                                ║
║                                                                              ║
║  Version: )" << PROJECT_VERSION_STRING << R"(                                                      ║
║  Built with: C++17, GStreamer, AWS SDK, Modern CV Frameworks                ║
╚══════════════════════════════════════════════════════════════════════════════╝
)" << std::endl;
}

// Print usage information
void print_usage(const char* program_name) {
    std::cout << "Usage: " << program_name << " [OPTIONS]\n\n";
    std::cout << "Options:\n";
    std::cout << "  -c, --config FILE         Configuration file path (required)\n";
    std::cout << "  -l, --log-level LEVEL     Log level (trace, debug, info, warn, error, critical)\n";
    std::cout << "  -f, --log-file FILE       Log file path (default: stdout)\n";
    std::cout << "  -d, --daemon              Run as daemon (background process)\n";
    std::cout << "  -p, --pid-file FILE       PID file path (daemon mode only)\n";
    std::cout << "  -t, --test-config         Test configuration and exit\n";
    std::cout << "  -v, --verbose             Enable verbose logging\n";
    std::cout << "  -q, --quiet               Suppress console output\n";
    std::cout << "  -h, --help                Show this help message\n";
    std::cout << "      --version             Show version information\n\n";
    
    std::cout << "Examples:\n";
    std::cout << "  " << program_name << " --config /etc/rtsp-kvs-gateway/config.json\n";
    std::cout << "  " << program_name << " -c config.json --log-level debug --verbose\n";
    std::cout << "  " << program_name << " -c config.json --daemon --pid-file /var/run/gateway.pid\n\n";
    
    std::cout << "Environment Variables:\n";
    std::cout << "  AWS_ACCESS_KEY_ID         AWS access key ID\n";
    std::cout << "  AWS_SECRET_ACCESS_KEY     AWS secret access key\n";
    std::cout << "  AWS_DEFAULT_REGION        AWS default region\n";
    std::cout << "  GST_DEBUG                 GStreamer debug level\n";
    std::cout << "  GST_DEBUG_DUMP_DOT_DIR    GStreamer pipeline dot file output directory\n\n";
}

// Print version information
void print_version() {
    std::cout << "RTSP KVS Gateway " << PROJECT_VERSION_STRING << "\n";
    std::cout << "Built on " << __DATE__ << " " << __TIME__ << "\n";
    std::cout << "Compiler: " << __VERSION__ << "\n";
    
    // GStreamer version
    guint major, minor, micro, nano;
    gst_version(&major, &minor, &micro, &nano);
    std::cout << "GStreamer: " << major << "." << minor << "." << micro;
    if (nano > 0) {
        std::cout << "." << nano;
    }
    std::cout << "\n";
    
    // OpenSSL version
    std::cout << "OpenSSL: " << OPENSSL_VERSION_TEXT << "\n";
    
    // Computer vision framework
#ifdef USE_OPENCV
    std::cout << "Computer Vision: OpenCV " << CV_VERSION << "\n";
#elif defined(USE_TENSORFLOW_LITE)
    std::cout << "Computer Vision: TensorFlow Lite\n";
#elif defined(USE_ONNX_RUNTIME)
    std::cout << "Computer Vision: ONNX Runtime\n";
#elif defined(USE_OPENVINO)
    std::cout << "Computer Vision: Intel OpenVINO\n";
#else
    std::cout << "Computer Vision: Custom GStreamer Elements\n";
#endif
}

// Test configuration file
bool test_configuration(const std::string& config_file) {
    try {
        spdlog::info("Testing configuration file: {}", config_file);
        
        auto config = AppConfig::load_from_file(config_file);
        spdlog::info("Configuration loaded successfully");
        
        // Validate required settings
        if (config.mqtt.host.empty()) {
            spdlog::error("MQTT host is not configured");
            return false;
        }
        
        if (config.aws.region.empty()) {
            spdlog::error("AWS region is not configured");
            return false;
        }
        
        // Test GStreamer initialization
        if (!gst_is_initialized()) {
            GError* error = nullptr;
            if (!gst_init_check(nullptr, nullptr, &error)) {
                spdlog::error("Failed to initialize GStreamer: {}", 
                    error ? error->message : "Unknown error");
                if (error) g_error_free(error);
                return false;
            }
        }
        
        spdlog::info("Configuration test passed");
        return true;
        
    } catch (const std::exception& e) {
        spdlog::error("Configuration test failed: {}", e.what());
        return false;
    }
}

// Daemonize the process
bool daemonize(const std::string& pid_file) {
    pid_t pid = fork();
    
    if (pid < 0) {
        spdlog::error("Failed to fork process: {}", strerror(errno));
        return false;
    }
    
    if (pid > 0) {
        // Parent process - write PID file and exit
        if (!pid_file.empty()) {
            std::ofstream pf(pid_file);
            if (pf.is_open()) {
                pf << pid << std::endl;
                pf.close();
            } else {
                spdlog::warn("Failed to write PID file: {}", pid_file);
            }
        }
        exit(0);
    }
    
    // Child process continues
    if (setsid() < 0) {
        spdlog::error("Failed to create new session: {}", strerror(errno));
        return false;
    }
    
    // Change working directory to root
    if (chdir("/") < 0) {
        spdlog::error("Failed to change working directory: {}", strerror(errno));
        return false;
    }
    
    // Close standard file descriptors
    close(STDIN_FILENO);
    close(STDOUT_FILENO);
    close(STDERR_FILENO);
    
    // Redirect to /dev/null
    open("/dev/null", O_RDONLY); // stdin
    open("/dev/null", O_WRONLY); // stdout
    open("/dev/null", O_WRONLY); // stderr
    
    return true;
}

// Initialize GStreamer
bool initialize_gstreamer() {
    GError* error = nullptr;
    
    if (!gst_init_check(nullptr, nullptr, &error)) {
        spdlog::error("Failed to initialize GStreamer: {}", 
            error ? error->message : "Unknown error");
        if (error) g_error_free(error);
        return false;
    }
    
    // Print GStreamer version
    guint major, minor, micro, nano;
    gst_version(&major, &minor, &micro, &nano);
    spdlog::info("GStreamer initialized successfully (version {}.{}.{}{})", 
        major, minor, micro, nano > 0 ? "." + std::to_string(nano) : "");
    
    return true;
}

// Main application loop
int run_application(const AppConfig& config) {
    try {
        // Initialize components
        spdlog::info("Initializing application components...");
        
        // Create stream manager
        g_stream_manager = std::make_unique<StreamManager>(config);
        
        // Create MQTT client
        g_mqtt_client = std::make_unique<MqttClient>(config);
        
        // Connect MQTT command handler to stream manager
        g_mqtt_client->set_command_handler([&](const MqttCommand& command) {
            g_stream_manager->handle_command(command);
        });
        
        // Start components
        spdlog::info("Starting application components...");
        
        if (!g_stream_manager->start()) {
            spdlog::error("Failed to start stream manager");
            return 1;
        }
        
        if (!g_mqtt_client->start()) {
            spdlog::error("Failed to start MQTT client");
            return 1;
        }
        
        spdlog::info("Application started successfully");
        
        // Main event loop
        while (!g_shutdown_requested) {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
            
            // Publish periodic status updates
            auto status = g_stream_manager->get_overall_status();
            g_mqtt_client->publish_status(status);
            
            // Check for component health
            if (!g_stream_manager->is_healthy()) {
                spdlog::warn("Stream manager is unhealthy");
            }
            
            if (!g_mqtt_client->is_connected()) {
                spdlog::warn("MQTT client is disconnected");
            }
        }
        
        spdlog::info("Shutdown requested, stopping components...");
        
        // Stop components gracefully
        if (g_mqtt_client) {
            g_mqtt_client->stop();
        }
        
        if (g_stream_manager) {
            g_stream_manager->stop();
        }
        
        spdlog::info("Application shutdown complete");
        return 0;
        
    } catch (const std::exception& e) {
        spdlog::error("Application error: {}", e.what());
        return 1;
    }
}

// Main function
int main(int argc, char* argv[]) {
    // Command line options
    std::string config_file;
    std::string log_level = "info";
    std::string log_file;
    std::string pid_file;
    bool daemon_mode = false;
    bool test_config = false;
    bool verbose = false;
    bool quiet = false;
    
    // Parse command line arguments
    static struct option long_options[] = {
        {"config",      required_argument, 0, 'c'},
        {"log-level",   required_argument, 0, 'l'},
        {"log-file",    required_argument, 0, 'f'},
        {"daemon",      no_argument,       0, 'd'},
        {"pid-file",    required_argument, 0, 'p'},
        {"test-config", no_argument,       0, 't'},
        {"verbose",     no_argument,       0, 'v'},
        {"quiet",       no_argument,       0, 'q'},
        {"help",        no_argument,       0, 'h'},
        {"version",     no_argument,       0, 0},
        {0, 0, 0, 0}
    };
    
    int option_index = 0;
    int c;
    
    while ((c = getopt_long(argc, argv, "c:l:f:dp:tvqh", long_options, &option_index)) != -1) {
        switch (c) {
            case 'c':
                config_file = optarg;
                break;
            case 'l':
                log_level = optarg;
                break;
            case 'f':
                log_file = optarg;
                break;
            case 'd':
                daemon_mode = true;
                break;
            case 'p':
                pid_file = optarg;
                break;
            case 't':
                test_config = true;
                break;
            case 'v':
                verbose = true;
                break;
            case 'q':
                quiet = true;
                break;
            case 'h':
                print_usage(argv[0]);
                return 0;
            case 0:
                if (option_index == 9) { // --version
                    print_version();
                    return 0;
                }
                break;
            case '?':
                print_usage(argv[0]);
                return 1;
            default:
                break;
        }
    }
    
    // Validate required arguments
    if (config_file.empty()) {
        std::cerr << "Error: Configuration file is required\n";
        print_usage(argv[0]);
        return 1;
    }
    
    // Print banner (unless quiet mode)
    if (!quiet && !daemon_mode) {
        print_banner();
    }
    
    try {
        // Initialize logging
        Logger::initialize(log_level, log_file, verbose, quiet);
        
        spdlog::info("Starting RTSP KVS Gateway {}", PROJECT_VERSION_STRING);
        spdlog::info("Process ID: {}", getpid());
        spdlog::info("Configuration file: {}", config_file);
        
        // Load configuration
        auto config = AppConfig::load_from_file(config_file);
        
        // Test configuration if requested
        if (test_config) {
            return test_configuration(config_file) ? 0 : 1;
        }
        
        // Initialize GStreamer
        if (!initialize_gstreamer()) {
            return 1;
        }
        
        // Daemonize if requested
        if (daemon_mode) {
            spdlog::info("Daemonizing process...");
            if (!daemonize(pid_file)) {
                return 1;
            }
            // Re-initialize logging for daemon mode
            Logger::initialize(log_level, log_file, false, true);
        }
        
        // Setup signal handlers
        setup_signal_handlers();
        
        // Run main application
        int result = run_application(config);
        
        // Cleanup
        gst_deinit();
        
        return result;
        
    } catch (const std::exception& e) {
        if (!quiet) {
            std::cerr << "Fatal error: " << e.what() << std::endl;
        }
        spdlog::critical("Fatal error: {}", e.what());
        return 1;
    }
}
