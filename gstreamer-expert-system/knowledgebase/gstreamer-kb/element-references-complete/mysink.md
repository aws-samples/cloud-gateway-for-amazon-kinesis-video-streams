    /* source pipeline */
    QString pipe1Descr = QString("filesrc location=\"%1\" ! "
                                 "decodebin2 ! "
                                 "audioconvert ! "
                                 "audioresample ! "
                                 "appsink name=\"mysink\" caps=\"%2\"").arg(argv[1], caps);
    pipeline1 = QGst::Parse::launch(pipe1Descr).dynamicCast<QGst::Pipeline>();
    m_sink.setElement(pipeline1->getElementByName("mysink"));
    QGlib::connect(pipeline1->bus(), "message::error", this, &Player::onBusMessage);
    pipeline1->bus()->addSignalWatch();
    /* sink pipeline */
    QString pipe2Descr = QString("appsrc name=\"mysrc\" caps=\"%1\" ! autoaudiosink").arg(caps);
    pipeline2 = QGst::Parse::launch(pipe2Descr).dynamicCast<QGst::Pipeline>();
    m_src.setElement(pipeline2->getElementByName("mysrc"));
    QGlib::connect(pipeline2->bus(), "message", this, &Player::onBusMessage);
    pipeline2->bus()->addSignalWatch();
    /* start playing */
    pipeline1->setState(QGst::StatePlaying);
    pipeline2->setState(QGst::StatePlaying);
}
Player::~Player()
{
    pipeline1->setState(QGst::StateNull);
--
    /* source pipeline */
    QString pipe1Descr = QString("filesrc location=\"%1\" ! "
                                 "decodebin2 ! "
                                 "audioconvert ! "
                                 "audioresample ! "
                                 "appsink name=\"mysink\" caps=\"%2\"").arg(argv[1], caps);
    pipeline1 = QGst::Parse::launch(pipe1Descr).dynamicCast<QGst::Pipeline>();
    m_sink.setElement(pipeline1->getElementByName("mysink"));
    QGlib::connect(pipeline1->bus(), "message::error", this, &Player::onBusMessage);
    pipeline1->bus()->addSignalWatch();
```

`QGst::Parse::launch()` parses the text description of a pipeline and
returns a `QGst::PipelinePtr`. In this case, the pipeline is composed
of:

  - A `filesrc` element to read the file
  - `decodebin2` to automatically examine the stream and pick the right
    decoder(s)
  - `audioconvert` and `audioresample` to convert the output of the
    `decodebin2` into the caps specified for the `appsink`
  - An `appsink` element with specific caps

    /* source pipeline */
    QString pipe1Descr = QString("filesrc location=\"%1\" ! "
                                 "decodebin2 ! "
                                 "audioconvert ! "
                                 "audioresample ! "
                                 "appsink name=\"mysink\" caps=\"%2\"").arg(argv[1], caps);
    pipeline1 = QGst::Parse::launch(pipe1Descr).dynamicCast<QGst::Pipeline>();
    m_sink.setElement(pipeline1->getElementByName("mysink"));
    QGlib::connect(pipeline1->bus(), "message::error", this, &Player::onBusMessage);
    pipeline1->bus()->addSignalWatch();
    /* sink pipeline */
    QString pipe2Descr = QString("appsrc name=\"mysrc\" caps=\"%1\" ! autoaudiosink").arg(caps);
    pipeline2 = QGst::Parse::launch(pipe2Descr).dynamicCast<QGst::Pipeline>();
    m_src.setElement(pipeline2->getElementByName("mysrc"));
    QGlib::connect(pipeline2->bus(), "message", this, &Player::onBusMessage);
    pipeline2->bus()->addSignalWatch();
    /* start playing */
    pipeline1->setState(QGst::StatePlaying);
    pipeline2->setState(QGst::StatePlaying);
}
Player::~Player()
{
    pipeline1->setState(QGst::StateNull);
--
    /* source pipeline */
    QString pipe1Descr = QString("filesrc location=\"%1\" ! "
                                 "decodebin2 ! "
                                 "audioconvert ! "
                                 "audioresample ! "
                                 "appsink name=\"mysink\" caps=\"%2\"").arg(argv[1], caps);
    pipeline1 = QGst::Parse::launch(pipe1Descr).dynamicCast<QGst::Pipeline>();
    m_sink.setElement(pipeline1->getElementByName("mysink"));
    QGlib::connect(pipeline1->bus(), "message::error", this, &Player::onBusMessage);
    pipeline1->bus()->addSignalWatch();
```

`QGst::Parse::launch()` parses the text description of a pipeline and
returns a `QGst::PipelinePtr`. In this case, the pipeline is composed
of:

  - A `filesrc` element to read the file
  - `decodebin2` to automatically examine the stream and pick the right
    decoder(s)
  - `audioconvert` and `audioresample` to convert the output of the
    `decodebin2` into the caps specified for the `appsink`
  - An `appsink` element with specific caps


---

