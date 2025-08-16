cmake_minimum_required(VERSION 3.16)
project(rtsp-kvs-gateway 
    VERSION 1.0.0 
    DESCRIPTION "RTSP to Kinesis Video Streams Gateway with Computer Vision"
    LANGUAGES CXX C
)

# Modern C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Build configuration
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# Compiler-specific options
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    set(CMAKE_CXX_FLAGS_DEBUG "-g -O0 -Wall -Wextra -Wpedantic -fsanitize=address")
    set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG -march=native")
    set(CMAKE_CXX_FLAGS_RELWITHDEBINFO "-O2 -g -DNDEBUG")
endif()

# Enable position independent code
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Find required packages
find_package(PkgConfig REQUIRED)
find_package(Threads REQUIRED)

# GStreamer dependencies
pkg_check_modules(GSTREAMER REQUIRED 
    gstreamer-1.0>=1.18
    gstreamer-base-1.0>=1.18
    gstreamer-video-1.0>=1.18
    gstreamer-app-1.0>=1.18
    gstreamer-rtsp-1.0>=1.18
)

# AWS SDK C++ (try to find system installation first)
find_package(aws-cpp-sdk-core QUIET)
find_package(aws-cpp-sdk-kinesisvideo QUIET)
find_package(aws-cpp-sdk-kinesis-video-webrtc-storage QUIET)

if(NOT aws-cpp-sdk-core_FOUND)
    message(STATUS "AWS SDK not found in system, will use bundled version")
    set(USE_BUNDLED_AWS_SDK ON)
endif()

# JSON library (try system first, fallback to FetchContent)
find_package(nlohmann_json QUIET)
if(NOT nlohmann_json_FOUND)
    include(FetchContent)
    FetchContent_Declare(
        nlohmann_json
        GIT_REPOSITORY https://github.com/nlohmann/json.git
        GIT_TAG v3.11.2
    )
    FetchContent_MakeAvailable(nlohmann_json)
endif()

# Logging library (spdlog)
find_package(spdlog QUIET)
if(NOT spdlog_FOUND)
    include(FetchContent)
    FetchContent_Declare(
        spdlog
        GIT_REPOSITORY https://github.com/gabime/spdlog.git
        GIT_TAG v1.12.0
    )
    FetchContent_MakeAvailable(spdlog)
endif()

# MQTT client library
find_library(MOSQUITTO_CPP_LIB mosquittopp)
find_path(MOSQUITTO_CPP_INCLUDE_DIR mosquittopp.h)

if(NOT MOSQUITTO_CPP_LIB)
    message(WARNING "Mosquitto C++ library not found, falling back to C library")
    find_library(MOSQUITTO_LIB mosquitto REQUIRED)
    find_path(MOSQUITTO_INCLUDE_DIR mosquitto.h REQUIRED)
    set(USE_MOSQUITTO_C ON)
endif()

# Computer Vision Framework Selection (mutually exclusive)
option(USE_OPENCV "Use OpenCV for computer vision" OFF)
option(USE_TENSORFLOW_LITE "Use TensorFlow Lite for computer vision" OFF)
option(USE_ONNX_RUNTIME "Use ONNX Runtime for computer vision" OFF)
option(USE_OPENVINO "Use Intel OpenVINO for computer vision" OFF)
option(USE_CUSTOM_CV "Use custom GStreamer elements for computer vision" ON)

# Validate CV framework selection
set(CV_FRAMEWORKS_SELECTED 0)
if(USE_OPENCV)
    math(EXPR CV_FRAMEWORKS_SELECTED "${CV_FRAMEWORKS_SELECTED} + 1")
endif()
if(USE_TENSORFLOW_LITE)
    math(EXPR CV_FRAMEWORKS_SELECTED "${CV_FRAMEWORKS_SELECTED} + 1")
endif()
if(USE_ONNX_RUNTIME)
    math(EXPR CV_FRAMEWORKS_SELECTED "${CV_FRAMEWORKS_SELECTED} + 1")
endif()
if(USE_OPENVINO)
    math(EXPR CV_FRAMEWORKS_SELECTED "${CV_FRAMEWORKS_SELECTED} + 1")
endif()
if(USE_CUSTOM_CV)
    math(EXPR CV_FRAMEWORKS_SELECTED "${CV_FRAMEWORKS_SELECTED} + 1")
endif()

if(CV_FRAMEWORKS_SELECTED GREATER 1)
    message(FATAL_ERROR "Only one computer vision framework can be selected at a time")
