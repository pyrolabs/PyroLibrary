/* Pyro for Firebase*/
  // Pyro Platform Firebase:
  var pyroRef = new Firebase('http://pyro.firebaseio.com');
  // Constructor:
  function Pyro (argPyroData, errorCb) {
    //Check for existance of Firebase
    if(typeof Firebase != 'undefined' && typeof argPyroData != 'undefined') {
      if(argPyroData.hasOwnProperty('url')){
        // [TODO] Check that url is firebase
        this.url = argPyroData.url;
        this.mainRef = new Firebase(argPyroData.url);
        this.pyroRef = pyroRef;
        // Not Required variables
        if(argPyroData.hasOwnProperty('secret')) {
          this.secret = argPyroData.secret;
        }
        if(argPyroData.hasOwnProperty('name')) {
          this.name = argPyroData.name;
        } else {
          //Regex name from url
          // this.name = 
        }
      } else {
        console.error('Missing firebase url.');
        if(errorCb) {
          errorCb({message:'Please provide your when running new Pyro() firebase URL'});
        }
      }
      return this;
    } else if(typeof argPyroData == 'undefined') {
      console.error('New pyro object does not include nessesary information.');
    }
    else throw Error('Firebase library does not exist. Check that firebase.js is included in your index.html file.');
    //for incorrect scope
    // if (window === this) {
    //     return new _(id);
    //  }
  }
  Pyro.prototype = {
    userSignup: function(argSignupData, successCb, errorCb) {
      var self = this;
      emailSignup(argSignupData, self, successCb, errorCb);
    },
    authAnonymously: function(){
      //check for auth info
      var auth = this.mainRef.getAuth();
      console.log('authAnonymously', auth);
      var currentThis = this;
      if(auth != null) {
        this.mainRef.authAnonymously(function(error, authData){
          if (error) {
            console.log('Login Failed!', error);
          } else {
            console.log('Authenticated successfully with payload:', authData);
            var anon = {uid: authData.uid, provider:authData.provider};
            currentThis.mainRef.child('users').child(authData.uid).set(anon);
          }
        });
      } else {
        //auth exists
      }
    },
    login: function(argLoginData, successCb, errorCb) {
      console.log('Pyro login:', arguments);
      var self = this;
      // check for existnace of main ref
      authWithPassword(argLoginData, self.mainRef, successCb, errorCb);
    },
    logout:function(callback){
      this.mainRef.unauth();
      if(callback){
        callback();
      }
    },
    getAuth: function() {
      console.log('getAuth called');
      var authData = this.mainRef.getAuth();
      if (authData) {
        return authData;
      } else {
        console.warn('Not Authenticated');
        return null;
      }
    },
    getListByAuthor: function(argListName, callback) {
      var auth = this.getAuth();
      if(auth != null) {
        this.mainRef.child(argListName).orderByChild('author').equalTo(auth.uid).on('value', function(listSnap){
          callback(listSnap.val());
        });
      } else {
        console.warn('listByAuthor cannot load list without current user');
      }
    },
    createObject: function(argListName, argObject, callback) {
      var auth = this.getAuth();
      if(auth) {
        argObject.author = auth.uid;
      }
      argObject.createdAt = Date.now();
      var newObj = this.mainRef.child(argListName).push(argObject, function(){
        callback(newObj);
      });
    },
    getUser: function(callback) {
      if (this.getAuth() != null) {
        var self = this;
        userById(this.getAuth().uid, self.mainRef.child('users'), function(returnedAccount){
          callback(returnedAccount);
        });
      } else {
        callback(null);
      }
    },
    loadObject:function(argListName, argObjectId, callback){
      var listRef = this.mainRef.child(argListName);
      listRef.child(argObjectId).on('value', function(objectSnap){
        callback(objectSnap.val());
      });
    },
    deleteObject:function(argListName, argObjectId, callback){
      var listRef = this.mainRef.child(argListName);
      listRef.child(argObjectId).remove();
      console.log(argObjectId + ' was removed from the ' + argListName + ' list');
      if(callback){
        callback();
      }
    },
    instanceRef: function(argInstanceData, successCb, errorCb) {
      console.log('loadInstance:', argInstanceData);
      this.currentInstance = {name:argInstanceData.name}
      checkForInstance(this, argInstanceData.name, successCb, errorCb);
    },
    getObjectCount: function(argListName, callback){
      var self = this;
      this.mainRef.child(argListName).on('value', function(usersListSnap){
        callback(usersListSnap.numChildren());
      });
    },
    getUserCount: function(callback){
      var self = this;
      this.mainRef.child('users').on('value', function(usersListSnap){
        callback(usersListSnap.numChildren());
      });
    },
    getUserList: function(callback){
      this.mainRef.child('users').on('value', function(usersListSnap){
        callback(usersListSnap.val());
      });
    },
    createInstance: function (argPyroData, successCb, errorCb) {
      var self = this;
      if(argPyroData.hasOwnProperty('name')){
        // [TODO] Check that url is firebase
        this.mainRef = new Firebase(self.url);
        checkForInstance(this, argPyroData.name, function(returnedInstance){
          successCb(returnedInstance);
        });
        //request admin auth token
        
        // var xmlhttp = new XMLHttpRequest();
        //   xmlhttp.open("POST", "http://pyro-server.herokuapp.com/auth");
        //   xmlhttp.onreadystatechange = function() {
        //     if (xmlhttp.readyState==4 && xmlhttp.status==200) {
        //       console.log('xmlresponse:', xmlhttp.responseText);
        //       // document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
        //     }
        //   }
        //   xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded", true);

        //   xmlhttp.send("secret=" + this.secret);
        //Login to firebase
        
        // this.mainRef.authWithPassword()
      } else {
        console.log('Missing app info.');
        if(argPyroData.hasOwnProperty('name')) {
          errorCb({message:'Please enter the name of your firebase instance.'});
        } else {
          errorCb({message:'Please enter your firebase secret'})
        }
      }
    },
    deleteInstance: function (argInstanceName) {
      // [TODO] Do this with a bound list or check author somehow
      this.mainRef.child('instances').child(argInstanceName).remove();
      console.log('instance with the name:'+ argInstanceName + 'was deleted successsfully');
    }
  };
  function loadUsersList(argRef, callback){
    argRef.child('users').on('value', function(usersListSnap){
        callback(usersListSnap);
      });
  }
  //------------ Instance action functions -----------------//
  function createNewInstance(argPyro, successCb, errorCb) {
    checkForInstance(argPyro, function(returnedInstance){
      if(returnedInstance == null) {
        instanceList.child(argPyro.name).set(instanceData, function(){
          argPyro.pyroRef = instanceList.child(argPyro.name);
          if(successCb) {
            successCb(argPyro.pyroRef);
          }
        });
      } else {
        var err = {message:'App already exists'}
        console.warn(err.message);
        errorCb(err);
      }
    });
  }

    function checkForInstance(argPyro, argName, callback) {
      // [TODO] Add user's id to author object?
      //check for app existance on pyroBase
      console.log('checkForInstance:', argPyro);
      var instanceList = argPyro.pyroRef.child("instances");
      instanceList.orderByChild("name").equalTo(argName).once('value', function(usersSnap){
        console.log('usersSnap:', usersSnap);
        if(usersSnap.val() == null) {
          console.log('App does not already exist');
          // Add instance to instance list under the instance name
          callback(null);
        }
        else {
          console.log('app already exists');
          if(callback) {
            callback(usersSnap.child(argName));
          }
        }
      });
   }
   //------------- User ---------------//
   function User(argUserData, argMainRef) {
    console.log('NEW User');
    var self;
    if(argUserData) {
      self = argUserData;
    } else {
      throw Error('No userData provided.');
    }
    if(argUserData.hasOwnProperty('email')){
      self.account = checkForUser(argUserData.email, argMainRef, function(returnedAccount){
        return returnedAccount;
      })
    }
    return self;
   }
   // function getAccountOrSignup(){
   //  return checkForUser(argUserData, argMainRef, function(userAccount){
   //    if(userAccount != null) {
   //      return userAccount;
   //    } else {
   //      return new User(argUserData, this);
   //      emailSignup(argUserData, this, function(returnedUser){

   //      }, function(){

   //      });
   //    }
   //  })
   // }
  function emailSignup(argSignupData, argThis, successCb, errorCb) {
    if(!argSignupData.hasOwnProperty('email') || !argSignupData.hasOwnProperty('password')){
      errorCb({message:'The specified email/password combination is incorrect'});
    } else {
      argThis.mainRef.createUser(argSignupData, function(error) {
        if (error === null) {
          console.log("User created successfully");
          // Login with new account and create profile
            authWithPassword(argSignupData, argThis.mainRef, function(authData){
              createUserProfile(authData, argThis.mainRef, function(userAccount){
                var newUser = new User(authData);
                successCb(newUser);
              });
            });
        } else {
          console.error("Error creating user:", error.message);
          errorCb(error);
        }
      });
    }
  }
  function authWithPassword(argLoginData, argRef, successCb, errorCb) {
    if(argLoginData.hasOwnProperty('email') && argLoginData.hasOwnProperty('password')) {
      argRef.authWithPassword(argLoginData, function(error, authData) {
        if (error === null) {
          // user authenticated with Firebase
          console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
          // Manage presense
          setupPresence(authData.uid, argRef);
          successCb(authData);
          // Add account if it doesn't already exist
          // userById(authData.uid, argRef.child('users'), function(userAccount){
          //   successCb(userAccount);
          // });
        } else {
          console.error("Error authenticating user:", error);
          errorCb(error);
        }
      });
    } else {
      // [TODO] Use error handling from Firbase.authWithPassword()
      console.error('The specified email/password combination is incorrect');
      var err = {message:'The specified email/password combination is incorrect'};
      errorCb(err);
    }
  }         
  function createUserProfile(argAuthData, argRef, callback) {
    console.log('createUserAccount called');
    var userRef = argRef.child('users').child(argAuthData.uid);
    var userObj = {role:10, provider: argAuthData.provider};
    if(argAuthData.provider == 'password') {
      userObj.email = argAuthData.password.email;
    }
    userRef.on('value', function(userSnap){
      if(userSnap.val() == null || userSnap.hasChild('sessions')) {
        userObj.createdAt = Firebase.ServerValue.TIMESTAMP;
        // [TODO] Add check for email before using it as priority
        userRef.setWithPriority(userObj, userObj.email, function(){
          console.log('New user account created:', userSnap.val());
          callback(userSnap.val());
        });
      } else {
        console.error('User account already exists');
        throw Error('User account already exists');
      }
    });
  } 
   function setupPresence(argUserId, argMainRef) {
    console.log('setupPresence:', arguments);
    var amOnline = argMainRef.child('.info/connected');
    var onlineRef = argMainRef.child('presense').child(argUserId);
    var sessionsRef = argMainRef.child('sessions');
    var userRef = argMainRef.child('users').child(argUserId);
    var userSessionRef = argMainRef.child('users').child(argUserId).child('sessions');
    var pastSessionsRef = userSessionRef.child('past');
    amOnline.on('value', function(snapShot){
      if(snapShot.val()) {
        //user is online
        var onDisconnectRef = argMainRef.onDisconnect();
        // add session and set disconnect
        var session = sessionsRef.push({began: Firebase.ServerValue.TIMESTAMP, user:argUserId});
        var endedRef = session.child('ended')
        endedRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);

        //add correct session id to user
        // adding session id to current list under user's session
        var currentSesh = userSessionRef.child('current').push(session.name());
        // Remove session id from users current session folder
        currentSesh.onDisconnect().remove();

        // remove from presense list
        onlineRef.set(true);
        onlineRef.onDisconnect().remove();
        // Add session id to past sessions on disconnect
        // pastSessionsRef.onDisconnect().push(session.name());
        // Do same on unAuth
        onUnAuth(function(){
          endedRef.set(Firebase.ServerValue.TIMESTAMP);
          currentSesh.remove();
           onlineRef.remove();
        }); 
      }
    });
    function onUnAuth(callback){
      onlineRef.onAuth(function(authData){
        if(!authData){
          callback();
        }
      });
    }
   }
   function userById(argUserId, argUsersRef, callback) {
    console.log('userById run with id:', argUserId);
    argUsersRef.child(argUserId).on('value', function(userSnap){
      callback(userSnap.val());
    });
   }
          // Single Checking function for all user types (should be in one folder)
       // [TODO] Fix repative code within if statements
    function checkForUser(argUserData, argUsersRef, callback) {
      console.log('CheckForUser:', argUserData);
      var userEmail = 't@t.com';
      // [TODO] Change to switch statement
      // [TODO] Change to using provider folder (password if for email/password)
      if(argUserData.hasOwnProperty('email') || argUserData.hasOwnProperty('password')) {
        if (argUserData.hasOwnProperty('password')){
          userEmail = argUserData.password.email;
        }
        else if(argUserData.hasOwnProperty('email')) {
          // object contains email
          userEmail = argUserData.email;
        }
        argUsersRef.orderByChild('email').startAt(userEmail).endAt(userEmail).on("value", function(querySnapshot) {
            console.log('check for user returned:', querySnapshot.val());
            querySnapshot.forEach(function(){

            });
            callback(querySnapshot.val());
          if(querySnapshot.val() != null) {
            console.log('Usersnap:', querySnapshot.val());
          } 
        });
      }
      else {
        console.error('Incorrect user info');
      }
      
    }