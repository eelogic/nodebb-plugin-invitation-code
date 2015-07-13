(function() {

  'use strict';

  var plugin = {};
  var Invitation = require('./lib/invitation');
  var Sockets = module.parent.require('./socket.io/plugins');
  var meta = module.parent.require('./meta');

  function addCodes(socket, data, callback) {
    var num = data && data.num || 0;
    Invitation.createNewCodes(num, callback);
  }

  function getCodes(socket, data, callback) {
    Invitation.fetchCodes(data.offset, data.limit, callback);
  }

  function delCodes(socket, data, callback) {
    Invitation.delCodes(data.codes, callback);
  }

  function getUserCode(socket, data, callback) {
    Invitation.getUserCode(data.uid, callback);
  }

  function dispatchCodes(socket, data, callback) {
    Invitation.dispatchCodes(data.codes, callback);
  }

  function registerCode(socket, data, callback) {
    Invitation.registerCode(data.uid, data.code, callback);
  }

  function renderAdmin(req, res, next) {
    res.render('admin/invitation-code', {});
  }

  function initSocket() {
    Sockets.invitation_code = {
      add: addCodes,
      get: getCodes,
      del: delCodes,
      usercode: getUserCode,
      dispatch: dispatchCodes,
      register: registerCode
    };
  }

  plugin.init = function(params, callback) {
    var app = params.router;
    var middleware = params.middleware;

    app.get('/admin/plugins/invitation-code',
      middleware.admin.buildHeader, renderAdmin);
    app.get('/api/admin/plugins/invitation-code', renderAdmin);

    callback();
    initSocket();
  };

  plugin.addAdminNavigation = function(header, callback) {
    header.plugins.push({
      route: '/plugins/invitation-code',
      icon: 'fa-check',
      name: 'Invitation Codes'
    });

    callback(null, header);
  };

  module.exports = plugin;

})();
