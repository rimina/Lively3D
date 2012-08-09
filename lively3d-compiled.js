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
	@author Jari-Pekka Voutilainen
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
  
  /**
    @namespace Holds THREE.JS related variables.
  */
  Lively3D.THREE = {
    /** Three.js Renderer */
    renderer : null,
    /** Three.js Camera */
    camera : null
  };
  
  /**
    @namespace Holds WIDGET3D related variables.
  */
  Lively3D.WIDGET = {
    mainWindow : null,
    
    cameraGroup : null,
    
    addToCameraGroup : function(component){
      if(this.cameraGroup){
        var rot = this.cameraGroup.getRot();
        var loc = this.cameraGroup.getLocation();
        
        this.cameraGroup.setLocation(0, 0, 0);
        this.cameraGroup.setRot(0, 0, 0);
        
        this.cameraGroup.addChild(component);
        
        this.cameraGroup.setLocation(loc.x, loc.y, loc.z);
        this.cameraGroup.setRot(rot.x, rot.y, rot.z);
      }
    }
    
  };
  
	var Scenes = [];
	var CurrentScene = 0;
	
	var DefaultScene = {
		Id:'mainscene',
    
    Model: null,
    
    //creates the object related to scene and
    //initializes it to be ready for use
    Init: function(){
      this.Model = new THREEJS_WIDGET3D.GridWindow({width: 2000,
        height: 2000,
        color: 0x6A8455,
        defaultControls : true});
      
      this.Model.setZ(200);
      Lively3D.WIDGET.mainWindow.addChild(this.Model);
    },
    
    //creates a scene specific icon for the application
    CreateApplication: function(appCanvas){
    
      var icon = new THREEJS_WIDGET3D.GridIcon({picture : "../images/app.png",
        color : 0x00EE55,
        parent : this.Model});
      
      return icon;
    },
    
    //animatingfunction for scene
		RenderingFunction: function(now, lastTime){
      this.Model.update();
    },
    
    //scene specific operations that are done when app is opened
		Open: function(app, camera){
		},
    
    //scene specific operations that are done when app is closed
		Close: function(app, camera){
		},
    
    Remove: function(){
      this.Model.remove();
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
    Lively3D.THREE.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, autoClear: false});
    Lively3D.THREE.renderer.setClearColorHex( 0xf9f9f9, 1);
    Lively3D.THREE.renderer.setSize(canvas.width, canvas.height);
  
    //Initialising widget library
    Lively3D.WIDGET.mainWindow = THREEJS_WIDGET3D.init({renderer : Lively3D.THREE.renderer});
    Lively3D.WIDGET.cameraGroup = new WIDGET3D.Window();
    Lively3D.WIDGET.mainWindow.addChild(Lively3D.WIDGET.cameraGroup);
    
    Lively3D.THREE.camera = THREEJS_WIDGET3D.camera;
    
    Lively3D.WIDGET.cameraGroup.container_.add(Lively3D.THREE.camera);
    Lively3D.WIDGET.cameraGroup.setZ(2800);
    
    //Lively3D.WIDGET.cameraGroup.setRotY(Math.PI/10.0);
    //Lively3D.WIDGET.cameraGroup.setRotX(Math.PI/10.0);
    
    Scenes.push( new Lively3D.Scene().SetScene(DefaultScene));
    Scenes[CurrentScene].GetScene().Init();
    Scenes[CurrentScene].SetModel(Scenes[CurrentScene].GetScene().Model);
    
    Lively3D.UI.create(Scenes[CurrentScene]);
    
    //ANIMATION LOOP
    var lasttime=0;
    var now;

    function animLoop(){
      requestAnimFrame(animLoop, canvas);
      now=parseInt(new Date().getTime());
      
      //Updates scene
      Scenes[CurrentScene].GetScene().RenderingFunction(now, lasttime);
      
      //Updates applications texture (canvas)
      for(var i = 0; i < Applications.length; ++i){
        var window = Applications[i].GetWindowObject();
        if(window.isVisible_){
          window.update();
        }
      }
      //the rendering function
      THREEJS_WIDGET3D.render()
      lasttime=now;
      
    }

    animLoop();
	}
	
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
    var display = new THREEJS_WIDGET3D.TitledWindow({title : name, 
      width  : 1500,
      height : 1500,
      material : material,
      defaultControls : true});
    
    display.setZ(-1800);
    
    Lively3D.WIDGET.addToCameraGroup(display);
    
    //creating a scene specific icon for the application   
    var icon = Scenes[CurrentScene].GetScene().CreateApplication(canvas);
    
    
    //updatefunction for application window
    var updateDisplay = function(display){
      if(display.mesh_.material.map){
        display.mesh_.material.map.needsUpdate = true;
      }
    };
    display.addUpdateCallback(updateDisplay, display);
    
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
    
    icon.addEventListener(WIDGET3D.EventType.ondblclick, iconOndblclick, livelyapp);
    display.closeButton_.addEventListener(WIDGET3D.EventType.onclick, closeDisplay, livelyapp);
    display.title_.addEventListener(WIDGET3D.EventType.ondblclick, titleOndblclick, livelyapp);
    
    //binds applications event listeners to application window
    AddEventListeners(display, app.EventListeners, livelyapp);
    
		return livelyapp;
	}
  
  //eventhandler for windows close button
  var closeDisplay = function(event, livelyapp){
    Lively3D.Close(livelyapp);
  };
  
  //eventhandler for icon doubleclick.
  var iconOndblclick = function(event, livelyapp){
    Lively3D.Open(livelyapp);
  };
  
  var titleOndblclick = function(event, livelyapp){
    if(!livelyapp.isMaximized()){
      livelyapp.Maximize();
    }
    else{
      livelyapp.Minimize();
    }
  };
  
  Lively3D.Maximize = function(window){
    var loc = window.getLocation();
    var d = {x : Lively3D.THREE.camera.position.x - loc.x,
      y : Lively3D.THREE.camera.position.y - loc.y,
      z : Lively3D.THREE.camera.position.z - loc.z};
      
    window.d = d;
    window.setLocation(loc.x + 0.3 * d.x, loc.y + 0.3 * d.y, loc.z + 0.3 * d.z);
  };
  
  Lively3D.Minimize = function(window){
    var loc = window.getLocation();
    window.setLocation(loc.x - 0.3*window.d.x, loc.y - 0.3*window.d.y, loc.z - 0.3*window.d.z);
  };

  /**
		Binds application eventlisteners to application window.
		@param object application window object, WIDGET3D -object
    @param events events -object that contains the eventhandler callback code
	*/
	var AddEventListeners = function(object, events, app){
    
    if(object && events){
      
      var hasClick = false;
      var hasMouseDown = false;
      var hasMouseUp = false;
      var hasMouseMove = false;
      
      for(var i in events){
        AddListener(object, i, events, app);
        
        if(i == "click"){
          hasClick = true;
        }
        else if(i == "mousedown"){
          hasMouseDown = true;
        }
      }
      
      if(!hasClick && !hasMouseDown){
        object.addEventListener(WIDGET3D.EventType.onclick, mouseEvents, {app:app, callback: false});
      }
    }
    
	}
  
  /**
		AddEventListeners calls this function for every event key found,
    This function does the eventhandler binding to app window.
		@param object application window object, WIDGET3D -object
    @param event event key, string
    @param events events -object that contains the eventhandler callback code
	*/
  var AddListener = function(object, event, events, app){
    switch(event){
      case "click":
        object.addEventListener(WIDGET3D.EventType.onclick, mouseEvents, {app:app, callback: events.click});
        return true;
        
      case "dblclick":
        object.addEventListener(WIDGET3D.EventType.ondblclick, mouseEvents, {app:app, callback: events.dblclick});
        return true;
        
      case "mousemove":
        object.addEventListener(WIDGET3D.EventType.onmousemove, mouseEvents, {app:app, callback: events.mousemove});
        return true;
        
      case "mousedown":
        object.addEventListener(WIDGET3D.EventType.onmousedown, mouseEvents, {app:app, callback: events.mousedown});
        return true;
      
      case "mouseup":
        object.addEventListener(WIDGET3D.EventType.onmouseup, mouseEvents, {app:app, callback: events.mouseup});
        return true;
        
      case "mouseover":
        object.addEventListener(WIDGET3D.EventType.onmouseover, mouseEvents, {app:app, callback: events.mouseover});
        return true;
        
      case "mouseout":
        object.addEventListener(WIDGET3D.EventType.onmouseout, mouseEvents, {app:app, callback: events.mouseout});
        return true;
        
      case "keypress":
        object.addEventListener(WIDGET3D.EventType.onkeypress, events.keypress);
        return true;
        
      case "keydown":
        object.addEventListener(WIDGET3D.EventType.onkeydown, events.keydown);
        return true;
        
      case "keyup":
        object.addEventListener(WIDGET3D.EventType.onkeyup, events.keyup);
        return true;
        
      default:
        console.log("default: " + event);
        return false;
    }
  };
  
  /**
    Calculates coordinate translations from screen coordinates to
    application coordinates and calls applications event handler for the event
    
    @param event DOM event object
    @param args object that contain application and it's callbackfunction
  */
  var mouseEvents = function(event, args){
  
    var window = args.app.GetWindowObject();
    
    if(event.type == "click" || event.type == "mousedown"){
      window.focus();
    }
    
    if(args.callback){
      var normalX = ((window.mousePosition_.x - (-window.width_  / 2.0)) / (window.width_ ));
      
      //planegeometry is represented in xz plane and it's just rotated to right position
      //that's why in planes up is z. for other objects up is y.
      var normalY = ((window.mousePosition_.z - (-window.height_ / 2.0)) / (window.height_));
      
      var canvasWidth = window.mesh_.material.map.image.width;
      var canvasHeight = window.mesh_.material.map.image.height;
      
      var x = normalX * canvasWidth;
      var y = normalY * canvasHeight;
      
      var coords = [x, y];
      
      var param = {"coord": coords, "canvas": window.mesh_.material.map.image, "event": event};
      
      args.callback(param);
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
    if(app.isMaximized()){
      app.Minimize();
    }
		app.Close();
    window.hide();
    Scenes[CurrentScene].GetScene().Close(app);
	}
	
	
	/**
		Gets index of the current scene.
		@returns {integer} Index of the scene.
	*/
	Lively3D.GetCurrentSceneIndex = function(){
		return CurrentScene;
	}
	

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
			if ( app.MaximizeAfterLoad == true){
				app.Maximize();
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
      var icon = Scenes[CurrentScene].GetScene().CreateApplication(Applications[i].GetWindowObject().mesh_.material.map.image);
      icon.addEventListener(WIDGET3D.EventType.ondblclick, iconOndblclick, Applications[i]);
      Applications[i].SetIcon(icon);
		}
		
	}
	
	
	/**
		Shows notification about completion of downloading Application or 3D Scene. 
	*/
	Lively3D.LoadCompleted = function(){
		Lively3D.UI.ShowLoadCompleted();
	}
	
	/**
		Syncs dropbox-contents to local filesystem if local node.js application is running.
	*/
	Lively3D.Sync = function(event){
		Lively3D.Proxies.Local.CheckAvailability(function(){
			Lively3D.Proxies.Local.Sync();
		});
	}
	
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
	}
	
	Lively3D.GetUsername = function(){
		return username;
	}

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
		
    
    //MUUTA S�L��
    
		var maximized = false;
		
		/**
			Is application maximized or minimized. Default minimized.
			@returns {boolean} True if application is maximized, otherwise false.
			
		*/
		this.isMaximized = function(){
			return maximized;
		}
		
		/**
			Maximizes application.
		*/
		this.Maximize = function(){
			maximized = true;
      Lively3D.Maximize(WindowObject);
		}
		
		/**
			Minimizes application
		*/
		this.Minimize = function(){
			maximized = false;
      Lively3D.Minimize(WindowObject);
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
(function(Lively3D){
  
	/**
		@namespace Functions for user interface.
	*/
	Lively3D.UI = {};
	Lively3D.UI.HTTPServers = {
		LOCAL: { inUse: false },
		NODE: { inUse: false },
		PROXY: { inUse: true }
	}
  
  Lively3D.UI.Dialogs = {
    loadState : null,
    addApp : null,
    loadScene : null,
    about : null,
    loadCompleted : null,
    menu : null,
    node : null,
    php : null
  }
  
  Lively3D.UI.create = function(scene){
  
    var username = new THREEJS_WIDGET3D.Dialog({text : "Enter Username", buttonText : "Ok", color: 0xB6C5BE, opacity : 1.0});
    
    username.setZ(-1300);
    Lively3D.WIDGET.addToCameraGroup(username);
    
    var okButtonOnclick = function(event, parameters){
      if(parameters.dialog.textBox_.string_.length > 0){
        Lively3D.SetUsername(parameters.dialog.textBox_.string_);
        parameters.dialog.remove();
        parameters.scene.show();
        Lively3D.UI.Dialogs.menu.show();
      }
    }
      
    var choices = [];
    choices.push({string : "Load Application", onclick: {handler : Lively3D.UI.ShowAppList}});
    choices.push({string : "Save Desktop", onclick: {handler : Lively3D.UI.ShowSaveDialog}});
    choices.push({string : "Load Desktop", onclick: {handler : Lively3D.UI.ShowStateList}});
    choices.push({string : "Load Scene", onclick: {handler : Lively3D.UI.ShowSceneList}});
    choices.push({string : "Switch Scene", onclick: {handler : Lively3D.ChangeScene}});
    choices.push({string : "Toggle Node.js", onclick: {handler : Lively3D.UI.ToggleNode}});
    choices.push({string : "About", onclick: {handler : Lively3D.UI.ShowAbout}});
    choices.push({string : "Sync for local usage", onclick: {handler : Lively3D.Sync}});
    
    Lively3D.UI.Dialogs.menu = new THREEJS_WIDGET3D.SelectDialog({width : 1300, height : 3000, choices : choices, color: 0x527F76, opacity : 0.7});
    Lively3D.UI.Dialogs.menu.setLocation(-2750,-1000, -2900);
    Lively3D.UI.Dialogs.menu.setRotX(-Math.PI/100.0);
    Lively3D.WIDGET.addToCameraGroup(Lively3D.UI.Dialogs.menu);
    
    username.button_.addEventListener(WIDGET3D.EventType.onclick, okButtonOnclick,
      {dialog: username, scene : scene.GetModel() });
    
    createLoadCompleted();
    createAbout();
    Lively3D.UI.Dialogs.menu.hide();
    
  }
  
  Lively3D.UI.createAppDialog = function(files){
    var choices = [];
    for ( var i in files ){
      if ( files.hasOwnProperty(i)){
        choices.push({string : files[i], onclick: {handler : Lively3D.UI.LoadApplication, parameters : files[i]}});
      }
    }
    Lively3D.UI.Dialogs.addApp = createListComponent(choices, "Select Application");
  };
  
  Lively3D.UI.createSceneDialog = function(files){
    var choices = [];
    for ( var i in files ){
      if ( files.hasOwnProperty(i)){
        choices.push({string : files[i], onclick: {handler : Lively3D.UI.LoadScene, parameters : files[i]}});
      }
    }
    Lively3D.UI.Dialogs.loadScene = createListComponent(choices, "Select Skene");
  };
  
  Lively3D.UI.createStateDialog = function(files){
    var choices = [];
    for ( var i in files ){
      if ( files.hasOwnProperty(i)){
        choices.push({string : files[i], onclick: {handler : Lively3D.UI.LoadDesktop, parameters : files[i]}});
      }
    }
    Lively3D.UI.Dialogs.loadState = createListComponent(choices, "Select Desktop");
  };
  
  var createListComponent = function(choices, text){
    var dialog = new THREEJS_WIDGET3D.SelectDialog({width : 1000, height : 3200, choices : choices,
      color: 0x527F76, opacity : 0.7, text : text, hasCancel : true});
    dialog.setLocation(0, -1600, -2400);
    Lively3D.WIDGET.addToCameraGroup(dialog);
    
    return dialog;
  }
	
  var createLoadCompleted = function(){
    Lively3D.UI.Dialogs.loadCompleted = new WIDGET3D.Basic();
    var texture = THREE.ImageUtils.loadTexture("images/loadCompleted.png");
    var material = new THREE.MeshBasicMaterial({ map: texture, color : 0x527F76, opacity : 1.0 });
    var mesh = new THREE.Mesh( new THREE.PlaneGeometry(2000, 500), material);
    mesh.doubleSided = true;
    mesh.flipSided = true;
    mesh.rotation.x = Math.PI/2;
    mesh.position.set(0, 0, -2400);
    Lively3D.UI.Dialogs.loadCompleted.setMesh(mesh);
    Lively3D.WIDGET.addToCameraGroup(Lively3D.UI.Dialogs.loadCompleted);
    Lively3D.UI.Dialogs.loadCompleted.hide();
  }
  
  var createAbout = function(){
    Lively3D.UI.Dialogs.about = new WIDGET3D.Basic();
    var texture = THREE.ImageUtils.loadTexture("images/about.png");
    var material = new THREE.MeshBasicMaterial({ map: texture, color : 0x527F76, opacity : 1.0 });
    var mesh = new THREE.Mesh( new THREE.PlaneGeometry(2000, 2000), material);
    mesh.doubleSided = true;
    mesh.flipSided = true;
    mesh.rotation.x = Math.PI/2;
    mesh.position.set(0, 0, -2400);
    Lively3D.UI.Dialogs.about.setMesh(mesh);
    Lively3D.WIDGET.addToCameraGroup(Lively3D.UI.Dialogs.about);
    Lively3D.UI.Dialogs.about.hide();
    
    var onclick = function(event, dialog){
      dialog.hide();
    }
    Lively3D.UI.Dialogs.about.addEventListener(WIDGET3D.EventType.onclick, onclick, Lively3D.UI.Dialogs.about);
  }
	
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
	}
	
	/**
		Enables usage of local web server. Functionality will be broken if web server is unavailable.
	*/
	Lively3D.UI.UseLocal = function(){
		console.log("Going offline...");
		Lively3D.UI.HTTPServers.LOCAL.inUse = true;
	}
	/**
		Enables usage of online resources.
	*/
	Lively3D.UI.UseOnline = function(){
		console.log("Going online...");
		Lively3D.UI.HTTPServers.LOCAL.inUse = false;
	}
	
	/**
		Shows notification about completing load process.
	*/
	Lively3D.UI.ShowLoadCompleted = function(){
    Lively3D.UI.Dialogs.loadCompleted.show();
    setTimeout(function(){Lively3D.UI.Dialogs.loadCompleted.hide();}, 1500);
	}
	
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
	}
	
	/**
		Loads applications.
		@param app Application name.
	*/
	Lively3D.UI.LoadApplication = function(event, app){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.LoadApplication(app);
		}
		else if ( Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.LoadApplication(app);
		}
		else{
			Lively3D.Proxies.Node.LoadApplication(app);
		
		}
	}
	
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
	}
	
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
	}
	
	/**
		Loads Scene.
		@param scene Name of the scene.
	*/
	Lively3D.UI.LoadScene = function(event, scene){
		if ( Lively3D.UI.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.LoadScene(scene);
		}
		else if ( Lively3D.UI.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.LoadScene(scene);
		}
		else{
			Lively3D.Proxies.Node.LoadScene(scene);
		
		}
	}
	
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
	}
	
	/**
		Loads desktop state.
		@param state Name of the state.
	*/
	Lively3D.UI.LoadDesktop = function(event, state){
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
    var saveState = new THREEJS_WIDGET3D.Dialog({text : "State name:", buttonText : "Save", color: 0xB6C5BE, opacity: 1.0});
    saveState.button_.addEventListener(WIDGET3D.EventType.onclick, Lively3D.UI.CloseSaveDialog, saveState);
    saveState.setZ(-1300);
    Lively3D.WIDGET.addToCameraGroup(saveState);
	}
	
	/**
		Closes save dialog. If statename field contains string, Desktopstate is saved.
	*/
	Lively3D.UI.CloseSaveDialog = function(event, dialog){ 
    if(dialog.textBox_.string_.length > 0){
      Lively3D.UI.SaveDesktop(dialog.textBox_.string_);
      dialog.remove();
    }
	}
	
	/**
		Shows about dialog.
	*/
	Lively3D.UI.ShowAbout = function(event){
		Lively3D.UI.Dialogs.about.show();
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
					var maximized = app.isMaximized();
					if ( app.isMaximized() == true ){
						app.Minimize();
					}
					var AppJSON = {
						Name: app.GetName(),
						Closed: app.isClosed(),
						Maximized: maximized,
						Code: app.GetApplicationCode().toString(),
						Init: app.GetInitializationCode().toString(),
						AppState: app.Save()
					}
					
					state.push(AppJSON);
					if ( maximized == true ){
						app.Maximize();
					}
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
				
				if ( JSONObject.Maximized == true ){
					app.MaximizeAfterLoad = true;
				}
				
				app.Load(JSONObject.AppState);
				app.StartApp();
			}
		}
	};
	
	var SetAppLocation = function(App, location){
		App.GetSceneObject(0).setLocX(location.x);
		App.GetSceneObject(0).setLocY(location.y);
		App.GetSceneObject(0).setLocZ(location.z);
	};
	
	var SetAppRotation = function(App, rotation){
		App.GetSceneObject(0).setRotX(rotation.x);
		App.GetSceneObject(0).setRotY(rotation.y);
		App.GetSceneObject(0).setRotZ(rotation.z);
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
					var maximized = app.isMaximized();
					if ( app.isMaximized() == true ){
						app.Minimize();
					}
					var AppJSON = {
						Name: app.GetName(),
						Closed: app.isClosed(),
						Maximized: maximized,
						Code: app.AppCode.toString(),
						Init: app.AppInit.toString(),
						AppState: app.Save()
					}
					
					state.applications.push(AppJSON);
					if ( maximized == true ){
						app.Maximize();
					}
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
						
						if ( JSONObject.Maximized == 'true' ){
							app.MaximizeAfterLoad = true;
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