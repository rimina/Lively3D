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
	
}(Lively3D));