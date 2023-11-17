const lifeworld = {
    init(numCols, numRows) {
        this.numCols = numCols,
        this.numRows = numRows,
        this.world = this.buildArray();
        this.worldBuffer = this.buildArray();
        this.randomSetup();
    },

    buildArray() {
        let outerArray = [];
        for (let row = 0; row < this.numRows; row++) {
            let innerArray = [];
            for (let col = 0; col < this.numCols; col++) {
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        return outerArray;
    },

    randomSetup() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.world[row][col] = 0;
                if (Math.random() < 0.1) {
                    this.world[row][col] = 1;
                }
            }
        }
    },

    getLivingNeighbors(row, col) {
        // row and col should > 0, if not return 0.
        if(row <= 0 || col <= 0) return 0;

        // row and col should be < the length of the applicable array, minus 1. If not return 0.
        if(row >= this.numRows - 1 || col >= this.numCols - 1) return 0;

        // count up how many neighbors are alive at N, NE, E, SE, S, SW, W, NW - use this.world[row][col-1] etc.
        let livingNeighbors = 0;
        livingNeighbors += this.world[row - 1][col];        // N
        livingNeighbors += this.world[row - 1][col + 1];    // NE
        livingNeighbors += this.world[row][col + 1];        // E
        livingNeighbors += this.world[row + 1][col + 1];    // SE
        livingNeighbors += this.world[row + 1][col];        // S
        livingNeighbors += this.world[row + 1][col - 1];    // SW
        livingNeighbors += this.world[row][col - 1];        // W
        livingNeighbors += this.world[row - 1][col - 1];    // NW

        // return that sum.
        return livingNeighbors;
    },

    step() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {

                // If the cell is alive
                if (this.world[row][col] == 1) {

                    // If the cell has less than two or more than three neighbors, kill it.
                    // Otherwise, if the cell has either two or three neighbors, let it live.
                    if (this.getLivingNeighbors(row, col) < 2 || this.getLivingNeighbors(row, col) > 3) {
                        this.worldBuffer[row][col] = 0;
                    }
                    else {
                        this.worldBuffer[row][col] = 1;
                    }
                }

                // If the cell is dead
                else {

                    // If the cell has exactly three neighbors, it is alive again.
                    // Otherwise, it stays dead.
                    if (this.getLivingNeighbors(row, col) == 3) {
                        this.worldBuffer[row][col] = 1;
                    }
                    else {
                        this.worldBuffer[row][col] = 0;
                    }
                }
            }
        }
        
        // Swap .world and .worldBuffer with temporary variables.
        let tempWorld = this.world;
        let tempWorldBuffer = this.worldBuffer;
        this.worldBuffer = tempWorld;
        this.world = tempWorldBuffer;
    }
}