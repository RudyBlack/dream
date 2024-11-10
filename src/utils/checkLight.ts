import * as THREE from 'three';

export function isLight(object: THREE.Object3D): object is THREE.Light {
  return (object as THREE.Light).isLight !== undefined;
}

export function isPointLight(
  object: THREE.Object3D,
): object is THREE.PointLight {
  return (object as THREE.PointLight).isPointLight !== undefined;
}

export function isDirectionalLight(
  object: THREE.Object3D,
): object is THREE.DirectionalLight {
  return (object as THREE.DirectionalLight).isDirectionalLight !== undefined;
}

export function isSpotLight(object: THREE.Object3D): object is THREE.SpotLight {
  return (object as THREE.SpotLight).isSpotLight !== undefined;
}

export function isHemisphereLight(
  object: THREE.Object3D,
): object is THREE.HemisphereLight {
  return (object as THREE.HemisphereLight).isHemisphereLight !== undefined;
}
