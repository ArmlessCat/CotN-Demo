import * as Phaser from 'phaser';
type Sprite = Phaser.GameObjects.Sprite;
type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
type CollidableGameObject = Phaser.GameObjects.GameObject & {collided?: boolean}
type Note = Phaser.GameObjects.GameObject & {timestamp?: number, spawned?: boolean}

export default class Demo extends Phaser.Scene
{
    constructor ()
    {
        super('demo');
    }

    // Board
    board: Phaser.GameObjects.GameObject[][];

    // Player
    player: Sprite;
    isPlayerMoving: boolean;
    isDirectionKeyDown: boolean;
    currentPlayerDirection: integer;
    pixelsLeftInCurrentMovement: integer;

    // Sound management
    noteBar: Phaser.GameObjects.Rectangle;
    noteCollisionBox: Phaser.GameObjects.Rectangle;
    song: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    colliders: Array<CollidableGameObject>;
    lastNoteIndex: number;
    notesTimestamps: Note[];
    notesSpawned: Phaser.GameObjects.Arc[];
    musicStartTime: number;
    timeToMove: number;
    score: number;
    scoreText: Phaser.GameObjects.Text;

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
        // Initialize board
        this.add.image(0, 0, 'background').setOrigin(0);
        for (let i = 0; i < NUMBER_OF_SQUARES; i++)
        {
            this.board[i] = [];
            for (let j = 0; j < NUMBER_OF_SQUARES; j++)
            {
                this.board[i][j] = undefined;
            }
        }

        // Initialize player
        this.player = this.add.sprite(21, 13, 'dude').setOrigin(0); // middle of a square (75 x 75)
        this.createPlayerAnimations(this);
        this.player.anims.play('turn');
        this.isPlayerMoving = false;
        this.isDirectionKeyDown = false;
        this.currentPlayerDirection = MovementDirection.NONE;
        this.pixelsLeftInCurrentMovement = 0;

