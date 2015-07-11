$(document).ready(function() {

  'use strict';

  $(window).on('action:ajaxify.contentLoaded', function(ev, data) {
    if(data.tpl === 'account/edit') {
      custom();
    }
  });

  function custom() {
    var uid = ajaxify.variables.get('theirid');
    getUserInvitationCode(uid, function(err, code) {
      if(err) {
        app.alertError(err.message);
      } else {
        injectInvitationField(code);
      }
    });
  }

  function injectInvitationField(code) {
    var $image = $('.account-picture-block');
    var html = '';
    if(code) {
      html = '<div class="qc-invitation-code">' +
             '<label>Invitation Code</label>' +
             '<div style="font-style:italic;color:#777">' + code + '</div>' +
             '</div>';
    } else {
      html = '<div class="qc-invitation-code">' +
             '<form class="form-horizontal">' +
             '<div class="control-group">' +
             '<label class="control-label" for="inviation_code_field">' +
             'Invitation Code</label>' +
             '<div class="controls" style="width:60%;margin:0 auto;">' +
             '<input class="form-control" id="inviation_code_field" name="code">' +
             '</div></div><br>' +
             '<div class="form-actions">' +
             '<a class="btn btn-primary" href="#">Save Fields</a>' +
             '</div></form></div>';
    }
    $image.after(html);
    bindEvents();
  }

  function bindEvents() {
    $('.qc-invitation-code .btn-primary').on('click', function(e) {
      var code = $.trim($('#inviation_code_field').val());
      if(code.length === 0) {
        app.alerError('Please fill the invitation code');
        return;
      }
      var uid = ajaxify.variables.get('theirid');
      registerInvitationCode(uid, code, function(err) {
        if(err) {
          app.alertError(err.message);
        } else {
          app.alertSuccess('Register Inviation Code Success');
          setTimeout(function() {
            location.reload(true);
          }, 2000);
        }
      });
    });
  }

  function getUserInvitationCode(uid, callback) {
    socket.emit('plugins.invitation_code.usercode', {uid: uid}, callback);
  }

  function registerInvitationCode(uid, code, callback) {
    socket.emit('plugins.invitation_code.register',
      {uid: uid, code: code}, callback);
  }

});