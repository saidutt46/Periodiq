/**
 * Orbital math — spherical harmonics, electron configuration parsing,
 * and parametric mesh generation for orbital isosurface visualization.
 */

/* ─── Types ─── */
export interface OrbitalInfo {
  n: number;       // principal quantum number (1-7)
  l: number;       // angular momentum (0=s, 1=p, 2=d, 3=f)
  m: number;       // magnetic quantum number (-l to +l)
  electrons: number; // electrons in this subshell
  label: string;   // e.g. "3d"
}

export interface SubshellInfo {
  n: number;
  l: number;
  electrons: number;
  label: string;
}

const SUBSHELL_LETTERS = ["s", "p", "d", "f"];
const SUBSHELL_MAX_ELECTRONS = [2, 6, 10, 14];

/* ─── Parse electron configuration ─── */

/**
 * Parse a configuration like "[Ar]4s2 3d6" into individual subshells.
 * Expands noble gas cores.
 */
export function parseElectronConfiguration(config: string): SubshellInfo[] {
  if (!config) return [];

  // Noble gas core expansions
  const cores: Record<string, string> = {
    "[He]": "1s2",
    "[Ne]": "1s2 2s2 2p6",
    "[Ar]": "1s2 2s2 2p6 3s2 3p6",
    "[Kr]": "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6",
    "[Xe]": "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6",
    "[Rn]": "1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6",
  };

  let expanded = config;
  for (const [core, expansion] of Object.entries(cores)) {
    if (expanded.includes(core)) {
      expanded = expanded.replace(core, expansion + " ");
      break;
    }
  }

  const subshells: SubshellInfo[] = [];
  const regex = /(\d+)([spdf])(\d+)/g;
  let match;

  while ((match = regex.exec(expanded)) !== null) {
    const n = parseInt(match[1]);
    const lStr = match[2];
    const electrons = parseInt(match[3]);
    const l = SUBSHELL_LETTERS.indexOf(lStr);

    subshells.push({
      n,
      l,
      electrons,
      label: `${n}${lStr}`,
    });
  }

  return subshells;
}

/**
 * Expand a subshell into individual orbitals with m quantum numbers.
 * Distributes electrons according to Hund's rule (simplified).
 */
export function expandSubshellToOrbitals(sub: SubshellInfo): OrbitalInfo[] {
  const orbitals: OrbitalInfo[] = [];
  const mValues = Array.from({ length: 2 * sub.l + 1 }, (_, i) => -sub.l + i);
  const maxPerOrbital = 2;

  // Hund's rule: fill all m with 1 electron first, then double up
  let remaining = sub.electrons;
  const counts = new Array(mValues.length).fill(0);

  // First pass: one electron each
  for (let i = 0; i < mValues.length && remaining > 0; i++) {
    counts[i] = 1;
    remaining--;
  }
  // Second pass: pair up
  for (let i = 0; i < mValues.length && remaining > 0; i++) {
    counts[i] = 2;
    remaining--;
  }

  for (let i = 0; i < mValues.length; i++) {
    if (counts[i] > 0) {
      orbitals.push({
        n: sub.n,
        l: sub.l,
        m: mValues[i],
        electrons: counts[i],
        label: `${sub.n}${SUBSHELL_LETTERS[sub.l]}`,
      });
    }
  }

  return orbitals;
}

/* ─── Spherical Harmonics (real form) ─── */

/**
 * Evaluate the real spherical harmonic Y_l^m(theta, phi).
 * Returns the value (can be positive or negative — sign determines lobe phase).
 */
export function realSphericalHarmonic(l: number, m: number, theta: number, phi: number): number {
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  if (l === 0) {
    // s orbital: Y_0^0 = sphere
    return 0.2821; // 1/(2*sqrt(pi))
  }

  if (l === 1) {
    switch (m) {
      case 0:  return 0.4886 * cosT;                    // pz
      case 1:  return 0.4886 * sinT * Math.cos(phi);    // px
      case -1: return 0.4886 * sinT * Math.sin(phi);    // py
    }
  }

  if (l === 2) {
    const sinT2 = sinT * sinT;
    const cosT2 = cosT * cosT;
    switch (m) {
      case 0:  return 0.3154 * (3 * cosT2 - 1);                    // dz²
      case 1:  return 1.0925 * sinT * cosT * Math.cos(phi);        // dxz
      case -1: return 1.0925 * sinT * cosT * Math.sin(phi);        // dyz
      case 2:  return 0.5463 * sinT2 * Math.cos(2 * phi);          // dx²-y²
      case -2: return 0.5463 * sinT2 * Math.sin(2 * phi);          // dxy
    }
  }

  if (l === 3) {
    const cosT2 = cosT * cosT;
    const sinT2 = sinT * sinT;
    const sinT3 = sinT2 * sinT;
    switch (m) {
      case 0:  return 0.3732 * cosT * (5 * cosT2 - 3);                         // fz³
      case 1:  return 0.4573 * sinT * (5 * cosT2 - 1) * Math.cos(phi);         // fxz²
      case -1: return 0.4573 * sinT * (5 * cosT2 - 1) * Math.sin(phi);         // fyz²
      case 2:  return 1.4453 * sinT2 * cosT * Math.cos(2 * phi);               // fz(x²-y²)
      case -2: return 1.4453 * sinT2 * cosT * Math.sin(2 * phi);               // fxyz
      case 3:  return 0.5901 * sinT3 * Math.cos(3 * phi);                      // fx(x²-3y²)
      case -3: return 0.5901 * sinT3 * Math.sin(3 * phi);                      // fy(3x²-y²)
    }
  }

  return 0;
}

