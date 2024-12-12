import GUI from 'lil-gui';

class DebugController {
  private static gui = new GUI();

  static position(object: any) {
    const gui = DebugController.gui;
    const positionFolder = gui.addFolder(`${object.constructor.name}_position`);

    try {
      positionFolder.add(object.position, 'x');
      positionFolder.add(object.position, 'y');
      positionFolder.add(object.position, 'z');
    } catch (e) {
      console.warn(e);
    }
  }

  static rotation(object: any) {
    const gui = DebugController.gui;
    const rotationFolder = gui.addFolder(`${object.constructor.name}_rotation`);

    try {
      rotationFolder.add(object.rotation, 'x');
      rotationFolder.add(object.rotation, 'y');
      rotationFolder.add(object.rotation, 'z');
    } catch (e) {
      console.warn(e);
    }
  }

  static scale(object: any) {
    const gui = DebugController.gui;
    const rotationFolder = gui.addFolder(`${object.constructor.name}_scale`);

    try {
      rotationFolder.add(object.scale, 'x');
      rotationFolder.add(object.scale, 'y');
      rotationFolder.add(object.scale, 'z');
    } catch (e) {
      console.warn(e);
    }
  }
}

export default DebugController;
