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
typeof Lively3D=="undefined"&&(Lively3D={});var Lively3D=function(e){var t="",n="canvas";e.THREE={renderer:null,camera:null,scene:null},e.WIDGET={mainWindow:null,display:null,icons:[]};var r=[],i=0,s={Id:"mainscene",RenderingFunction:function(){},Open:function(e,t){},Close:function(e,t){}},o=[],u;e.APP_EVENTS={onclick:function(){},ondblclick:function(){},onmousemove:function(){},onmousedown:function(){},onmouseup:function(){},onmouseover:function(){},onmouseout:function(){},onkeydown:function(){}},e.SCENE_EVENTS={onclick:function(){},ondblclick:function(){},onmousemove:function(){},onmousedown:function(){},onmouseup:function(){},onmouseover:function(){},onmouseout:function(){},onkeydown:function(){}},e.Init=function(r){function f(){requestAnimFrame(f,r),a=parseInt((new Date).getTime()),e.WIDGET.display.update(),e.THREE.renderer.render(e.THREE.scene,e.THREE.camera),u=a}var i=$("<h1>Enter Username</h1>Username: <input type='text' name='username' id='username'/><h3 onclick='Lively3D.UI.EnterUsername()'>Ok</h3>");e.UI.ShowHTML(i,!0),r?t=r:t=n;var r=document.getElementById(t);e.THREE.renderer=new THREE.WebGLRenderer({canvas:r,antialias:!0,autoClear:!1}),e.THREE.renderer.setClearColorHex(16382457,1),e.THREE.renderer.setSize(r.width,r.height),e.THREE.scene=new THREE.Scene,e.THREE.camera=new THREE.PerspectiveCamera(75,r.width/r.height,1,1e4),e.THREE.camera.position.z=1600,e.THREE.scene.add(e.THREE.camera),e.THREE.scene.add(new THREE.AmbientLight(4210752)),e.WIDGET.mainWindow=THREEJS_WIDGET3D.init(e.THREE.scene,e.THREE.renderer,e.THREE.camera);var s=new THREE.MeshBasicMaterial({color:0,opacity:1});e.WIDGET.display=new THREEJS_WIDGET3D.TitledWindow("app",1e3,1e3,s),e.WIDGET.mainWindow.addChild(e.WIDGET.display);var o=function(e){e.mesh_.material.map&&(e.mesh_.material.map.needsUpdate=!0)};e.WIDGET.display.addUpdateCallback(o,e.WIDGET.display);var u=0,a;f()},e.AddApplication=function(t,n,r){var i=new e.Application;o.push(i),i.SetName(t).SetApplicationCode(n).SetInitializationCode(r);var s=r(n),u=s.GetCanvas();i.SetStart(s.StartApp);var a=new THREE.Texture(u),f=new THREE.MeshBasicMaterial({map:a}),l=new THREE.Mesh(new THREE.PlaneGeometry(1e3,1e3,10,10),f);return l.doubleSided=!0,l.flipSided=!0,e.WIDGET.display.setMesh(l),a.needsUpdate=!0,s.GetState&&i.SetSave(s.GetState),s.SetState&&i.SetLoad(s.SetState),s.Open&&i.SetAppOpen(s.Open),s.Close&&i.SetAppClose(s.Close),s.SetLivelyApp(i),i};var a=!1;e.Open=function(e){r[i].GetModel().Open(e,r[i].GetScene()),e.Open()},e.Close=function(e){e.Close(),r[i].GetModel().Close(e,r[i].GetScene())},e.Maximize=function(e){},e.Minimize=function(e){},e.FireEvent=function(e,t,n,r,i){if(n,r){var s;s=r.getMaterial();var o=s.getLayers()[0].getTexture();if(o.getCanvas){var u;if(e!="mousewheel"){var a=o.getCanvas(),f=[n[0]*a.width,(1-n[1])*a.height];u={coord:f,canvas:a}}else u=i;s.fireEvent(e,u)}}else t.GetCurrentSceneObject().fireEvent(e)},e.GetCurrentSceneIndex=function(){return i},e.FileOperations={},e.FileOperations.getScript=function(e,t){$.get("getFile.php",{name:e,path:t},function(e){var t=document.createElement("script");t.type="text/javascript",t.src=e,document.head.appendChild(t)})},e.FileOperations.uploadScript=function(e,t,n){$.post("uploadfile.php",{name:e,file:t,path:n},function(){console.log("uploaded script: "+e)})},e.FileOperations.getJSON=function(e,t,n){$.get("getFile.php",{name:e,JSON:!0,path:n},function(e){$.getJSON(e,t)})},e.FileOperations.LoadResources=function(e,t){$.get("getFileArray.php",{"names[]":e.Resources[t],path:e.ResourcePath},function(n){var r=JSON.parse(n);e.ResourceHandlers[t](r),e.ResourcesLoaded(t)})},e.AllowAppStart=function(t){t.StateFromDropbox==1&&(t.OpenAfterLoad==1&&e.Open(t),t.MaximizeAfterLoad==1&&e.Maximize(t)),e.UI.ShowLoadCompleted(),t.Open()};var f=[];e.AddScene=function(t){console.log("Loading scene.."),f.push(t),t.Resources.Document="Document/"+t.File,t.ResourceHandlers.Document=function(t){e.GLGE.document.loadDocument(t[0])},e.LoadResources(t)};var l=function(t){var n=c(t);console.log("scene loaded from url: "+t+" and file is "+n.file);var i=!1;for(var s in f)f.hasOwnProperty(s)&&f[s].File==n.file&&(f[s].DocumentDone&&f[s].DocumentDone(),r.push((new e.Scene).SetScene(e.GLGE.document.getElement(f[s].Id)).SetModel(f[s])),AddAppsToScene(f[s]),f.splice(s,1),i=!0);i==0&&console.log("error loading scene")},c=function(e){var t=/((http|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+\.[^#?\s]+)(#[\w\-]+)?/;return e.match(t)?{url:RegExp["$&"],protocol:RegExp.$2,host:RegExp.$3,path:RegExp.$4,file:RegExp.$6,hash:RegExp.$7}:{url:"",protocol:"",host:"",path:"",file:"",hash:""}};e.GetCurrentScene=function(){return r[i]},e.GetApplications=function(){return o},e.ChangeScene=function(){for(var t in o)o.hasOwnProperty(t)&&(o[t].isClosed()||e.Close(o[t]));i+=1,i==r.length&&(i=0);for(var t in o)o[t].SetCurrentSceneObject(i)},e.LoadCompleted=function(){e.UI.ShowLoadCompleted()},e.Sync=function(){e.Proxies.Local.CheckAvailability(function(){e.Proxies.Local.Sync()})},e.LoadResources=function(t){for(var n in t.Resources)t.Resources.hasOwnProperty(n)&&(e.UI.HTTPServers.LOCAL.inUse==1?e.Proxies.Local.LoadResources(t,n):(e.UI.HTTPServers.PROXY.inUse==1||e.UI.HTTPServers.NODE.inUse==1)&&e.FileOperations.LoadResources(t,n))};var h;return e.SetUsername=function(e){h=e},e.GetUsername=function(){return h},e}(Lively3D);(function(e){e.Application=function(){this.Save=function(){var e={};return e},this.Load=function(e){};var t=!0;this.isClosed=function(){return t};var n=function(){};this.Close=function(){t=!0,n()},this.SetAppClose=function(e){return n=e,this};var r=function(){};this.Open=function(){t=!1,r()},this.SetAppOpen=function(e){return r=e,this};var i=!1;this.isMaximized=function(){return i},this.Maximize=function(){i=!0},this.Minimize=function(){i=!1};var s=[];this.AddSceneObject=function(e){return s.push(e),u==null&&(u=e),this};var o;this.SetWindowObject=function(e){return o=e,this},this.GetWindowObject=function(){return o},this.GetWindowMaterial=function(){return o.children[2].getMaterial()};var u;this.ToggleWindowObject=function(){return u==o?u=s[e.GetCurrentSceneIndex()]:u=o,this},this.GetCurrentSceneObject=function(){return u.group?u.group:u},this.GetCurrentObject=function(){return u},this.SetCurrentSceneObject=function(e){e!=null&&e>=0&&e<s.length?u=s[e]:console.log("No such scene object")},this.GetSceneObject=function(e){if(e!=null&&e>=0&&e<s.length)return s[e].group;console.log("No such scene object")},this.GetAppObject=function(e){if(e!=null&&e>=0&&e<s.length)return s[e];console.log("No such scene object")};var a;this.SetName=function(e){return a=e,this},this.GetName=function(){return a};var f;this.SetApplicationCode=function(e){return f=e,this},this.GetApplicationCode=function(){return f};var l;this.SetInitializationCode=function(e){return l=e,this},this.GetInitializationCode=function(){return l},this.SetSave=function(e){return this.Save=e,this},this.SetLoad=function(e){return this.Load=e,this},this.SetStart=function(e){return this.StartApp=e,this}}})(Lively3D),function(e){e.Scene=function(){var e;this.SetModel=function(t){return e=t,this},this.GetModel=function(){return e};var t;this.SetScene=function(e){return t=e,this},this.GetScene=function(){return t}}}(Lively3D),function(e){e.UI={},e.UI.HTTPServers={LOCAL:{inUse:!1},NODE:{inUse:!1},PROXY:{inUse:!0}},e.UI.ToggleNode=function(){e.UI.HTTPServers.NODE.inUse=!e.UI.HTTPServers.NODE.inUse,e.UI.HTTPServers.PROXY.inUse=!e.UI.HTTPServers.PROXY.inUse},e.UI.UseLocal=function(){console.log("Going offline..."),e.UI.HTTPServers.LOCAL.inUse=!0},e.UI.UseOnline=function(){console.log("Going online..."),e.UI.HTTPServers.LOCAL.inUse=!1},e.UI.ShowLoadCompleted=function(){var e=$("<div id='loadcompleted'><p>Load Compeleted</p></div>");e.appendTo("#container"),e.fadeIn("slow",function(){setTimeout(function(){e.fadeOut("slow",function(){e.remove()})},1e3)})},e.UI.ShowAppList=function(){this.HTTPServers.LOCAL.inUse==1?e.Proxies.Local.ShowAppList():this.HTTPServers.PROXY.inUse==1?e.Proxies.PHP.ShowAppList():e.Proxies.Node.ShowAppList()},e.UI.LoadApplication=function(t){this.HTTPServers.LOCAL.inUse==1?e.Proxies.Local.LoadApplication(t):this.HTTPServers.PROXY.inUse==1?e.Proxies.PHP.LoadApplication(t):e.Proxies.Node.LoadApplication(t)},e.UI.ShowStateList=function(){this.HTTPServers.LOCAL.inUse==1?e.Proxies.Local.ShowStateList():this.HTTPServers.PROXY.inUse==1?e.Proxies.PHP.ShowStateList():e.Proxies.Node.ShowStateList()},e.UI.ShowSceneList=function(){this.HTTPServers.LOCAL.inUse==1?e.Proxies.Local.ShowSceneList():this.HTTPServers.PROXY.inUse==1?e.Proxies.PHP.ShowSceneList():e.Proxies.Node.ShowSceneList()},e.UI.LoadScene=function(t){this.HTTPServers.LOCAL.inUse==1?e.Proxies.Local.LoadScene(t):this.HTTPServers.PROXY.inUse==1?e.Proxies.PHP.LoadScene(t):e.Proxies.Node.LoadScene(t)},e.UI.SaveDesktop=function(t){this.HTTPServers.LOCAL.inUse==1?e.Proxies.Local.SaveDesktop(t):this.HTTPServers.PROXY.inUse==1?e.Proxies.PHP.SaveDesktop(t):e.Proxies.Node.SaveDesktop(t)},e.UI.LoadDesktop=function(t){this.HTTPServers.LOCAL.inUse==1?(e.Proxies.Local.LoadDesktop(t),e.UI.CloseDialog()):this.HTTPServers.PROXY.inUse==1?(e.Proxies.PHP.LoadDesktop(t),e.UI.CloseDialog()):(e.Proxies.Node.LoadDesktop(t),e.UI.CloseDialog())};var t;e.UI.ShowSaveDialog=function(){var n=$('<h1>Save state</h1>State name:<input type="text" name="statename" id="statename"/><h3 onclick="Lively3D.UI.CloseSaveDialog();">Save</h3>');this.ShowHTML(n),t=e.GLGE.clickedObject,e.GLGE.clickedObject=null},e.UI.CloseSaveDialog=function(){var n=$("#statename");n[0].value.length!=0?(e.UI.SaveDesktop(n[0].value),this.CloseDialog(),t&&(e.GLGE.clickedObject=t,t=null)):$("<h3>Please supply state name</h3>").appendTo("#dialog")},e.UI.ShowAbout=function(){var e=$("<h1>About</h1><p>Lively3D code made by Jari-Pekka Voutilainen</p><p>Applications developed by: Arto Salminen, Matti Anttonen, Anna-Liisa Mattila, Lotta Liikkanen, Jani Heininen, Mika V�lim�ki</p>");this.ShowHTML(e)},e.UI.ShowMessage=function(e){var t=$("<p>"+e+"</p>");this.ShowHTML(t)},e.UI.ActiveDialog,e.UI.ShowHTML=function(e,t){if(this.ActiveDialog!=null)this.ActiveDialog.cancelOmitted!=1&&n(e);else{if(t!=1)var r=$("<div class='dialog' id='dialog'><h3 onclick='Lively3D.UI.CloseDialog();'>Cancel</h3></div>");else{var r=$("<div class='dialog' id='dialog'></div>");r.cancelOmitted=!0}r.prepend(e),r.appendTo($("#container")),r.fadeIn("slow"),this.ActiveDialog=r}},e.UI.CloseDialog=function(){this.ActiveDialog.fadeOut("slow",function(){e.UI.ActiveDialog.remove(),e.UI.ActiveDialog=null})};var n=function(t){e.UI.ActiveDialog.fadeOut("fast",function(){e.UI.ActiveDialog.remove();var n=$("<div class='dialog' id='dialog'><h3 onclick='Lively3D.UI.CloseDialog();'>Cancel</h3></div>");n.prepend(t),n.appendTo($("#container")),n.fadeIn("fast"),e.UI.ActiveDialog=n})};e.UI.EnterUsername=function(){var t=$("#username");t[0].value.length!=0?(e.SetUsername(t[0].value),this.CloseDialog()):$("<h3>Please enter username</h3>").appendTo("#dialog")}}(Lively3D),function(Lively3D){Lively3D.Proxies={},Lively3D.Proxies.PHP={ShowAppList:function(){$.get("getFileList.php",{path:"apps"},function(e){var t=JSON.parse(e),n=$("<h1>Select Application</h1><div></div>"),r=n.last();for(var i in t)if(t.hasOwnProperty(i)){var s=$("<span onclick=\"Lively3D.UI.LoadApplication('"+t[i]+"')\">"+t[i]+"</span></br>");s.appendTo(r)}Lively3D.UI.ShowHTML(n)})},LoadApplication:function(e){Lively3D.FileOperations.getScript(e,"apps/"),Lively3D.UI.CloseDialog()},SaveDesktop:function(e){var t=Lively3D.GetApplications(),n="",r=[];for(var i in t)if(t.hasOwnProperty(i)){var s=t[i],o=s.isMaximized();s.isMaximized()==1&&Lively3D.Minimize(s);var u={Name:s.GetName(),Location:{x:s.GetCurrentSceneObject().getLocX(),y:s.GetCurrentSceneObject().getLocY(),z:s.GetCurrentSceneObject().getLocZ()},Rotation:s.GetCurrentSceneObject().getRotation(),Closed:s.isClosed(),Maximized:o,Code:s.GetApplicationCode().toString(),Init:s.GetInitializationCode().toString(),AppState:s.Save()};r.push(u),o==1&&Lively3D.Maximize(s)}n=JSON.stringify(r),Lively3D.FileOperations.uploadScript(e,n,"states/"+Lively3D.GetUsername())},LoadDesktop:function(e){Lively3D.FileOperations.getJSON(e,ParseDesktopJSON,"states/"+Lively3D.GetUsername()+"/")},ShowStateList:function(){$.get("getFileList.php",{path:"states/"+Lively3D.GetUsername()},function(e){var t=JSON.parse(e),n=$("<h1>Select State</h1><div></div>"),r=n.last();for(var i in t)if(t.hasOwnProperty(i)){var s=$("<span onclick=\"Lively3D.UI.LoadDesktop('"+t[i]+"')\">"+t[i]+"</span></br>");s.appendTo(r)}Lively3D.UI.ShowHTML(n)})},ShowSceneList:function(){$.get("getFileList.php",{path:"scenes"},function(e){var t=JSON.parse(e),n=$("<h1>Select Scene</h1><div></div>"),r=n.last();for(var i in t)if(t.hasOwnProperty(i)){var s=$("<span onclick=\"Lively3D.UI.LoadScene('"+t[i]+"')\">"+t[i]+"</span></br>");s.appendTo(r)}Lively3D.UI.ShowHTML(n)})},LoadScene:function(e){Lively3D.FileOperations.getScript(e,"scenes/"),Lively3D.UI.CloseDialog()}};var ParseDesktopJSON=function(data){var JSONArray=JSON.parse(data);for(var i in JSONArray)if(JSONArray.hasOwnProperty(i)){var JSONObject=JSONArray[i],CodeFunc=eval("("+JSONObject.Code+")"),InitFunc=eval("("+JSONObject.Init+")"),app=Lively3D.AddApplication(JSONObject.Name,CodeFunc,InitFunc);SetAppLocation(app,JSONObject.Location),SetAppRotation(app,JSONObject.Rotation),app.StateFromDropbox=!0,JSONObject.Closed!=1&&(app.OpenAfterLoad=!0),JSONObject.Maximized==1&&(app.MaximizeAfterLoad=!0),app.Load(JSONObject.AppState),app.StartApp()}},SetAppLocation=function(e,t){e.GetSceneObject(0).setLocX(t.x),e.GetSceneObject(0).setLocY(t.y),e.GetSceneObject(0).setLocZ(t.z)},SetAppRotation=function(e,t){e.GetSceneObject(0).setRotX(t.x),e.GetSceneObject(0).setRotY(t.y),e.GetSceneObject(0).setRotZ(t.z)};Lively3D.Proxies.Node={ShowAppList:function(){$.get("/lively3d/node/filelist/apps",function(e){var t=$("<h1>Select Application</h1><div></div>"),n=t.last();for(var r in e)if(e.hasOwnProperty(r)){var i=$("<span onclick=\"Lively3D.UI.LoadApplication('"+e[r]+"')\">"+e[r]+"</span></br>");i.appendTo(n)}Lively3D.UI.ShowHTML(t)})},LoadApplication:function(e){$.get("/lively3d/node/file/apps/"+e,function(e){var t=document.createElement("script");t.type="text/javascript",t.src=e,document.head.appendChild(t)}),Lively3D.UI.CloseDialog()},SaveDesktop:function(e){var t=Lively3D.GetApplications(),n={};n.name=e,n.user=Lively3D.GetUsername(),n.applications=[];for(var r in t)if(t.hasOwnProperty(r)){var i=t[r],s=i.isMaximized();i.isMaximized()==1&&Lively3D.Minimize(i);var o={Name:i.GetName(),Location:{x:i.GetCurrentSceneObject().getLocX(),y:i.GetCurrentSceneObject().getLocY(),z:i.GetCurrentSceneObject().getLocZ()},Rotation:i.GetCurrentSceneObject().getRotation(),Closed:i.isClosed(),Maximized:s,Code:i.AppCode.toString(),Init:i.AppInit.toString(),AppState:i.Save()};n.applications.push(o),s==1&&Lively3D.Maximize(i)}$.post("/lively3d/node/states/new",{state:n},function(e){console.log(e)})},LoadDesktop:function(name){var Applications=Lively3D.GetApplications(),appcount=Applications.length;for(var i=0;i<appcount;++i){for(var i in Lively3D.GLGE.scenes)Lively3D.GLGE.scenes.hasOwnProperty(i)&&Lively3D.GLGE.scenes[i].scene.removeChild(Applications[i].current);Applications.splice(0,1)}$.get("/lively3d/node/states/"+Lively3D.GetUsername()+"/"+name,function(data){var apps=data.applications;for(var i in apps)if(apps.hasOwnProperty(i)){var JSONObject=apps[i],CodeFunc=eval("("+JSONObject.Code+")"),InitFunc=eval("("+JSONObject.Init+")"),app=Lively3D.AddApplication(JSONObject.Name,CodeFunc,InitFunc);SetAppLocation(app,JSONObject.Location),SetAppRotation(app,JSONObject.Rotation),app.StateFromDropbox=!0,JSONObject.Closed!="true"&&(app.OpenAfterLoad=!0),JSONObject.Maximized=="true"&&(app.MaximizeAfterLoad=!0),app.Load(JSONObject.AppState),app.StartApp()}})},ShowStateList:function(){$.get("/lively3d/node/states/"+Lively3D.GetUsername(),function(e){var t=$("<h1>Select State</h1><div></div>"),n=t.last();for(var r in e)if(e.hasOwnProperty(r)){var i=$("<span onclick=\"Lively3D.UI.LoadDesktop('"+e[r]+"')\">"+e[r]+"</span></br>");i.appendTo(n)}Lively3D.UI.ShowHTML(t)})},ShowSceneList:function(){$.get("/lively3d/node/filelist/scenes",function(e){var t=$("<h1>Select Scene</h1><div></div>"),n=t.last();for(var r in e)if(e.hasOwnProperty(r)){var i=$("<span onclick=\"Lively3D.UI.LoadScene('"+e[r]+"')\">"+e[r]+"</span></br>");i.appendTo(n)}Lively3D.UI.ShowHTML(t)})},LoadScene:function(e){$.get("/lively3d/node/file/scenes/"+e,function(e){var t=document.createElement("script");t.type="text/javascript",t.src=e,document.head.appendChild(t)}),Lively3D.UI.CloseDialog()}},Lively3D.Proxies.Local={ShowAppList:function(){$.ajax({url:"http://127.0.0.1:8000/filelist/apps",success:function(e){var t=$("<h1>Select Application</h1><div></div>"),n=t.last();for(var r in e)if(e.hasOwnProperty(r)){var i=$("<span onclick=\"Lively3D.UI.LoadApplication('"+e[r]+"')\">"+e[r]+"</span></br>");i.appendTo(n)}Lively3D.UI.ShowHTML(t)}})},LoadApplication:function(e){$.get("http://127.0.0.1:8000/file/apps/"+e,function(e){var t=document.createElement("script");t.type="text/javascript",t.src=e,document.head.appendChild(t)}),Lively3D.UI.CloseDialog()},ShowSceneList:function(){$.get("http://localhost:8000/filelist/scenes",function(e){var t=$("<h1>Select Scene</h1><div></div>"),n=t.last();for(var r in e)if(e.hasOwnProperty(r)){var i=$("<span onclick=\"Lively3D.UI.LoadScene('"+e[r]+"')\">"+e[r]+"</span></br>");i.appendTo(n)}Lively3D.UI.ShowHTML(t)})},LoadScene:function(e){$.get("http://localhost:8000/file/scenes/"+e,function(e){var t=document.createElement("script");t.type="text/javascript",t.src=e,document.head.appendChild(t)}),Lively3D.UI.CloseDialog()},CheckAvailability:function(e){$.ajax({url:"http://localhost:8000/",success:function(t){t.success==0?Lively3D.UI.ShowMessage(t.message):e()},error:function(){Lively3D.UI.ShowMessage("Local Node.js application not found. Please run 'node local.js'")}})},Sync:function(e){$.ajax({url:"http://localhost:8000/sync",data:{host:window.location.host,port:window.location.port,path:window.location.pathname},success:function(e){e.success==1&&Lively3D.UI.ShowMessage(e.message)},error:function(){Lively3D.UI.ShowMessage("Local Node.js application not found. Please run 'node local.js' and associated Mongo-database.")}})},LoadResources:function(e,t){$.get("http://localhost:8000/filearray",{"names[]":e.Resources[t],path:e.ResourcePath},function(n){e.ResourceHandlers[t](n),e.ResourcesLoaded(t)})}}}(Lively3D)