        // Initialize sound
        this.noteBar = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 30, WINDOW_WIDTH, 10, 0xff0000);
        this.noteCollisionBox = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 30, 20, 60, 0xffff00);
        this.noteCollisionBox.setStrokeStyle(2, 0x00ff00);
        this.lastNoteIndex = 0;

        this.notesTimestamps = [];
        this.notesSpawned = [];
        this.timeToMove = 1000; // ms, time for the note to go to the bottom. The lower the faster/hardest
        this.notesTimestamps = JSON.parse('[{"timestamp":944},{"timestamp":1383},{"timestamp":1768},{"timestamp":2173},{"timestamp":2364},{"timestamp":2562},{"timestamp":2951},{"timestamp":3560},{"timestamp":3767},{"timestamp":3969},{"timestamp":4164},{"timestamp":4565},{"timestamp":4760},{"timestamp":4971},{"timestamp":5377},{"timestamp":5567},{"timestamp":5766},{"timestamp":6163},{"timestamp":6776},{"timestamp":6978},{"timestamp":7181},{"timestamp":7388},{"timestamp":7781},{"timestamp":8174},{"timestamp":8576},{"timestamp":8770},{"timestamp":8965},{"timestamp":9358},{"timestamp":9970},{"timestamp":10177},{"timestamp":10376},{"timestamp":10570},{"timestamp":10964},{"timestamp":11162},{"timestamp":11365},{"timestamp":11762},{"timestamp":11961},{"timestamp":12184},{"timestamp":12561},{"timestamp":13165},{"timestamp":13380},{"timestamp":13575},{"timestamp":13778},{"timestamp":14167},{"timestamp":14370},{"timestamp":14585},{"timestamp":14978},{"timestamp":15177},{"timestamp":15400},{"timestamp":15764},{"timestamp":16356},{"timestamp":16563},{"timestamp":16766},{"timestamp":16973},{"timestamp":17391},{"timestamp":17594},{"timestamp":17792},{"timestamp":17987},{"timestamp":18181},{"timestamp":18367},{"timestamp":18570},{"timestamp":18765},{"timestamp":19145},{"timestamp":19535},{"timestamp":19750},{"timestamp":19961},{"timestamp":20172},{"timestamp":20573},{"timestamp":20772},{"timestamp":20975},{"timestamp":21372},{"timestamp":21579},{"timestamp":21790},{"timestamp":22167},{"timestamp":22771},{"timestamp":22982},{"timestamp":23185},{"timestamp":23578},{"timestamp":23785},{"timestamp":23988},{"timestamp":24182},{"timestamp":24393},{"timestamp":24592},{"timestamp":24790},{"timestamp":24981},{"timestamp":25378},{"timestamp":25771},{"timestamp":26190}]');

        this.song = this.sound.add("song");
        this.song.volume = 0.1;
        this.song.play();
        this.musicStartTime = Date.now();

        this.score = 0;
        this.scoreText = this.add.text(0, WINDOW_HEIGHT - 100, this.score.toString(), { fontFamily: "arial", fontSize: "42px" });
        this.scoreText.setStroke("#ff0000", 2);

        this.colliders = [];

        // Add initial game objects to the board
        this.board[0][0] = this.player;
    }

    createPlayerAnimations(scene: Phaser.Scene)
    {
        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update ()
    {
        this.updatePlayer();

        // Sound management
        this.handlePlayerInput();
        this.spawnNotes();
        this.checkNoteCollisions();
    }

    /*
        Steps for player movement:
        1) If player is not currently moving, check if movement key is down
        2) Start player movement animation, move player sprite to the next square
        3) When the player sprite moves one square, stop the animation at the resting position 
    */
    updatePlayer()
    {
        var cursors = this.input.keyboard.createCursorKeys();
        var keyDown = null;
        if (cursors.left.isDown)
        {
            keyDown = MovementDirection.LEFT;
        }
        else if (cursors.right.isDown)
        {
            keyDown = MovementDirection.DOWN;
        }
        else if (cursors.up.isDown)
        {
            keyDown = MovementDirection.UP;
        }
        else if (cursors.down.isDown)
        {
            keyDown = MovementDirection.DOWN;
        }

        // Start moving in a new direction
        if (!this.isPlayerMoving && keyDown != null && keyDown != this.currentPlayerDirection)
        {
            this.isPlayerMoving = true;
            this.updatePlayerDirection(cursors);
        }

        //If moving, continue moving in the direction
        if (this.isPlayerMoving)
        {
            this.movePlayer();
        }
    }

    updatePlayerDirection(keysDown: CursorKeys)
    {
        this.pixelsLeftInCurrentMovement = PIXELS_TO_MOVE;

        if (keysDown.left.isDown)
        {
            this.currentPlayerDirection = MovementDirection.LEFT;
            this.player.anims.play('left', true);
        }
        else if (keysDown.right.isDown)
        {
            this.currentPlayerDirection = MovementDirection.RIGHT;
            this.player.anims.play('right', true);
        }
        else if (keysDown.up.isDown)
        {
            this.currentPlayerDirection = MovementDirection.UP;
            this.player.anims.play('left', true);
        }
        else if (keysDown.down.isDown)
        {
            this.currentPlayerDirection = MovementDirection.DOWN;
            this.player.anims.play('right', true);
        }
    }

    movePlayer()
    {
        if (this.pixelsLeftInCurrentMovement <= 0)
        {
            this.isPlayerMoving = false;
            this.currentPlayerDirection = MovementDirection.NONE;
            this.player.anims.play('turn');
            return;
        }

        // Do not move farther than the remaining pixels left
        let adjustedMovementSpeed = Math.min(this.pixelsLeftInCurrentMovement, MOVEMENT_SPEED);

        if (this.currentPlayerDirection == MovementDirection.LEFT)
        {
            this.player.x -= adjustedMovementSpeed;
        }
        else if (this.currentPlayerDirection == MovementDirection.RIGHT)
        {
            this.player.x += adjustedMovementSpeed;
        }
        else if (this.currentPlayerDirection == MovementDirection.UP)
        {
            this.player.y -= adjustedMovementSpeed;
        }
        else if (this.currentPlayerDirection == MovementDirection.DOWN)
        {
            this.player.y += adjustedMovementSpeed;
        }

        this.pixelsLeftInCurrentMovement -= adjustedMovementSpeed;
    }

    handlePlayerInput()
    {
        var cursors = this.input.keyboard.createCursorKeys();
        if (cursors.space.isDown) {
            // we create a new collider at the position of the red bar
            let collider = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 30, 20, 60, 0xaaaaff);

            // attach physics
            let colliderWithPhysicsBody = this.physics.add.existing(collider) as CollidableGameObject;

            // little tween to grow
            this.tweens.add({
                targets: colliderWithPhysicsBody,
                scale: 1.5,
                duration: 100,
                alpha: 0,
                onComplete: () => {
                    colliderWithPhysicsBody.destroy();

                    // If the collider did not hit a note, its a miss, so lets lower the score
                    if (colliderWithPhysicsBody.collided != true) {
                        this.cameras.main.shake(100, 0.01);
                        // this.score -= 200;
                        // this.updateScoreText();
                    }
                }
            });

            // add the collider to the list
            this.colliders.push(colliderWithPhysicsBody);
        }
    }

    spawnNotes()
    {
        // lets look up to the 10 next notes and spawn if needed
        for (let i = this.lastNoteIndex; i < this.lastNoteIndex + 10; i++) {
            let note = this.notesTimestamps[i];
            if (!note) break;

            // Spawn note if: is not already spawned, and the timing is right. From the start of the song, we need to consider the time it takes for the note to fall so we start it at the timestamp minus the time to fall
            if (
                note.spawned != true
                && note.timestamp <= Date.now() - this.musicStartTime + this.timeToMove
            ) {
                this.spawnNote();
                this.lastNoteIndex = i;
                note.spawned = true;
            }
        }
    }

    spawnNote()
    {
        // This is self explanatory. Spawn the note and let it fall to the bottom.
        let note = this.add.circle(WINDOW_WIDTH, WINDOW_HEIGHT - 30, 20, 0xffff00);
        this.notesSpawned.push(note);
        this.physics.add.existing(note);
        this.physics.moveTo(note, 0, WINDOW_HEIGHT - 30, null, this.timeToMove);
    }

    checkNoteCollisions()
    {
        this.physics.overlap(this.colliders, this.notesSpawned, (colliderGameObject, noteGameObject) => {
            let collider = colliderGameObject as CollidableGameObject;
            let note = noteGameObject as Phaser.GameObjects.Arc;

            // the collider collided
            collider.collided = true;

            // remove the collider from list
            this.colliders.splice(this.colliders.indexOf(collider), 1);

            // destroy the note and remove from list
            note.destroy();
            this.notesSpawned.splice(this.notesSpawned.indexOf(note), 1);

            // increase the score and update the text
            this.score += 100;
            this.updateScoreText();
        });
    }

    updateScoreText()
    {
        this.scoreText.text = this.score.toString();
    }
}

const WINDOW_WIDTH = 600;
const WINDOW_HEIGHT = 700;

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: Demo
};

const MOVEMENT_SPEED = 10;

// Size of each square (600 pixels / 8 squares)
const NUMBER_OF_SQUARES = 8;
const PIXELS_TO_MOVE = 75;

const MovementDirection = {
    'NONE': 0,
    'UP': 1,
    'LEFT': 2,
    'RIGHT': 3,
    'DOWN': 4
}

const game = new Phaser.Game(config);