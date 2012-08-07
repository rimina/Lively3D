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
				var choices = []
        
				for ( var i in files ){
					if ( files.hasOwnProperty(i)){
            console.log(files[i]);
            choices.push({string : files[i], onclick: {handler : Lively3D.UI.LoadApplication, parameters : files[i]}});
					}
				}
        Lively3D.UI.Widgets.addApp = new THREEJS_WIDGET3D.SelectDialog({width : 1000, height : 1500, choices : choices,
          color: 0x92CC66, text : "Select Application", hasCancel : true});
        Lively3D.UI.Widgets.addApp.setLocation(0, 700, 450);
        Lively3D.WIDGET.mainWindow.addChild(Lively3D.UI.Widgets.addApp);
				
			});
		},
		
		/**
			Downloads application script and executes it.
			@param {string} app Filename of the application.
		*/
		LoadApplication: function(app){
			Lively3D.FileOperations.getScript(app, "apps/")
      Lively3D.UI.Widgets.addApp.remove();
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
			$.get("getFileList.php", {path: 'world'}, function(list){
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
			Lively3D.FileOperations.getScript(file, "world/");
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