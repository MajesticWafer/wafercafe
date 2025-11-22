export function normalize(v) {
  const len = Math.hypot(v.x, v.y);
  return { x: v.x / len, y: v.y / len };
}

export function projectPolygon(axis, verts) {
  let min = axis.x * verts[0].x + axis.y * verts[0].y;
  let max = min;
  for (let i = 1; i < verts.length; i++) {
    const p = axis.x * verts[i].x + axis.y * verts[i].y;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

export function polysCollide(vertsA, vertsB) {
  const polys = [vertsA, vertsB];
  for (let i = 0; i < polys.length; i++) {
    const verts = polys[i];
    for (let j = 0; j < verts.length; j++) {
      const next = (j + 1) % verts.length;
      const edge = { x: verts[next].x - verts[j].x, y: verts[next].y - verts[j].y };
      const axis = normalize({ x: -edge.y, y: edge.x });
      const projA = projectPolygon(axis, vertsA);
      const projB = projectPolygon(axis, vertsB);
      if (projA.max < projB.min || projB.max < projA.min) return false;
    }
  }
  return true;
}
