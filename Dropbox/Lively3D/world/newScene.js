var SphereScene = function(){

	this.Id = "spherescene";
  
  this.Model;

	this.RenderingFunction = function(now, lasttime){
    this.Model.update();
	};
	
	this.CreateApplication = function(canvastex){
  
    var icon = new WIDGET3D.GridIcon({
      picture : texture,
      color : 0xEE0055,
      parent : this.Model});
    
    return icon;

	};
  
  this.Init = function(){
    this.Model = new WIDGET3D.GridWindow({width: 2000,
      height: 2000,
      color: 0xC0C0C0,
      defaultControls : true});
    
    this.Model.setZ(-1000);
    Lively3D.WIDGET.mainWindow.addChild(this.Model);
    
    Lively3D.renderer.setClearColorHex( 0xF5F5F5, 1);
  };
	
	this.Open = function(app, scene){

	};
	
	this.Close = function(){
	
	};
  
  this.Remove = function(){
    this.Model.remove();
  };
  
  this.Resources = {
		images: ['images/app.png']
	};
  this.ResourceHandlers = {
		images: function(imageURLs){
			texture = imageURLs[0];
		}
  }
  this.ResourcePath = 'world/Resources/newScene/';
	this.ResourcesLoaded = function(resource){
		console.log('terrainscene done with resource: ' + resource);
    Lively3D.SceneLoader();
	}
	
}

var scene = new SphereScene();
Lively3D.AddScene(scene);