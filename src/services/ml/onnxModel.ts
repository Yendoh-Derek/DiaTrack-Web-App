import * as ort from "onnxruntime-web";
import type { ModelMetadata } from "./featureEncoder";
import { encodeFeatures, scaleFeatures, predictWithMetadata } from "./featureEncoder";
import type { PredictionInput } from "@/types/prediction";

let session: ort.InferenceSession | null = null;
let metadata: ModelMetadata | null = null;

const MODEL_URL = `${import.meta.env.BASE_URL}models/diabetes-risk.onnx`;
const METADATA_URL = `${import.meta.env.BASE_URL}models/model-metadata.json`;

export async function loadModel(): Promise<void> {
  if (!metadata) {
    const res = await fetch(METADATA_URL);
    if (!res.ok) throw new Error("Failed to load model metadata");
    metadata = (await res.json()) as ModelMetadata;
  }

  if (!session) {
    try {
      ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.0/dist/";
      session = await ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ["wasm"],
      });
    } catch (err) {
      console.warn("ONNX session unavailable, using coefficient fallback:", err);
      session = null;
    }
  }
}

export async function predictProbability(input: PredictionInput): Promise<number> {
  await loadModel();
  if (!metadata) throw new Error("Model metadata not loaded");

  const raw = encodeFeatures(input);
  const scaled = scaleFeatures(raw, metadata);

  if (session) {
    const tensor = new ort.Tensor("float32", scaled, [1, scaled.length]);
    const results = await session.run({ float_input: tensor });
    const output = results["output_label"] ?? results[Object.keys(results)[0]];
    if (output && "data" in output) {
      const data = output.data as Float32Array | Int32Array;
      if (data.length === 1 && data[0] <= 1 && data[0] >= 0) {
        return data[0];
      }
      if (data.length === 2) {
        const exp0 = Math.exp(data[0]);
        const exp1 = Math.exp(data[1]);
        return exp1 / (exp0 + exp1);
      }
    }
  }

  return predictWithMetadata(input, metadata);
}

export function getMetadata(): ModelMetadata | null {
  return metadata;
}

export async function preloadModel(): Promise<void> {
  try {
    await loadModel();
  } catch (err) {
    console.warn("Model preload failed:", err);
  }
}