elseif(CV_FRAMEWORKS_SELECTED EQUAL 0)
    message(STATUS "No CV framework selected, defaulting to custom GStreamer elements")
    set(USE_CUSTOM_CV ON)
endif()

# Computer Vision Dependencies
if(USE_OPENCV)
    find_package(OpenCV 4.0 REQUIRED)
    add_compile_definitions(USE_OPENCV)
    message(STATUS "Using OpenCV ${OpenCV_VERSION} for computer vision")
    
elseif(USE_TENSORFLOW_LITE)
    find_path(TFLITE_INCLUDE_DIR tensorflow/lite/c/c_api.h)
    find_library(TFLITE_LIB tensorflowlite_c)
    if(NOT TFLITE_INCLUDE_DIR OR NOT TFLITE_LIB)
        message(FATAL_ERROR "TensorFlow Lite not found. Please install or set TFLITE_INCLUDE_DIR and TFLITE_LIB")
    endif()
    add_compile_definitions(USE_TENSORFLOW_LITE)
    message(STATUS "Using TensorFlow Lite for computer vision")
    
elseif(USE_ONNX_RUNTIME)
    find_path(ONNX_INCLUDE_DIR onnxruntime_cxx_api.h)
    find_library(ONNX_LIB onnxruntime)
    if(NOT ONNX_INCLUDE_DIR OR NOT ONNX_LIB)
        message(FATAL_ERROR "ONNX Runtime not found. Please install or set ONNX_INCLUDE_DIR and ONNX_LIB")
    endif()
    add_compile_definitions(USE_ONNX_RUNTIME)
    message(STATUS "Using ONNX Runtime for computer vision")
    
elseif(USE_OPENVINO)
    find_package(InferenceEngine QUIET)
    if(NOT InferenceEngine_FOUND)
        find_path(OPENVINO_INCLUDE_DIR inference_engine.hpp)
        find_library(OPENVINO_LIB inference_engine)
        if(NOT OPENVINO_INCLUDE_DIR OR NOT OPENVINO_LIB)
            message(FATAL_ERROR "Intel OpenVINO not found. Please install OpenVINO toolkit")
        endif()
    endif()
    add_compile_definitions(USE_OPENVINO)
    message(STATUS "Using Intel OpenVINO for computer vision")
    
else()
    add_compile_definitions(USE_CUSTOM_CV)
    message(STATUS "Using custom GStreamer elements for computer vision")
endif()

# Optional features
option(ENABLE_TESTING "Enable unit testing" OFF)
option(ENABLE_BENCHMARKING "Enable performance benchmarking" OFF)
option(ENABLE_COVERAGE "Enable code coverage" OFF)
option(ENABLE_SANITIZERS "Enable runtime sanitizers" OFF)
option(ENABLE_PROMETHEUS "Enable Prometheus metrics" OFF)

# Testing framework
if(ENABLE_TESTING)
    find_package(GTest QUIET)
    if(NOT GTest_FOUND)
        include(FetchContent)
        FetchContent_Declare(
            googletest
            GIT_REPOSITORY https://github.com/google/googletest.git
            GIT_TAG release-1.12.1
        )
        FetchContent_MakeAvailable(googletest)
    endif()
    enable_testing()
endif()

# Benchmarking framework
if(ENABLE_BENCHMARKING)
    find_package(benchmark QUIET)
    if(NOT benchmark_FOUND)
        include(FetchContent)
        FetchContent_Declare(
            benchmark
            GIT_REPOSITORY https://github.com/google/benchmark.git
            GIT_TAG v1.8.0
        )
        FetchContent_MakeAvailable(benchmark)
    endif()
endif()

# Prometheus C++ client
if(ENABLE_PROMETHEUS)
    find_package(prometheus-cpp QUIET)
    if(NOT prometheus-cpp_FOUND)
        message(WARNING "Prometheus C++ client not found, metrics will be disabled")
        set(ENABLE_PROMETHEUS OFF)
    else()
        add_compile_definitions(ENABLE_PROMETHEUS)
    endif()
endif()

# Include directories
include_directories(
    ${CMAKE_SOURCE_DIR}/include
    ${GSTREAMER_INCLUDE_DIRS}
)

# Source files
set(CORE_SOURCES
    src/main.cpp
    src/stream_manager.cpp
    src/gstreamer_pipeline.cpp
    src/mqtt_client.cpp
    src/cv_processor.cpp
    src/kvs_integration.cpp
    src/utils/logger.cpp
    src/utils/config.cpp
    src/utils/metrics.cpp
)

