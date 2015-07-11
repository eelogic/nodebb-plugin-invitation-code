(function() {

  'use strict';

  var INVIATION_CODE_LIMIT = 10;

  function renderBody(codes) {
    var $body = $('#invitation-code-table tbody');
    var trs = [];
    var arr, dispatched, email;
    for(var code in codes) {
      arr = codes[code].split(',');
      dispatched = arr[0];
      email = arr[1] === '0' ? '' : arr[1];
      trs.push('<tr><td><input type="checkbox" /></td>' +
        '<td>' + code + '</td>' +
        '<td>' + dispatched + '</td>' +
        '<td>' + email + '</td>');
    }
    $body.html(trs.join(''));
  }

  function renderPagination(start, pagenum, total) {
    var $pagination = $('#invitation-code-pagination');
    if(total > pagenum) {
      var cur_page = Math.floor(start / pagenum) + 1;
      var total_page = Math.ceil(total / pagenum);
      var has_prev = cur_page > 1;
      var has_next = total_page > cur_page;
      $pagination.find('.total-num').html(total);
      $pagination.find('.cur-page').html(cur_page);
      $pagination.find('.total-page').html(total_page);
      if(has_prev) {
        $pagination.find('.btn-prev')
          .removeClass('btn-forbidden').addClass('btn-primary');
      } else {
        $pagination.find('.btn-prev')
          .addClass('btn-forbidden').removeClass('btn-primary');
      }
      if(has_next) {
        $pagination.find('.btn-next')
          .removeClass('btn-forbidden').addClass('btn-primary');
      } else {
        $pagination.find('.btn-next')
          .addClass('btn-forbidden').removeClass('btn-primary');
      }
      $pagination.show();
    } else {
      $pagination.hide();
    }
  }

  function renderTable(offset, limit) {
    offset = offset || 0;
    limit = limit || INVIATION_CODE_LIMIT;
    fetchCodes(offset, limit, function(err, data) {
      if(!err) {
        renderBody(data.codes);
        renderPagination(offset, limit, data.total);
        initSelector();
      } else {
        app.alertError(err.message);
      }
    });
  }

  function initSelector() {
    $('#invitation-code-table thead input').prop('checked', false);
  }

  $('#add-invitation-code').on('click', function() {
    var num = prompt('Invitatino Code Number');
    addCodes(num, function(err, codes, total) {
      if(!err) {
        app.alertSuccess('Add Invitation Code Success');
        renderTable();
      } else {
        app.alertError(err.message);
      }
    });
  });

  $('#refresh-invitation-code').on('click', function() {
    renderTable();
  });

  $('#invitation-code-pagination .btn').on('click', function(e) {
    var $target = $(e.target);
    if(!$target.hasClass('btn')) {
      $target = $target.parent();
    }
    if($target.hasClass('btn-forbidden')) {
      return;
    }
    var cur_page = parseInt($('#invitation-code-pagination .cur-page').html(), 10);
    var dir = $target.hasClass('btn-prev') ?
      -INVIATION_CODE_LIMIT : INVIATION_CODE_LIMIT;
    renderTable((cur_page - 1) * INVIATION_CODE_LIMIT + dir, INVIATION_CODE_LIMIT);
  });

  $('#invitation-code-table thead input').on('click', function(e) {
    var checked = $(e.target).prop('checked');
    $('#invitation-code-table tbody input').prop('checked', checked);
    updateDeleteBtn();
  });

  $('#invitation-code-table').delegate('tbody input', 'click', function(e) {
    var total_len = $('#invitation-code-table tbody input').length;
    var checked_len = $('#invitation-code-table tbody input:checked').length;
    $('#invitation-code-table thead input')
      .prop('checked', total_len === checked_len);
    updateDeleteBtn();
  });

  function updateDeleteBtn() {
    var checked_len = $('#invitation-code-table tbody input:checked').length;
    if(checked_len > 0) {
      $('#del-invitation-code').removeClass('btn-forbidden').addClass('btn-primary');
    } else {
      $('#del-invitation-code').addClass('btn-forbidden').removeClass('btn-primary');
    }
  }

  $('#dispatch-invitation-code').on('click', function(e) {
    var ret = confirm('Do you want to mark these invitation codes dispatched ?');
    if(ret) {
      var codes = getSelectCodes();
      dispatchCodes(codes, function(err, data) {
        if(!err) {
          app.alertSuccess('Dispatch Invitaion Codes Success');
          renderTable();
        } else {
          app.alertError(err.message);
        }
      });
    }
  });

  $('#del-invitation-code').on('click', function(e) {
    var ret = confirm('Are you sure you want to delete these invitation codes ?');
    if(ret) {
      var codes = getSelectCodes();
      deleteCodes(codes, function(err, data) {
        if(!err) {
          app.alertSuccess('Delete Invitaion Codes Success');
          renderTable();
        } else {
          app.alertError(err.message);
        }
      });
    }
  });

  function getSelectCodes() {
    var $trs = $('#invitation-code-table tbody tr');
    var codes = [];
    for(var i = 0, len = $trs.length, $tr; i < len; i++) {
      $tr = $($trs[i]);
      if($tr.find('input').is(':checked')) {
        codes.push($tr.find('td:nth-child(2)').html());
      }
    }
    return codes;
  }

  function fetchCodes(offset, limit, callback) {
    var params = {offset: offset, limit: limit};
    socket.emit('plugins.invitation_code.get', params, callback);
  }

  function addCodes(num, callback) {
    socket.emit('plugins.invitation_code.add', {num: num}, callback);
  }

  function dispatchCodes(codes, callback) {
    socket.emit('plugins.invitation_code.dispatch', {codes: codes}, callback);
  }

  function deleteCodes(codes, callback) {
    socket.emit('plugins.invitation_code.del', {codes: codes}, callback);
  }

  $(document).ready(function() {
    $(window).on('action:ajaxify.end', function(event, data) {
      renderTable();
    });
  });

})();
