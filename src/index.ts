import Game from './Game';

const game =  new Game({ containerId: '#game', sourceUrl: '/api/images' });

global.game = game;
