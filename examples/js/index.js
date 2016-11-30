function create() {
  var dialog = new Dialog();

  dialog.innerHTML = '<div class="ui-dialog-content">hello, world</div>';

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
    dialog.remove();
  });

  dialog.addEventListener('beforeremove', function() {
    console.log('beforeremove');
  });

  dialog.addEventListener('remove', function() {
    console.log('remove');
  });

  dialog.node.onclick = function() {
    dialog.close();
  };

  return dialog;
}

var follow = document.getElementById('follow');
var modal = document.getElementById('modal');

document.getElementById('button').onclick = function() {
  var dialog = create();

  if (!follow.checked) {
    if (!modal.checked) {
      dialog.show();
    } else {
      dialog.showModal();
    }
  } else {
    if (!modal.checked) {
      dialog.show(this);
    } else {
      dialog.showModal(this);
    }
  }
};
