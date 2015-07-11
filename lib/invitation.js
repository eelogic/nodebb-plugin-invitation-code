(function(Invitation) {

  /*
   * invitaion_codes are stored in a hash table
   * key is qc:invitation-codes
   * field is the invitation code, and value is structured as 'dispatched,email'
   *
   * user's invitation_code is stored in a hash table
   * key is qc:user-code
   * field is the uid and value is the invitation code
   *
   * it's a redundant structure for speed, and designed for early time of the forum
   * so don't let invitation codes grow too much ( > 10000 )
   */

  'use strict';

  var ancestor = module.parent.parent;
  var User = ancestor.require('./user');
  var Groups = ancestor.require('./groups');
  var db = ancestor.require('./database');
  var _ = ancestor.require('underscore');
  var winston = ancestor.require('winston');

  var utils = {
    random: function(len) {
      var arr = [];
      for(var i = 0; i < len; i++) {
        arr.push(String.fromCharCode(_.random(65, 90)));
      }
      return arr.join('');
    },
    sliceObj: function(obj, offset, limit) {
      var keys = _.keys(obj).sort().slice(offset, offset + limit);
      return _.pick(obj, keys);
    },
    objSize: function(obj) {
      return _.keys(obj).length;
    }
  };

  Invitation.code_key = 'qc:invitation-codes';
  Invitation.user_key = 'qc:user-codes';

  Invitation.fetchCodes = function(offset, limit, callback) {
    if(offset < 0 || limit <= 0) {
      callback(new Error('Invalid parameter offset and limit'));
      return;
    }
    db.getObject(Invitation.code_key, function(err, map) {
      if(err) {
        winston.error('[invitation] Get Invitation Codes Object failed: ' + err);
        callback(new Error('Get Invitation Codes Object failed'));
        return;
      }
      map = map || {};
      callback(null, {
        codes: utils.sliceObj(map, offset, limit),
        total: utils.objSize(map)
      });
    });
  };

  Invitation.createNewCodes = function(num, callback) {
    if(num <= 0) {
      callback(new Error('Invalid number to create: ' + num));
      return;
    }
    db.getObject(Invitation.code_key, function(err, map) {
      if(err) {
        winston.error('[invitation] Get Invitation Codes Object failed: ' + err);
        callback(new Error('Get Invitation Codes Object failed'));
        return;
      }
      map = map || {};
      for(var i = 0, code; i < num; i++) {
        code = utils.random(10);
        if(map[code] === undefined) {
          // dispatched, email
          map[code] = '0,0';
        } else {
          i--;
        }
      }
      db.setObject(Invitation.code_key, map, function(err) {
        if(!err) {
          callback(null, {
            codes: utils.sliceObj(map, 0, 10),
            total: utils.objSize(map)
          });
        } else {
          winston.error('[invitation] Set Invitation Codes Object failed: ' + err);
          callback(new Error('Set Invitation Codes Object failed'));
        }
      });
    });
  };

  Invitation.dispatchCodes = function(codes, callback) {
    if(!codes || codes.length === 0) {
      callback(new Error('Invalid codes to dispatch'));
      return;
    }
    db.getObject(Invitation.code_key, function(err, map) {
      if(err) {
        winston.error('[invitation] Get Invitation Codes Object failed: ' + err);
        callback(new Error('Get Invitation Codes Object failed'));
        return;
      }
      map = map || {};
      for(var i = 0, len = codes.length, code, arr; i < len; i++) {
        code = codes[i];
        if(map[code]) {
          arr = map[code].split(',');
          arr[0] = '1';
          map[code] = arr.join(',');
        }
      }
      db.setObject(Invitation.code_key, map, function(err) {
        if(!err) {
          callback(null);
        } else {
          winston.error('[invitation] Set Invitation Codes Object failed: ' + err);
          callback(new Error('Set Invitation Codes Object failed'));
        }
      });
    });
  };

  Invitation.registerCode = function(uid, code, callback) {
    if(!uid || !code) {
      winston.error('[invitation] Invalid parameters: ' + uid + ', ' + code);
      callback(new Error('Register Invitation Code Failed'));
      return;
    }
    db.getObjectField(Invitation.code_key, code, function(err, value) {
      if(err) {
        winston.error('[invitation] Get Invitation Codes Field failed: ' + err);
        callback(new Error('Get Invitation Codes Field failed'));
        return;
      }
      if(!value) {
        winston.error('[invitation] Given An Invalid Inviation Code: ' + code);
        callback(new Error('Register Invitation Code Failed'));
        return;
      }
      User.getUserField(uid, 'email', function(err, email) {
        if(err) {
          winston.error('[invitation] Get User Email Field Failed: ' + err);
          callback(new Error('Register Invitation Code Failed'));
          return;
        }
        var arr = value.split(',');
        arr[1] = email;
        value = arr.join(',');
        db.setObjectField(Invitation.code_key, code, value, function(err) {
          if(!err) {
            Invitation.setUserCode(uid, code, callback);
          } else {
            winston.error('[invitation] Set Invitation Codes Field failed: ' + err);
            callback(new Error('Register Invitation Code Failed'));
          }
        });
      });
    });
  };

  Invitation.getUserCode = function(uid, callback) {
    if(!uid) {
      winston.error('[invitation] Invalid uid');
      callback(new Error('Get User Invitation Code Failed'));
      return;
    }
    db.getObjectField(Invitation.user_key, uid, function(err, code) {
      if(err) {
        winston.error('[invitation] Get User Invitation Code failed: ' + err);
        callback(new Error('Get User Invitation Codes failed'));
        return;
      }
      callback(null, code);
    });
  };

  Invitation.setUserCode = function(uid, code, callback) {
    if(!uid) {
      winston.error('[invitation] Invalid uid');
      callback(new Error('Register Invitation Code Failed'));
      return;
    }
    db.setObjectField(Invitation.user_key, uid, code, function(err, code) {
      if(err) {
        winston.error('[invitation] Set User Invitation Code failed: ' + err);
        callback(new Error('Register Invitation Code Failed'));
        return;
      }
      Groups.join('invited', uid, function(err) {
        if(err) {
          winston.error('[invitation] Join group failed: ' + err);
          callback(new Error('Register Invitation Code Failed'));
          return;
        }
        callback(null);
      });
    });
  };

  Invitation.delCodes = function(codes, callback) {
    if(!codes || codes.length === 0) {
      callback(new Error('Invalid codes to delete'));
      return;
    }
    db.deleteObjectFields(Invitation.code_key, codes, function(err) {
      callback(err ? new Error('Delete Codes Failed') : null);
    });
  };

}(module.exports));
