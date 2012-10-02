/*!
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
typeof Lively3D=="undefined"&&(Lively3D={});var Lively3D=function(a){var b="",c="canvas";a.WIDGET={mainWindow:null,cameraGroup:null};var d=[],e=0,f={Id:"mainscene",Model:null,Init:function(){this.Model=new THREEJS_WIDGET3D.GridWindow({width:2e3,height:2e3,color:6980693,defaultControls:!0}),this.Model.setZ(200),a.WIDGET.mainWindow.addChild(this.Model)},CreateApplication:function(a){var b=new THREEJS_WIDGET3D.GridIcon({picture:"../images/app.png",color:61013,parent:this.Model});return b},RenderingFunction:function(a,b){this.Model.update()},Open:function(a,b){},Close:function(a,b){},Remove:function(){this.Model.remove()}},g=[];a.Init=function(h){function l(){requestAnimFrame(l,h),k=parseInt((new Date).getTime()),d[e].GetScene().RenderingFunction(k,j);for(var a=0;a<g.length;++a){var b=g[a].GetWindowObject();b.isVisible_&&b.update()}THREEJS_WIDGET3D.render(),j=k}h?b=h:b=c;var h=document.getElementById(b),i=new THREE.WebGLRenderer({canvas:h,antialias:!0,autoClear:!1});i.setClearColorHex(16382457,1),i.setSize(h.width,h.height),a.WIDGET.mainWindow=THREEJS_WIDGET3D.init({renderer:i}),a.WIDGET.cameraGroup=new THREEJS_WIDGET3D.CameraGroup,a.WIDGET.mainWindow.addChild(a.WIDGET.cameraGroup),a.WIDGET.cameraGroup.setZ(2800),d.push((new a.Scene).SetScene(f)),d[e].GetScene().Init(),d[e].SetModel(d[e].GetScene().Model),a.UI.create(d[e]);var j=0,k;l()},a.AddApplication=function(b,c,f){var l=new a.Application;g.push(l),l.SetName(b).SetApplicationCode(c).SetInitializationCode(f);var m=f(c),n=m.GetCanvas();l.SetStart(m.StartApp);var o=new THREE.Texture(n),p=new THREE.MeshBasicMaterial({map:o});o.needsUpdate=!0;var q=new THREEJS_WIDGET3D.TitledWindow({title:b,width:1500,height:1500,material:p,defaultControls:!0});q.setZ(-1800),a.WIDGET.cameraGroup.addChild(q);var r=d[e].GetScene().CreateApplication(n),s=function(a){a.mesh_.material.map&&(a.mesh_.material.map.needsUpdate=!0)};return q.addUpdateCallback(s,q),q.hide(),l.SetWindowObject(q),l.SetIcon(r),m.GetState&&l.SetSave(m.GetState),m.SetState&&l.SetLoad(m.SetState),m.Open&&l.SetAppOpen(m.Open),m.Close&&l.SetAppClose(m.Close),m.SetLivelyApp(l),r.addEventListener(WIDGET3D.EventType.ondblclick,i,l),q.closeButton_.addEventListener(WIDGET3D.EventType.onclick,h,l),q.title_.addEventListener(WIDGET3D.EventType.ondblclick,j,l),k(q,m.EventListeners,l),l};var h=function(b,c){a.Close(c)},i=function(b,c){a.Open(c)},j=function(a,b){b.isMaximized()?b.Minimize():b.Maximize()};a.Maximize=function(a){var b=a.getLocation();a.setZ(b.z+600)},a.Minimize=function(a){var b=a.getLocation();a.setZ(b.z-600)};var k=function(a,b,c){if(a&&b){var d=!1,e=!1,f=!1,g=!1;for(var h in b)l(a,h,b,c),h=="click"?d=!0:h=="mousedown"&&(e=!0);!d&&!e&&a.addEventListener(WIDGET3D.EventType.onclick,m,{app:c,callback:!1})}},l=function(a,b,c,d){switch(b){case"click":return a.addEventListener(WIDGET3D.EventType.onclick,m,{app:d,callback:c.click}),!0;case"dblclick":return a.addEventListener(WIDGET3D.EventType.ondblclick,m,{app:d,callback:c.dblclick}),!0;case"mousemove":return a.addEventListener(WIDGET3D.EventType.onmousemove,m,{app:d,callback:c.mousemove}),!0;case"mousedown":return a.addEventListener(WIDGET3D.EventType.onmousedown,m,{app:d,callback:c.mousedown}),!0;case"mouseup":return a.addEventListener(WIDGET3D.EventType.onmouseup,m,{app:d,callback:c.mouseup}),!0;case"mouseover":return a.addEventListener(WIDGET3D.EventType.onmouseover,m,{app:d,callback:c.mouseover}),!0;case"mouseout":return a.addEventListener(WIDGET3D.EventType.onmouseout,m,{app:d,callback:c.mouseout}),!0;case"keypress":return a.addEventListener(WIDGET3D.EventType.onkeypress,c.keypress),!0;case"keydown":return a.addEventListener(WIDGET3D.EventType.onkeydown,c.keydown),!0;case"keyup":return a.addEventListener(WIDGET3D.EventType.onkeyup,c.keyup),!0;default:return console.log("default: "+b),!1}},m=function(a,b){var c=b.app.GetWindowObject();(a.type=="click"||a.type=="mousedown")&&c.focus();if(b.callback){var d=(c.mousePosition_.x- -c.width_/2)/c.width_,e=1-(c.mousePosition_.y- -c.height_/2)/c.height_,f=c.mesh_.material.map.image.width,g=c.mesh_.material.map.image.height,h=d*f,i=e*g,j=[h,i],k={coord:j,canvas:c.mesh_.material.map.image,event:a};b.callback(k)}};a.Open=function(a){d[e].GetScene().Open(a),a.Open(),a.GetWindowObject().show(),a.GetWindowObject().focus()},a.Close=function(a){var b=a.GetWindowObject();a.isMaximized()&&a.Minimize(),a.Close(),b.hide(),d[e].GetScene().Close(a)},a.GetCurrentSceneIndex=function(){return e},a.FileOperations={},a.FileOperations.getScript=function(a,b){$.get("getFile.php",{name:a,path:b},function(a){var b=document.createElement("script");b.type="text/javascript",b.src=a,document.head.appendChild(b)})},a.FileOperations.uploadScript=function(a,b,c){$.post("uploadfile.php",{name:a,file:b,path:c},function(){console.log("uploaded script: "+a)})},a.FileOperations.getJSON=function(a,b,c){$.get("getFile.php",{name:a,JSON:!0,path:c},function(a){$.getJSON(a,b)})},a.FileOperations.LoadResources=function(a,b){$.get("getFileArray.php",{"names[]":a.Resources[b],path:a.ResourcePath},function(c){var d=JSON.parse(c);a.ResourceHandlers[b](d),a.ResourcesLoaded(b)})},a.AllowAppStart=function(b){b.StateFromDropbox==1&&(b.OpenAfterLoad==1&&a.Open(b),b.MaximizeAfterLoad==1&&b.Maximize()),a.LoadCompleted()};var n=[];a.AddScene=function(b){console.log("Loading scene.."),n.push(b),a.LoadResources(b)},a.SceneLoader=function(){var b=!1;for(var c in n)n.hasOwnProperty(c)&&(d.push((new a.Scene).SetScene(n[c])),console.log(n[c]),n.splice(c,1),b=!0,a.LoadCompleted());b==0&&console.log("error loading scene")},a.GetCurrentScene=function(){return d[e]},a.GetApplications=function(){return g},a.ChangeScene=function(b,c){for(var f in g)g.hasOwnProperty(f)&&(g[f].isClosed()||a.Close(g[f]));d[e].GetScene().Remove(),e+=1,e==d.length&&(e=0),d[e].GetScene().Init(),d[e].SetModel(d[e].GetScene().Model);for(var f in g){var h=d[e].GetScene().CreateApplication(g[f].GetWindowObject().mesh_.material.map.image);h.addEventListener(WIDGET3D.EventType.ondblclick,i,g[f]),g[f].SetIcon(h)}},a.LoadCompleted=function(){a.UI.ShowLoadCompleted()},a.Sync=function(b){a.Proxies.Local.CheckAvailability(function(){a.Proxies.Local.Sync()})},a.LoadResources=function(b){for(var c in b.Resources)b.Resources.hasOwnProperty(c)&&(a.UI.HTTPServers.LOCAL.inUse==1?a.Proxies.Local.LoadResources(b,c):(a.UI.HTTPServers.PROXY.inUse==1||a.UI.HTTPServers.NODE.inUse==1)&&a.FileOperations.LoadResources(b,c))};var o;return a.SetUsername=function(a){o=a},a.GetUsername=function(){return o},a}(Lively3D);(function(a){a.Application=function(){this.Save=function(){var a={};return a},this.Load=function(a){};var b=!0;this.isClosed=function(){return b};var c=function(){};this.Close=function(){b=!0,c()},this.SetAppClose=function(a){return c=a,this};var d=function(){};this.Open=function(){b=!1,d()},this.SetAppOpen=function(a){return d=a,this};var e=!1;this.isMaximized=function(){return e},this.Maximize=function(){e=!0,a.Maximize(g)},this.Minimize=function(){e=!1,a.Minimize(g)};var f;this.SetIcon=function(a){f=a},this.GetIcon=function(){return f};var g;this.SetWindowObject=function(a){return g=a,this},this.GetWindowObject=function(){return g};var h;this.SetName=function(a){return h=a,this},this.GetName=function(){return h};var i;this.SetApplicationCode=function(a){return i=a,this},this.GetApplicationCode=function(){return i};var j;this.SetInitializationCode=function(a){return j=a,this},this.GetInitializationCode=function(){return j},this.SetSave=function(a){return this.Save=a,this},this.SetLoad=function(a){return this.Load=a,this},this.SetStart=function(a){return this.StartApp=a,this}}})(Lively3D),function(a){a.Scene=function(){var a;this.SetModel=function(b){return a=b,this},this.GetModel=function(){return a};var b;this.SetScene=function(a){return b=a,this},this.GetScene=function(){return b}}}(Lively3D),function(a){a.UI={},a.UI.HTTPServers={LOCAL:{inUse:!1},NODE:{inUse:!1},PROXY:{inUse:!0}},a.UI.Dialogs={loadState:null,addApp:null,loadScene:null,about:null,loadCompleted:null,menu:null,node:null,php:null},a.UI.create=function(b){var e=new THREEJS_WIDGET3D.Dialog({text:"Enter Username",buttonText:"Ok",color:11978174,opacity:1});e.setZ(-1300),a.WIDGET.cameraGroup.addChild(e);var f=function(b,c){c.dialog.textBox_.string_.length>0&&(a.SetUsername(c.dialog.textBox_.string_),c.dialog.remove(),c.scene.show(),a.UI.Dialogs.menu.show())},g=[];g.push({string:"Load Application",onclick:{handler:a.UI.ShowAppList}}),g.push({string:"Save Desktop",onclick:{handler:a.UI.ShowSaveDialog}}),g.push({string:"Load Desktop",onclick:{handler:a.UI.ShowStateList}}),g.push({string:"Load Scene",onclick:{handler:a.UI.ShowSceneList}}),g.push({string:"Switch Scene",onclick:{handler:a.ChangeScene}}),g.push({string:"Toggle Node.js",onclick:{handler:a.UI.ToggleNode}}),g.push({string:"About",onclick:{handler:a.UI.ShowAbout}}),g.push({string:"Sync for local usage",onclick:{handler:a.Sync}}),a.UI.Dialogs.menu=new THREEJS_WIDGET3D.SelectDialog({width:1300,height:3e3,choices:g,color:5406582,opacity:.7}),a.UI.Dialogs.menu.setLocation(-2750,0,-2900),a.UI.Dialogs.menu.setRotX(-Math.PI/100),a.WIDGET.cameraGroup.addChild(a.UI.Dialogs.menu),e.button_.addEventListener(WIDGET3D.EventType.onclick,f,{dialog:e,scene:b.GetModel()}),c(),d(),a.UI.Dialogs.menu.hide()},a.UI.createAppDialog=function(c){var d=[];for(var e in c)c.hasOwnProperty(e)&&d.push({string:c[e],onclick:{handler:a.UI.LoadApplication,parameters:c[e]}});a.UI.Dialogs.addApp=b(d,"Select Application")},a.UI.createSceneDialog=function(c){var d=[];for(var e in c)c.hasOwnProperty(e)&&d.push({string:c[e],onclick:{handler:a.UI.LoadScene,parameters:c[e]}});a.UI.Dialogs.loadScene=b(d,"Select Skene")},a.UI.createStateDialog=function(c){var d=[];for(var e in c)c.hasOwnProperty(e)&&d.push({string:c[e],onclick:{handler:a.UI.LoadDesktop,parameters:c[e]}});a.UI.Dialogs.loadState=b(d,"Select Desktop")};var b=function(b,c){var d=new THREEJS_WIDGET3D.SelectDialog({width:1e3,height:3200,choices:b,color:5406582,opacity:.7,text:c,hasCancel:!0});return d.setLocation(0,0,-2400),a.WIDGET.cameraGroup.addChild(d),d},c=function(){a.UI.Dialogs.loadCompleted=new WIDGET3D.Basic;var b=THREE.ImageUtils.loadTexture("images/loadCompleted.png"),c=new THREE.MeshBasicMaterial({map:b,color:5406582,opacity:1}),d=new THREE.Mesh(new THREE.PlaneGeometry(2e3,500),c);d.position.set(0,0,-2400),a.UI.Dialogs.loadCompleted.setMesh(d),a.WIDGET.cameraGroup.addChild(a.UI.Dialogs.loadCompleted),a.UI.Dialogs.loadCompleted.hide()},d=function(){a.UI.Dialogs.about=new WIDGET3D.Basic;var b=THREE.ImageUtils.loadTexture("images/about.png"),c=new THREE.MeshBasicMaterial({map:b,color:5406582,opacity:1}),d=new THREE.Mesh(new THREE.PlaneGeometry(2e3,2e3),c);d.position.set(0,0,-2400),a.UI.Dialogs.about.setMesh(d),a.WIDGET.cameraGroup.addChild(a.UI.Dialogs.about),a.UI.Dialogs.about.hide();var e=function(a,b){b.hide()};a.UI.Dialogs.about.addEventListener(WIDGET3D.EventType.onclick,e,a.UI.Dialogs.about)},e=5;a.UI.ToggleNode=function(b){a.UI.HTTPServers.NODE.inUse=!a.UI.HTTPServers.NODE.inUse,a.UI.HTTPServers.PROXY.inUse=!a.UI.HTTPServers.PROXY.inUse,a.UI.HTTPServers.NODE.inUse?a.UI.Dialogs.menu.changeChoiceText("Toggle PHP",e):a.UI.Dialogs.menu.changeChoiceText("Toggle Node.js",e)},a.UI.UseLocal=function(){console.log("Going offline..."),a.UI.HTTPServers.LOCAL.inUse=!0},a.UI.UseOnline=function(){console.log("Going online..."),a.UI.HTTPServers.LOCAL.inUse=!1},a.UI.ShowLoadCompleted=function(){a.UI.Dialogs.loadCompleted.show(),setTimeout(function(){a.UI.Dialogs.loadCompleted.hide()},1500)},a.UI.ShowAppList=function(b){a.UI.HTTPServers.LOCAL.inUse==1?a.Proxies.Local.ShowAppList():a.UI.HTTPServers.PROXY.inUse==1?a.Proxies.PHP.ShowAppList():a.Proxies.Node.ShowAppList()},a.UI.LoadApplication=function(b,c){a.UI.HTTPServers.LOCAL.inUse==1?a.Proxies.Local.LoadApplication(c):a.UI.HTTPServers.PROXY.inUse==1?a.Proxies.PHP.LoadApplication(c):a.Proxies.Node.LoadApplication(c)},a.UI.ShowStateList=function(b){a.UI.HTTPServers.LOCAL.inUse==1?a.Proxies.Local.ShowStateList():a.UI.HTTPServers.PROXY.inUse==1?a.Proxies.PHP.ShowStateList():a.Proxies.Node.ShowStateList()},a.UI.ShowSceneList=function(b){a.UI.HTTPServers.LOCAL.inUse==1?a.Proxies.Local.ShowSceneList():a.UI.HTTPServers.PROXY.inUse==1?a.Proxies.PHP.ShowSceneList():a.Proxies.Node.ShowSceneList()},a.UI.LoadScene=function(b,c){a.UI.HTTPServers.LOCAL.inUse==1?a.Proxies.Local.LoadScene(c):a.UI.HTTPServers.PROXY.inUse==1?a.Proxies.PHP.LoadScene(c):a.Proxies.Node.LoadScene(c)},a.UI.SaveDesktop=function(b){a.UI.HTTPServers.LOCAL.inUse==1?a.Proxies.Local.SaveDesktop(b):a.UI.HTTPServers.PROXY.inUse==1?a.Proxies.PHP.SaveDesktop(b):a.Proxies.Node.SaveDesktop(b)},a.UI.LoadDesktop=function(b,c){a.UI.HTTPServers.LOCAL.inUse==1?a.Proxies.Local.LoadDesktop(c):a.UI.HTTPServers.PROXY.inUse==1?a.Proxies.PHP.LoadDesktop(c):a.Proxies.Node.LoadDesktop(c),a.UI.Dialogs.loadState.remove()},a.UI.ShowSaveDialog=function(b){var c=new THREEJS_WIDGET3D.Dialog({text:"State name:",buttonText:"Save",color:11978174,opacity:1});c.button_.addEventListener(WIDGET3D.EventType.onclick,a.UI.CloseSaveDialog,c),c.setZ(-1300),a.WIDGET.cameraGroup.addChild(c)},a.UI.CloseSaveDialog=function(b,c){c.textBox_.string_.length>0&&(a.UI.SaveDesktop(c.textBox_.string_),c.remove())},a.UI.ShowAbout=function(b){a.UI.Dialogs.about.show()}}(Lively3D),function(Lively3D){Lively3D.Proxies={},Lively3D.Proxies.PHP={ShowAppList:function(){$.get("getFileList.php",{path:"apps"},function(a){var b=JSON.parse(a);Lively3D.UI.createAppDialog(b)})},LoadApplication:function(a){Lively3D.FileOperations.getScript(a,"apps/"),Lively3D.UI.Dialogs.addApp.remove()},SaveDesktop:function(a){var b=Lively3D.GetApplications(),c="",d=[];for(var e in b)if(b.hasOwnProperty(e)){var f=b[e],g=f.isMaximized();f.isMaximized()==1&&f.Minimize();var h={Name:f.GetName(),Closed:f.isClosed(),Maximized:g,Code:f.GetApplicationCode().toString(),Init:f.GetInitializationCode().toString(),AppState:f.Save()};d.push(h),g==1&&f.Maximize()}c=JSON.stringify(d),Lively3D.FileOperations.uploadScript(a,c,"states/"+Lively3D.GetUsername())},LoadDesktop:function(a){Lively3D.FileOperations.getJSON(a,ParseDesktopJSON,"states/"+Lively3D.GetUsername()+"/")},ShowStateList:function(){$.get("getFileList.php",{path:"states/"+Lively3D.GetUsername()},function(a){var b=JSON.parse(a);Lively3D.UI.createStateDialog(b)})},ShowSceneList:function(){$.get("getFileList.php",{path:"world"},function(a){var b=JSON.parse(a);Lively3D.UI.createSceneDialog(b)})},LoadScene:function(a){Lively3D.FileOperations.getScript(a,"world/"),Lively3D.UI.Dialogs.loadScene.remove()}};var ParseDesktopJSON=function(data){var Applications=Lively3D.GetApplications(),appcount=Applications.length;for(var i=0;i<appcount;++i)Applications[0].GetIcon().remove(),Applications[0].GetWindowObject().remove(),Applications.splice(0,1);var JSONArray=JSON.parse(data);for(var i in JSONArray)if(JSONArray.hasOwnProperty(i)){var JSONObject=JSONArray[i],CodeFunc=eval("("+JSONObject.Code+")"),InitFunc=eval("("+JSONObject.Init+")"),app=Lively3D.AddApplication(JSONObject.Name,CodeFunc,InitFunc);app.StateFromDropbox=!0,JSONObject.Closed!=1&&(app.OpenAfterLoad=!0),JSONObject.Maximized==1&&(app.MaximizeAfterLoad=!0),app.Load(JSONObject.AppState),app.StartApp()}},SetAppLocation=function(a,b){a.GetSceneObject(0).setLocX(b.x),a.GetSceneObject(0).setLocY(b.y),a.GetSceneObject(0).setLocZ(b.z)},SetAppRotation=function(a,b){a.GetSceneObject(0).setRotX(b.x),a.GetSceneObject(0).setRotY(b.y),a.GetSceneObject(0).setRotZ(b.z)};Lively3D.Proxies.Node={ShowAppList:function(){$.get("/lively3d/node/filelist/apps",function(a){Lively3D.UI.createAppDialog(a)})},LoadApplication:function(a){$.get("/lively3d/node/file/apps/"+a,function(a){var b=document.createElement("script");b.type="text/javascript",b.src=a,document.head.appendChild(b)}),Lively3D.UI.Dialogs.addApp.remove()},SaveDesktop:function(a){var b=Lively3D.GetApplications(),c={};c.name=a,c.user=Lively3D.GetUsername(),c.applications=[];for(var d in b)if(b.hasOwnProperty(d)){var e=b[d],f=e.isMaximized();e.isMaximized()==1&&e.Minimize();var g={Name:e.GetName(),Closed:e.isClosed(),Maximized:f,Code:e.AppCode.toString(),Init:e.AppInit.toString(),AppState:e.Save()};c.applications.push(g),f==1&&e.Maximize()}$.post("/lively3d/node/states/new",{state:c},function(a){console.log(a)})},LoadDesktop:function(name){var Applications=Lively3D.GetApplications(),appcount=Applications.length;for(var i=0;i<appcount;++i)Applications[0].GetIcon().remove(),Applications[0].GetWindowObject().remove(),Applications.splice(0,1);$.get("/lively3d/node/states/"+Lively3D.GetUsername()+"/"+name,function(data){var apps=data.applications;for(var i in apps)if(apps.hasOwnProperty(i)){var JSONObject=apps[i],CodeFunc=eval("("+JSONObject.Code+")"),InitFunc=eval("("+JSONObject.Init+")"),app=Lively3D.AddApplication(JSONObject.Name,CodeFunc,InitFunc);app.StateFromDropbox=!0,JSONObject.Closed!="true"&&(app.OpenAfterLoad=!0),JSONObject.Maximized=="true"&&(app.MaximizeAfterLoad=!0),app.Load(JSONObject.AppState),app.StartApp()}})},ShowStateList:function(){$.get("/lively3d/node/states/"+Lively3D.GetUsername(),function(a){Lively3D.UI.createStateDialog(a)})},ShowSceneList:function(){$.get("/lively3d/node/filelist/world",function(a){Lively3D.UI.createSceneDialog(a)})},LoadScene:function(a){$.get("/lively3d/node/file/world/"+a,function(a){var b=document.createElement("script");b.type="text/javascript",b.src=a,document.head.appendChild(b)}),Lively3D.UI.Dialogs.loadScene.remove()}},Lively3D.Proxies.Local={ShowAppList:function(){$.ajax({url:"http://127.0.0.1:8000/filelist/apps",success:function(a){Lively3D.UI.createAppDialog(a)}})},LoadApplication:function(a){$.get("http://127.0.0.1:8000/file/apps/"+a,function(a){var b=document.createElement("script");b.type="text/javascript",b.src=a,document.head.appendChild(b)}),Lively3D.UI.Dialogs.addApp.remove()},ShowSceneList:function(){$.get("http://localhost:8000/filelist/world",function(a){Lively3D.UI.createSceneDialog(a)})},LoadScene:function(a){$.get("http://localhost:8000/file/world/"+a,function(a){var b=document.createElement("script");b.type="text/javascript",b.src=a,document.head.appendChild(b)}),Lively3D.UI.Dialogs.loadScene.remove()},CheckAvailability:function(a){$.ajax({url:"http://localhost:8000/",success:function(b){b.success==0?alert(b.message):a()},error:function(){alert("Local Node.js application not found. Please run 'node local.js'")}})},Sync:function(a){$.ajax({url:"http://localhost:8000/sync",data:{host:window.location.host,port:window.location.port,path:window.location.pathname},success:function(a){a.success==1&&alert(a.message)},error:function(){alert("Local Node.js application not found. Please run 'node local.js' and associated Mongo-database.")}})},LoadResources:function(a,b){$.get("http://localhost:8000/filearray",{"names[]":a.Resources[b],path:a.ResourcePath},function(c){a.ResourceHandlers[b](c),a.ResourcesLoaded(b)})}}}(Lively3D)