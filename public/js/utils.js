

function unlockForm () {
  if( $("#editButton").text()=='Edit' ) {
    $("#formFieldSet").removeAttr('disabled');
    $("#updateButton").css({ display: "block" });

    $("#editButton").text('Lock');
  } else {
    $("#formFieldSet").prop('disabled', true);
    $("#updateButton").css({ display: "none" });

    $("#editButton").text('Edit');
  }
};

