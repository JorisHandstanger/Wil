'use strict';

export default class spaceObject {

  constructor(type, id){

    this.id = id;

    this.type = type;

    this.rotation = this.radians(45);

    this.loaded = false;
    this.finished = false;

    this.collided = false;
    this.deletable = false;

    this.obj = {};

    this.hPosition = (Math.floor(Math.random() * 3) + 1) - 2;

    this.redMaterial = new THREE.MeshPhongMaterial( {
      color: 0xe62626,
      emissive: new THREE.Color( 0.6, 0.1, 0.2 ),
      shading: THREE.SmoothShading
    });

    this.whiteMaterial = new THREE.MeshPhongMaterial( {
      color: 0xffffff,
      emissive: new THREE.Color( 0.6, 0.6, 0.6 ),
      shading: THREE.SmoothShading
    });

    let group = new THREE.Object3D();

    let objloader = new THREE.OBJLoader();

    switch (this.type) {
    case 1:

      let loader = new THREE.ColladaLoader();
      loader.options.convertUpAxis = true;
      loader.load(
        // resource URL
        './assets/rocketExportTest.dae',
        // Function when resource is loaded
        ( collada ) => {
          let theObject = collada.scene;
          theObject.position.set(0, 0, -470);

          theObject.rotation.set(this.radians(-90), 0, 0);

          group.add(theObject);

          group.name = id;

          this.obj.shape = group;

        }
      );

      break;

    case 2:

      let loader2 = new THREE.ColladaLoader();
      loader2.options.convertUpAxis = true;
      loader2.load(
        // resource URL
        './assets/rock.dae',
        // Function when resource is loaded
        ( collada ) => {
          let theObject = collada.scene;
          theObject.position.set((this.hPosition * 16), 0, -440);
          theObject.scale.set(0.1, 0.2, 0.1);

          theObject.rotation.set(this.radians(-90), this.radians(90), 0);

          group.add(theObject);

          group.name = id;

          this.obj.shape = group;

        }
      );

      break;

      case 3:
      objloader.load(
        // resource URL
        './assets/engine.obj',
        // Function when resource is loaded
        ( object ) => {

          object.children[0].material = this.redMaterial;
          object.position.set((this.hPosition * 16)-2, 0, -467);

          object.rotation.set(this.radians(-90), 0, 0);
          object.scale.set(0.01, 0.01, 0.01);

          group.add(object);

          group.name = id;

          this.obj.shape = group;

        }
      );

      break;

      case 4:
      objloader.load(
        // resource URL
        './assets/poten.obj',
        // Function when resource is loaded
        ( object ) => {

          object.children[0].material = this.redMaterial;

          object.position.set((this.hPosition * 16)-2, 0, -468);

          object.rotation.set(this.radians(-90), 0, 0);
          object.scale.set(0.006, 0.006, 0.006);

          group.add(object);

          group.name = id;

          this.obj.shape = group;

        }
      );

      break;

      case 5:
      objloader.load(
        // resource URL
        './assets/hull.obj',
        // Function when resource is loaded
        ( object ) => {
          object.children[0].material = this.whiteMaterial;
          object.position.set((this.hPosition * 16), 0, -465);

          object.rotation.set(this.radians(-90), 0, 0);
          object.scale.set(0.01, 0.01, 0.01);

          group.add(object);

          group.name = id;

          this.obj.shape = group;

        }
      );

      break;

      case 6:

      objloader.load(
        // resource URL
        './assets/antenna.obj',
        // Function when resource is loaded
        ( object ) => {
          object.children[0].material = this.redMaterial;
          object.position.set((this.hPosition * 16), 0, -465);

          object.rotation.set(this.radians(-90), 0, 0);
          object.scale.set(0.01, 0.01, 0.01);

          group.add(object);

          group.name = id;

          this.obj.shape = group;

        }
      );

      break;
    }

  }

  update(speed){

    this.rotation += speed;

    if(this.obj.shape){
      this.obj.shape.rotation.set(this.rotation, 0, 0);
    }

    if(this.rotation >= this.radians(96)){
      this.deletable = true;
    }else if(this.rotation >= this.radians(87)){
      this.collided = true;
    }else if(this.rotation >= this.radians(87.01)){
      this.collided = false;
    }

    if((this.type === 1) && (this.rotation >= this.radians(80))){
      this.finished = true;
    }
  }

  render(){
    return this.obj.shape;
  }

  radians(degrees) {
    return degrees * Math.PI / 180;
  }

}
