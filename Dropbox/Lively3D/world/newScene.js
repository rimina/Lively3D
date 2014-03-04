var SphereScene = function(){

	this.Id = "spherescene";
  
  this.Model;
  this.CameraControls;
  this.SkySphere;
  this.CurrentDistance = 100;
  this.DistanceStep = 50;

	this.RenderingFunction = function(now, lasttime){
    this.Model.rotation.y += Math.PI/600;
	};
	
	this.CreateApplication = function(appCanvas){
    var texture = new THREE.Texture(appCanvas);
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(20, 16, 16), new THREE.MeshBasicMaterial({map: texture}));
    var icon = new WIDGET3D.Widget(mesh);
    
    var pos = this.Model.getPosition();
    icon.setPosition(pos.x + this.CurrentDistance, pos.y, pos.z);
    
    this.Model.add(icon);
    
    this.CurrentDistance += this.DistanceStep;
    
    return icon;

	};
  
  this.Init = function(){
    
    this.SkySphere = new THREE.Mesh(new THREE.SphereGeometry(60, 16, 16), new THREE.MeshBasicMaterial({color:0x30F030}));
    WIDGET3D.getScene().add(this.SkySphere);
  
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(60, 16, 16), new THREE.MeshBasicMaterial({color:0xF000FF}));
    this.Model = new WIDGET3D.Group(mesh);
    Lively3D.WIDGET.mainWindow.add(this.Model);
  };
	
	this.Open = function(app, scene){

	};
	
	this.Close = function(){
	
	};
  
  this.Remove = function(){
    this.Model.remove();
    this.CameraControls.remove();
    WIDGET3D.getScene().remove(this.SkySphere);
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
		console.log('sphere scene done with resource: ' + resource);
    Lively3D.SceneLoader();
	}
	
}

var scene = new SphereScene();
Lively3D.AddScene(scene);