/* ─── Mesh Generation ─── */

/**
 * Generate vertices for an orbital isosurface.
 * Returns two arrays: positive lobe vertices and negative lobe vertices.
 * Each vertex is [x, y, z].
 */
export function generateOrbitalMeshData(
  n: number,
  l: number,
  m: number,
  resolution: number = 64,
): { positive: Float32Array; negative: Float32Array; positiveNormals: Float32Array; negativeNormals: Float32Array } {
  const thetaSteps = resolution;
  const phiSteps = resolution * 2;

  // Scale factor: orbitals get larger with n
  const scale = 0.6 + n * 0.35;

  const posVertices: number[] = [];
  const negVertices: number[] = [];
  const posNormals: number[] = [];
  const negNormals: number[] = [];

  for (let i = 0; i < thetaSteps; i++) {
    for (let j = 0; j < phiSteps; j++) {
      // Generate two triangles per grid cell
      const points = [
        [i, j],
        [i + 1, j],
        [i + 1, j + 1],
        [i, j],
        [i + 1, j + 1],
        [i, j + 1],
      ];

      for (let tri = 0; tri < 2; tri++) {
        const triPoints = points.slice(tri * 3, tri * 3 + 3);
        const verts: [number, number, number][] = [];
        let allPos = true;
        let allNeg = true;

        for (const [ti, pj] of triPoints) {
          const theta = (ti / thetaSteps) * Math.PI;
          const phi = (pj / phiSteps) * Math.PI * 2;
          const Y = realSphericalHarmonic(l, m, theta, phi);

          // Radius = |Y|^(2/3) scaled — gives smoother shape than |Y|
          const r = Math.pow(Math.abs(Y), 0.667) * scale;

          // Spherical to Cartesian
          const sinTheta = Math.sin(theta);
          const x = r * sinTheta * Math.cos(phi);
          const y = r * Math.cos(theta);
          const z = r * sinTheta * Math.sin(phi);

          verts.push([x, y, z]);
          if (Y < 0) allPos = false;
          if (Y >= 0) allNeg = false;
        }

        // Skip mixed-sign triangles (they're at node boundaries)
        if (!allPos && !allNeg) continue;

        // Compute face normal
        const ax = verts[1][0] - verts[0][0];
        const ay = verts[1][1] - verts[0][1];
        const az = verts[1][2] - verts[0][2];
        const bx = verts[2][0] - verts[0][0];
        const by = verts[2][1] - verts[0][1];
        const bz = verts[2][2] - verts[0][2];
        let nx = ay * bz - az * by;
        let ny = az * bx - ax * bz;
        let nz = ax * by - ay * bx;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;

        const target = allPos ? posVertices : negVertices;
        const normals = allPos ? posNormals : negNormals;

        for (const [x, y, z] of verts) {
          target.push(x, y, z);
          normals.push(nx, ny, nz);
        }
      }
    }
  }

  return {
    positive: new Float32Array(posVertices),
    negative: new Float32Array(negVertices),
    positiveNormals: new Float32Array(posNormals),
    negativeNormals: new Float32Array(negNormals),
  };
}

/**
 * Get a human-readable label for an orbital.
 */
export function getOrbitalLabel(l: number, m: number): string {
  if (l === 0) return "s";
  if (l === 1) {
    return ["py", "pz", "px"][m + 1] || `p(m=${m})`;
  }
  if (l === 2) {
    return ["dxy", "dyz", "dz²", "dxz", "dx²-y²"][m + 2] || `d(m=${m})`;
  }
  if (l === 3) {
    return ["fy(3x²-y²)", "fxyz", "fyz²", "fz³", "fxz²", "fz(x²-y²)", "fx(x²-3y²)"][m + 3] || `f(m=${m})`;
  }
  return `l=${l},m=${m}`;
}

/**
 * Get the outermost (valence) subshell for an element.
 */
export function getValenceSubshell(config: string): SubshellInfo | null {
  const subshells = parseElectronConfiguration(config);
  if (subshells.length === 0) return null;
  return subshells[subshells.length - 1];
}
