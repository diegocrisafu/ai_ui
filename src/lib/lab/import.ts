import { validateModel } from "../simulation/model-import";
import { MAX_BODIES, type Body } from "./model";
import type { Object3D } from "three";

export type ImportedModel = {
  name: string;
  root: Object3D;
  boxes: Body[];
  width: number;
  depth: number;
  skipped: number;
};

export async function importModel(
  file: File,
  physicalWidth: number,
): Promise<ImportedModel> {
  const data = validateModel(
    await file.arrayBuffer(),
    /\.glb$/i.test(file.name),
  );
  const [T, { GLTFLoader }] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
  ]);
  const manager = new T.LoadingManager();
  manager.setURLModifier((url) => {
    if (!url.startsWith("data:") && !url.startsWith("blob:"))
      throw new Error(
        "Model tried to load an external file. Export a self-contained GLB instead.",
      );
    return url;
  });
  const gltf = await new GLTFLoader(manager).parseAsync(data, "");
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  const bounds = new T.Box3().setFromObject(root),
    size = bounds.getSize(new T.Vector3());
  if (
    ![size.x, size.y, size.z, bounds.min.x, bounds.min.y, bounds.min.z].every(
      Number.isFinite,
    ) ||
    size.x < 0.001 ||
    size.z < 0.001 ||
    size.z / size.x > 7
  ) {
    disposeModel(root);
    throw new Error(
      "Model needs finite X/Z floor dimensions. Export it with Y up and a ground plane.",
    );
  }
  const scale = physicalWidth / size.x;
  root.scale.multiplyScalar(scale);
  root.position.add(
    new T.Vector3(
      -bounds.min.x * scale + 1,
      -bounds.min.y * scale,
      -bounds.min.z * scale + 1,
    ),
  );
  root.updateMatrixWorld(true);
  const width = Math.max(4, physicalWidth + 2),
    depth = Math.max(4, size.z * scale + 2);
  if (width > 30 || depth > 30) {
    disposeModel(root);
    throw new Error(
      "The scaled model exceeds 30 m. Reduce Model width and import again.",
    );
  }
  const boxes: Body[] = [];
  let skipped = 0,
    vertices = 0;
  root.traverse((obj) => {
    if (!(obj instanceof T.Mesh)) return;
    vertices += obj.geometry.attributes.position?.count ?? 0;
    const b = new T.Box3().setFromObject(obj),
      s = b.getSize(new T.Vector3()),
      c = b.getCenter(new T.Vector3());
    // A reviewed navigation-height projection, not arbitrary mesh physics.
    if (
      s.y < 0.08 ||
      b.min.y > 0.6 ||
      b.max.y < 0.08 ||
      boxes.length >= MAX_BODIES ||
      s.x < 0.1 ||
      s.z < 0.1
    ) {
      skipped++;
      return;
    }
    boxes.push({
      id: `mesh-${boxes.length + 1}`,
      label: (obj.name || `Mesh ${boxes.length + 1}`).slice(0, 60),
      x: c.x,
      y: c.z,
      width: s.x,
      depth: s.z,
      height: Math.min(8, Math.max(0.1, s.y)),
    });
  });
  if (vertices > 250_000) {
    disposeModel(root);
    throw new Error(
      "Use a model with fewer than 250,000 vertices. Decimate the scene before exporting.",
    );
  }
  return { name: file.name, root, boxes, width, depth, skipped };
}

export function disposeModel(root: Object3D) {
  const geometries = new Set<import("three").BufferGeometry>(),
    materials = new Set<import("three").Material>(),
    textures = new Set<import("three").Texture>();
  root.traverse((obj) => {
    const mesh = obj as import("three").Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    for (const mat of mesh.material
      ? Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      : []) {
      materials.add(mat);
      for (const value of Object.values(mat))
        if (value && typeof value === "object" && "isTexture" in value)
          textures.add(value);
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => {
    const image = t.source?.data;
    if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap)
      image.close();
    t.dispose();
  });
}
