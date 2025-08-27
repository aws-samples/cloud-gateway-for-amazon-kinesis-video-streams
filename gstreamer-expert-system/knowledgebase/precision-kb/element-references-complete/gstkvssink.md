  pkg_check_modules(GST_APP REQUIRED gstreamer-app-1.0)
  include_directories(${GST_APP_INCLUDE_DIRS})
  link_directories(${GST_APP_LIBRARY_DIRS})

  if(BUILD_STATIC)
    add_library(gstkvssink STATIC ${GST_PLUGIN_SOURCE_FILES})
  else()
    add_library(gstkvssink MODULE ${GST_PLUGIN_SOURCE_FILES})
  endif()
  target_link_libraries(gstkvssink PRIVATE ${GST_APP_LIBRARIES} KinesisVideoProducer)

  add_executable(kvssink_gstreamer_sample samples/kvssink_gstreamer_sample.cpp)
  target_link_libraries(kvssink_gstreamer_sample ${GST_APP_LIBRARIES} KinesisVideoProducer)

  add_executable(kvssink_intermittent_sample samples/kvssink_intermittent_sample.cpp )
  target_link_libraries(kvssink_intermittent_sample ${GST_APP_LIBRARIES} KinesisVideoProducer)

  add_executable(kvs_gstreamer_sample samples/kvs_gstreamer_sample.cpp)
  target_link_libraries(kvs_gstreamer_sample ${GST_APP_LIBRARIES} KinesisVideoProducer kvspic)

  add_executable(kvs_gstreamer_multistream_sample samples/kvs_gstreamer_multistream_sample.cpp)
  target_link_libraries(kvs_gstreamer_multistream_sample ${GST_APP_LIBRARIES} KinesisVideoProducer)

  add_executable(kvs_gstreamer_audio_video_sample samples/kvs_gstreamer_audio_video_sample.cpp)
  target_link_libraries(kvs_gstreamer_audio_video_sample ${GST_APP_LIBRARIES} KinesisVideoProducer)

---

