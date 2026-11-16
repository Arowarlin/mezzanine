#!/usr/bin/env node
/**
 * Controla la instancia MariaDB propia del proyecto (puerto 3307, datos en .db/data).
 * No toca la instalacion de XAMPP ni otras bases de datos de la maquina.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbDir = join(root, '.db');
const dataDir = join(dbDir, 'data');
const logFile = join(dbDir, 'mysqld.log');
const pidFile = join(dbDir, 'mysqld.pid');
const passwordFile = join(dbDir, 'root-password.txt');

const MYSQLD = 'C:\\xampp\\mysql\\bin\\mysqld.exe';
const MYSQLADMIN = 'C:\\xampp\\mysql\\bin\\mysqladmin.exe';
const BASEDIR = 'C:\\xampp\\mysql';
const PORT = 3307;
const HOST = '127.0.0.1';

function fail(message) {
  console.error(`\n  ERROR: ${message}\n`);
  process.exit(1);
}

function rootPassword() {
  if (!existsSync(passwordFile)) fail(`No existe ${passwordFile}`);
  return readFileSync(passwordFile, 'utf8').trim();
}

function portOpen(timeoutMs = 800) {
  return new Promise((resolvePromise) => {
    const socket = net.connect({ host: HOST, port: PORT });
    const done = (value) => {
      socket.destroy();
      resolvePromise(value);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

async function status() {
  const open = await portOpen();
  if (open) {
    console.log(`  MariaDB del proyecto: ARRIBA en ${HOST}:${PORT}`);
    return true;
  }
  console.log(`  MariaDB del proyecto: PARADA (${HOST}:${PORT})`);
  return false;
}

async function start() {
  if (await portOpen()) {
    console.log(`  MariaDB ya esta arriba en ${HOST}:${PORT}`);
    return;
  }
  if (!existsSync(dataDir)) fail(`No existe el directorio de datos ${dataDir}. Ejecuta la instalacion inicial.`);
  if (!existsSync(MYSQLD)) fail(`No encuentro mysqld.exe en ${MYSQLD}`);

  mkdirSync(dbDir, { recursive: true });
  const out = openSync(logFile, 'a');
  const child = spawn(
    MYSQLD,
    [
      '--no-defaults',
      `--basedir=${BASEDIR}`,
      `--datadir=${dataDir}`,
      `--port=${PORT}`,
      `--bind-address=${HOST}`,
      '--console',
    ],
    { detached: true, stdio: ['ignore', out, out], windowsHide: true },
  );
  child.unref();
  writeFileSync(pidFile, String(child.pid));

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await portOpen(300)) {
      console.log(`  MariaDB del proyecto ARRANCADA en ${HOST}:${PORT} (PID ${child.pid})`);
      console.log(`  log: ${logFile}`);
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  fail(`No arranco en 30 s. Revisa ${logFile}`);
}

function stop() {
  return new Promise((resolvePromise) => {
    const child = spawn(
      MYSQLADMIN,
      ['--no-defaults', '-h', HOST, '-P', String(PORT), '-u', 'root', `-p${rootPassword()}`, 'shutdown'],
      { stdio: 'inherit', windowsHide: true },
    );
    child.on('exit', (code) => {
      if (code === 0) console.log('  MariaDB del proyecto DETENIDA');
      else console.error(`  mysqladmin termino con codigo ${code}`);
      resolvePromise();
    });
  });
}

const command = process.argv[2];
if (command === 'start') await start();
else if (command === 'stop') await stop();
else if (command === 'status') process.exitCode = (await status()) ? 0 : 1;
else {
  console.log('Uso: node scripts/db.mjs <start|stop|status>');
  process.exitCode = 1;
}
