import { spawn, type SpawnOptions } from "node:child_process";

/**
 * Run a command to completion, streaming stdio so migrate/seed/build logs are
 * visible in the test output. Rejects on a non-zero exit code.
 */
export function run(
  command: string,
  args: string[],
  options: SpawnOptions = {},
): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      // pnpm/npx live in PATH; inherit it plus any injected env (DATABASE_URL).
      ...options,
      env: { ...process.env, ...options.env },
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}
