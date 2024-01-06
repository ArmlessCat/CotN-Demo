import * as Phaser from 'phaser';
import * as Schemas from './schemas';

export class Player
{
    scene: Phaser.Scene;
    board: Phaser.GameObjects.GameObject[][];

    player: Phaser.GameObjects.Sprite;
    isPlayerMoving: boolean;
    isPlayerDirectionKeyDown: boolean;
    currentPlayerDirection: Schemas.MovementDirection;
    lastPlayerDirection: Schemas.MovementDirection;
    pixelsLeftInCurrentMovement: integer;
    playerBoardPosition: Schemas.BoardPosition;

    readonly playerSpriteName = 'dude';

    constructor (scene: Phaser.Scene, board: Phaser.GameObjects.GameObject[][])
    {
        // Initialize properties to default/starting values
        this.scene = scene;
        this.board = board;

        this.player = this.scene.add.sprite(21, 13, this.playerSpriteName).setOrigin(0); // middle of a square (75 x 75)
        this.createPlayerAnimations();
        this.player.anims.play(Schemas.MovementDirection.NONE);
        this.isPlayerMoving = false;
        this.isPlayerDirectionKeyDown = false;
        this.currentPlayerDirection = Schemas.MovementDirection.NONE;
        this.lastPlayerDirection = Schemas.MovementDirection.NONE;
        this.pixelsLeftInCurrentMovement = 0;

        // Add the player to the board
        this.playerBoardPosition = {row: 0, col: 0};
        board[this.playerBoardPosition.row][this.playerBoardPosition.col] = this.player;
    }

