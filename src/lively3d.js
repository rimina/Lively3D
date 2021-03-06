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
}(Lively3D));