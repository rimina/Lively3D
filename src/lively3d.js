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
    mainWindow : null,
    /** Scene window */
    //scene is WIDGET3D window. it might be styled or not
    // but it's a window that can have children (applications)
    // scene window is a child of a mainWindow
    grid : null
  };
	
	var Scenes = [];
	var CurrentScene = 0;
	
  //TODO: GRID LAYOUT WINDOWSTA DEFAULT SCENE
	var DefaultScene = {
		Id:'mainscene',
    
    //scenen animointifunktio
		RenderingFunction: function(){
      //Haetaan scenen malli ja kutsutaan sille update -funktiota
    },
    
		//GLGEObject: "DefaultSceneObject.children[0]",
		//GLGEGroup: "DefaultSceneObject",
    
    //mit� tehd��n scenelle, kun appi avataan
		Open: function(app, camera){
			//app.GetWindowObject().setLookat(null);
			//app.GetWindowObject().setRotZ(0).setRotX(0).setRotY(Math.PI);
			//app.GetWindowObject().setScale(3,3,3);
			//app.GetWindowObject().setLoc(app.GetSceneObject(0).getLocX(),app.GetSceneObject(0).getLocY(),app.GetSceneObject(0).getLocZ());
		},
    
    //mit� tehd��n scenelle, kun appi suljetaan
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
    
    //T�SS� PIT�ISI OIKEASTI LUODA UUSI LIVELY3D SCENE....
    //
    //GRID on scenen malli ja periaatteessa mallin luominen pit�isi tapahtua scene� luodessa, ei t�ss� kohdassa.
    //Scenen pit�� m��ritt�� addApplication -fuktio, jonka avulla appi saadaan luotua haluttuun esitystapaan ja
    //scenen vaihtamiseen t�ytyy tehd� esitystavan muunnos jo olemassa oleville appeille.
    Lively3D.WIDGET.grid = new THREEJS_WIDGET3D.GridWindow(2000, 2000, 0x6A8455.toString(16));
    Lively3D.WIDGET.mainWindow.addChild(Lively3D.WIDGET.grid);
    
    //Gridin eventtihandlerit py�rittelylle.
    Lively3D.WIDGET.grid.addEventListener(WIDGET3D.EventType.onmousedown, Lively3D.WIDGET.grid.mousedownHandler, Lively3D.WIDGET.grid);
    Lively3D.WIDGET.grid.addEventListener(WIDGET3D.EventType.onmouseup, Lively3D.WIDGET.grid.mouseupHandler, Lively3D.WIDGET.grid);
    Lively3D.WIDGET.grid.addEventListener(WIDGET3D.EventType.onmousemove, Lively3D.WIDGET.grid.mousemoveHandler, Lively3D.WIDGET.grid);
    
    //ANIMATION LOOP
    var lasttime=0;
    var now;

    function animLoop(){
      requestAnimFrame(animLoop, canvas);
      now=parseInt(new Date().getTime());
      
      //t�m�n pit�isi olla scenen render -funktio
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

		var canvas = app.GetCanvas();
	
		livelyapp.SetStart(app.StartApp);
    
    //T�SS� IKONI PIT�ISI LUODA SCENEN M��RITTELEM�LL� FUNKTIOLLA, JOTTA
    //SCENEKOHTAINEN ESITYSTAPA TULISI HUOMIOITUA
    var iconTexture = THREE.ImageUtils.loadTexture("../images/app.png");
    var icon = new THREEJS_WIDGET3D.GridIcon(iconTexture, Lively3D.WIDGET.grid);
    
    
    
    //create appcanvas texture fo application window
    var tex = new THREE.Texture(canvas);
    var material = new THREE.MeshBasicMaterial({
      map: tex
    });
    tex.needsUpdate = true;
    
    //creating application window
    var display = new THREEJS_WIDGET3D.TitledWindow(name, 1500, 1500, material);
    Lively3D.WIDGET.mainWindow.addChild(display);
    
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
    
    //event handler for icon click.
    var iconOnclick = function(event, livelyapp){
      //KUN SCENE SAADAAN KORJATTUA, T�SS� KUTSUTAAN LIVELYN OPEN FUNKTIOTA.
      //IKKUNAN N�YTT�MINEN JA FOKUSOIMINEN TAPAHTUU SIELL�.
      livelyapp.Open();
      livelyapp.GetWindowObject().show();
      livelyapp.GetWindowObject().focus();
    };
    icon.addEventListener(WIDGET3D.EventType.onclick, iconOnclick, livelyapp);
    
    //event handler for windows close button
    var closeDisplay = function(event, livelyapp){
      //KUN SCENE SAADAAN KORJATTUA, T�SS� KUTSUTTAAN LIVELYN CLOSE FUNKTIOTA.
      //IKKUNAN PIILOTTAMISEN PIT�ISI OLLA SIELL�.
      livelyapp.Close();
      livelyapp.GetWindowObject().hide();
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
    var normalY = /*1.0 -*/((window.mousePosition_.z - (-window.height_ / 2.0)) / (window.height_));
    
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
  
  //Kutsutaan, kun appia klikataan
  //VOI K�YTT�� VASTA KUN SCENET ON KORJATTU
	Lively3D.Open = function(app){
		
    //kutsuu scenen open funktiota
		Scenes[CurrentScene].GetModel().Open(app, Scenes[CurrentScene].GetScene());
		
    //t�ss� kohtaa pit�isi my�s kutsua appin ikkunalle show -funktiota
		app.Open();
	}

	/**
		Closes given Lively3D Application in every 3D-scene.
		@param app Lively3D Application
	*/
  
  //TODO: REDO
  //VOI K�YTT�� VASTA KUN SCENET ON KORJATTU
	Lively3D.Close = function(app){
    
    //TODO: minimoi ikkuna, jos se oli maksimoitu!!
    
    //t�ss� kohtaa pit�isi my�s kutsua appin ikkunalle hide -funktiota
		app.Close();
		
    //kutsuu scenen close objektia
    Scenes[CurrentScene].GetModel().Close(app, Scenes[CurrentScene].GetScene());
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
