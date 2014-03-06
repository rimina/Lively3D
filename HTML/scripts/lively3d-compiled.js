/*
Copyright (C) 2012 Jari-Pekka Voutilainen

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/**
	@fileOverview Lively3D-library for WebGL.
	@author Jari-Pekka Voutilainen, Anna-Liisa Mattila
*/

if (typeof(Lively3D) == 'undefined' ){
	Lively3D = {};
}

/**
	Creates Lively3D Object. Object created automatically when javascript-file is downloaded.
	@constructor
*/
var Lively3D = (function(Lively3D){
	
	var canvasName = "";
	var canvasDefault = "canvas";
  this.renderer;
  
  /**
    @namespace Holds WIDGET3D related variables.
  */
  Lively3D.WIDGET = {
    mainWindow : null,
    cameraGroup : null 
  };
  
	var Scenes = [];
	var CurrentScene = 0;
	
	var DefaultScene = {
		Id:'mainscene',
    Model: null,
    SkySphere : null,
    
    //creates the object related to scene and
    //initializes it to be ready for use
    Init: function(){
      var scene = WIDGET3D.getScene();

      this.SkySphere = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 32), new THREE.MeshBasicMaterial({color:/*0x7AA9DD*/0xC6E2FF, side: THREE.BackSide}));
      scene.add(this.SkySphere);
      scene.fog = new THREE.Fog( 0x8F8FBC, 20, 2000 );
    
      this.Model = new WIDGET3D.GridWindow({
        width: 200,
        height: 200,
        color: 0x344152,
        defaultControls : true
      });
      Lively3D.WIDGET.mainWindow.add(this.Model);
      
      Lively3D.WIDGET.cameraGroup.setPositionZ(450);
    },
    
    //creates a scene specific icon for the application
    CreateApplication: function(appCanvas){

      var icon = new WIDGET3D.GridIcon({
        img : appCanvas,
        parent : this.Model
      });
      
      var update = function(){
        icon.material.map.needsUpdate = true;
      }
      
      icon.addUpdateCallback(update);
      
      return icon;
    },
    
    //animatingfunction for scene
		RenderingFunction: function(now, lastTime){
    },
    
    //scene specific operations that are done when app is opened
		Open: function(app, camera){
		},
    
    //scene specific operations that are done when app is closed
		Close: function(app, camera){
		},
    
    Remove: function(){
      
      //removing widgets
      this.Model.remove();
      
      //removing everything else
      var scene = WIDGET3D.getScene();
      scene.remove(this.SkySphere);
      scene.fog = null;
      
      //reseting camera position and rotation
      Lively3D.WIDGET.cameraGroup.setPosition(0, 0, 0);
      Lively3D.WIDGET.cameraGroup.setRotation(0, 0, 0);
    }
    
	};
	
	var Applications = [];
  
	/**
		Initializes Lively3D environment.
		@param canvas ID of the canvas-element used for rendering Lively3D. 
	*/
	Lively3D.Init = function(canvas){
		
		if ( !canvas ){
			canvasName = canvasDefault;
		}
		else{
			canvasName = canvas;
		}
		var canvas = document.getElementById(canvasName);
    
    //creating renderer
    Lively3D.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    
    Lively3D.WIDGET.mainWindow = WIDGET3D.THREE_Application({renderer : Lively3D.renderer});
    
    Lively3D.WIDGET.cameraGroup = WIDGET3D.getCameraGroup();
    
    Scenes.push(new Lively3D.Scene().SetScene(DefaultScene));
    Scenes[CurrentScene].GetScene().Init();
    Scenes[CurrentScene].SetModel(Scenes[CurrentScene].GetScene().Model);
    
    Lively3D.UI.create(Scenes[CurrentScene]);
    
    //ANIMATION LOOP
    var lasttime=0;
    var now;

    function animLoop(){
      requestAnimationFrame(animLoop, canvas);
      now=parseInt(new Date().getTime());
      
      //Updates scene
      Scenes[CurrentScene].GetScene().RenderingFunction(now, lasttime);
      
      //Updates applications texture (canvas)
      for(var i = 0; i < Applications.length; ++i){
        var window = Applications[i].GetWindowObject();
        if(window.isVisible){
          window.update();
        }
      }
      //the rendering function
      WIDGET3D.render();
      lasttime=now;
      
    }

    animLoop();
	};
	
  //eventhandler for icon doubleclick.
  var createIconOndblclick = function(livelyapp){
    return function(event){
      Lively3D.Open(livelyapp);
    };
  };
  
	/**
		Adds new canvas-application to the Lively3D-environment.
		@param name Name of the application.
		@param AppCode Function which holds the application code.
		@param AppInit Function which initializes the application.
	*/
	Lively3D.AddApplication = function(name, AppCode, AppInit ){

		var livelyapp = new Lively3D.Application();
		Applications.push(livelyapp);
		livelyapp.SetName(name).SetApplicationCode(AppCode).SetInitializationCode(AppInit);
    
		//run the app code and save app canvas
		var app = AppInit(AppCode);
		var canvas = app.GetCanvas();
		livelyapp.SetStart(app.StartApp);
    
    //create appcanvas texture fo application window
    var tex = new THREE.Texture(canvas);
    var material = new THREE.MeshBasicMaterial({
      map: tex
    });
    tex.needsUpdate = true;
    
    //creating application window
    var display = new WIDGET3D.TitledWindow({
      title : name, 
      width  : 100,
      height : 75,
      material : material,
      defaultControls : true,
      mouseButton : 2,
      override : true
    });
    
    new WIDGET3D.RollControl(display, {mouseButton: 2, shiftKey: true});
    
    Lively3D.WIDGET.cameraGroup.add(display);
    display.setPosition(0, 0, -150);
    
    //creating a scene specific icon for the application   
    var icon = Scenes[CurrentScene].GetScene().CreateApplication(canvas);
    
    //updatefunction for application window
    var createUpdateCallback = function(display){
      return function(){
        content = display.getContent();
        if(content.object3D.material.map){
          content.object3D.material.map.needsUpdate = true;
        }
      }
    };
    var updateFunktion = createUpdateCallback(display);
    display.addUpdateCallback(updateFunktion);
    
    //app window is hidden until the app is opened
    display.hide();
    
    livelyapp.SetWindowObject(display);
    livelyapp.SetIcon(icon);
		
		if ( app.GetState ){
			livelyapp.SetSave(app.GetState);
		}
		
		if ( app.SetState ){
			livelyapp.SetLoad(app.SetState);
		}
		
		if ( app.Open ){
			livelyapp.SetAppOpen(app.Open);
		}
		
		if ( app.Close ){
			livelyapp.SetAppClose(app.Close);
		}
    
		app.SetLivelyApp(livelyapp);
    
    
    //eventhandler for windows close button
    var createCloseDisplay = function(livelyapp){
      return function(event){
        Lively3D.Close(livelyapp);
      }
    };
    
    icon.addEventListener("dblclick", createIconOndblclick(livelyapp));
    display.closeButton.addEventListener("click", createCloseDisplay(livelyapp));
    
    //binds applications event listeners to application window
    AddEventListeners(display, app.EventListeners, livelyapp);
    
		return livelyapp;
	};
  
  /**
  Calculates coordinate translations from screen coordinates to
  application coordinates and calls applications event handler for the event
  
  @param event DOM event object
  @param args object that contain application and it's callbackfunction
  */
  var mouseEvents = function(parameters, event){
    var window = parameters.app.GetWindowObject();
    var content = window.getContent();
    
    if(parameters.callback){
      
      var position = event.mousePositionIn3D.obj;
      
      var normalX = ((position.x - (-window.width  / 2.0)) / (window.width ));
      var normalY = 1.0-((position.y - (-window.height / 2.0)) / (window.height));
      
      var canvasWidth = content.object3D.material.map.image.width;
      var canvasHeight = content.object3D.material.map.image.height;
      
      var x = normalX * canvasWidth;
      var y = normalY * canvasHeight;
      
      var coords = [x, y];
      
      var param = {"coord": coords, "canvas": content.object3D.material.map.image, "event": event};
      
      parameters.callback(param);
    }
  };

  /**
		Binds application eventlisteners to application window.
		@param object application window object, WIDGET3D -object
    @param events events -object that contains the eventhandler callback code
	*/
	var AddEventListeners = function(object, events, app){
  
    var createMouseHandler = function(parameters){
      return function(event){
        mouseEvents(parameters, event);
      };
    };
    
    var focus = function(app){
      return function(event){
        app.GetWindowObject().focus();
      }
    };
    
    var content = object.getContent();
    if(object && events){
    
      content.addEventListener("click", focus(app));
      
      for(var i in events){
        
        if(i != "keypress" && i != "keydown" && i != "keyup"){
          content.addEventListener(i, createMouseHandler({app:app, callback: events[i.toString()]}));
        }
        else{
          //these should not be bound to window content
          object.addEventListener(i, events[i.toString()]);
        }
      }
    }
	};
	
	/**
		Opens given Lively3D Application in every 3D-scene.
		@param app Lively3D Application
	*/
	Lively3D.Open = function(app){
  
		Scenes[CurrentScene].GetScene().Open(app);
    
		app.Open();
    app.GetWindowObject().show();
    app.GetWindowObject().focus();
	}

	/**
		Closes given Lively3D Application in every 3D-scene.
		@param app Lively3D Application
	*/
	Lively3D.Close = function(app){
    
    var window = app.GetWindowObject();

		app.Close();
    window.hide();
    Scenes[CurrentScene].GetScene().Close(app);
	};
	
	
	/**
		Gets index of the current scene.
		@returns {integer} Index of the scene.
	*/
	Lively3D.GetCurrentSceneIndex = function(){
		return CurrentScene;
	};
	

	/**
		@namespace Functions for proxying files through serverside PHP.
	*/
	Lively3D.FileOperations = {};
	
	/**
		Gets JavaScript-file from dropbox and creates script element for it.
		@param {string} filename Name of the JavaScript-file.
		@param {string} path Path of the JavaScript file in Dropbox, starting from shared folder root.
	*/
	Lively3D.FileOperations.getScript = function(filename, path){
	
		$.get("getFile.php", {name: filename, path: path}, function(scripturl){
			
			var script = document.createElement('script');
			script.type = "text/javascript";
			script.src = scripturl;
			document.head.appendChild(script);
		});
	}
	
	/**
		Uploads file to the dropbox folder. Replaces existing.
		@param {string} filename Name of the resulting file.
		@param {string} script Contents of the file.
		@param {string} path Path of the file in dropbox.
	*/
	Lively3D.FileOperations.uploadScript = function(filename, script, path ){
		$.post('uploadfile.php', {name: filename, file: script, path: path}, function(){
			console.log('uploaded script: ' + filename);
		});
	};
	
	/**
		Gets file from dropbox which contains JSON.
		@param {string} filename Name of the file.
		@param {function} JSONParsingFunc Parser for JSON response.
		@param {string} path Path of the file in dropbox.
	*/
	Lively3D.FileOperations.getJSON = function(filename, JSONParsingFunc, path){
		$.get("getFile.php", {name: filename, JSON: true, path: path}, function(jsonURL){
			$.getJSON(jsonURL, JSONParsingFunc);
		});
	};
	
	/**
		Gets array of resources from dropbox.
		@param App Lively3D Application which requires resources
		@param {string} resource Literal for current resource. 
	*/
	Lively3D.FileOperations.LoadResources = function(App, resource){
		$.get("getFileArray.php", {'names[]': App.Resources[resource], path: App.ResourcePath}, function(array){
			var list = JSON.parse(array);
			App.ResourceHandlers[resource](list);
			App.ResourcesLoaded(resource);
		});	
	};
	
	
	/**
		Enables opening of the application for the glge object in the scene.
		@param app Lively3D Application which is ready for usage.
	*/
	Lively3D.AllowAppStart = function(app){
  
		if ( app.StateFromDropbox == true ){
			if ( app.OpenAfterLoad == true){
				Lively3D.Open(app);
			}
		}
		Lively3D.LoadCompleted();
	}
	
	var SceneBuffer = [];
	
	/**
		Adds a new scene to the environment.
		@param scene Object which implements Lively3D APIs for 3d scene.
	*/
	Lively3D.AddScene = function(scene){
		console.log("Loading scene..");
		SceneBuffer.push(scene);
		Lively3D.LoadResources(scene);
	}
	
	Lively3D.SceneLoader = function(){
		
		var found = false;
		for ( var i in SceneBuffer){
			if ( SceneBuffer.hasOwnProperty(i)){

        Scenes.push(new Lively3D.Scene().SetScene(SceneBuffer[i]));
        console.log(SceneBuffer[i]);
        
        SceneBuffer.splice(i, 1);
        found = true;
        Lively3D.LoadCompleted();
			}
		}
		if ( found == false){
			console.log("error loading scene");
		}
	}
	
	/**
		Gets currently shown scene.
		@returns Scene object.
	*/
	Lively3D.GetCurrentScene = function(){
		return Scenes[CurrentScene];
	}
	
	/**
		Gets currently loaded applications.
		@returns Array of applications.
	*/
	Lively3D.GetApplications = function(){
		return Applications;
	}
		
	/**
		Switches to the next scene. If current scene is the last scene, switches to the first scene.
	*/
	Lively3D.ChangeScene = function(event, parameters){
		
		for ( var i in Applications){
			if ( Applications.hasOwnProperty(i)){
				if ( !Applications[i].isClosed() ){
					Lively3D.Close(Applications[i]);
				}
			}
		}
		
   Scenes[CurrentScene].GetScene().Remove();
    
		CurrentScene += 1;
		if (CurrentScene == Scenes.length ){
			CurrentScene = 0;
		}
		
    Scenes[CurrentScene].GetScene().Init();      
    Scenes[CurrentScene].SetModel(Scenes[CurrentScene].GetScene().Model);
    
		for ( var i in Applications){
      var icon = Scenes[CurrentScene].GetScene().CreateApplication(Applications[i].GetWindowObject().getContent().mesh_.material.map.image);
      icon.addEventListener("dblclick", createIconOndblclick(Applications[i]));
      
      Applications[i].SetIcon(icon);
		}
		
	}
	
	
	/**
		Shows notification about completion of downloading Application or 3D Scene. 
	*/
	Lively3D.LoadCompleted = function(){
		Lively3D.UI.ShowLoadCompleted();
	};
	
	/**
		Syncs dropbox-contents to local filesystem if local node.js application is running.
	*/
	Lively3D.Sync = function(event){
		Lively3D.Proxies.Local.CheckAvailability(function(){
			Lively3D.Proxies.Local.Sync();
		});
	};
	
	/**
		Loads Resources for application or scene.
		@param App Lively3D Application or scene.
	*/
	Lively3D.LoadResources = function(App){
		
		for ( var resource in App.Resources ){
			if ( App.Resources.hasOwnProperty(resource)){
				if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
					Lively3D.Proxies.Local.LoadResources(App, resource);
				}
				else if ( Lively3D.UI.HTTPServers.PROXY.inUse == true || Lively3D.UI.HTTPServers.NODE.inUse == true ){
					Lively3D.FileOperations.LoadResources(App, resource);
				}
			}
		}
	};
	
	var username;
	Lively3D.SetUsername = function(name){
		username = name;
	};
	
	Lively3D.GetUsername = function(){
		return username;
	};

	return Lively3D;
}(Lively3D));/*
Copyright (C) 2012 Jari-Pekka Voutilainen

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

(function(Lively3D){
	/**
		Creates new application.
		@class Represents single Lively3D Application.
	*/
	Lively3D.Application = function(){
		
    //DEFAULTOTEUTUKSIA RAJAPINNOISTA
    
		/**
			Gets application's inner state as javascript object.
			@returns {object} inner state.
		*/
		this.Save = function(){
			var state = {};
			return state;
		}
		
		/**
			Sets application's inner state.
			@param {object} state The state object which was created in the Save-function.
		*/
		this.Load = function(state){
		}
		
		var closed = true;
		/**
			Is application open or closed. Default closed.
			@returns {boolean} true for closed application, otherwise false.
		*/
		this.isClosed = function(){
			return closed;
		}
		
		var AppClose = function(){
		}
		
		/**
			Closes the application and calls settable closing function.
		*/
		this.Close = function(){
			closed = true;
			AppClose();
		}
		
		/**
			Sets closing function which is called during closing.
			@param {function} func Code that is executed at closing.
		*/
		this.SetAppClose = function(func){
			AppClose = func;
			return this;
		}
		
		var AppOpen = function(){
		}
		
		/**
			Opens the application and calls settable opening function.
		*/
		this.Open = function(){
			closed = false;
			AppOpen();
		}
		
		/**
			Sets opening function whis is called during opening.
			@param {function} func Code that is executed at opening.
		*/
		this.SetAppOpen = function(func){
			AppOpen = func;
			return this;
		}
    
    var icon;
    
    this.SetIcon = function(obj){
      icon = obj;
    }
    
    this.GetIcon = function(){
      return icon;
    }
		
		var WindowObject;
		/**
			Set the application window object.
			@param window Object which represents application window.
		*/
		this.SetWindowObject = function(window){
			WindowObject = window;
			return this;
		}
		
		/**
			Gets Application window.
		*/
		this.GetWindowObject = function(){
			return WindowObject;
		}

    //APPLIKAATIORAJAPINTA
    
		var Name;
		/**
			Sets application name.
			@param {string} name Name of application.
		*/
		this.SetName = function(name){
			Name = name;
			return this;
		}
		
		/**
			Gets application name.
		*/
		this.GetName = function(){
			return Name;
		}
		
		var ApplicationCode;
		/**
			Sets application code.
			@param {function} code Code of the canvas application.
		*/
		this.SetApplicationCode = function(code){
			ApplicationCode = code;
			return this;
		}
		
		/**
			Gets application code.
			@returns Code of the canvas application.
		*/
		this.GetApplicationCode = function(){
			return ApplicationCode;
		}
		
		var InitializationCode;
		/**
			Sets application's initalization code.
			@param {function} code Initalization code.
		*/
		this.SetInitializationCode = function(code){
			InitializationCode = code;
			return this;
		}
		
		/**
			Gets application's iniitalization code.
			@returns Initialization code.
		*/
		this.GetInitializationCode = function(){
			return InitializationCode;
		}
		
		/**
			Sets Save function for state creation.
			@param {function} func Function to be called during state save.
		*/
		this.SetSave = function(func){
			this.Save = func;
			return this;
		}
		
		/**
			Sets Load function for state parsing.
			@param {function} func Function to be called during state load.
		*/
		this.SetLoad = function(func){
			this.Load = func;
			return this;
		}
		
		/**
			Set the function which is executed after the application is initialized.
			@param {function} func Function for execution.
		*/
		this.SetStart = function(func){
			this.StartApp = func;
			return this;
		}
	}
}(Lively3D));/*
Copyright (C) 2012 Jari-Pekka Voutilainen

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
(function(Lively3D){
	/**
		@class Represents single scene.
	*/
	Lively3D.Scene = function(){
		
		var Model;
		/**
			Sets Model for Lively3D scene.
			@param model Model of the scene.
		*/
		this.SetModel = function(model){
			Model = model;
			return this;
		}
		
		/**
			Gets the model of the scene.
			@returns Model of the scene.
		*/
		this.GetModel = function(){
			return Model;
		}
		
		var Scene;
		/**
			Sets GLGE Scene for the Lively3D scene.
			@param scene GLGE Scene.
		*/
		this.SetScene = function(scene){
			Scene = scene;
			return this;
		}
		
		/**
			Gets GLGE scene of the Lively3d scene.
			@returns GLGE Scene.
		*/
		this.GetScene = function(){
			return Scene;
		}
	};
}(Lively3D));/*
Copyright (C) 2012 Jari-Pekka Voutilainen

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/


//TODO REFACTOR TO NEWEST VERSION!!!

(function(Lively3D){
  
	/**
		@namespace Functions for user interface.
	*/
	Lively3D.UI = {};
  
	Lively3D.UI.HTTPServers = {
		LOCAL: { inUse: false },
		NODE: { inUse: false },
		PROXY: { inUse: true }
	};
  
  Lively3D.UI.colors = {
    menus : 0xE3E3E3,//0x6E7B8B,//0xA2B5CD,
    dialogs: 0xE8E8E8,
    notifications: 0xA2B5CD
  };
  
  Lively3D.UI.Dialogs = {
    loadState : null,
    saveState : null,
    addApp : null,
    loadScene : null,
    about : null,
    username : null,
    loadCompleted : null,
    menu : null,
    node : null,
    php : null
  };
  
  Lively3D.UI.create = function(scene){
     
    var createLogInButtonClick = function(scene){
      return function(event){
        if(Lively3D.UI.Dialogs.username.fields[0].input.text.length > 0){
          Lively3D.SetUsername(Lively3D.UI.Dialogs.username.fields[0].input.text);
          Lively3D.UI.Dialogs.username.remove();
         
          scene.GetModel().show();
          Lively3D.UI.Dialogs.menu.show();
        }
      };
    };
    
    var buttons = [];
    buttons.push({text: "Log in", onclick: createLogInButtonClick(scene)});
    var fields = [];
    fields.push({description: "Username"});
    
    Lively3D.UI.Dialogs.username = new WIDGET3D.Dialog({
      title : "Log in to Lively3D",
      color : Lively3D.UI.colors.dialogs,
      buttons : buttons,
      fields : fields,
      width : 200,
      height : 150
    });
    
    Lively3D.WIDGET.cameraGroup.add(Lively3D.UI.Dialogs.username);
    Lively3D.UI.Dialogs.username.setPosition(0,0,-200);
    
    var choices = [];
    choices.push({string : "Load Application", onclick: {handler : Lively3D.UI.ShowAppList}});
    choices.push({string : "Save Desktop", onclick: {handler : Lively3D.UI.ShowSaveDialog}});
    choices.push({string : "Load Desktop", onclick: {handler : Lively3D.UI.ShowStateList}});
    choices.push({string : "Load Scene", onclick: {handler : Lively3D.UI.ShowSceneList}});
    choices.push({string : "Switch Scene", onclick: {handler : Lively3D.ChangeScene}});
    choices.push({string : "Toggle Node.js", onclick: {handler : Lively3D.UI.ToggleNode}});
    choices.push({string : "About", onclick: {handler : Lively3D.UI.ShowAbout}});
    choices.push({string : "Sync for local usage", onclick: {handler : Lively3D.Sync}});
    
    Lively3D.UI.Dialogs.menu = new WIDGET3D.SelectDialog({width : 160, height : 360, choices : choices, color: Lively3D.UI.colors.menus});
    new WIDGET3D.DragControl(Lively3D.UI.Dialogs.menu, {
      mouseButton : 2,
      width : 800,
      height : 1600
    });
    
    new WIDGET3D.RollControl(Lively3D.UI.Dialogs.menu, {
      mouseButton : 2,
      shiftKey : true
    });
    
    Lively3D.WIDGET.cameraGroup.add(Lively3D.UI.Dialogs.menu);
    
    Lively3D.UI.Dialogs.menu.setPosition(-240, 0, -420);

    createLoadCompleted();
    createAbout();
    Lively3D.UI.Dialogs.menu.hide();
    scene.GetModel().hide();
    
  };
  
  Lively3D.UI.createAppDialog = function(files){
  
    var createOnClick = function(app){
      return function(event){
        Lively3D.UI.LoadApplication(app);
      };
    };
  
    var choices = [];
    for ( var i in files ){
      if ( files.hasOwnProperty(i)){
        var onclick = createOnClick(files[i]);
        choices.push({string : files[i], onclick: {handler : onclick}});
      }
    }
    Lively3D.UI.Dialogs.addApp = createListComponent(choices, "Select Application");
  };
  
  Lively3D.UI.createSceneDialog = function(files){
  
    var createOnClick = function(scene){
      return function(event){
        Lively3D.UI.LoadScene(scene);
      }
    };
  
    var choices = [];
    for ( var i in files ){
      if ( files.hasOwnProperty(i)){
        var onclick = createOnClick(files[i]);
        choices.push({string : files[i], onclick: {handler : onclick}});
      }
    }
    Lively3D.UI.Dialogs.loadScene = createListComponent(choices, "Select Skene");
  };
  
  Lively3D.UI.createStateDialog = function(files){
  
    var createOnClick = function(state){
      return function(event){
        Lively3D.UI.LoadDesktop(state);
      }
    };
  
    var choices = [];
    for ( var i in files ){
      if ( files.hasOwnProperty(i)){
        var onclick = createOnClick(files[i]);
        choices.push({string : files[i], onclick: {handler : onclick}});
      }
    }
    Lively3D.UI.Dialogs.loadState = createListComponent(choices, "Select Desktop");
  };
  
  var createListComponent = function(choices, text){
    
    if(choices.length == 1){
      var height = 340/3;
    }
    else if(choices.length < 10){
      var height = (340/5)*choices.length;
      
    }
    else if (choices.length < 15){
      var height = (340/14)*choices.length;
    }
    else{
      var height = 360;
    }
    
    var dialog = new WIDGET3D.SelectDialog({
      width : 160,
      height : height,
      depth : 2,
      choices : choices,
      color: Lively3D.UI.colors.menus,
      opacity : 0.7,
      text : text,
      hasCancel : true
    });
    Lively3D.WIDGET.cameraGroup.add(dialog);
    dialog.setPosition(0, 0, -420);
    dialog.setRotationX(-Math.PI/100.0);
    
    return dialog;
  };
	
  var createLoadCompleted = function(){
    
    var texture = THREE.ImageUtils.loadTexture("images/loadCompleted.png");
    var material = new THREE.MeshBasicMaterial({ map: texture, color : Lively3D.UI.colors.notifications});
    var mesh = new THREE.Mesh( new THREE.PlaneGeometry(100, 20), material);
    
    Lively3D.UI.Dialogs.loadCompleted = new WIDGET3D.Widget(mesh);
    Lively3D.WIDGET.cameraGroup.add(Lively3D.UI.Dialogs.loadCompleted);
    Lively3D.UI.Dialogs.loadCompleted.setPosition(0,0,-150);
    
    Lively3D.UI.Dialogs.loadCompleted.hide();
  };
  
  var createAbout = function(){
    
    var texture = THREE.ImageUtils.loadTexture("images/about.png");
    var material = new THREE.MeshBasicMaterial({ map: texture, color : Lively3D.UI.colors.notifications});
    var mesh = new THREE.Mesh( new THREE.PlaneGeometry(100, 100), material);
    Lively3D.UI.Dialogs.about = new WIDGET3D.Widget(mesh);
    Lively3D.WIDGET.cameraGroup.add(Lively3D.UI.Dialogs.about);
    Lively3D.UI.Dialogs.about.setPosition(0,0,-150);

    Lively3D.UI.Dialogs.about.hide();
    
    var onclick = function(event, dialog){
      Lively3D.UI.Dialogs.about.hide();
    }
    Lively3D.UI.Dialogs.about.addEventListener("click", onclick);
  };
	
  var choiceIndex = 5;
  /**
		Toggles between PHP- and Node.js proxies. Default is PHP-proxy.
	*/
	Lively3D.UI.ToggleNode = function(event){
		Lively3D.UI.HTTPServers.NODE.inUse = !Lively3D.UI.HTTPServers.NODE.inUse;
		Lively3D.UI.HTTPServers.PROXY.inUse = !Lively3D.UI.HTTPServers.PROXY.inUse;
    if(Lively3D.UI.HTTPServers.NODE.inUse){
      Lively3D.UI.Dialogs.menu.changeChoiceText("Toggle PHP", choiceIndex);
    }
    else{
      Lively3D.UI.Dialogs.menu.changeChoiceText("Toggle Node.js",choiceIndex);
    }
	};
	
	/**
		Enables usage of local web server. Functionality will be broken if web server is unavailable.
	*/
	Lively3D.UI.UseLocal = function(){
		console.log("Going offline...");
		Lively3D.UI.HTTPServers.LOCAL.inUse = true;
	};
  
	/**
		Enables usage of online resources.
	*/
	Lively3D.UI.UseOnline = function(){
		console.log("Going online...");
		Lively3D.UI.HTTPServers.LOCAL.inUse = false;
	};
	
	/**
		Shows notification about completing load process.
	*/
	Lively3D.UI.ShowLoadCompleted = function(){
    Lively3D.UI.Dialogs.loadCompleted.show();
    setTimeout(function(){Lively3D.UI.Dialogs.loadCompleted.hide();}, 1500);
	};
	
	/**
		Shows application list.
	*/
	Lively3D.UI.ShowAppList = function(event){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.ShowAppList();
		}
		else if (Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.ShowAppList();
		}
		else{
			Lively3D.Proxies.Node.ShowAppList();
		}
	};
	
	/**
		Loads applications.
		@param app Application name.
	*/
	Lively3D.UI.LoadApplication = function(app){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.LoadApplication(app);
		}
		else if ( Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.LoadApplication(app);
		}
		else{
			Lively3D.Proxies.Node.LoadApplication(app);
		
		}
	};
	
	/**
		Shows state list for current user.
	*/
	Lively3D.UI.ShowStateList = function(event){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.ShowStateList();
		}
		else if (Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.ShowStateList();
		}
		else{
			Lively3D.Proxies.Node.ShowStateList();
		}
	};
	
	/**
		Shows Scene list.
	*/
	Lively3D.UI.ShowSceneList = function(event){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.ShowSceneList();
		}
		else if (Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.ShowSceneList();
		}
		else{
			Lively3D.Proxies.Node.ShowSceneList();
		}
	};
	
	/**
		Loads Scene.
		@param scene Name of the scene.
	*/
	Lively3D.UI.LoadScene = function(scene){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.LoadScene(scene);
		}
		else if ( Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.LoadScene(scene);
		}
		else{
			Lively3D.Proxies.Node.LoadScene(scene);
		
		}
	};
	
	/**
		Saves desktop state
		@param filename Name of the state.
	*/
	Lively3D.UI.SaveDesktop = function(filename){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.SaveDesktop(filename);
		}
		else if ( Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.SaveDesktop(filename);
		}
		else{
			Lively3D.Proxies.Node.SaveDesktop(filename);
		}
	};
	
	/**
		Loads desktop state.
		@param state Name of the state.
	*/
	Lively3D.UI.LoadDesktop = function(state){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.LoadDesktop(state);
		}
		else if ( Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.LoadDesktop(state);
		}
		else{
			Lively3D.Proxies.Node.LoadDesktop(state);
		}
    Lively3D.UI.Dialogs.loadState.remove();
	};
  
	/**
		Shows dialog for saving desktop state. User enter state name in the dialog.
	*/
	Lively3D.UI.ShowSaveDialog = function(event){

    var fields = [];
    fields.push({description : "State name"});
    var buttons = [];
    buttons.push({text : "Save", onclick: Lively3D.UI.CloseSaveDialog});
    
    Lively3D.UI.Dialogs.saveState = new WIDGET3D.Dialog({
      color : Lively3D.UI.colors.dialogs,
      fields : fields,
      buttons : buttons,
      title : "Save Desktop",
      width : 200,
      height : 150,
      hasCancel : true
    });
    
    Lively3D.WIDGET.cameraGroup.add(Lively3D.UI.Dialogs.saveState);
    Lively3D.UI.Dialogs.saveState.setPosition(0,0,-200);
	};
	
	/**
		Closes save dialog. If statename field contains string, Desktopstate is saved.
	*/
	Lively3D.UI.CloseSaveDialog = function(event){ 
    if(Lively3D.UI.Dialogs.saveState.fields[0].input.text.length > 0){
      Lively3D.UI.SaveDesktop(Lively3D.UI.Dialogs.saveState.fields[0].input.text);
      Lively3D.UI.Dialogs.saveState.remove();
    }
	};
	
	/**
		Shows about dialog.
	*/
	Lively3D.UI.ShowAbout = function(event){
		Lively3D.UI.Dialogs.about.show();
	};
	
}(Lively3D));/*
Copyright (C) 2012 Jari-Pekka Voutilainen

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
(function(Lively3D){
	
	/** 
		Interface implementations for serverside proxies. 
		@name Lively3D.Proxies
	*/
	Lively3D.Proxies = {};
	
	/**
		Implementation for PHP-proxy.
		@namespace
	*/
	Lively3D.Proxies.PHP = {
		/** 
			Fetches application list from PHP-proxy and shows it to the user. 
		*/
		ShowAppList: function(){
		
			$.get("getFileList.php", {path: 'apps'}, function(list){
				var files = JSON.parse(list);
        Lively3D.UI.createAppDialog(files);
			});
		},
		
		/**
			Downloads application script and executes it.
			@param {string} app Filename of the application.
		*/
		LoadApplication: function(app){
			Lively3D.FileOperations.getScript(app, "apps/")
      Lively3D.UI.Dialogs.addApp.remove();
		},
		
		/**
			Serializes Desktop state as JSON and uploads it to the dropbox.
			@param {string} filename Filename for the state in dropbox.
		*/
		SaveDesktop: function(filename){
			var Applications = Lively3D.GetApplications();
			
			var LivelyState = '';
			var state = [];
			for ( var i in Applications ){
				if ( Applications.hasOwnProperty(i)){
					var app = Applications[i];

					var AppJSON = {
						Name: app.GetName(),
						Closed: app.isClosed(),
						Code: app.GetApplicationCode().toString(),
						Init: app.GetInitializationCode().toString(),
						AppState: app.Save()
					}
					
					state.push(AppJSON);
				}
			}
			LivelyState = JSON.stringify(state);
			Lively3D.FileOperations.uploadScript(filename, LivelyState, "states/" + Lively3D.GetUsername());
		},
		
		/**
			Downloads statefile from dropbox and de-serializes it.
			@param {string} filename Name of the statefile.
		*/
		LoadDesktop: function(filename){
			Lively3D.FileOperations.getJSON(filename, ParseDesktopJSON, "states/" + Lively3D.GetUsername() + '/');
		},
		
		/**
			Fetches statelist for the current username and shows it to the user.
		*/
		ShowStateList: function(){
			$.get("getFileList.php", {path: 'states/' + Lively3D.GetUsername()}, function(list){
				var files = JSON.parse(list);
				Lively3D.UI.createStateDialog(files);
			});
		},
		
		/**
			Fetches scene list and shows it to the user.
		*/
		ShowSceneList: function(){
			$.get("getFileList.php", {path: 'world'}, function(list){
				var files = JSON.parse(list);
        Lively3D.UI.createSceneDialog(files);
			});
		},
		
		/**
			Downloads scene script and executes it.
			@param {string} file Name of the scene file.
		*/
		LoadScene: function(file){
			Lively3D.FileOperations.getScript(file, "world/");
			Lively3D.UI.Dialogs.loadScene.remove();
		}		
	};
	
	var ParseDesktopJSON = function(data){
    var Applications = Lively3D.GetApplications();
    
    var appcount = Applications.length;
    for (var i = 0; i < appcount; ++i ){
      Applications[0].GetIcon().remove();
      Applications[0].GetWindowObject().remove();
      Applications.splice(0, 1);
    }
    
		var JSONArray = JSON.parse(data);	
		for ( var i in JSONArray ){
			if ( JSONArray.hasOwnProperty(i)){
				var JSONObject = JSONArray[i];
				var CodeFunc = eval("(" + JSONObject.Code + ")");
				var InitFunc = eval("(" + JSONObject.Init + ")");
				var app = Lively3D.AddApplication(JSONObject.Name, CodeFunc, InitFunc);
				app.StateFromDropbox = true;
				
				
				if ( JSONObject.Closed != true ){
					app.OpenAfterLoad = true;
				}
				
				app.Load(JSONObject.AppState);
				app.StartApp();
			}
		}
	};
	
	/**
		@namespace Implementation for Node.js-proxy.
	*/
	Lively3D.Proxies.Node = {
		/** 
			Fetches application list from Node.js-proxy and shows it to the user. 
		*/
		ShowAppList: function(){	
			$.get("/lively3d/node/filelist/apps", function(files){
        Lively3D.UI.createAppDialog(files);
			});
		},
		
		/**
			Downloads application script and executes it.
			@param {string} app Filename of the application.
		*/
		LoadApplication: function(app){
			$.get('/lively3d/node/file/apps/' + app, function(scripturl){
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = scripturl;
				document.head.appendChild(script);
			});
			Lively3D.UI.Dialogs.addApp.remove();
		},
		
		/**
			Serializes Desktop state as JSON and uploads it to the mongo database.
			@param {string} name Filename for the state in mongo database.
		*/
		SaveDesktop: function(name){
			var Applications = Lively3D.GetApplications();
			
			var state = {};
			state.name = name;
			state.user = Lively3D.GetUsername();
			state.applications = [];
			for ( var i in Applications ){
				if ( Applications.hasOwnProperty(i)){
					var app = Applications[i];

					var AppJSON = {
						Name: app.GetName(),
						Closed: app.isClosed(),
						Code: app.AppCode.toString(),
						Init: app.AppInit.toString(),
						AppState: app.Save()
					}
					
					state.applications.push(AppJSON);
				}
			}
			
			
			$.post("/lively3d/node/states/new", {state: state}, function(data){
				console.log(data);
			});
		},
		
		/**
			Downloads state from mongo database and de-serializes it.
			@param {string} name Name of the state.
		*/
		LoadDesktop: function(name){
			var Applications = Lively3D.GetApplications();
			
			var appcount = Applications.length;
			for (var i = 0; i < appcount; ++i ){
        Applications[0].GetIcon().remove();
        Applications[0].GetWindowObject().remove();
        Applications.splice(0, 1);
			}
      
			$.get("/lively3d/node/states/" + Lively3D.GetUsername() + '/' + name, function (data){
				var apps = data.applications;
				for ( var i in apps){
					if ( apps.hasOwnProperty(i)){
						var JSONObject = apps[i];
						var CodeFunc = eval("(" + JSONObject.Code + ")");
						var InitFunc = eval("(" + JSONObject.Init + ")");
						var app = Lively3D.AddApplication(JSONObject.Name, CodeFunc, InitFunc);
						app.StateFromDropbox = true;
						
						
						if ( JSONObject.Closed != 'true' ){			
							app.OpenAfterLoad = true;
						}
						
						app.Load(JSONObject.AppState);
						app.StartApp();
					}
				}
			});
		},
		/**
			Fetches statelist for the current username and shows it to the user.
		*/
		ShowStateList: function(){
			$.get("/lively3d/node/states/" + Lively3D.GetUsername(), function(files){
				Lively3D.UI.createStateDialog(files);
			});
		},
		/**
			Fetches scene list and shows it to the user.
		*/
		ShowSceneList: function(){
			$.get("/lively3d/node/filelist/world", function(files){
				Lively3D.UI.createSceneDialog(files);
			});
		},
		/**
			Downloads scene script and executes it.
			@param {string} file Name of the scene file.
		*/
		LoadScene: function(file){
			$.get('/lively3d/node/file/world/' + file, function(scripturl){
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = scripturl;
				document.head.appendChild(script);
			});
			Lively3D.UI.Dialogs.loadScene.remove();
		}
	};	
	
	/**
		@namespace Implementation for locally executed Node.js webserver.
	*/
	Lively3D.Proxies.Local = {
		/** 
			Reads application list from local node.js-application and shows it to the user. 
		*/
		ShowAppList: function(){
			$.ajax({
				url: "http://127.0.0.1:8000/filelist/apps", 
				success: function(files){
					Lively3D.UI.createAppDialog(files);
				}
			});
		},
		/**
			Loads application script and executes it.
			@param {string} app Filename of the application.
		*/
		LoadApplication: function(app){
			$.get('http://127.0.0.1:8000/file/apps/' + app, function(scripturl){
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = scripturl;
				document.head.appendChild(script);
			});
			Lively3D.UI.Dialogs.addApp.remove();
		},
		
		/**
			Reads scene list and shows it to user.
		*/
		ShowSceneList: function(){
			$.get("http://localhost:8000/filelist/world", function(files){
				Lively3D.UI.createSceneDialog(files);
			});
		
		},
		
		/**
			Loads scene script and executes it.
			@param {script} file Filename of the scene.
		*/
		LoadScene: function(file){
			$.get('http://localhost:8000/file/world/' + file, function(scripturl){
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = scripturl;
				document.head.appendChild(script);
			});
			Lively3D.UI.Dialogs.loadScene.remove();
		},
		
		/**
			Checks availability of http server in localhost port 8000.
		*/
		CheckAvailability: function(callback){
		
			$.ajax({
				url: "http://localhost:8000/", 
				success: function(data){
					if ( data.success == false ){
						alert(data.message);
					}else{
						callback();
					}
				},
				error: function(){
					alert("Local Node.js application not found. Please run 'node local.js'");
				}
			});
		},
		
		/** Downloads dropbox contents to local filesystem. */
		Sync: function(callback){
			$.ajax({
				url: "http://localhost:8000/sync",
				data: {host: window.location.host, port: window.location.port, path: window.location.pathname },
				success: function(data){
					if ( data.success == true ){
						alert(data.message);
					}
				},
				error: function(){
					alert("Local Node.js application not found. Please run 'node local.js' and associated Mongo-database.");
				}
			});
		},
		
		/**
			Loads resources for application.
			Functionality similar to {@link Lively3D.FileOperations.LoadResources}.
			@param App Application which needs the resources.
			@param {string} resource Currently loaded resource.
		*/
		LoadResources: function(App, resource){
			$.get("http://localhost:8000/filearray", {'names[]': App.Resources[resource], path: App.ResourcePath}, function(array){
				App.ResourceHandlers[resource](array);
				App.ResourcesLoaded(resource);
			});	
		}
	};
}(Lively3D));