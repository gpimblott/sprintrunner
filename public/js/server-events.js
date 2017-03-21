function listenForSSE () {

  if (!!window.EventSource) {
    var source = new EventSource('/stream')

    source.addEventListener('message', function (e) {
      var data = JSON.parse(e.data);

      // Skip ping messages
      if( data.type == 'ping') {
        return;
      }

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

      // Update the menubar to include the new event and show the count
      var html = '<li class="notification"> \
      <div class="media"> \
        <div class="media-left"> \
          <div class="media-object"> \
            <img data-src="{{this.icon}}" src="' + data.icon + '" class="img-circle" alt="Name"> \
          </div> \
        </div> \
        <div class="media-body"> \
          <strong class="notification-title">' + data.title + '</a></strong> \
          <p class="notification-desc">' + data.message + '</p> \
        <div class="notification-meta"> \
          <small class="timestamp">27. 11. 2015, 15:00</small> \
        </div> \
      </div> \
      </div> \
      </li>';

      // Update the menu items
      $('#notification-list').append(html);
      $('#notification-count').attr('data-count' , parseInt($('#notification-count').attr('data-count') , 10 )+1 );

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