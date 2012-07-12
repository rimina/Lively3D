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
    renderer: null,
    /** Three.js Camera */
    camera: null,
    /** Three.js Scene */
    scene: null
  };
  
  /**
    @namespace Holds WIDGET3D related variables.
  */
  Lively3D.WIDGET = {
    /** Convas */
    mainWindow : null
  };
	
	var Scenes = [];
	var CurrentScene = 0;
	
  //TODO: GRID LAYOUT WINDOWSTA DEFAULT SCENE
	var DefaultScene = {
		Id:'mainscene',
    
    Model: null,
    
    Icon: null,
    
    //creates the object related to scene and
    //initializes it to be ready for use
    Init: function(){
    
      this.Model = new THREEJS_WIDGET3D.GridWindow(2000, 2000, 0x6A8455.toString(16));

      this.Model.addEventListener(WIDGET3D.EventType.onmousedown, this.Model.mousedownHandler, this.Model);
      this.Model.addEventListener(WIDGET3D.EventType.onmouseup, this.Model.mouseupHandler, this.Model);
      this.Model.addEventListener(WIDGET3D.EventType.onmousemove, this.Model.mousemoveHandler, this.Model);
    },
    
    //creates a scene specific icon for the application
    CreateIcon: function(){
    
      var iconTexture = THREE.ImageUtils.loadTexture("../images/app.png");
      this.Icon = new THREEJS_WIDGET3D.GridIcon(iconTexture, this.Model);
      return this.Icon;
    },
    
    //animatingfunction for scene
		RenderingFunction: function(){
      this.Model.update();
    },
    
    //scene specific operations that are done when app is opened
		Open: function(app, camera){
		},
    
    //scene specific operations that are done when app is closed
		Close: function(app, camera){
		}
    
	};
	
	var Applications = [];
  
	/**
		Initializes Lively3D environment.
		@param canvas ID of the canvas-element used for rendering Lively3D. 
	*/
	Lively3D.Init = function(canvas){
		
		var userform = $("<h1>Enter Username</h1>Username: <input type='text' name='username' id='username'/><h3 onclick='Lively3D.UI.EnterUsername()'>Ok</h3>");
		Lively3D.UI.ShowHTML(userform, true);
		
		if ( !canvas ){
			canvasName = canvasDefault;
		}
		else{
			canvasName = canvas;
		}
	
		var canvas = document.getElementById(canvasName);
    
    Lively3D.THREE.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, autoClear: false});
    Lively3D.THREE.renderer.setClearColorHex( 0xf9f9f9, 1);
    Lively3D.THREE.renderer.setSize(canvas.width, canvas.height);
  
  
    //MAIN SCENE
    Lively3D.THREE.scene = new THREE.Scene();
    
    //MAIN CAMERA
    Lively3D.THREE.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 1, 10000);
    Lively3D.THREE.camera.position.z = 2000;
    Lively3D.THREE.scene.add( Lively3D.THREE.camera );
    
    Lively3D.THREE.scene.add( new THREE.AmbientLight( 0x404040 ) );
    
    //GUIS MAIN WINDOW
    Lively3D.WIDGET.mainWindow = THREEJS_WIDGET3D.init(Lively3D.THREE.scene, Lively3D.THREE.renderer, Lively3D.THREE.camera);
    
    //T�SS� PIT�ISI OIKEASTI LUODA UUSI LIVELY3D SCENE....
    Scenes.push(DefaultScene);
    Scenes[CurrentScene].Init();
    
    Lively3D.WIDGET.mainWindow.addChild(Scenes[CurrentScene].Model);
    
    
    
    //ANIMATION LOOP
    var lasttime=0;
    var now;

    function animLoop(){
      requestAnimFrame(animLoop, canvas);
      now=parseInt(new Date().getTime());
      
      //Updates scene
      Scenes[CurrentScene].RenderingFunction(now, lasttime);
      
      //Updates applications texture (canvas)
      for(var i = 0; i < Applications.length; ++i){
        Applications[i].GetWindowObject().update();
      }
      
      //the rendering function
      Lively3D.THREE.renderer.render(Lively3D.THREE.scene, Lively3D.THREE.camera);
      lasttime=now;
      
    }

    animLoop();
	}
  
  var createGUI = function(){
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
    
    //creating a scene specific icon for the application   
    var icon = Scenes[CurrentScene].CreateIcon();
    
    //create appcanvas texture fo application window
    var tex = new THREE.Texture(canvas);
    var material = new THREE.MeshBasicMaterial({
      map: tex
    });
    tex.needsUpdate = true;
    
    //creating application window
    var display = new THREEJS_WIDGET3D.TitledWindow(name, 1500, 1500, material);
    Lively3D.WIDGET.mainWindow.addChild(display);
    
    //drag & drop controlls are tide to application window titlebar
    display.title_.addEventListener(WIDGET3D.EventType.onmousedown, display.mousedownHandler, display);
    display.title_.addEventListener(WIDGET3D.EventType.onmouseup, display.mouseupHandler, display);
    display.title_.addEventListener(WIDGET3D.EventType.onmousemove, display.mousemoveHandler, display);
    
    //updatefunction for application window
    var updateDisplay = function(display){
      if(display.mesh_.material.map){
        display.mesh_.material.map.needsUpdate = true;
      }
    };
    display.addUpdateCallback(updateDisplay, display);
    display.setZ(200);
    //app window is hidden until the app is opened
    display.hide();
    
    livelyapp.SetWindowObject(display);
		
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
    
    //event handler for icon doubleclick.
    var iconOndblclick = function(event, livelyapp){
      Lively3D.Open(livelyapp);
    };
    icon.addEventListener(WIDGET3D.EventType.ondblclick, iconOndblclick, livelyapp);
    
    //event handler for windows close button
    var closeDisplay = function(event, livelyapp){
      Lively3D.Close(livelyapp);
    };
    display.closeButton_.addEventListener(WIDGET3D.EventType.onclick, closeDisplay, livelyapp);
    
    //binds applications event listeners to application window
    AddEventListeners(display, app.EventListeners, livelyapp);
    
		return livelyapp;
	}
  
  /**
		Binds application eventlisteners to application window.
		@param object application window object, WIDGET3D -object
    @param events events -object that contains the eventhandler callback code
	*/
	var AddEventListeners = function(object, events, app){
    
    var hasClickEvent = false;
    if(object && events){
      for(var i in events){
        hasClickEvent = AddListener(object, i, events, app);
      }
    }
    if(!hasClickEvent){
      //default eventhandler focuses appwindow on click
      object.addEventListener(WIDGET3D.EventType.onclick, function(event){});
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
        return false;
        
      case "mousemove":
        object.addEventListener(WIDGET3D.EventType.onmousemove, mouseEvents, {app:app, callback: events.mousemove});
        return false;
        
      case "mousedown":
        object.addEventListener(WIDGET3D.EventType.onmousedown, mouseEvents, {app:app, callback: events.mousedown});
        return false;
      
      case "mouseup":
        object.addEventListener(WIDGET3D.EventType.onmouseup, mouseEvents, {app:app, callback: events.mouseup});
        return false;
        
      case "mouseover":
        object.addEventListener(WIDGET3D.EventType.onmouseover, mouseEvents, {app:app, callback: events.mouseover});
        return false;
        
      case "mouseout":
        object.addEventListener(WIDGET3D.EventType.onmouseout, mouseEvents, {app:app, callback: events.mouseout});
        return false;
        
      case "keypress":
        object.addEventListener(WIDGET3D.EventType.onkeypress, events.keypress);
        return false;
        
      case "keydown":
        object.addEventListener(WIDGET3D.EventType.onkeydown, events.keydown);
        return false;
        
      case "keyup":
        object.addEventListener(WIDGET3D.EventType.onkeyup, events.keyup);
        return false;
        
      default:
        console.log("default: " + event);
        return false;
    }
  };
  
  /**
    Calculates coordinate translations from screen coordinates to
    application coordinates and calls applications event handler for the event
    
    @param event DOM event object
    @param argumets object that contain application and it's callbackfunction
  */
  var mouseEvents = function(event, arguments){
    var window = arguments.app.GetWindowObject();
    
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
    
    arguments.callback(param);
  };
	
	/**
		Opens given Lively3D Application in every 3D-scene.
		@param app Lively3D Application
	*/
	Lively3D.Open = function(app){
		
    //kutsuu scenen open funktiota
		Scenes[CurrentScene].Open(app, null/*Scenes[CurrentScene].GetScene()*/);
    
		app.Open();
    app.GetWindowObject().show();
    app.GetWindowObject().focus();
    
	}

	/**
		Closes given Lively3D Application in every 3D-scene.
		@param app Lively3D Application
	*/
	Lively3D.Close = function(app){
    
    //TODO: minimoi ikkuna, jos se oli maksimoitu!!
    
		app.Close();
    app.GetWindowObject().hide();
    //kutsuu scenen close objektia
    Scenes[CurrentScene]/*.GetModel()*/.Close(app, null/*Scenes[CurrentScene].GetScene()*/);
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
			//$.getScript(scripturl, function(){
			//	console.log("Executed scriptfile: " + filename);
			//});
			
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
				Lively3D.Maximize(app);
			}
		}
		Lively3D.UI.ShowLoadCompleted();
    
	}
	
	var SceneBuffer = [];
	
	/**
		Adds a new scene to the environment.
		@param scene Object which implements Lively3D APIs for 3d scene.
	*/
  //TEE T�LLE JOTAIN
	Lively3D.AddScene = function(scene){
		console.log("Loading scene..");
		
		SceneBuffer.push(scene);
		scene.Resources['Document'] = 'Document/' + scene.File;
		
		scene.ResourceHandlers['Document'] = function(docURL){
				Lively3D.GLGE.document.loadDocument(docURL[0]);
		};
		
		
		Lively3D.LoadResources(scene);
	}
	
  //T�LLEKIN T�YTYY EHK� TEHD� JOTAIN
	var SceneLoader = function(url){
		
		var parsedURL = parseUrl(url);
		
		console.log("scene loaded from url: "+ url + " and file is " + parsedURL.file);
		
		var found = false;
		for ( var i in SceneBuffer){
			if ( SceneBuffer.hasOwnProperty(i)){
				if ( SceneBuffer[i].File == parsedURL.file){
					if ( SceneBuffer[i].DocumentDone ){
						SceneBuffer[i].DocumentDone();
					}
					Scenes.push(new Lively3D.Scene().SetScene(Lively3D.GLGE.document.getElement(SceneBuffer[i].Id)).SetModel(SceneBuffer[i]));
					AddAppsToScene(SceneBuffer[i]);
					SceneBuffer.splice(i, 1);
					found = true;
				}
			}
		}
		if ( found == false){
			console.log("error loading scene");
		}
	}
	
	var parseUrl = function(data) {
		var e=/((http|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+\.[^#?\s]+)(#[\w\-]+)?/;

		if (data.match(e)) {
			return  {url: RegExp['$&'],
                protocol: RegExp.$2,
                host:RegExp.$3,
                path:RegExp.$4,
                file:RegExp.$6,
                hash:RegExp.$7};
		}
		else {
			return  {url:"", protocol:"",host:"",path:"",file:"",hash:""};
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
	Lively3D.ChangeScene = function(){
		
		/*for ( var i in Applications){
			if ( Applications.hasOwnProperty(i)){
				if ( !Applications[i].isClosed() ){
					Lively3D.Close(Applications[i]);
				}
			}
		}*/
		
		CurrentScene += 1;
		if (CurrentScene == Scenes.length ){
			CurrentScene = 0;
		}
		
		/*for ( var i in Applications){
			Applications[i].SetCurrentSceneObject(CurrentScene);
		}*/
		
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
	Lively3D.Sync = function(){
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
}(Lively3D));
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
		}
		
		/**
			Minimizes application
		*/
		this.Minimize = function(){
			maximized = false;
		}
		
		var SceneObjects = [];
		/**
			Add new Scene object to the application.
			@param obj The object that represents application within the scene.
		*/
		this.AddSceneObject = function(obj){
			SceneObjects.push(obj);
			if ( CurrentObject == null ){
				CurrentObject = obj;
			}
			return this;
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
		
		var CurrentObject;
		
		/**
			Gets the current scene object within the scene.
		*/
		this.GetCurrentSceneObject = function(){
			return CurrentObject;
		}
		
		/**
			Sets the current scene object.
			@param {integer} index Index of the scene.
		*/
		this.SetCurrentSceneObject = function(index){
			if ( index != null  && index >= 0 && index < SceneObjects.length ){
				CurrentObject = SceneObjects[index];
			}
			else{
				console.log("No such scene object");
			}
		}
		
		/**
			Gets scene object for specified scene.
			@param {integer} index Index of the scene.
		*/
		this.GetSceneObject = function(index){
			if ( index != null  && index >= 0 && index < SceneObjects.length ){
				return SceneObjects[index].group;
			}
			else{
				console.log("No such scene object");
			}
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
	
	/**
		Toggles between PHP- and Node.js proxies. Default is PHP-proxy.
	*/
	Lively3D.UI.ToggleNode = function(){
		Lively3D.UI.HTTPServers.NODE.inUse = !Lively3D.UI.HTTPServers.NODE.inUse;
		Lively3D.UI.HTTPServers.PROXY.inUse = !Lively3D.UI.HTTPServers.PROXY.inUse;
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
		var div = $("<div id='loadcompleted'><p>Load Compeleted</p></div>")
		div.appendTo("#container");
		div.fadeIn("slow",function(){
			setTimeout(function(){div.fadeOut("slow",function(){div.remove();});}, 1000);
		});
	}
	
	/**
		Shows application list.
	*/
	Lively3D.UI.ShowAppList = function(){
		if ( this.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.ShowAppList();
		}
		else if ( this.HTTPServers.PROXY.inUse == true ){
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
	Lively3D.UI.LoadApplication = function(app){
		if ( this.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.LoadApplication(app);
		}
		else if ( this.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.LoadApplication(app);
		}
		else{
			Lively3D.Proxies.Node.LoadApplication(app);
		
		}
	}
	
	/**
		Shows state list for current user.
	*/
	Lively3D.UI.ShowStateList = function(){
		if ( this.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.ShowStateList();
		}
		else if ( this.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.ShowStateList();
		}
		else{
			Lively3D.Proxies.Node.ShowStateList();
		}
	}
	
	/**
		Shows Scene list.
	*/
	Lively3D.UI.ShowSceneList = function(){
		if ( this.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.ShowSceneList();
		}
		else if ( this.HTTPServers.PROXY.inUse == true ){
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
	Lively3D.UI.LoadScene = function(scene){
		if ( this.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.LoadScene(scene);
		}
		else if ( this.HTTPServers.PROXY.inUse == true ){
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
		if ( this.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.SaveDesktop(filename);
		}
		else if ( this.HTTPServers.PROXY.inUse == true ){
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
	Lively3D.UI.LoadDesktop = function(state){
		if ( this.HTTPServers.LOCAL.inUse == true ){
			Lively3D.Proxies.Local.LoadDesktop(state);
			Lively3D.UI.CloseDialog();
		}
		else if ( this.HTTPServers.PROXY.inUse == true ){
			Lively3D.Proxies.PHP.LoadDesktop(state);
			Lively3D.UI.CloseDialog();
		}
		else{
			Lively3D.Proxies.Node.LoadDesktop(state);
			Lively3D.UI.CloseDialog();
		}
	};
	
	
	
	var tmpApp;
	/**
		Shows dialog for saving desktop state. User enter state name in the dialog.
	*/
	Lively3D.UI.ShowSaveDialog = function(){
		var content = $('<h1>Save state</h1>State name:<input type="text" name="statename" id="statename"/><h3 onclick="Lively3D.UI.CloseSaveDialog();">Save</h3>');
		this.ShowHTML(content);
		tmpApp = Lively3D.GLGE.clickedObject;
		Lively3D.GLGE.clickedObject = null;	
	}
	
	/**
		Closes save dialog. If statename field contains string, Desktopstate is saved.
	*/
	Lively3D.UI.CloseSaveDialog = function(){
		var name = $("#statename");
		if ( name[0].value.length != 0 ){
			Lively3D.UI.SaveDesktop(name[0].value);
			this.CloseDialog();
			if (tmpApp){
				Lively3D.GLGE.clickedObject = tmpApp;
				tmpApp = null;
			}
		}
		else{
			$("<h3>Please supply state name</h3>").appendTo("#dialog");
		}
	}
	
	/**
		Shows about dialog.
	*/
	Lively3D.UI.ShowAbout = function(){
		var content = $("<h1>About</h1><p>Lively3D code made by Jari-Pekka Voutilainen</p><p>Applications developed by: Arto Salminen, Matti Anttonen, Anna-Liisa Mattila, Lotta Liikkanen, Jani Heininen, Mika V�lim�ki</p>");
		this.ShowHTML(content);
	}
	
	/**
		Shows message in dialog.
		@param {string} message Message to display.
	*/
	Lively3D.UI.ShowMessage = function(message){
		var content = $("<p>" + message + "</p>");
		this.ShowHTML(content);
	}
	

	
	Lively3D.UI.ActiveDialog;
	/**
		Shows HTML content to user.
		@param content HTML code to display.
		@param {boolean} omitCancel Whether to display cancel-button or not. If true, button is omitted.
	*/
	Lively3D.UI.ShowHTML = function(content, omitCancel){
		if ( this.ActiveDialog != null ){
			if ( this.ActiveDialog.cancelOmitted != true){
				SwitchDialog(content);
			}
		}
		else{
			if ( omitCancel != true ){
				var dialog = $("<div class='dialog' id='dialog'><h3 onclick='Lively3D.UI.CloseDialog();'>Cancel</h3></div>");
			}
			else{
				var dialog = $("<div class='dialog' id='dialog'></div>");
				dialog.cancelOmitted = true;
			}
			dialog.prepend(content);
			dialog.appendTo($('#container'));
			dialog.fadeIn("slow");
			this.ActiveDialog = dialog;
		}
	}
	
	/**
		Closes dialog.
	*/
	Lively3D.UI.CloseDialog = function(){
		this.ActiveDialog.fadeOut("slow", function(){
			Lively3D.UI.ActiveDialog.remove();
			Lively3D.UI.ActiveDialog = null;
		});
	}
	
	/**
		Switches existing dialog.
		@param content Contents of new dialog.
	*/
	var SwitchDialog = function(content){
		Lively3D.UI.ActiveDialog.fadeOut("fast", function(){
			Lively3D.UI.ActiveDialog.remove();
			var dialog = $("<div class='dialog' id='dialog'><h3 onclick='Lively3D.UI.CloseDialog();'>Cancel</h3></div>");
			dialog.prepend(content);
			dialog.appendTo($('#container'));
			dialog.fadeIn("fast");
			Lively3D.UI.ActiveDialog = dialog;
		});
	}
	
	
	/**
		Saves username from the original dialog.
	*/
	Lively3D.UI.EnterUsername = function(){
		var name = $("#username");
		if ( name[0].value.length != 0 ){
			Lively3D.SetUsername(name[0].value);
			this.CloseDialog();
		}
		else{
			$("<h3>Please enter username</h3>").appendTo("#dialog");
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
				var content = $("<h1>Select Application</h1><div></div>");
				var element = content.last();
				
				for ( var i in files ){
					if ( files.hasOwnProperty(i)){
						var entry = $("<span onclick=\"Lively3D.UI.LoadApplication('" + files[i] + "')\">" + files[i] + "</span></br>");
						entry.appendTo(element);
					}
				}
				Lively3D.UI.ShowHTML(content);
				
			});
		},
		
		/**
			Downloads application script and executes it.
			@param {string} app Filename of the application.
		*/
		LoadApplication: function(app){
			Lively3D.FileOperations.getScript(app, "apps/")
			Lively3D.UI.CloseDialog();
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
						Lively3D.Minimize(app);
					}
					var AppJSON = {
						Name: app.GetName(),
						Location: { x: app.GetCurrentSceneObject().getLocX(), y: app.GetCurrentSceneObject().getLocY(), z: app.GetCurrentSceneObject().getLocZ()},
						Rotation: app.GetCurrentSceneObject().getRotation(),
						Closed: app.isClosed(),
						Maximized: maximized,
						Code: app.GetApplicationCode().toString(),
						Init: app.GetInitializationCode().toString(),
						AppState: app.Save()
					}
					
					state.push(AppJSON);
					if ( maximized == true ){
						Lively3D.Maximize(app);
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
				var content = $('<h1>Select State</h1><div></div>');
				var element = content.last();
				for ( var i in files ){
					if ( files.hasOwnProperty(i)){
						var entry = $("<span onclick=\"Lively3D.UI.LoadDesktop('" + files[i] + "')\">" + files[i] + "</span></br>");
						entry.appendTo(element);
					}
				}
				Lively3D.UI.ShowHTML(content);
			});
		},
		
		/**
			Fetches scene list and shows it to the user.
		*/
		ShowSceneList: function(){
			$.get("getFileList.php", {path: 'scenes'}, function(list){
				var files = JSON.parse(list);
				var content = $('<h1>Select Scene</h1><div></div>');
				var element = content.last();
				for ( var i in files ){
					if ( files.hasOwnProperty(i)){
						var entry = $("<span onclick=\"Lively3D.UI.LoadScene('" + files[i] + "')\">" + files[i] + "</span></br>");
						entry.appendTo(element);
					}
				}
				Lively3D.UI.ShowHTML(content);
				
			});
		},
		
		/**
			Downloads scene script and executes it.
			@param {string} file Name of the scene file.
		*/
		LoadScene: function(file){
			Lively3D.FileOperations.getScript(file, "scenes/");
			Lively3D.UI.CloseDialog();
		}		
	};
	
	var ParseDesktopJSON = function(data){
		var JSONArray = JSON.parse(data);
		
		for ( var i in JSONArray ){
			if ( JSONArray.hasOwnProperty(i)){
				var JSONObject = JSONArray[i];
				var CodeFunc = eval("(" + JSONObject.Code + ")");
				var InitFunc = eval("(" + JSONObject.Init + ")");
				var app = Lively3D.AddApplication(JSONObject.Name, CodeFunc, InitFunc);
				SetAppLocation(app, JSONObject.Location);
				SetAppRotation(app, JSONObject.Rotation);
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
				
				var content = $("<h1>Select Application</h1><div></div>");
				var element = content.last();
				for ( var i in files ){
					if ( files.hasOwnProperty(i)){
						var entry = $("<span onclick=\"Lively3D.UI.LoadApplication('" + files[i] + "')\">" + files[i] + "</span></br>");
						entry.appendTo(element);
					}
				}
				Lively3D.UI.ShowHTML(content);
				
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
			Lively3D.UI.CloseDialog();
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
						Lively3D.Minimize(app);
					}
					var AppJSON = {
						Name: app.GetName(),
						Location: { x: app.GetCurrentSceneObject().getLocX(), y: app.GetCurrentSceneObject().getLocY(), z: app.GetCurrentSceneObject().getLocZ()},
						Rotation: app.GetCurrentSceneObject().getRotation(),
						Closed: app.isClosed(),
						Maximized: maximized,
						Code: app.AppCode.toString(),
						Init: app.AppInit.toString(),
						AppState: app.Save()
					}
					
					state.applications.push(AppJSON);
					if ( maximized == true ){
						Lively3D.Maximize(app);
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
				for ( var i in Lively3D.GLGE.scenes ){
					if ( Lively3D.GLGE.scenes.hasOwnProperty(i) ){
						Lively3D.GLGE.scenes[i].scene.removeChild(Applications[i].current);
					}
				}
				
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
						SetAppLocation(app, JSONObject.Location);
						SetAppRotation(app, JSONObject.Rotation);
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
				
				var content = $('<h1>Select State</h1><div></div>');
				var element = content.last();
				for ( var i in files ){
					if ( files.hasOwnProperty(i)){
						var entry = $("<span onclick=\"Lively3D.UI.LoadDesktop('" + files[i] + "')\">" + files[i] + "</span></br>");
						entry.appendTo(element);
					}
				}
				Lively3D.UI.ShowHTML(content);
			});
		},
		/**
			Fetches scene list and shows it to the user.
		*/
		ShowSceneList: function(){
			$.get("/lively3d/node/filelist/scenes", function(files){
				var content = $('<h1>Select Scene</h1><div></div>');
				var element = content.last();
				for ( var i in files ){
					if ( files.hasOwnProperty(i)){
						var entry = $("<span onclick=\"Lively3D.UI.LoadScene('" + files[i] + "')\">" + files[i] + "</span></br>");
						entry.appendTo(element);
					}
				}
				Lively3D.UI.ShowHTML(content);
				
			});
		},
		/**
			Downloads scene script and executes it.
			@param {string} file Name of the scene file.
		*/
		LoadScene: function(file){
			$.get('/lively3d/node/file/scenes/' + file, function(scripturl){
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = scripturl;
				document.head.appendChild(script);
			});
			
			Lively3D.UI.CloseDialog();
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
					var content = $("<h1>Select Application</h1><div></div>");
					var element = content.last();
					for ( var i in files ){
						if ( files.hasOwnProperty(i)){
							var entry = $("<span onclick=\"Lively3D.UI.LoadApplication('" + files[i] + "')\">" + files[i] + "</span></br>");
							entry.appendTo(element);
						}
					}
					Lively3D.UI.ShowHTML(content);
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
			Lively3D.UI.CloseDialog();
		},
		
		/**
			Reads scene list and shows it to user.
		*/
		ShowSceneList: function(){
			$.get("http://localhost:8000/filelist/scenes", function(files){
				var content = $('<h1>Select Scene</h1><div></div>');
				var element = content.last();
				for ( var i in files ){
					if ( files.hasOwnProperty(i)){
						var entry = $("<span onclick=\"Lively3D.UI.LoadScene('" + files[i] + "')\">" + files[i] + "</span></br>");
						entry.appendTo(element);
					}
				}
				Lively3D.UI.ShowHTML(content);
				
			});
		
		},
		
		/**
			Loads scene script and executes it.
			@param {script} file Filename of the scene.
		*/
		LoadScene: function(file){
			$.get('http://localhost:8000/file/scenes/' + file, function(scripturl){
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = scripturl;
				document.head.appendChild(script);
			});
			Lively3D.UI.CloseDialog();
		},
		
		/**
			Checks availability of http server in localhost port 8000.
		*/
		CheckAvailability: function(callback){
		
			$.ajax({
				url: "http://localhost:8000/", 
				success: function(data){
					if ( data.success == false ){
						Lively3D.UI.ShowMessage(data.message);
					}else{
						callback()
					}
				},
				error: function(){
					Lively3D.UI.ShowMessage("Local Node.js application not found. Please run 'node local.js'");
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
						Lively3D.UI.ShowMessage(data.message);
					}
				},
				error: function(){
					Lively3D.UI.ShowMessage("Local Node.js application not found. Please run 'node local.js' and associated Mongo-database.");
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