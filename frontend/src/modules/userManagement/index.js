// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('core/origin');
  var UserManagementView = require('./views/userManagementView');
  var UserManagementSidebarView = require('./views/userManagementSidebarView');
  var AddUsersView = require('./views/addUsersView');
  var AddUsersSidebarView = require('./views/addUsersSidebarView');
  var CustomHelpers = require('./helpers');

  var isReady = false;
  var data = {
    featurePermissions: ["*/*:create","*/*:read","*/*:update","*/*:delete"],
    allRoles: new Backbone.Collection(),
    allTenants: new Backbone.Collection()
  };

  Origin.on('origin:dataReady login:changed', function() {
    Origin.permissions.addRoute('userManagement', data.featurePermissions);

  	if (Origin.permissions.hasPermissions(data.featurePermissions)) {
      data.allRoles.on('sync', onDataFetched);
      data.allRoles.url = 'api/role';
      data.allRoles.fetch();

      data.allTenants.on('sync', onDataFetched);
      data.allTenants.url = 'api/tenant';
      data.allTenants.fetch();

  		Origin.globalMenu.addItem({
        "location": "global",
        "text": Origin.l10n.t('app.usermanagement'),
        "icon": "fa-users",
        "sortOrder": 3,
        "callbackEvent": "userManagement:open"
      });
  	} else {
      isReady = true;
    }
  });

  Origin.on('globalMenu:userManagement:open', function() {
    Origin.router.navigateTo('userManagement');
  });

  Origin.on('router:userManagement', function(location, subLocation, action) {
    if(isReady) {
      onRoute(location, subLocation, action);
    }
    else {
      Origin.on('userManagement:dataReady', function() {
        onRoute(location, subLocation, action);
      });
    }
  });

  var onRoute = function(location, subLocation, action) {
    console.log(arguments);
    var mainView, sidebarView;

    if(!location) {
      mainView = UserManagementView;
      sidebarView = UserManagementSidebarView;
    }
    else if(location === 'add') {
      mainView = AddUsersView;
      sidebarView = AddUsersSidebarView;
    }

    Origin.contentPane.setView(mainView, { model: new Backbone.Model({ globalData: data }) });
    Origin.sidebar.addView(new sidebarView().$el);
  };

  var onDataFetched = function() {
    // ASSUMPTION we always have roles and tenants
    if(data.allRoles.length > 0 && data.allTenants.length > 0) {
      isReady = true;
      Origin.trigger('userManagement:dataReady');
    }
  };
});