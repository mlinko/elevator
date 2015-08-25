Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {

    Meteor.subscribe("tasks");
    Template.body.helpers({
    tasks: function(){
      if(Session.get('hideFinished')){
        return Tasks.find({checked:{$ne:true}},{sort:{checked:1}});
      }else {
        return Tasks.find({}, {sort:{checked:1}});
      }
    },
    hideFinished:function(){
      return Session.get('hideFinished');
    },
      incompleteCount: function () {
        return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    'submit .new-task': function(event) {
      var title = event.target.title.value;

      Meteor.call("addTask", title);

      event.target.title.value = "";

      return false;
    },
    'change .hide-finished':function(event) {
      Session.set('hideFinished', event.target.checked);
    }

  });

  Template.task.events({
    'click .toggle-checked':function(){
      Meteor.call("updateTask", this._id, !this.checked);
    },
    'click .delete': function(){
      Meteor.call("deleteTask",this._id);
    }
  });

    Accounts.ui.config({
        passwordSignupFields: "EMAIL"
    });


}

if (Meteor.isServer) {
    // Only publish tasks
    Meteor.publish("tasks", function () {
        return Tasks.find({});
    });


      Meteor.publish(null, function (){
          return Meteor.roles.find({})
      });

          var users = [
              {name:"Osoba4",email:"Osoba4@qwe.qwe",roles:[]},
              {name:"Osoba5",email:"Osoba5@qwe.qwe",roles:['admin']}
          ];

          _.each(users, function (user) {
              var id;

              id = Accounts.createUser({
                  email: user.email,
                  password: "apple1"
              });

              if (user.roles.length > 0) {
                  // Need _id of existing user record so this call must come
                  // after `Accounts.createUser` or `Accounts.onCreate`
                  Roles.addUsersToRoles(id, user.roles);
              }
          });
}

Meteor.methods({
  addTask: function(title){

      // Make sure the user is logged in before inserting a task
      if (! Meteor.userId()) {
          throw new Meteor.Error("not-authorized");
      }


      Tasks.insert({
          title:title,
          createdAt: new Date()
      });
  },

  updateTask: function(id, checked){
    Tasks.update(id, {$set:{checked: checked}});
  },
  deleteTask:function(id){
    Tasks.remove(id);
  }
});

