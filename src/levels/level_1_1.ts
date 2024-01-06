import * as Phaser from 'phaser';
import * as Schemas from '../schemas';
import { BeatTracker } from '../BeatTracker';
import { Player } from '../player';

export class Level_1_1 extends Phaser.Scene implements Schemas.Level
{
    map: Schemas.Room[][];
    beatTracker: BeatTracker;
    entities: Schemas.Entity[];

    // TODO: refactor this to only use the above interface properties
    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    board: Phaser.GameObjects.GameObject[][];
    player: Player;

    constructor ()
    {
        super('level_1_1');
    }

    preload ()
    {
        this.load.audio("song", "assets/galactic_dancing.ogg");
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('dude', 
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create ()
    {
        // Initialize beat tracker
        this.beatTracker = new BeatTracker(this);

        // Initialize cursor keys
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.cursorKeys.space.on('down', () => {
            this.beatTracker.startNoteCollision();
        });
        this.cursorKeys.left.on('down', () => {
            this.beatTracker.startNoteCollision();
        });
        this.cursorKeys.up.on('down', () => {
            this.beatTracker.startNoteCollision();
        });
        this.cursorKeys.right.on('down', () => {
            this.beatTracker.startNoteCollision();
        });
        this.cursorKeys.down.on('down', () => {
            this.beatTracker.startNoteCollision();
        });

        // Initialize board
        this.add.image(0, 0, 'background').setOrigin(0);
        this.board = [];
        for (let i = 0; i < Schemas.NUMBER_OF_SQUARES; i++)
        {
            this.board[i] = [];
            for (let j = 0; j < Schemas.NUMBER_OF_SQUARES; j++)
            {
                this.board[i][j] = undefined;
            }
        }

        // Initialize player
        this.player = new Player(this, this.board);
    }

    update ()
    {
        // Player management
        this.player.update();

        // Beat tracker management
        this.beatTracker.update();
    }
}