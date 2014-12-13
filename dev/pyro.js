  /** Enhanced functionality for the Firebase library 
   * @constructor Pyro
   * 
   * @param {object} PyroData Object containing identifying information for creating a Pyro instance. 
   * @param {string} PyroData.url Firebase url `Required`
   * @param {string} PyroData.dbName Database Name `Required`
   * @param {string} PyroData.appUrl Hosted location of generated Pyro App `Not Required`
   *
   */
  function Pyro (argPyroData) {
    //[TODO] Pass argPyroData object through
    if(typeof Firebase != 'undefined' && typeof argPyroData != 'undefined') {
      if(argPyroData.hasOwnProperty('url')){
        // [TODO] Check that url is firebase
        this.url = argPyroData.url;
        this.dbUrl = this.url;
        this.mainRef = new Firebase(argPyroData.url);
        this.pyroRef = pyroRef;
        // Not Required variables
        if(argPyroData.hasOwnProperty('name')) {
          this.name = argPyroData.name;
        } else {
          //[TODO] Regex name from url
          // this.name = 
        }
        // Pyro Is is a seed app
        if(argPyroData.hasOwnProperty('dbName') ) {
          this.dbName = argPyroData.dbName;
        } 
        if(argPyroData.hasOwnProperty('appUrl')){
          this.appUrl = argPyroData.appUrl;
        } else {
          this.appUrl = this.name + ".s3-website-us-east-1.amazonaws.com";
        }
      } else {
        console.error('Please provide your Firebase Url when running new Pyro() firebase URL');
        if(errorCb) {
          throw Error('Please provide your Firebase Url when running new Pyro() firebase URL');
        }
      }
      return this;
    } else if(typeof argPyroData == 'undefined') {
      console.error('New pyro object does not include nessesary information.');
      throw Error('Please provide an object containing a url parameter containing your Firebase URL');
    }
    else throw Error('Firebase library does not exist. Check that firebase.js is included in your index.html file.');
    //for incorrect scope
    // if (window === this) {
    //     return new _(id);
    //  }
  }
  var pyroRef = new Firebase('http://pyro.firebaseio.com');
  /**
   * General error callback
   * @callback Pyro~errorCb
   * @param {object} errorObj Object containing error information
   * @param {string} error Error string
   * @param {string} message Error message to display to users
   */
  Pyro.prototype = {
    /**  Authenticate a user anonymously. Sessions are handled automatically.
     * @memberof Pyro#
     * @param {Pyro~authAnonymouslyCb} onComplete - Function called when completed
     */
    authAnonymously: function(callback){
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
            if(callback){
              callback(anon);
            }
          }
        });
      } else {
        //auth exists
        if(callback){
          callback(auth);
        }
      }
    },
    /** Callback used by authAnonymously
     * @callback Pyro~authAnonymouslyCb
     * @param {object} auth Anonymous auth information
     * @param {string} auth.uid Unique id of anonymous user
     * @param {string} auth.provider Login provider of user
     */

    /** 
     * Signup a new user with email and password. Sessions are handled automatically.
     * @memberof Pyro#
     * @param {object} signupData - Information of new user to signup
     * @param {string} signupData.email - Email of new user
     * @param {string} signupData.password - Password of new user
     */
    userSignup: function(argSignupData, successCb, errorCb) {
      var self = this;
      emailSignup(argSignupData, self, successCb, errorCb);
    },
    /** 
     * Login a user with email and password
     * @memberof Pyro#
     * @param loginData - Login information for user
     * @param loginData.email - Email of user to login
     * @param loginData.password - Password of user to login
     */
    login: function(argLoginData, successCb, errorCb) {
      var self = this;
      // check for existnace of main ref
      authWithPassword(argLoginData, self.mainRef, successCb, errorCb);
    },
    /** 
     * Logout the current user from app Firebase
     * @memberof Pyro#
     * @param onComplete - Function that runs on completion of logout (Not Required)
     */
    logout:function(callback){
      this.mainRef.unauth();
      if(callback){
        callback();
      }
    },
    /** 
     * Gets current auth information for main app reference
     * @memberof Pyro#
    */
    getAuth: function() {
      var authData = this.mainRef.getAuth();
      if (authData) {
        return authData;
      } else {
        console.warn('Not Authenticated');
        return null;
      }
    },
    /** 
     * Gets list of objects created by the currently logged in User.
     * @memberof Pyro#
     * @param {string} listName - The name of the list the objects will be grabbed from.
     * @param {function} onComplete - Function that runs when the list has been retrieved successfully
    */
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
    /** 
     * Creates an object provided the name of the list the object will go into and the object itself.
     * The object is created with a createdAt parameter that is a server timestamp from Firebase.
     * If a user is currently signed in, the object will contain the author's `$uid` under the author parameter. This is used for the getListByAuthor function.
     * @memberof Pyro#
     * @param {string} listName - The name of the list the object will be put into.
     * @param {object} object - Object you wish to create
     * @param {Pyro~createObjectCb} onComplete - Function that runs when your object has been created successfully
    */
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
    /** Callback function used by createObject
     * @callback Pyro~createObjectCb
     * @param {object} newObjRef Firebase reference created by new object
     */

    /** 
     * Retreives account for currently logged in user
     * @memberof Pyro#
     * @param {getUserCb} onComplete - The name of the list the object will be put into.
    */
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
    /** Callback function used by getUser
     * @callback getUserCb
     * @param {object} userAccount Retreived account of logged in user
     * @param {object} userAccount.email Email of retreived user account 
     */

    /** 
     * Loads object given list name and object id
     * @memberof Pyro#
     * @param {string} listName - The name of the list the object will be put into.
     * @param {string} objectId - Key of object to be loaded
     * @param {function} onComplete - Function that runs on completion of load operation
     * @param {object} onComplete.ReturnValue - Loaded object
    */
    loadObject:function(argListName, argObjectId, callback){
      var listRef = this.mainRef.child(argListName);
      listRef.child(argObjectId).on('value', function(objectSnap){
        callback(objectSnap.val());
      });
    },
    /** 
     * Deletes object given list name and object id
     * @memberof Pyro#
     * @param {string} listName - The name of the list the object will be put into.
     * @param {string} objectId - Key of object to be loaded
     * @param {function} onComplete - Function that runs on completion of delete operation
    */
    deleteObject:function(argListName, argObjectId, callback){
      var listRef = this.mainRef.child(argListName);
      listRef.child(argObjectId).remove();
      console.log(argObjectId + ' was removed from the ' + argListName + ' list');
      if(callback){
        callback();
      }
    },
    /** 
     * Reference to specific pyro instance
     * @memberof Pyro#
     * @param {string} listName - The name of the list the object will be put into.
     * @param {string} objectId - Key of object to be loaded
     * @param {function} onComplete - Function that runs on completion of delete operation
    */
    instanceRef: function(argInstanceData, successCb, errorCb) {
      console.log('loadInstance:', argInstanceData);
      this.currentInstance = {name:argInstanceData.name}
      checkForInstance(this, argInstanceData.name, successCb, errorCb);
    },
    /** 
     * Get count of objects in a given list
     * @memberof Pyro#
     * @param {string} listName - The name of the list the object will be put into.
     * @param {function} onComplete - Function that runs on completion of gathering list count
    */
    getObjectCount: function(argListName, callback){
      var self = this;
      this.mainRef.child(argListName).on('value', function(usersListSnap){
        callback(usersListSnap.numChildren());
      });
    },
    /** 
     * Get user count
     * @memberof Pyro#
     * @param {function} onComplete - Function that runs on completion of delete operation
    */
    getUserCount: function(callback){
      var self = this;
      this.mainRef.child('users').on('value', function(usersListSnap){
        callback(usersListSnap.numChildren());
      });
    },
    /** 
     * Get list of users from the main instance ref
     * @memberof Pyro#
     * @param {function} onComplete - Function that runs on completion of delete operation
    */
    getUserList: function(callback){
      this.mainRef.child('users').on('value', function(usersListSnap){
        callback(usersListSnap.val());
      });
    },
    /** 
     * Create new instance of pyro
     * @memberof Pyro#
     * @param {string} listName - The name of the list the object will be put into.
     * @param {string} objectId - Key of object to be loaded
     * @param {function} onComplete - Function that runs on completion of delete operation
    */
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
    /** 
     * Deletes pyro instance from list of instances
     * @memberof Pyro#
     * @param {string} ListName - The name of the list the object will be put into.
     * @param {string} ObjectId - Key of object to be loaded
     * @param {function} OnComplete - Function that runs on completion of delete operation
    */
    deleteInstance: function (argInstanceName) {
      // [TODO] Do this with a bound list or check author somehow
      this.pyroRef.child('instances').child(argInstanceName).remove();
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
 /** User object with extended methods 
  * @constructor
  * @param {object} userData 
  * @param {string} userData.email 
  * @param {object} mainRef Main app reference
  */
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

 /** Email login functionality
  * @function emailSignup
  * @param {object} signupData Signup data of new user
  * @param {object} this Pyro Object
  * @param {function} success Function that runs when you successfully log in
  * @param {function} error Function that runs if there is an error
  * @param {object} error.
  */
  function emailSignup(argSignupData, argThis, successCb, errorCb) {
    if(!argSignupData.hasOwnProperty('email') || !argSignupData.hasOwnProperty('password')){
      errorCb({message:'The specified email/password combination is incorrect'});
    } else {
      argThis.mainRef.child('users').orderByChild('email').equalTo(argSignupData.email).limitToFirst(1).once('value', function(userQuery){
        console.log('userQuery:', userQuery);
        console.log('userQuery.hasChildren()', userQuery.hasChildren());
        if(!userQuery.hasChildren()){
          console.log('New user does not already exist');
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
        } else {
          console.warn('Account already exists');
          var error = {message:'Account already exists', account: JSON.stringify(userQuery.val()), status:'ACCOUNT_EXISTS'}
          errorCb(error);
        }
      });

    }
  }
 /** Modified authWithPassword functionality that handles presense
  * @function authWithPassword
  * @param {object} loginData Login data of new user
  * @param {object} reg Reference to Firebase for which to create auth
  * @param {authWithPassword~successCb} successCb Function that runs when you successfully log in
  * @param {Pyro~errorCb} errorCb Function that runs if there is an error
  *
  */
  /**
   * Success callback for authWithPassword function
   * @callback authWithPassword~successCb
   * @param {object} authData Returned authentication data
   */

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
 /** Create a new user profile
  * @function createUserProfile
  * @param {object} loginData Login data of new user
  * @param {object} ref Reference to Firebase for which to create auth
  * @param {function} callback Function that runs when user profile has been created
  */
  function createUserProfile(argAuthData, argRef, callback) {
    console.log('createUserAccount called:', arguments);
    var userRef = argRef.child('users').child(argAuthData.uid);
    var userObj = {role:10, provider: argAuthData.provider};
    if(argAuthData.provider == 'password') {
      userObj.email = argAuthData.password.email;
    }
    userRef.once('value', function(userSnap){
      if(userSnap.val() == null || userSnap.hasChild('sessions')) {
        userObj.createdAt = Firebase.ServerValue.TIMESTAMP;
        // [TODO] Add check for email before using it as priority
        userRef.setWithPriority(userObj, userObj.email, function(){
          console.log('New user account created:', userSnap.val());
          callback(userSnap.val());
        });
      } else {
        console.error('User account already exists', userSnap.val());
        callback(userSnap.val());
      }
    });
  }
 /** Setup presense given user unique id
  * @function setupPresense
  * @param {object} uid User unique id
  * @param {object} ref Reference to Firebase for which to create auth
  */
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
        var currentSesh = userSessionRef.child('current').push(session.key());
        // Remove session id from users current session folder
        currentSesh.onDisconnect().remove();

        // remove from presense list
        onlineRef.set(true);
        onlineRef.onDisconnect().remove();
        // Add session id to past sessions on disconnect
        // pastSessionsRef.onDisconnect().push(session.key());
        // Do same on unAuth
        onUnAuth(onlinRef, function(){
          endedRef.set(Firebase.ServerValue.TIMESTAMP);
          currentSesh.remove();
           onlineRef.remove();
        }); 
      }
    });
   }
   /** onUnAuth wrapper for onAuth functionality provided by Firebase API
    * @function onUnAuth
    * @param {object} ref Reference to Firebase of which to watch auth
    * @param {function} onComplete Function that runs when onUnAuth event is triggered
    */
    function onUnAuth(ref, callback){
      ref.onAuth(function(authData){
        if(!authData){
          callback();
        }
      });
    }
  /** Get user account given user unique id
   * @function userById
   * @param {string} uid Unique id of user for which to grab info
   * @param {object} usersRef Reference to users list of Firebase
   * @param {function} onComplete Function that returns loaded user account information
   */
   function userById(argUserId, argUsersRef, callback) {
    console.log('userById run with id:', argUserId);
    argUsersRef.child(argUserId).on('value', function(userSnap){
      callback(userSnap.val());
    });
   }
  /** check for existance of user and create a new account for them if an account does not exist
   * @function checkForUser
   * @param {object} userData Data of user to check for
   * @param {string} userData.email Email of user to check for
   * @param {string} userData.password Password of user to check for
   * @param {object} usersRef Reference to users list of Firebase
   * @param {function} onComplete Function that returns loaded user account information
   */
  function checkForUser(argUserData, argUsersRef, callback) {
    // [TODO] Fix repative code within if statements
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
      argUsersRef.orderByChild('email').equalTo(userEmail).on("value", function(querySnapshot) {
        console.log('check for user returned:', querySnapshot.val());
        callback(querySnapshot.val());
      });
    }
    else {
      console.error('Incorrect user info');
    }
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