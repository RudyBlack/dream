import { Object3D, Scene } from 'three';

export function parseSceneObjects(scene: Scene) {
  const objects: any = [];
  scene.traverse((object: any) => {
    console.log(object);
    if (object.isMesh) {
      objects.push({
        uuid: object.uuid,
        type: object.type,
        position: object.position.toArray(),
        rotation: object.rotation.toArray(),
        scale: object.scale.toArray(),
        geometry: object.geometry.parameters, // 필요한 경우
        material: {
          color: object.material.color.getHex(),
        },
      });
    }
  });
  return { objects };
}