# Create main executable
add_executable(${PROJECT_NAME} ${CORE_SOURCES})

# Set target properties
set_target_properties(${PROJECT_NAME} PROPERTIES
    CXX_STANDARD 17
    CXX_STANDARD_REQUIRED ON
    CXX_EXTENSIONS OFF
)

# Compiler definitions
target_compile_definitions(${PROJECT_NAME} PRIVATE
    ${GSTREAMER_CFLAGS_OTHER}
    PROJECT_VERSION="${PROJECT_VERSION}"
    PROJECT_NAME="${PROJECT_NAME}"
)

# Link libraries - Core dependencies
target_link_libraries(${PROJECT_NAME} PRIVATE
    ${GSTREAMER_LIBRARIES}
    nlohmann_json::nlohmann_json
    spdlog::spdlog
    Threads::Threads
)

# MQTT library linking
if(USE_MOSQUITTO_C)
    target_link_libraries(${PROJECT_NAME} PRIVATE ${MOSQUITTO_LIB})
    target_include_directories(${PROJECT_NAME} PRIVATE ${MOSQUITTO_INCLUDE_DIR})
    add_compile_definitions(USE_MOSQUITTO_C)
else()
    target_link_libraries(${PROJECT_NAME} PRIVATE ${MOSQUITTO_CPP_LIB})
    target_include_directories(${PROJECT_NAME} PRIVATE ${MOSQUITTO_CPP_INCLUDE_DIR})
endif()

# AWS SDK linking
if(USE_BUNDLED_AWS_SDK)
    # Add bundled AWS SDK
    add_subdirectory(third_party/aws-sdk-cpp EXCLUDE_FROM_ALL)
    target_link_libraries(${PROJECT_NAME} PRIVATE 
        aws-cpp-sdk-core
        aws-cpp-sdk-kinesisvideo
        aws-cpp-sdk-kinesis-video-webrtc-storage
    )
else()
    target_link_libraries(${PROJECT_NAME} PRIVATE
        aws-cpp-sdk-core
        aws-cpp-sdk-kinesisvideo
        aws-cpp-sdk-kinesis-video-webrtc-storage
    )
endif()

# Computer Vision framework linking
if(USE_OPENCV)
    target_link_libraries(${PROJECT_NAME} PRIVATE ${OpenCV_LIBS})
    target_include_directories(${PROJECT_NAME} PRIVATE ${OpenCV_INCLUDE_DIRS})
    
elseif(USE_TENSORFLOW_LITE)
    target_link_libraries(${PROJECT_NAME} PRIVATE ${TFLITE_LIB})
    target_include_directories(${PROJECT_NAME} PRIVATE ${TFLITE_INCLUDE_DIR})
    
elseif(USE_ONNX_RUNTIME)
    target_link_libraries(${PROJECT_NAME} PRIVATE ${ONNX_LIB})
    target_include_directories(${PROJECT_NAME} PRIVATE ${ONNX_INCLUDE_DIR})
    
elseif(USE_OPENVINO)
    if(InferenceEngine_FOUND)
        target_link_libraries(${PROJECT_NAME} PRIVATE ${InferenceEngine_LIBRARIES})
        target_include_directories(${PROJECT_NAME} PRIVATE ${InferenceEngine_INCLUDE_DIRS})
    else()
        target_link_libraries(${PROJECT_NAME} PRIVATE ${OPENVINO_LIB})
        target_include_directories(${PROJECT_NAME} PRIVATE ${OPENVINO_INCLUDE_DIR})
    endif()
endif()

# Prometheus metrics (optional)
if(ENABLE_PROMETHEUS)
    target_link_libraries(${PROJECT_NAME} PRIVATE prometheus-cpp::prometheus-cpp)
endif()

