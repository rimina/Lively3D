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
    /** Scene window */
    mainWindow : null,
    /** App window */
    grid : null,
    /** App icons */
    icons : [],
  };
	
	var Scenes = [];
	var CurrentScene = 0;
	
  //TODO: GRID LAYOUT WINDOWSTA DEFAULT SCENE
	var DefaultScene = {
		Id:'mainscene',
    
    //scenen animointifunktio
		RenderingFunction: function(){},
    
		//GLGEObject: "DefaultSceneObject.children[0]",
		//GLGEGroup: "DefaultSceneObject",
    
    //mitä tehdään scenelle, kun appi avataan
		Open: function(app, camera){
			//app.GetWindowObject().setLookat(null);
			//app.GetWindowObject().setRotZ(0).setRotX(0).setRotY(Math.PI);
			//app.GetWindowObject().setScale(3,3,3);
			//app.GetWindowObject().setLoc(app.GetSceneObject(0).getLocX(),app.GetSceneObject(0).getLocY(),app.GetSceneObject(0).getLocZ());
		},
    
    //mitä tehdään scenelle, kun appi suljetaan
		Close: function(app, camera){
			//app.GetSceneObject(0).setLoc(app.GetWindowObject().getLocX(),app.GetWindowObject().getLocY(),app.GetWindowObject().getLocZ());
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
    Lively3D.THREE.camera.position.z = 1600;
    Lively3D.THREE.scene.add( Lively3D.THREE.camera );
    
    Lively3D.THREE.scene.add( new THREE.AmbientLight( 0x404040 ) );
    
    Lively3D.WIDGET.mainWindow = THREEJS_WIDGET3D.init(Lively3D.THREE.scene, Lively3D.THREE.renderer, Lively3D.THREE.camera);
    
    //THIS SHOULD BE A DEFAULT SCENE THING
    //TÄSSÄ PITÄISI OIKEASTI LUODA UUSI LIVELY3D SCENE....
    Lively3D.WIDGET.grid = new THREEJS_WIDGET3D.GridWindow(2000, 2000, 0xFF90BF.toString(16));
    Lively3D.WIDGET.mainWindow.addChild(Lively3D.WIDGET.grid);
    
    
    var lasttime=0;
    var now;

    function animLoop(){
      requestAnimFrame(animLoop, canvas);
      now=parseInt(new Date().getTime());
      
      //tämän pitäisi olla scenen render -funktio
      Lively3D.WIDGET.grid.update();
      
      //Updates applications texture (canvas)
      for(var i = 0; i < Applications.length; ++i){
        Applications[i].GetWindowObject().update();
      }
      
      //Scenes[CurrentScene].GetModel().RenderingFunction(now, lasttime);
      Lively3D.THREE.renderer.render(Lively3D.THREE.scene, Lively3D.THREE.camera);
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
    
    console.log(app);
		var canvas = app.GetCanvas();
	
		livelyapp.SetStart(app.StartApp);
	
		//create appcanvas texture
    var tex = new THREE.Texture(canvas);
    var material = new THREE.MeshBasicMaterial({
      map: tex
    });
    tex.needsUpdate = true;
    
    
    var iconTexture = THREE.ImageUtils.loadTexture("../images/app.png");
    
    var icon = new THREEJS_WIDGET3D.GridIcon(iconTexture, Lively3D.WIDGET.grid);
    livelyapp.SetIconObject(icon);
    
    var display = new THREEJS_WIDGET3D.TitledWindow(name, 1500, 1000, material);
    Lively3D.WIDGET.mainWindow.addChild(display);
    
    var updateDisplay = function(display){
      if(display.mesh_.material.map){
        display.mesh_.material.map.needsUpdate = true;
      }
    };
    
    display.addUpdateCallback(updateDisplay, display);
    display.setZ(100);
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
    
    //event handler for icon click.
    var iconOnclick = function(event, livelyapp){
      livelyapp.Open();
      livelyapp.GetWindowObject().show();
      livelyapp.GetWindowObject().focus();
    };
    icon.addEventListener(WIDGET3D.EventType.onclick, iconOnclick, livelyapp);
    
    //event handler for windows close button
    var closeDisplay = function(event, livelyapp){
      livelyapp.Close();
      livelyapp.GetWindowObject().hide();
    };
    display.closeButton_.addEventListener(WIDGET3D.EventType.onclick, closeDisplay, livelyapp);
    
    AddEventListeners(display, app.EventListeners);
    
		return livelyapp;
	}

	
  //Binds application eventlisteners to
  // application window events
	var AddEventListeners = function(object, events){
    
    if(object && events){
      for(var i in events){
        addListener(object, i, events);
      }
    }
    
	}
  
  var addListener = function(object, event, events){
    switch(event){
      case "click":
        object.addEventListener(Widget3D.EventType.onclick, events.click);
        break;
        
      case "dblclick":
        object.addEventListener(Widget3D.EventType.ondblclick, events.dblclick);
        break;
        
      case "mousemove":
        object.addEventListener(WIDGET3D.EventType.onmousemove, events.mousemove);
        break;
        
      case "mousedown":
        object.addEventListener(WIDGET3D.EventType.onmousedown, events.mousedown);
        break;
      
      
      case "mouseup":
        object.addEventListener(WIDGET3D.EventType.onmouseup, events.mouseup);
        break;
        
      case "mouseover":
        object.addEventListener(WIDGET3D.EventType.onmouseover, events.mouseover);
        break;
        
      case "mouseout":
        object.addEventListener(WIDGET3D.EventType.onmouseout, events.mouseout);
        break;
        
      case "keypress":
        object.addEventListener(WIDGET3D.EventType.onkeydown, events.keypress);
        break;
        
      case "keydown":
        object.addEventListener(WIDGET3D.EventType.onkeydown, events.keydown);
        break;
        
      default:
        console.log("default");
        return;
    }
  };
	
	var AppIsOpen = false;
	
	/**
		Opens given Lively3D Application in every 3D-scene.
		@param app Lively3D Application
	*/
  
  //Kutsutaan, kun appia klikataan
  //VOI KÄYTTÄÄ VASTA KUN SCENET ON KORJATTU
	Lively3D.Open = function(app){
		
    //kutsuu scenen open funktiota
		Scenes[CurrentScene].GetModel().Open(app, Scenes[CurrentScene].GetScene());
		
		app.Open();
	}

	/**
		Closes given Lively3D Application in every 3D-scene.
		@param app Lively3D Application
	*/
  
  //TODO: REDO
  //VOI KÄYTTÄÄ VASTA KUN SCENET ON KORJATTU
	Lively3D.Close = function(app){
    
    //minimoi ikkuna, jos se oli maksimoitu
    
		app.Close();
		
    //kutsuu scenen close objektia
    Scenes[CurrentScene].GetModel().Close(app, Scenes[CurrentScene].GetScene());
	}

	/**
		Maximizes given Lively3D Application in the current scene.
		@param app Lively3D Application 
	*/
  
  //TODO: REDO
	Lively3D.Maximize = function(app){
			
		/*var scene = Scenes[CurrentScene].GetScene();
		var ray = scene.makeRay(window.innerWidth/2, window.innerHeight/2);
		var FrontOfCamera = [];
		FrontOfCamera = [ray.origin[0] - ray.coord[0]*11,
			ray.origin[1] - ray.coord[1]*11,
			ray.origin[2] - ray.coord[2]*11];
			
		app.OldLocation = [app.GetWindowObject().getLocX(),app.GetWindowObject().getLocY(),app.GetWindowObject().getLocZ()];
		app.GetWindowObject().setLoc(FrontOfCamera[0],FrontOfCamera[1],FrontOfCamera[2]).setScale(1,1,1);
		app.Maximize();	
		this.GLGE.clickedObject = app.GetWindowMaterial();*/
	}
	
	/**
		Minimizes given Lively3D Application to the original location and size.
		@param app Lively3D Application
	*/
  
  //TODO: REDO
	Lively3D.Minimize = function(app){
		/*app.GetWindowObject().setLoc(app.OldLocation[0],app.OldLocation[1],app.OldLocation[2]).setScale(3,3,3);
		app.Minimize();
		this.GLGE.clickedObject = app.GetWindowMaterial();*/
	}
  
	
	/**
		Fires given event to given application.
		@param {string} eventname Name of the event for firing.
		@param app Application which is the target of the event.
		@param textureCoordinates x- and y-coordinates in texture of the event.
		@param glge_object The GLGE Object which represents the target application.
		@param event Javascript event-object.
	*/
  
  //TODO: REDO EVENT FIRING 
	Lively3D.FireEvent= function(eventname, app, textureCoordinates,glge_object, event ){
	
		
		if ( textureCoordinates, glge_object ){
			var material;
			material = glge_object.getMaterial();
			
			var tex = material.getLayers()[0].getTexture();
			
			//tex is GLGE.TextureCanvas
			if ( tex.getCanvas ){
				var params;
				if ( eventname != "mousewheel" ){
					var canvas = tex.getCanvas();
					var canvasCoordinates = [ textureCoordinates[0]*canvas.width, (1-textureCoordinates[1])*canvas.height ]; 
					params = { "coord":canvasCoordinates, "canvas":canvas };
				}
				else{
					params = event;
				}
				material.fireEvent(eventname, params);
			}
		}
		else{
			app.GetCurrentSceneObject().fireEvent(eventname);
		}
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
	Lively3D.AddScene = function(scene){
		console.log("Loading scene..");
		
		SceneBuffer.push(scene);
		scene.Resources['Document'] = 'Document/' + scene.File;
		
		scene.ResourceHandlers['Document'] = function(docURL){
				Lively3D.GLGE.document.loadDocument(docURL[0]);
		};
		
		
		Lively3D.LoadResources(scene);
	}
	
  //Tee tälle jotain
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
		
		for ( var i in Applications){
			if ( Applications.hasOwnProperty(i)){
				if ( !Applications[i].isClosed() ){
					Lively3D.Close(Applications[i]);
				}
			}
		}
		
		CurrentScene += 1;
		if (CurrentScene == Scenes.length ){
			CurrentScene = 0;
		}
		
		for ( var i in Applications){
			Applications[i].SetCurrentSceneObject(CurrentScene);
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
