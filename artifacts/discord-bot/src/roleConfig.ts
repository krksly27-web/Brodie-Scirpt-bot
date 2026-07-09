import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const CONFIG_FILE = join(DATA_DIR, 'role-config.json');

interface RoleConfig {
  // guildId -> required role ID
  roles: Record<string, string>;
}

function loadFile(): RoleConfig {
  try {
    if (existsSync(CONFIG_FILE)) {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) as RoleConfig;
    }
  } catch {}
  return { roles: {} };
}

function saveFile(config: RoleConfig): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getRequiredRole(guildId: string): string | null {
  return loadFile().roles[guildId] ?? null;
}

export function setRequiredRole(guildId: string, roleId: string): void {
  const config = loadFile();
  config.roles[guildId] = roleId;
  saveFile(config);
}
