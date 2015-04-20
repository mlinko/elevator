Resolutions = new Mongo.Collection('resolutions');

if (Meteor.isClient) {

    Meteor.subscribe("resolutions");

    Template.body.helpers({
    resolutions: function(){
      if(Session.get('hideFinished')){
        return Resolutions.find({checked:{$ne:true}},{sort:{checked:1}});
      }else {
        return Resolutions.find({}, {sort:{checked:1}});
      }
    },
    hideFinished:function(){
      return Session.get('hideFinished');
    },
      incompleteCount: function () {
        return Resolutions.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    'submit .new-resolution': function(event) {
      var title = event.target.title.value;

      Meteor.call("addResolution", title);

      event.target.title.value = "";

      return false;
    },
    'change .hide-finished':function(event) {
      Session.set('hideFinished', event.target.checked);
    }
  });

  Template.resolution.events({
    'click .toggle-checked':function(){
      Meteor.call("updateResolution", this._id, !this.checked);
    },
    'click .delete': function(){
      Meteor.call("deleteResolution",this._id);
    }
  });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_AND_EMAIL"
    });
}

if (Meteor.isServer) {
    // Only publish tasks
    Meteor.publish("resolutions", function () {
        return Resolutions.find({});
    });

        Meteor.publish(null, function (){
            return Meteor.roles.find({});
        });
        var users = [
            {name:"Osoba4",email:"Osoba4@qwe.qwe",roles:[]},
            {name:"Osoba5",email:"Osoba5@qwe.qwe",roles:['admin']},
            {name:"Osoba6",email:"Osoba6@qwe.qwe",roles:['foreman']}
        ];

        _.each(users, function (user) {
            var id;

            id = Accounts.createUser({
                email: user.email,
                password: "apple1",
                profile: { name: user.name }
            });

            if (user.roles.length > 0) {
                // Need _id of existing user record so this call must come
                // after `Accounts.createUser` or `Accounts.onCreate`
                Roles.addUsersToRoles(id, user.roles);
            }

        });

}

Meteor.methods({
  addResolution: function(title){

      // Make sure the user is logged in before inserting a task
      if (! Meteor.userId()) {
          throw new Meteor.Error("not-authorized");
      }


      Resolutions.insert({
          title:title,
          createdAt: new Date()
      });
  },

  updateResolution: function(id, checked){
    Resolutions.update(id, {$set:{checked: checked}});
  },
  deleteResolution:function(id){
    Resolutions.remove(id);
  }
});

