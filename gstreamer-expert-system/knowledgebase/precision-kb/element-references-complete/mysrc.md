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
    pipeline2->setState(QGst::StateNull);
}
void Player::onBusMessage(const QGst::MessagePtr & message)
{
    switch (message->type()) {
    case QGst::MessageEos:
--

**Second Pipeline**

``` c
    /* sink pipeline */
    QString pipe2Descr = QString("appsrc name=\"mysrc\" caps=\"%1\" ! autoaudiosink").arg(caps);
    pipeline2 = QGst::Parse::launch(pipe2Descr).dynamicCast<QGst::Pipeline>();
    m_src.setElement(pipeline2->getElementByName("mysrc"));
    QGlib::connect(pipeline2->bus(), "message", this, &Player::onBusMessage);
    pipeline2->bus()->addSignalWatch();
```

Finally, the pipeline is started:

**Starting the pipeline**

``` c
 /* start playing */
    pipeline1->setState(QGst::StatePlaying);
    pipeline2->setState(QGst::StatePlaying);
```

Once the pipelines are started, the first one begins pushing buffers
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
    pipeline2->setState(QGst::StateNull);
}
void Player::onBusMessage(const QGst::MessagePtr & message)
{
    switch (message->type()) {
    case QGst::MessageEos:
--

**Second Pipeline**

``` c
    /* sink pipeline */
    QString pipe2Descr = QString("appsrc name=\"mysrc\" caps=\"%1\" ! autoaudiosink").arg(caps);
    pipeline2 = QGst::Parse::launch(pipe2Descr).dynamicCast<QGst::Pipeline>();
    m_src.setElement(pipeline2->getElementByName("mysrc"));
    QGlib::connect(pipeline2->bus(), "message", this, &Player::onBusMessage);
    pipeline2->bus()->addSignalWatch();
```

Finally, the pipeline is started:

**Starting the pipeline**

``` c
 /* start playing */
    pipeline1->setState(QGst::StatePlaying);
    pipeline2->setState(QGst::StatePlaying);
```

Once the pipelines are started, the first one begins pushing buffers

---

