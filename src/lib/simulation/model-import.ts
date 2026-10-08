export const MODEL_LIMIT = 15_000_000;
export type ModelReference = { name: string; data: ArrayBuffer | string };

/** Inspect the JSON chunk before Three.js can request any linked resource. */
export function validateModel(data: ArrayBuffer, isBinary: boolean): ArrayBuffer | string {
  if (data.byteLength > MODEL_LIMIT) throw new Error("Use a GLB/glTF file smaller than 15 MB.");
  let json: string;
  if (isBinary) {
    if (data.byteLength < 20) throw new Error("Incomplete GLB file.");
    const header = new DataView(data);
    if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== data.byteLength) throw new Error("Expected a valid GLB 2.0 file.");
    const length = header.getUint32(12, true);
    if (header.getUint32(16, true) !== 0x4e4f534a || length + 20 > data.byteLength) throw new Error("GLB has no valid scene description.");
    json = new TextDecoder().decode(data.slice(20, 20 + length));
  } else json = new TextDecoder().decode(data);
  const document = JSON.parse(json);
  if (document?.asset?.version !== "2.0") throw new Error("Expected a glTF 2.0 scene.");
  // URI-bearing extension payloads are checked too; no remote or filesystem URLs.
  const pending: unknown[] = [document];
  let count = 0;
  while (pending.length) {
    if (++count > 100_000) throw new Error("The model is too complex for this demo.");
    const item = pending.pop();
    if (!item || typeof item !== "object") continue;
    for (const [key, value] of Object.entries(item)) {
      if (key === "uri" && (typeof value !== "string" || !/^data:(application\/(octet-stream|gltf-buffer)|image\/(png|jpeg|webp));base64,[A-Za-z0-9+/=\s]+$/.test(value))) throw new Error("External model resources are blocked. Export a self-contained GLB or embed all glTF buffers and textures.");
      if (value && typeof value === "object") pending.push(value);
    }
  }
  return isBinary ? data : json;
}
