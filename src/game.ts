import * as Phaser from 'phaser';
import * as Schemas from './schemas';
import * as Levels from './levels/level';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: Schemas.WINDOW_WIDTH,
    height: Schemas.WINDOW_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: Levels.Level
};

const game = new Phaser.Game(config);