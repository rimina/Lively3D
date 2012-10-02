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
    Lively3D.WIDGET.cameraGroup.addChild(username);
    
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
    Lively3D.UI.Dialogs.menu.setLocation(-2750, 0, -2900);
    Lively3D.UI.Dialogs.menu.setRotX(-Math.PI/100.0);
    Lively3D.WIDGET.cameraGroup.addChild(Lively3D.UI.Dialogs.menu);
    
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
    dialog.setLocation(0, 0, -2400);
    Lively3D.WIDGET.cameraGroup.addChild(dialog);
    
    return dialog;
  }
	
  var createLoadCompleted = function(){
    Lively3D.UI.Dialogs.loadCompleted = new WIDGET3D.Basic();
    var texture = THREE.ImageUtils.loadTexture("images/loadCompleted.png");
    var material = new THREE.MeshBasicMaterial({ map: texture, color : 0x527F76, opacity : 1.0});
    var mesh = new THREE.Mesh( new THREE.PlaneGeometry(2000, 500), material);
    mesh.position.set(0, 0, -2400);
    Lively3D.UI.Dialogs.loadCompleted.setMesh(mesh);
    Lively3D.WIDGET.cameraGroup.addChild(Lively3D.UI.Dialogs.loadCompleted);
    Lively3D.UI.Dialogs.loadCompleted.hide();
  }
  
  var createAbout = function(){
    Lively3D.UI.Dialogs.about = new WIDGET3D.Basic();
    var texture = THREE.ImageUtils.loadTexture("images/about.png");
    var material = new THREE.MeshBasicMaterial({ map: texture, color : 0x527F76, opacity : 1.0});
    var mesh = new THREE.Mesh( new THREE.PlaneGeometry(2000, 2000), material);
    mesh.position.set(0, 0, -2400);
    Lively3D.UI.Dialogs.about.setMesh(mesh);
    Lively3D.WIDGET.cameraGroup.addChild(Lively3D.UI.Dialogs.about);
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
    Lively3D.WIDGET.cameraGroup.addChild(saveState);
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
	
}(Lively3D));