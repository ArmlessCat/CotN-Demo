import * as Phaser from 'phaser';
type Sprite = Phaser.GameObjects.Sprite;
type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export default class Demo extends Phaser.Scene
{
    constructor ()
    {
        super('demo');
    }

    player: Sprite;
    isPlayerMoving: boolean;
    currentMovementDirection: integer;
    pixelsLeftInCurrentMovement: integer;

    preload ()
    {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('dude', 
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create ()
    {
        // this.add.image(400, 300, 'sky');
        this.add.image(0, 0, 'background').setOrigin(0);

        // Initialize player in the middle of a square (75 x 75)
        this.player = this.add.sprite(21, 13, 'dude').setOrigin(0);//this.physics.add.sprite(21, 13, 'dude').setOrigin(0);
        this.createPlayerAnimations(this);
        this.isPlayerMoving = false;
        this.currentMovementDirection = null;
        this.pixelsLeftInCurrentMovement = 0;
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
        // if (cursors.left.isDown)
        // {
        //     this.player.anims.play('left', true);
        // }
        // else if (cursors.right.isDown)
        // {
        //     this.player.anims.play('right', true);
        // }
        // else
        // {
        //     this.player.anims.play('turn');
        // }

        // if (cursors.up.isDown && this.player.body.touching.down)
        // {

        // }
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
        var playerMovementKeyDown = null;
        if (cursors.left.isDown)
        {
            playerMovementKeyDown = MovementDirection.LEFT;
        }
        else if (cursors.right.isDown)
        {
            playerMovementKeyDown = MovementDirection.DOWN;
        }
        else if (cursors.up.isDown)
        {
            playerMovementKeyDown = MovementDirection.UP;
        }
        else if (cursors.down.isDown)
        {
            playerMovementKeyDown = MovementDirection.DOWN;
        }

        // Start moving in a direction
        if (!this.isPlayerMoving && playerMovementKeyDown)
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
        this.isPlayerMoving = true;
        this.pixelsLeftInCurrentMovement = PIXELS_TO_MOVE;

        if (keysDown.left.isDown)
        {
            this.currentMovementDirection = MovementDirection.LEFT;
            this.player.anims.play('left', true);
        }
        else if (keysDown.right.isDown)
        {
            this.currentMovementDirection = MovementDirection.RIGHT;
            this.player.anims.play('right', true);
        }
        else if (keysDown.up.isDown)
        {
            this.currentMovementDirection = MovementDirection.UP;
            this.player.anims.play('left', true);
        }
        else if (keysDown.down.isDown)
        {
            this.currentMovementDirection = MovementDirection.DOWN;
            this.player.anims.play('right', true);
        }
    }

    movePlayer()
    {
        if (this.pixelsLeftInCurrentMovement <= 0)
        {
            this.isPlayerMoving = false;
            this.player.anims.play('turn');
            return;
        }

        if (this.currentMovementDirection == MovementDirection.LEFT)
        {
            this.player.x -= MOVEMENT_SPEED;
        }
        else if (this.currentMovementDirection == MovementDirection.RIGHT)
        {
            this.player.x += MOVEMENT_SPEED;
        }
        else if (this.currentMovementDirection == MovementDirection.UP)
        {
            this.player.y -= MOVEMENT_SPEED;
        }
        else if (this.currentMovementDirection == MovementDirection.DOWN)
        {
            this.player.y += MOVEMENT_SPEED;
        }

        this.pixelsLeftInCurrentMovement -= MOVEMENT_SPEED;
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 600,
    height: 600,
    physics: {
        default: 'arcade'
    },
    scene: Demo
};

const MOVEMENT_SPEED = 5;

// Size of each square (600 pixels / 8 squares)
const PIXELS_TO_MOVE = 75;

const MovementDirection = {
    'UP': 1,
    'LEFT': 2,
    'RIGHT': 3,
    'DOWN': 4
}

const game = new Phaser.Game(config);