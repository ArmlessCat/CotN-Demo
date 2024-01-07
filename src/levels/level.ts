import * as Phaser from 'phaser';
import * as Schemas from '../schemas';
import { BeatTracker } from '../BeatTracker';
import { Player } from '../player';
import { Room } from '../room';

export class Level extends Phaser.Scene
{
    map: Schemas.Room[][];
    currentRoom: Schemas.Room;
    startingRoom: Schemas.Room;

    entities: Schemas.Entity[];

    beatTracker: BeatTracker;

    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor ()
    {
        super('level');
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

        // Initialize all rooms in the level
        this.add.image(0, 0, 'background').setOrigin(0);

        // TODO: create map as defined by config passed through the constructor
        this.startingRoom = new Room();
        this.map = [[this.startingRoom]];

        // Initialize entities
        this.entities = [];
        this.entities.push(new Player(this, this.startingRoom.board));
    }

    update ()
    {
        for (const entity of this.entities)
        {
            entity.update();
        }

        this.beatTracker.update();
    }
}