    createPlayerAnimations()
    {
        this.scene.anims.create({
            key: Schemas.MovementDirection.LEFT,
            frames: this.scene.anims.generateFrameNumbers(this.playerSpriteName, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: Schemas.MovementDirection.UP,
            frames: this.scene.anims.generateFrameNumbers(this.playerSpriteName, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: Schemas.MovementDirection.RIGHT,
            frames: this.scene.anims.generateFrameNumbers(this.playerSpriteName, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: Schemas.MovementDirection.DOWN,
            frames: this.scene.anims.generateFrameNumbers(this.playerSpriteName, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: Schemas.MovementDirection.NONE,
            frames: [ { key: this.playerSpriteName, frame: 4 } ],
            frameRate: 20
        });
    }

        /*
        Steps for player movement:
        1) If player is not currently moving, check if movement key is down
        2) Start player movement animation, move player sprite to the next square
        3) When the player sprite moves one square, stop the animation at the resting position 
    */
    updatePlayer()
    {
        var cursors = this.scene.input.keyboard.createCursorKeys();

        // Check if the current/last player movement key has been lifted
        if (this.isPlayerDirectionKeyDown)
        {
            let currentMovementCursorKey = this.getCursorKeyForMovementDirection(cursors);
            if (currentMovementCursorKey && currentMovementCursorKey.isUp)
            {
                this.isPlayerDirectionKeyDown = false;
            }
        }

        // Do not change the player's direction if player is currently moving
        if (this.isPlayerMoving)
        {
            this.movePlayer();
            return;
        }

        // Do not continue moving if the same direction key is still held down
        if (this.isPlayerDirectionKeyDown)
        {
            return;
        }

        let playerDirection: Schemas.MovementDirection = Schemas.MovementDirection.NONE;
        if (cursors.left.isDown)
        {
            playerDirection = Schemas.MovementDirection.LEFT;
        }
        else if (cursors.right.isDown)
        {
            playerDirection = Schemas.MovementDirection.RIGHT;
        }
        else if (cursors.up.isDown)
        {
            playerDirection = Schemas.MovementDirection.UP;
        }
        else if (cursors.down.isDown)
        {
            playerDirection = Schemas.MovementDirection.DOWN;
        }

        // Start moving in a new direction, if they are able
        if (playerDirection != Schemas.MovementDirection.NONE && this.validatePlayerMovement(playerDirection))
        {
            this.isPlayerMoving = true;
            this.isPlayerDirectionKeyDown = true;
            this.updatePlayerDirection(playerDirection);
        }
    }

    getCursorKeyForMovementDirection(cursors: Phaser.Types.Input.Keyboard.CursorKeys): Phaser.Input.Keyboard.Key
    {
        let movementDirection = this.currentPlayerDirection == Schemas.MovementDirection.NONE ? this.lastPlayerDirection : this.currentPlayerDirection;

        if (movementDirection == Schemas.MovementDirection.LEFT)
        {
            return cursors.left;
        }

        if (movementDirection == Schemas.MovementDirection.UP)
        {
            return cursors.up;
        }

        if (movementDirection == Schemas.MovementDirection.RIGHT)
        {
            return cursors.right;
        }

        if (movementDirection == Schemas.MovementDirection.DOWN)
        {
            return cursors.down;
        }

        return undefined;
    }

    validatePlayerMovement(playerDirection: Schemas.MovementDirection): boolean
    {
        let proposedRowChange = 0, proposedColChange = 0;
        if (playerDirection == Schemas.MovementDirection.LEFT)
        {
            proposedColChange = -1;
        } 
        else if (playerDirection == Schemas.MovementDirection.UP)
        {
            proposedRowChange = -1;
        }
        else if (playerDirection == Schemas.MovementDirection.RIGHT)
        {
            proposedColChange = 1;
        }
        else if (playerDirection == Schemas.MovementDirection.DOWN)
        {
            proposedRowChange = 1;
        }

        let proposedPlayerBoardPosition: Schemas.BoardPosition = {row: this.playerBoardPosition.row + proposedRowChange, col: this.playerBoardPosition.col + proposedColChange};

        if (proposedPlayerBoardPosition.row < 0 ||
            proposedPlayerBoardPosition.row >= this.board.length ||
            proposedPlayerBoardPosition.col < 0 ||
            proposedPlayerBoardPosition.col >= this.board[0].length)
        {
            return false;
        }

        let playerGameObject = this.board[this.playerBoardPosition.row][this.playerBoardPosition.col];

        // Clear the board at the player's old position
        this.board[this.playerBoardPosition.row][this.playerBoardPosition.col] = undefined;

        // Assign the player game object to their new position
        this.board[proposedPlayerBoardPosition.row][proposedPlayerBoardPosition.col] = playerGameObject;

        // Update the stored player board position with their new location
        this.playerBoardPosition = proposedPlayerBoardPosition;

        return true;
    }

    updatePlayerDirection(newPlayerDirection: Schemas.MovementDirection)
    {
        this.pixelsLeftInCurrentMovement = Schemas.PIXELS_TO_MOVE;

        this.currentPlayerDirection = newPlayerDirection;

        this.player.anims.play(newPlayerDirection, true);
    }

    movePlayer()
    {
        if (this.pixelsLeftInCurrentMovement <= 0)
        {
            this.isPlayerMoving = false;
            this.lastPlayerDirection = this.currentPlayerDirection;
            this.currentPlayerDirection = Schemas.MovementDirection.NONE;
            this.player.anims.play(Schemas.MovementDirection.NONE);
            return;
        }

        // Do not move farther than the remaining pixels left
        let adjustedMovementSpeed = Math.min(this.pixelsLeftInCurrentMovement, Schemas.MOVEMENT_SPEED);

        if (this.currentPlayerDirection == Schemas.MovementDirection.LEFT)
        {
            this.player.x -= adjustedMovementSpeed;
        }
        else if (this.currentPlayerDirection == Schemas.MovementDirection.RIGHT)
        {
            this.player.x += adjustedMovementSpeed;
        }
        else if (this.currentPlayerDirection == Schemas.MovementDirection.UP)
        {
            this.player.y -= adjustedMovementSpeed;
        }
        else if (this.currentPlayerDirection == Schemas.MovementDirection.DOWN)
        {
            this.player.y += adjustedMovementSpeed;
        }

        this.pixelsLeftInCurrentMovement -= adjustedMovementSpeed;
    }
}