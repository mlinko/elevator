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
        passwordSignupFields: "USERNAME_ONLY"
    });
}

if (Meteor.isServer) {
    // Only publish tasks
    Meteor.publish("resolutions", function () {
        return Resolutions.find({});
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

