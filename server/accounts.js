Meteor.startup(function() {

Meteor.users.remove();
console.log("clearing the all user accounts. Maybe remove Service configuration?")


/*  ServiceConfiguration.configurations.remove({service: 'meteor-developer'});
  ServiceConfiguration.configurations.insert({
    service: 'meteor-developer',
    clientId: Meteor.settings.meteorDeveloper.clientId,
    secret: Meteor.settings.meteorDeveloper.secret
  });*/
});

/*
Accounts.onCreateUser(function(options, user) {
  user.emails = user.services['meteor-developer'].emails;
  user.profile = options.profile;
  return user;
});
*/