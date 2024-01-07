export type BoardPosition = {row: number, col: number}
export type CollidableGameObject = Phaser.GameObjects.GameObject & {collided?: boolean}
export type Note = Phaser.GameObjects.GameObject & {timestamp?: number, spawned?: boolean}

export const enum MovementDirection {
    NONE = "NONE",
    UP = "UP",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    DOWN = "DOWN"
}

export const MOVEMENT_SPEED = 10;

// Size of each square (600 pixels / 8 squares)
export const NUMBER_OF_SQUARES = 8;
export const PIXELS_TO_MOVE = 75;

export const WINDOW_WIDTH = 600;
export const WINDOW_HEIGHT = 700;

export interface Entity
{
    level: Phaser.Scene;
    sprite: Phaser.GameObjects.Sprite;

    update();
}

export interface Actor extends Entity
{

}

export interface Item extends Entity
{

}

export interface Room
{
    board: Entity[][];
    entities: Entity[];
}