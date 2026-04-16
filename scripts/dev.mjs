import { spawn } from 'node:child_process';

const nodeCmd = process.execPath;
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  console.error('Missing npm_execpath. Run this script via `npm run dev`.');
  process.exit(1);
}

function run(label, args) {
  const child = spawn(nodeCmd, [npmCli, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  const prefix = `[${label}] `;
  child.stdout.on('data', (chunk) => process.stdout.write(prefix + chunk.toString()));
  child.stderr.on('data', (chunk) => process.stderr.write(prefix + chunk.toString()));

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`${prefix}exited (signal ${signal})`);
      return;
    }
    if (code !== 0) {
      console.log(`${prefix}exited (code ${code})`);
    }
  });

  return child;
}

function runWithEnv(label, args, extraEnv) {
  const child = spawn(nodeCmd, [npmCli, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...extraEnv },
  });

  const prefix = `[${label}] `;
  child.stdout.on('data', (chunk) => process.stdout.write(prefix + chunk.toString()));
  child.stderr.on('data', (chunk) => process.stderr.write(prefix + chunk.toString()));

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`${prefix}exited (signal ${signal})`);
      return;
    }
    if (code !== 0) {
      console.log(`${prefix}exited (code ${code})`);
    }
  });

  return child;
}

const server = run('server', ['--prefix', 'server', 'run', 'dev']);

let client;
let exiting = false;

const serverPortPromise = new Promise((resolve) => {
  const re = /API listening on http:\/\/localhost:(\d+)/;
  const onData = (chunk) => {
    const match = re.exec(chunk.toString());
    if (match?.[1]) {
      resolve(Number(match[1]));
      server.stdout.off('data', onData);
    }
  };
  server.stdout.on('data', onData);

  // Fallback: if we don't detect it quickly, start client with default.
  setTimeout(() => resolve(Number(process.env.PORT || 5000)), 7000);
});

serverPortPromise.then((port) => {
  if (exiting) return;
  const apiBaseUrl = `http://localhost:${port}`;
  client = runWithEnv('client', ['--prefix', 'client', 'run', 'dev'], {
    VITE_API_BASE_URL: apiBaseUrl,
  });
});

function shutdown(exitCode = 0) {
  for (const child of [server, client].filter(Boolean)) {
    if (!child.killed) child.kill();
  }
  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

server.on('exit', (code, signal) => {
  if (exiting) return;
  exiting = true;
  if (signal) shutdown(1);
  shutdown(typeof code === 'number' ? code : 1);
});

process.on('beforeExit', () => {
  if (!exiting) shutdown(0);
});
