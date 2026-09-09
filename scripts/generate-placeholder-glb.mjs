import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputPath = resolve("public/models/placeholder-car.glb");
const views = [];

function align4(value) {
  return (value + 3) & ~3;
}

function addView(values, componentType, type, target) {
  const source =
    values instanceof Uint8Array ? values : new Uint8Array(values.buffer);
  views.push({ source, componentType, type, target });
  return views.length - 1;
}

function addBox(width, height, depth) {
  const positions = [];
  const normals = [];
  const indices = [];
  const half = [width / 2, height / 2, depth / 2];
  const faces = [
    [
      [0, 0, 1],
      [
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ],
    ],
    [
      [0, 0, -1],
      [
        [1, -1, -1],
        [-1, -1, -1],
        [-1, 1, -1],
        [1, 1, -1],
      ],
    ],
    [
      [1, 0, 0],
      [
        [1, -1, 1],
        [1, -1, -1],
        [1, 1, -1],
        [1, 1, 1],
      ],
    ],
    [
      [-1, 0, 0],
      [
        [-1, -1, -1],
        [-1, -1, 1],
        [-1, 1, 1],
        [-1, 1, -1],
      ],
    ],
    [
      [0, 1, 0],
      [
        [-1, 1, 1],
        [1, 1, 1],
        [1, 1, -1],
        [-1, 1, -1],
      ],
    ],
    [
      [0, -1, 0],
      [
        [-1, -1, -1],
        [1, -1, -1],
        [1, -1, 1],
        [-1, -1, 1],
      ],
    ],
  ];

  for (const [normal, corners] of faces) {
    const offset = positions.length / 3;
    for (const [x, y, z] of corners) {
      positions.push(x * half[0], y * half[1], z * half[2]);
      normals.push(...normal);
    }
    indices.push(
      offset,
      offset + 1,
      offset + 2,
      offset,
      offset + 2,
      offset + 3,
    );
  }
  return { positions, normals, indices };
}

function addCylinder(radius, depth, segments = 20) {
  const positions = [];
  const normals = [];
  const indices = [];
  const halfDepth = depth / 2;

  for (let ring = 0; ring < 2; ring += 1) {
    const y = ring === 0 ? -halfDepth : halfDepth;
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push(x, y, z);
      normals.push(x / radius, 0, z / radius);
    }
  }

  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments;
    indices.push(
      segment,
      next,
      segments + next,
      segment,
      segments + next,
      segments + segment,
    );
  }

  const bottomCenter = positions.length / 3;
  positions.push(0, -halfDepth, 0);
  normals.push(0, -1, 0);
  const topCenter = positions.length / 3;
  positions.push(0, halfDepth, 0);
  normals.push(0, 1, 0);
  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments;
    indices.push(bottomCenter, next, segment);
    indices.push(topCenter, segments + segment, segments + next);
  }
  return { positions, normals, indices };
}

const meshes = [
  { geometry: addBox(3.2, 0.65, 1.55), material: 0 },
  {
    geometry: addBox(1.65, 0.75, 1.28),
    material: 1,
    translation: [0.2, 0.68, 0],
  },
  {
    geometry: addCylinder(0.34, 0.22),
    material: 2,
    translation: [-1.05, -0.18, 0.82],
    rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
  },
  {
    geometry: addCylinder(0.34, 0.22),
    material: 2,
    translation: [1.05, -0.18, 0.82],
    rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
  },
  {
    geometry: addCylinder(0.34, 0.22),
    material: 2,
    translation: [-1.05, -0.18, -0.82],
    rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
  },
  {
    geometry: addCylinder(0.34, 0.22),
    material: 2,
    translation: [1.05, -0.18, -0.82],
    rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
  },
];

const gltfMeshes = [];
const accessors = [];
const accessorFor = (values, componentType, type, count, target, itemSize) => {
  const typed =
    componentType === 5126 ? new Float32Array(values) : new Uint16Array(values);
  const view = addView(typed, componentType, type, target);
  const numericValues = Array.from(values);
  const min = [];
  const max = [];
  for (let index = 0; index < itemSize; index += 1) {
    const column = numericValues.filter(
      (_, itemIndex) => itemIndex % itemSize === index,
    );
    min.push(Math.min(...column));
    max.push(Math.max(...column));
  }
  accessors.push({ bufferView: view, componentType, count, type, min, max });
  return accessors.length - 1;
};

