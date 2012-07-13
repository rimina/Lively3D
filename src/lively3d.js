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
    
    Controlls : null,
    
    Clk: null,
    
    //creates the object related to scene and
    //initializes it to be ready for use
    Init: function(){
    
      this.Model = new THREEJS_WIDGET3D.GridWindow(2000, 2000, 0x6A8455.toString(16));

      this.Model.addEventListener(WIDGET3D.EventType.onmousedown, this.Model.mousedownHandler, this.Model);
      this.Model.addEventListener(WIDGET3D.EventType.onmouseup, this.Model.mouseupHandler, this.Model);
      this.Model.addEventListener(WIDGET3D.EventType.onmousemove, this.Model.mousemoveHandler, this.Model);
      
      this.Controlls = new THREE.FirstPersonControls(Lively3D.THREE.camera, Lively3D.THREE.renderer.domElement);
      this.Clk = new THREE.Clock();
      
      Lively3D.THREE.camera.lookAt(this.Model.getLocation());
      console.log(this.Controlls);
    },
    
    //creates a scene specific icon for the application
    CreateIcon: function(){
    
      var iconTexture = THREE.ImageUtils.loadTexture("../images/app.png");
      this.Icon = new THREEJS_WIDGET3D.GridIcon(iconTexture, this.Model);
      return this.Icon;
    },
    
    //animatingfunction for scene
		RenderingFunction: function(now, lastTime){
      this.Model.update();
      this.Controlls.update(this.Clk.getDelta());
    },
    
    //scene specific operations that are done when app is opened
		Open: function(app, camera){
      if(applicationsInRun == 0){
        this.Controlls.freeze = true;
        //Lively3D.THREE.camera.position.z = 3000;
        //Lively3D.THREE.camera.position.x = 0;
        //Lively3D.THREE.camera.position.y = 0;
        //Lively3D.THREE.camera.lookAt(app.GetWindowObject().getLocation());
      }
      //Lively3D.THREE.camera.lookAt(app.GetWindowObject().getLocation());
		},
    
    //scene specific operations that are done when app is closed
		Close: function(app, camera){
      
      if(applicationsInRun == 0){
        this.Controlls.freeze = false;
        Lively3D.THREE.camera.lookAt(this.Model.getLocation());
      }
		}
    
	};
	
	var Applications = [];
  var applicationsInRun = 0;
  
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
    Lively3D.THREE.camera.position.z = 3000;
    Lively3D.THREE.scene.add( Lively3D.THREE.camera );
    
    Lively3D.THREE.scene.add( new THREE.AmbientLight( 0x404040 ) );
    
    //GUIS MAIN WINDOW
    Lively3D.WIDGET.mainWindow = THREEJS_WIDGET3D.init(Lively3D.THREE.scene, Lively3D.THREE.renderer, Lively3D.THREE.camera);
    
    //TÄSSÄ PITÄISI OIKEASTI LUODA UUSI LIVELY3D SCENE....
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
    display.setZ(1000);
    
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
    
    icon.addEventListener(WIDGET3D.EventType.ondblclick, iconOndblclick, livelyapp);
    display.closeButton_.addEventListener(WIDGET3D.EventType.onclick, closeDisplay, livelyapp);
    
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
        else if(i == "mouseup"){
          hasMouseUp = true;
        }
        else if(i == "mousemove"){
          hasMouseMove = true;
        }
      }
      
      if(!hasClick && !hasMouseDown){
        object.addEventListener(WIDGET3D.EventType.onclick, mouseEvents, {app:app, callback: false});
      }

      if(!hasMouseUp){
        object.addEventListener(WIDGET3D.EventType.onmouseup, mouseEvents, {app:app, callback: false});
      }
      
      if(!hasMouseMove){
        object.addEventListener(WIDGET3D.EventType.onmousemove, mouseEvents, {app:app, callback: false});
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
    else if(event.type == "mouseup"){
      window.mouseupHandler(event, window);
    }
    else if(event.type == "mousemove"){
      window.mousemoveHandler(event, window);
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
		
    //kutsuu scenen open funktiota
		Scenes[CurrentScene].Open(app, null/*Scenes[CurrentScene].GetScene()*/);
    
		app.Open();
    app.GetWindowObject().show();
    app.GetWindowObject().focus();
    ++applicationsInRun;
    
	}

	/**
		Closes given Lively3D Application in every 3D-scene.
		@param app Lively3D Application
	*/
	Lively3D.Close = function(app){
    
    //TODO: minimoi ikkuna, jos se oli maksimoitu!!
    --applicationsInRun;
    
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
  //TEE TÄLLE JOTAIN
	Lively3D.AddScene = function(scene){
		console.log("Loading scene..");
		
		SceneBuffer.push(scene);
		scene.Resources['Document'] = 'Document/' + scene.File;
		
		scene.ResourceHandlers['Document'] = function(docURL){
				Lively3D.GLGE.document.loadDocument(docURL[0]);
		};
		
		
		Lively3D.LoadResources(scene);
	}
	
  //TÄLLEKIN TÄYTYY EHKÄ TEHDÄ JOTAIN
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
