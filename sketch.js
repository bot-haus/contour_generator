// Cribbed from Meandering Triangles by solub (https://editor.p5js.org/solub/sketches/I3V99NXlX) and Export SVG by dannyrozin (https://editor.p5js.org/dannyrozin/sketches/r1djoVow7) 

p5.disableFriendlyErrors = true;

const W = 256,
  H = 256; // grid dimensions
const N = W * H; // number of vertices
const F = 0.014; // noise factor

const steps = [0, 1, W + 1, W];
const path = [1, 0, 3, 1, 2, 3];


function setup() {
  createCanvas(displayWidth, displayHeight, SVG);
  background(255);
  randomSeed();

  offx = width / W;
  offy = height / H;
  translate(offx * 0.5, offy * 0.5);
}


class Contour {
  constructor(nvals, num, start, off) {
    this.nvals = nvals;
    this.start = start;
    this.num = num;
    this.off = off;
  }

  display() {

    for (let i = 0; i < this.num; i++) {

      let n = this.start + i * this.off; //noise value based on the contour index
      const lines = this.contour(n);
      let sw = 0;

      //makes the stroke weight of every fifth row heavier than the others
      if (i % 5 === 0) {
        sw = 1.4
      } else {
        sw = 1
      }

      // this set the color of the line based on the i value (number of the contour line), but I turned it off to just make black lines
      strokeWeight(sw);
      stroke(0)
      //stroke(43+i*16, 69+i*6, 255-i*4);

      lines.forEach(function([p1, p2], j) {
          //beginShape();

          // think this is the source of the dashed lines, to make this even you need to remove noise from the creation of the p1 and p2
          if (i % 5 === 3) {
            if (j % 2 === 0) {
              line(p1.x, p1.y, p2.x, p2.y)
            }
          } else {
            line(p1.x, p1.y, p2.x, p2.y)
          }
          //endShape(CLOSE);
        })
      }
  }



contour(n) {
  beginShape();
  const lines = [];

  for (let i = 0; i < N; i++) {

    if ((i % W) === W - 1 || floor(i / W) === H - 1) {
      continue;
    }

    // find the 4 indices and corresponding 4 noise values of the current face's vertices
    let [f_ids, f_vls] = [
      [],
      []
    ];

    for (const s of steps) {
      let id = i + s;
      f_ids.push(id);
      f_vls.push(this.nvals[id]);
    }

    // store point when its corresponding chosen noise value lies between 1 of the current face's edges
    let pts = []

    if (n > Math.min(...f_vls) && n < Math.max(...f_vls)) {

      // traverse each edge of the current face (including diagonal)
      for (const [p1, p2] of d3.pairs(path)) {

        let [i1, i2] = [f_ids[p1], f_ids[p2]]; //indices incident to a face's edge
        let [n1, n2] = [this.nvals[i1], this.nvals[i2]]; //corresponding noise values

        //if the chosen noise value lies between the 2 noise values currently explored
        if ((n > n1 && n < n2) || (n > n2 && n < n1)) {

          // compute interpolated point and store it
          let v1 = createVector((i1 % W) * offx, floor(i1 / W) * offy);
          let v2 = createVector((i2 % W) * offx, floor(i2 / W) * offy);
          let p = p5.Vector.sub(v2, v1).mult(norm(n, n1, n2)).add(v1);
          pts.push(p);
        }
      }
    }

    if (pts.length > 0 && pts.length % 2 === 0) {

      for (let n = 0; n < pts.length; n += 2) {
        lines.push([pts[n], pts[n + 1]]);
      }
      continue
    }

    for (const pair of d3.pairs(pts)) {
      lines.push(pair);
    }
  }

  return lines
    endShape(close);
}

}

function draw() {

    // compute noise value for each vertex
    const nvalues = d3.range(N).map(i => noise((i % W) * F, int(i / W) * F))

    // compute + draw contour lines
    c = new Contour(nvalues, 28, 0.5, 0.01); // 28 contours, starting noise = .5, offset = .01
    c.display();

  if (keyCode === LEFT_ARROW) {
    save("topogen.svg");
    print("saved svg");
    noLoop();
  }
}