for (const mesh of meshes) {
  const positionAccessor = accessorFor(
    mesh.geometry.positions,
    5126,
    "VEC3",
    mesh.geometry.positions.length / 3,
    34962,
    3,
  );
  const normalAccessor = accessorFor(
    mesh.geometry.normals,
    5126,
    "VEC3",
    mesh.geometry.normals.length / 3,
    34962,
    3,
  );
  const indexAccessor = accessorFor(
    mesh.geometry.indices,
    5123,
    "SCALAR",
    mesh.geometry.indices.length,
    34963,
    1,
  );
  gltfMeshes.push({
    primitives: [
      {
        attributes: { POSITION: positionAccessor, NORMAL: normalAccessor },
        indices: indexAccessor,
        material: mesh.material,
      },
    ],
  });
}

const binaryParts = [];
let byteOffset = 0;
const bufferViews = views.map((view) => {
  const alignedOffset = align4(byteOffset);
  if (alignedOffset > byteOffset)
    binaryParts.push(new Uint8Array(alignedOffset - byteOffset));
  binaryParts.push(view.source);
  byteOffset = alignedOffset + view.source.byteLength;
  return {
    buffer: 0,
    byteOffset: alignedOffset,
    byteLength: view.source.byteLength,
    ...(view.target ? { target: view.target } : {}),
  };
});
const binary = Buffer.concat(binaryParts.map((part) => Buffer.from(part)));

const gltf = {
  asset: { version: "2.0", generator: "Little Car Museum placeholder model" },
  scene: 0,
  scenes: [{ nodes: meshes.map((_, index) => index) }],
  nodes: meshes.map((mesh, index) => ({
    mesh: index,
    name: index === 0 ? "Body" : index === 1 ? "Cabin" : `Wheel-${index - 1}`,
    ...(mesh.translation ? { translation: mesh.translation } : {}),
    ...(mesh.rotation ? { rotation: mesh.rotation } : {}),
  })),
  meshes: gltfMeshes,
  materials: [
    {
      name: "body_paint",
      pbrMetallicRoughness: {
        baseColorFactor: [0.91, 0.2, 0.14, 1],
        metallicFactor: 0.05,
        roughnessFactor: 0.4,
      },
    },
    {
      name: "window_glass",
      pbrMetallicRoughness: {
        baseColorFactor: [0.08, 0.3, 0.36, 1],
        metallicFactor: 0.1,
        roughnessFactor: 0.18,
      },
    },
    {
      name: "rubber",
      pbrMetallicRoughness: {
        baseColorFactor: [0.04, 0.06, 0.07, 1],
        metallicFactor: 0,
        roughnessFactor: 0.9,
      },
    },
  ],
  accessors,
  bufferViews,
  buffers: [{ byteLength: binary.byteLength }],
};

const json = Buffer.from(JSON.stringify(gltf));
const jsonPadded = Buffer.concat([
  json,
  Buffer.alloc((4 - (json.byteLength % 4)) % 4, 0x20),
]);
const binaryPadded = Buffer.concat([
  binary,
  Buffer.alloc((4 - (binary.byteLength % 4)) % 4),
]);
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(
  12 + 8 + jsonPadded.byteLength + 8 + binaryPadded.byteLength,
  8,
);
const jsonChunkHeader = Buffer.alloc(8);
jsonChunkHeader.writeUInt32LE(jsonPadded.byteLength, 0);
jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);
const binaryChunkHeader = Buffer.alloc(8);
binaryChunkHeader.writeUInt32LE(binaryPadded.byteLength, 0);
binaryChunkHeader.writeUInt32LE(0x004e4942, 4);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  Buffer.concat([
    header,
    jsonChunkHeader,
    jsonPadded,
    binaryChunkHeader,
    binaryPadded,
  ]),
);
console.log(`Wrote ${outputPath}`);
