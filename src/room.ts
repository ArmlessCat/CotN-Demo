import * as Phaser from 'phaser';
import * as Schemas from './schemas';

export class Room implements Schemas.Room
{
    board: Schemas.Entity[][];
    entities: Schemas.Entity[];

    constructor ()
    {
        // TODO: create room as defined by config passed through constructor
        this.board = [];
        for (let i = 0; i < Schemas.NUMBER_OF_SQUARES; i++)
        {
            this.board[i] = [];
            for (let j = 0; j < Schemas.NUMBER_OF_SQUARES; j++)
            {
                this.board[i][j] = undefined;
            }
        }
    }
}