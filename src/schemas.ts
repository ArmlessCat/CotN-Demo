export type BoardPosition = {row: number, col: number}

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