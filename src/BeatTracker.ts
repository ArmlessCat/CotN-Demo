import * as Phaser from 'phaser';
import * as Schemas from './schemas';

export class BeatTracker
{
    scene: Phaser.Scene;

    noteBar: Phaser.GameObjects.Rectangle;
    noteCollisionBox: Phaser.GameObjects.Rectangle;
    song: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    colliders: Array<Schemas.CollidableGameObject>;
    lastNoteIndex: number;
    notesTimestamps: Schemas.Note[];
    notesSpawned: Phaser.GameObjects.Arc[];
    musicStartTime: number;
    timeToMove: number;
    hitScore: number;
    hitScoreText: Phaser.GameObjects.Text;
    missScore: number;
    missScoreText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene)
    {
        this.scene = scene;

        this.noteBar = this.scene.add.rectangle(Schemas.WINDOW_WIDTH / 2, Schemas.WINDOW_HEIGHT - 30, Schemas.WINDOW_WIDTH, 10, 0xff0000);
        this.noteCollisionBox = this.scene.add.rectangle(Schemas.WINDOW_WIDTH / 2, Schemas.WINDOW_HEIGHT - 30, 20, 60, 0xffff00);
        this.noteCollisionBox.setStrokeStyle(2, 0x00ff00);
        this.lastNoteIndex = 0;

        this.notesTimestamps = [];
        this.notesSpawned = [];
        this.timeToMove = 1000; // ms, time for the note to go to the bottom. The lower the faster/hardest
        this.notesTimestamps = JSON.parse('[{"timestamp":944},{"timestamp":1383},{"timestamp":1768},{"timestamp":2173},{"timestamp":2364},{"timestamp":2562},{"timestamp":2951},{"timestamp":3560},{"timestamp":3767},{"timestamp":3969},{"timestamp":4164},{"timestamp":4565},{"timestamp":4760},{"timestamp":4971},{"timestamp":5377},{"timestamp":5567},{"timestamp":5766},{"timestamp":6163},{"timestamp":6776},{"timestamp":6978},{"timestamp":7181},{"timestamp":7388},{"timestamp":7781},{"timestamp":8174},{"timestamp":8576},{"timestamp":8770},{"timestamp":8965},{"timestamp":9358},{"timestamp":9970},{"timestamp":10177},{"timestamp":10376},{"timestamp":10570},{"timestamp":10964},{"timestamp":11162},{"timestamp":11365},{"timestamp":11762},{"timestamp":11961},{"timestamp":12184},{"timestamp":12561},{"timestamp":13165},{"timestamp":13380},{"timestamp":13575},{"timestamp":13778},{"timestamp":14167},{"timestamp":14370},{"timestamp":14585},{"timestamp":14978},{"timestamp":15177},{"timestamp":15400},{"timestamp":15764},{"timestamp":16356},{"timestamp":16563},{"timestamp":16766},{"timestamp":16973},{"timestamp":17391},{"timestamp":17594},{"timestamp":17792},{"timestamp":17987},{"timestamp":18181},{"timestamp":18367},{"timestamp":18570},{"timestamp":18765},{"timestamp":19145},{"timestamp":19535},{"timestamp":19750},{"timestamp":19961},{"timestamp":20172},{"timestamp":20573},{"timestamp":20772},{"timestamp":20975},{"timestamp":21372},{"timestamp":21579},{"timestamp":21790},{"timestamp":22167},{"timestamp":22771},{"timestamp":22982},{"timestamp":23185},{"timestamp":23578},{"timestamp":23785},{"timestamp":23988},{"timestamp":24182},{"timestamp":24393},{"timestamp":24592},{"timestamp":24790},{"timestamp":24981},{"timestamp":25378},{"timestamp":25771},{"timestamp":26190}]');

        this.song = this.scene.sound.add("song");
        this.song.volume = 0.1;
        this.song.play();
        this.musicStartTime = Date.now();

        this.hitScore = 0;
        this.hitScoreText = this.scene.add.text(0, Schemas.WINDOW_HEIGHT - 100, this.hitScore.toString(), { fontFamily: "arial", fontSize: "42px" });
        this.hitScoreText.setStroke("#00ff00", 2);
        this.missScore = 0;
        this.missScoreText = this.scene.add.text(Schemas.WINDOW_WIDTH - 50, Schemas.WINDOW_HEIGHT - 100, this.missScore.toString(), { fontFamily: "arial", fontSize: "42px" });
        this.missScoreText.setStroke("#ff0000", 2);

        this.colliders = [];
    }

    update()
    {
        this.spawnNotes();
        this.checkNoteCollisions();
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
        let note = this.scene.add.circle(Schemas.WINDOW_WIDTH, Schemas.WINDOW_HEIGHT - 30, 20, 0xffff00);
        this.notesSpawned.push(note);
        this.scene.physics.add.existing(note);
        this.scene.physics.moveTo(note, 0, Schemas.WINDOW_HEIGHT - 30, null, this.timeToMove);
    }

    checkNoteCollisions()
    {
        this.scene.physics.overlap(this.colliders, this.notesSpawned, (colliderGameObject, noteGameObject) => {
            let collider = colliderGameObject as Schemas.CollidableGameObject;
            let note = noteGameObject as Phaser.GameObjects.Arc;

            // the collider collided
            collider.collided = true;

            // remove the collider from list
            this.colliders.splice(this.colliders.indexOf(collider), 1);

            // destroy the note and remove from list
            note.destroy();
            this.notesSpawned.splice(this.notesSpawned.indexOf(note), 1);

            // increase the score and update the text
            this.hitScore += 1;
            this.updateHitScoreText();
        });
    }

    startNoteCollision()
    {
        // we create a new collider at the position of the red bar
        let collider = this.scene.add.rectangle(Schemas.WINDOW_WIDTH / 2, Schemas.WINDOW_HEIGHT - 30, 20, 60, 0xaaaaff);

        // attach physics
        let colliderWithPhysicsBody = this.scene.physics.add.existing(collider) as Schemas.CollidableGameObject;
        colliderWithPhysicsBody.collided = false;

        // little tween to grow
        this.scene.tweens.add({
            targets: colliderWithPhysicsBody,
            scale: 1.5,
            duration: 100,
            alpha: 0,
            onComplete: () => {
                colliderWithPhysicsBody.destroy();

                // If the collider did not hit a note, its a miss, so lets lower the score
                if (colliderWithPhysicsBody.collided != true) {
                    this.missScore += 1;
                    this.updateMissScoreText();
                }
            }
        });

        // add the collider to the list
        this.colliders.push(colliderWithPhysicsBody);
    }

    updateHitScoreText()
    {
        this.hitScoreText.text = this.hitScore.toString();
    }

    updateMissScoreText()
    {
        this.missScoreText.text = this.missScore.toString();
    }
}