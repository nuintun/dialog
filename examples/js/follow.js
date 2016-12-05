var dialog;
var __window = $(window);
var follow = $('#follow-elem');
var alignView = $('#test-align-value');

__window.on('resize.dialog', function() {
  dialog && dialog.reset();
});

follow
  .on('click', '[type=radio]', function() {
    if (dialog) {
      dialog.close();
    }

    dialog = new Dialog();

    dialog.addEventListener('close', function() {
      this.remove();
    });

    dialog.innerHTML = '<div class="ui-bubble">' +
      '<div class="ui-bubble-arrow-a"></div>' +
      '<div class="ui-bubble-arrow-b"></div>' +
      '<div class="ui-bubble-content">' +
      'hello, world' +
      '</div>' +
      '</div>';

    var align = $(this).val();

    dialog.align = align;

    dialog.show(follow[0]);
    alignView.html(align);
  })
  .find(':radio:checked')
  .trigger('click');
