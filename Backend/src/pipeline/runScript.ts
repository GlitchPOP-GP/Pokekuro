// FittingPipeline（Blender + Python）を別コンテナとして呼び出す。
//
// 以前は python を spawn してホスト上のスクリプトを直接叩いていたが、
//   - Blender の絶対パスや python コマンド名が OS ごとに違う
//   - api イメージに Blender を同梱すると 1.5GB 級になる

export interface ScriptResult {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

const PIPELINE_URL = (process.env.PIPELINE_URL || "http://pipeline:9000").replace(/\/$/, "");

// Meshy の 3D 生成と Blender のフィッティングは数分かかるため長めに取る。
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

export async function callPipeline(
  endpoint: "extract" | "generate" | "fit",
  payload: Record<string, unknown>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<ScriptResult> {
  try {
    const res = await fetch(`${PIPELINE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        success: false,
        error: `pipeline /${endpoint} が ${res.status} を返しました: ${body.slice(0, 500)}`,
      };
    }

    return (await res.json()) as ScriptResult;
  } catch (err: any) {
    return {
      success: false,
      error: `pipeline (${PIPELINE_URL}) の呼び出しに失敗しました: ${err?.message ?? err}`,
    };
  }
}

export async function pipelineHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`${PIPELINE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export interface PipelineHealth {
  ok: boolean;
  meshy_key: boolean;
  gemini_key: boolean;
}

// 到達できない場合は null を返し、呼び出し側で通常経路にフォールバックさせる。
export async function pipelineHealth(): Promise<PipelineHealth | null> {
  try {
    const res = await fetch(`${PIPELINE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return (await res.json()) as PipelineHealth;
  } catch {
    return null;
  }
}
