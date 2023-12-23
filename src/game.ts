import * as Phaser from 'phaser';

export default class Demo extends Phaser.Scene
{
    constructor ()
    {
        super('demo');
    }

    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

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
        this.player = this.physics.add.sprite(21, 13, 'dude').setOrigin(0);

        this.createPlayerAnimations(this);
    }

    createPlayerAnimations(scene)
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
        var cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown)
        {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-500);
        }
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

const game = new Phaser.Game(config);