# Sanitizers (Debug builds only)
if(ENABLE_SANITIZERS AND CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(${PROJECT_NAME} PRIVATE 
        -fsanitize=address,undefined
        -fno-omit-frame-pointer
    )
    target_link_options(${PROJECT_NAME} PRIVATE 
        -fsanitize=address,undefined
    )
endif()

# Code coverage (Debug builds only)
if(ENABLE_COVERAGE AND CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(${PROJECT_NAME} PRIVATE --coverage)
    target_link_options(${PROJECT_NAME} PRIVATE --coverage)
    
    # Add coverage target
    find_program(GCOV_PATH gcov)
    find_program(LCOV_PATH lcov)
    find_program(GENHTML_PATH genhtml)
    
    if(GCOV_PATH AND LCOV_PATH AND GENHTML_PATH)
        add_custom_target(coverage
            COMMAND ${LCOV_PATH} --directory . --capture --output-file coverage.info
            COMMAND ${LCOV_PATH} --remove coverage.info '/usr/*' --output-file coverage.info
            COMMAND ${LCOV_PATH} --list coverage.info
            COMMAND ${GENHTML_PATH} -o coverage coverage.info
            WORKING_DIRECTORY ${CMAKE_BINARY_DIR}
            COMMENT "Generating code coverage report"
        )
    endif()
endif()

# Installation
include(GNUInstallDirs)

install(TARGETS ${PROJECT_NAME}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

install(FILES 
    config/default_config.json
    config/production_config.json
    DESTINATION ${CMAKE_INSTALL_SYSCONFDIR}/${PROJECT_NAME}
)

install(DIRECTORY docs/
    DESTINATION ${CMAKE_INSTALL_DOCDIR}
    FILES_MATCHING PATTERN "*.md"
)

# Testing
if(ENABLE_TESTING)
    add_subdirectory(tests)
endif()

# Benchmarking
if(ENABLE_BENCHMARKING)
    add_executable(${PROJECT_NAME}_benchmark tests/performance_tests.cpp)
    target_link_libraries(${PROJECT_NAME}_benchmark PRIVATE 
        benchmark::benchmark
        ${PROJECT_NAME}_lib  # We'll need to create a library target
    )
endif()

# Package configuration
set(CPACK_PACKAGE_NAME ${PROJECT_NAME})
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY ${PROJECT_DESCRIPTION})
set(CPACK_PACKAGE_VENDOR "Your Organization")
set(CPACK_PACKAGE_CONTACT "your.email@example.com")
set(CPACK_GENERATOR "TGZ;DEB;RPM")

include(CPack)

# Configuration summary
message(STATUS "")
message(STATUS "=== Configuration Summary ===")
message(STATUS "Project: ${PROJECT_NAME} v${PROJECT_VERSION}")
message(STATUS "Build Type: ${CMAKE_BUILD_TYPE}")
message(STATUS "C++ Standard: C++${CMAKE_CXX_STANDARD}")
message(STATUS "Compiler: ${CMAKE_CXX_COMPILER_ID} ${CMAKE_CXX_COMPILER_VERSION}")
message(STATUS "Install Prefix: ${CMAKE_INSTALL_PREFIX}")
message(STATUS "")
message(STATUS "=== Dependencies ===")
message(STATUS "GStreamer: ${GSTREAMER_VERSION}")
message(STATUS "nlohmann/json: Found")
message(STATUS "spdlog: Found")
if(USE_MOSQUITTO_C)
    message(STATUS "MQTT: Mosquitto C library")
else()
    message(STATUS "MQTT: Mosquitto C++ library")
endif()
if(USE_BUNDLED_AWS_SDK)
    message(STATUS "AWS SDK: Bundled version")
else()
    message(STATUS "AWS SDK: System installation")
endif()
message(STATUS "")
message(STATUS "=== Computer Vision ===")
if(USE_OPENCV)
    message(STATUS "Framework: OpenCV ${OpenCV_VERSION}")
elseif(USE_TENSORFLOW_LITE)
    message(STATUS "Framework: TensorFlow Lite")
elseif(USE_ONNX_RUNTIME)
    message(STATUS "Framework: ONNX Runtime")
elseif(USE_OPENVINO)
    message(STATUS "Framework: Intel OpenVINO")
else()
    message(STATUS "Framework: Custom GStreamer Elements")
endif()
message(STATUS "")
message(STATUS "=== Optional Features ===")
message(STATUS "Testing: ${ENABLE_TESTING}")
message(STATUS "Benchmarking: ${ENABLE_BENCHMARKING}")
message(STATUS "Coverage: ${ENABLE_COVERAGE}")
message(STATUS "Sanitizers: ${ENABLE_SANITIZERS}")
message(STATUS "Prometheus: ${ENABLE_PROMETHEUS}")
message(STATUS "")

# Warnings for missing dependencies
if(NOT MOSQUITTO_CPP_LIB AND NOT MOSQUITTO_LIB)
    message(WARNING "Neither Mosquitto C++ nor C library found. MQTT functionality will be disabled.")
endif()

if(USE_BUNDLED_AWS_SDK AND NOT EXISTS "${CMAKE_SOURCE_DIR}/third_party/aws-sdk-cpp")
    message(WARNING "AWS SDK not found. Please run: git submodule update --init --recursive")
endif()
