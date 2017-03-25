cursor_wait = function()
{
  // switch to cursor wait for the current element over
  var elements = $(':hover');
  if (elements.length)
  {
    // get the last element which is the one on top
    elements.last().addClass('cursor-wait');
  }
  // use .off() and a unique event name to avoid duplicates
  $('html').
  off('mouseover.cursorwait').
  on('mouseover.cursorwait', function(e)
  {
    // switch to cursor wait for all elements you'll be over
    $(e.target).addClass('cursor-wait');
  });
}

remove_cursor_wait = function()
{
  $('html').off('mouseover.cursorwait'); // remove event handler
  $('.cursor-wait').removeClass('cursor-wait'); // get back to default
};