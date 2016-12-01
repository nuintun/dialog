var popup;
var follow = document.getElementById('follow');
var modal = document.getElementById('modal');
var remove = document.getElementById('remove');

function create() {
  var dialog = new Dialog();

  dialog.innerHTML = '<div class="ui-dialog-content"><span>hello, world</span><a class="button ui-close">关闭</a></div>';

  dialog.addEventListener('focus', function() {
    console.log('focus');
  });

  dialog.addEventListener('blur', function() {
    console.log('blur');
  });

  dialog.addEventListener('show', function() {
    console.log('show');
  });

  dialog.addEventListener('beforeclose', function() {
    console.log('beforeclose');
  });

  dialog.addEventListener('close', function() {
    console.log('close');

    if (remove.checked) {
      dialog.remove();

      popup = null;
    }
  });

  dialog.addEventListener('beforeremove', function() {
    console.log('beforeremove');
  });

  dialog.addEventListener('remove', function() {
    console.log('remove');
  });

  $(dialog.node).on('click', '.ui-close', function() {
    dialog.close();
  });

  return dialog;
}

$('#button').on('click', function() {
  popup = popup || create();

  if (!follow.checked) {
    if (!modal.checked) {
      popup.show();
    } else {
      popup.showModal();
    }
  } else {
    if (!modal.checked) {
      popup.show(this);
    } else {
      popup.showModal(this);
    }
  }
});
