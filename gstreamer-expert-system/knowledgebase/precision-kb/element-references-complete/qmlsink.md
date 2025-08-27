find_package(Qt5Widgets REQUIRED)
find_package(Qt5Qml REQUIRED)
find_package(Qt5Quick REQUIRED)

set (SRC_LIST main.cpp)
qt5_add_resources(RESOURCES qmlsink.qrc)
link_directories(${GSTREAMER_LIBRARY_DIRS})
include_directories (${GSTREAMER_INCLUDE_DIRS})
add_executable(qml-example ${SRC_LIST} ${RESOURCES})
target_link_libraries (qml-example ${GSTREAMER_LIBRARIES})
qt5_use_modules(qml-example Core Widgets Qml Quick)


---

