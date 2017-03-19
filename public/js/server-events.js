function listenForSSE () {

  if (!!window.EventSource) {
    var source = new EventSource('/stream')

    source.addEventListener('message', function (e) {
      var data = JSON.parse(e.data);
      console.log(data);
      $.notify({
        icon: data.icon,
        title: data.title,
        message: data.message,
      }, {
        type: 'minimalist',
        delay: 6000,
        icon_type: 'image',
        offset: { x: 10, y: 70 },
        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
        '<img data-notify="icon" class="img-circle pull-left">' +
        '<span data-notify="title">{1}</span>' +
        '<span data-notify="message">{2}</span>' +
        '</div>'
      });
    }, false)

    source.addEventListener('open', function (e) {
      console.log("connected");
    }, false)

    source.addEventListener('error', function (e) {
      if (e.target.readyState == EventSource.CLOSED) {
        console.log('disconnected');
      }
      else if (e.target.readyState == EventSource.CONNECTING) {
        console.log('connecting');
      }
    }, false)
  } else {
    console.log("Your browser doesn't support SSE")
  }
}