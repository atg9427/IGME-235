// Linear interpolation
function lerp(start, end, amount){
  return start * (1 - amount) + amount * end;
}

// Returns a middle value between two given values
function clamp(val, min, max){
  return val < min ? min : (val > max ? max : val);
}

// Used for collision detection
function rectsIntersect(a, b){
  let ab = a.getBounds();
  let bb = b.getBounds();

  // Scale down hitboxes during player and enemy collision
  if(b == antibody){
    let scale = 0.5;
    ab.width *= scale;
    ab.height *= scale;
    bb.width *= scale;
    bb.height *= scale;
  }
  return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

// Get a pseudo-random direction vector
function getRandomUnitVector(){
  let x = getRandom(-1, 1);
  let y = getRandom(-1, 1);
  let length = Math.sqrt(x * x + y * y);
  if(length == 0){
    x = 1;
    y = 0;
    length = 1;
  } else{
    x /= length;
    y /= length;
  }

  return {x: x, y: y};
}

// Get a pseudo-random number
function getRandom(min, max){
  return Math.random() * (max - min) + min;
}