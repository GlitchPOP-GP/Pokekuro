import { spawn } from "child_process";

export interface ScriptResult {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

// yzl3Dmodel の Python スクリプト（gemini_extract.py / meshy_generate.py /
// run_pipeline.py / run_bottoms.py）を実行し、標準出力の最後の1行を
// JSON として解釈して返す（各スクリプトは終了直前に必ず1行JSONを出力する規約）。
export function runPythonScript(scriptPath: string, args: string[], cwd: string): Promise<ScriptResult> {
  return new Promise((resolve) => {
    const pythonPath = process.env.PYTHON_PATH || "python";
    const child = spawn(pythonPath, [scriptPath, ...args], { cwd });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    child.on("close", (code) => {
      const lines = stdout.trim().split("\n").filter(Boolean);
      const lastLine = lines[lines.length - 1];
      try {
        const result = JSON.parse(lastLine);
        resolve(result as ScriptResult);
      } catch {
        resolve({
          success: false,
          error: `スクリプト出力の解析に失敗しました (exit ${code}): ${(stderr || stdout).slice(-1500)}`,
        });
      }
    });

    child.on("error", (err) => {
      resolve({ success: false, error: `プロセス起動に失敗しました: ${err.message}` });
    });
  });
}
