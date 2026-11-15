import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  collegeName: 'Sree Sakthi Engineering College',
  collegeLogo: '/college-logo.png',
  address: 'Bettathapuram, Karamadai',
  location: 'Coimbatore',
  fineRate: 5,
  loanPeriod: 14,
  maxBooks: 3,
  holdDays: 5,
};

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Notice reading settings file:', err);
  }
  return DEFAULT_SETTINGS;
}

function writeSettings(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Notice writing settings file:', err);
  }
}

export async function GET() {
  const settings = readSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = readSettings();
    const updated = {
      ...current,
      ...(body.collegeName !== undefined ? { collegeName: String(body.collegeName).trim() } : {}),
      ...(body.collegeLogo !== undefined ? { collegeLogo: body.collegeLogo } : {}),
      ...(body.address !== undefined ? { address: String(body.address).trim() } : {}),
      ...(body.location !== undefined ? { location: String(body.location).trim() } : {}),
      ...(body.fineRate !== undefined ? { fineRate: Number(body.fineRate) || 5 } : {}),
      ...(body.loanPeriod !== undefined ? { loanPeriod: Number(body.loanPeriod) || 14 } : {}),
      ...(body.maxBooks !== undefined ? { maxBooks: Number(body.maxBooks) || 3 } : {}),
      ...(body.holdDays !== undefined ? { holdDays: Number(body.holdDays) || 5 } : {}),
    };

    writeSettings(updated);
    return NextResponse.json({ success: true, message: 'Settings saved successfully', settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Error saving settings' }, { status: 500 });
  }
}
