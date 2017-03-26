function listenForSSE () {

    // Get the current notifications for this user
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url: "/api/notifications",
            data: {},
            success: function (result) {
                if (result.length === 0) return;

                result.forEach( function(result ){
                    $("#notification-list").append(generateNotification(result));
                });

                var notificationCount = $("#notification-count");
                if (result.length > 0) {
                    notificationCount.addClass("notification-icon");
                } else {
                    notificationCount.removeClass("notification-icon");
                }
                notificationCount.attr("data-count", result.length, 10);


            },
            error: function (error) {
                alert("Unable get notifications");
            }
        });
    });

    // Listen for events from the server
    if (!!window.EventSource) {
        var source = new EventSource("/stream")

        // Remove the notification when pulldown shown
        $(".dropdown").on("show.bs.dropdown", function () {
            var notificationCount = $("#notification-count");
            notificationCount.removeClass("notification-icon");
            notificationCount.attr("data-count", 0);
        });

        source.addEventListener("message", function (e) {
            var data = JSON.parse(e.data);

            // Skip ping messages
            if (data.type == "ping") {
                return;
            }

            $.notify({
                icon: data.icon,
                title: data.title,
                message: data.message,
            }, {
                type: "minimalist",
                delay: 6000,
                icon_type: "image",
                offset: { x: 10, y: 70 },
                template: "<div data-notify=\"container\" class=\"col-xs-11 col-sm-3 alert alert-{0}\" role=\"alert\">" +
                "<img data-notify=\"icon\" class=\"img-circle pull-left\">" +
                "<span data-notify=\"title\">{1}</span>" +
                "<span data-notify=\"message\">{2}</span>" +
                "</div>"
            });

            // Update the menu items
            var notificationCount = $("#notification-count");
            console.log(notificationCount.attr("data-count"));
            if (notificationCount.attr("data-count") > 0) {
                notificationCount.addClass("notification-icon");
            } else {
                notificationCount.removeClass("notification-icon");
            }
            notificationCount.attr("data-count", parseInt(notificationCount.attr("data-count"), 10) + 1);
            $("#notification-list").append(generateNotification(data));
        }, false)

        source.addEventListener("open", function (e) {
            console.log("connected");
        }, false)

        source.addEventListener("error", function (e) {
            if (e.target.readyState === EventSource.CLOSED) {
                console.log("disconnected");
            }
            else if (e.target.readyState === EventSource.CONNECTING) {
                console.log("connecting");
            }
        }, false)
    } else {
        console.log("Your browser doesn't support SSE")
    }
}

function generateNotification (data) {
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
          <small class="timestamp">' + data.time + '</small> \
        </div> \
      </div> \
      </div> \
      </li>';

    return html;
}