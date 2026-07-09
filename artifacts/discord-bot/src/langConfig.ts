import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Lang } from './i18n.js';

const DATA_DIR = join(process.cwd(), 'data');
const CONFIG_FILE = join(DATA_DIR, 'lang-config.json');

interface LangConfig {
  langs: Record<string, Lang>;
}

function loadFile(): LangConfig {
  try {
    if (existsSync(CONFIG_FILE)) {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) as LangConfig;
    }
  } catch {}
  return { langs: {} };
}

function saveFile(config: LangConfig): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getGuildLang(guildId: string): Lang {
  return loadFile().langs[guildId] ?? 'fr';
}

export function setGuildLang(guildId: string, lang: Lang): void {
  const config = loadFile();
  config.langs[guildId] = lang;
  saveFile(config);
}
