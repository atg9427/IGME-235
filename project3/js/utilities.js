function lerp(start, end, amt){
    return start * (1-amt) + amt * end;
}

function clamp(val, min, max){
  return val < min ? min : (val > max ? max : val);
}

function rectsIntersect(a,b){
  let ab = a.getBounds();
  let bb = b.getBounds();
  return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

function getRandomUnitVector(){
  let x = getRandom(-1,1);
  let y = getRandom(-1,1);
  let length = Math.sqrt(x*x + y*y);
  if(length == 0){
      x=1;
      y=0;
      length = 1;
  } else{
      x /= length;
      y /= length;
  }

  return {x:x, y:y};
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}