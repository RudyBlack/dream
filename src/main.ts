import DreamJourney from './core';

const container = document.getElementById('container') as HTMLDivElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const dreamJourney = new DreamJourney(canvas, container);
await dreamJourney.init();
