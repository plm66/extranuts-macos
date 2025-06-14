#!/usr/bin/env node

// Simple script to check localStorage data from your Tauri app
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('🔍 Checking for your notes...\n');

// Try to find the localStorage data in Tauri's data directory
const homeDir = os.homedir();
const possiblePaths = [
  `${homeDir}/Library/Application Support/com.extranuts.app`,
  `${homeDir}/Library/WebKit/com.extranuts.app`,
  `${homeDir}/Library/Caches/com.extranuts.app`,
  `${homeDir}/.local/share/com.extranuts.app`
];

console.log('Searching possible localStorage locations:');
possiblePaths.forEach(p => {
  console.log(`  - ${p}`);
  if (fs.existsSync(p)) {
    console.log('    ✅ EXISTS!');
    try {
      const files = fs.readdirSync(p, { recursive: true });
      files.forEach(f => console.log(`      📁 ${f}`));
    } catch (e) {
      console.log(`      ❌ Error reading: ${e.message}`);
    }
  } else {
    console.log('    ❌ Not found');
  }
});

console.log('\n💡 Your notes might be in browser localStorage instead.');
console.log('📍 To access browser localStorage:');
console.log('   1. Open http://localhost:3000/ in Safari');
console.log('   2. Press Cmd+Option+I (developer tools)');
console.log('   3. Go to Storage tab');
console.log('   4. Find localStorage > extranuts_notes');
console.log('\n🚨 OR try clicking the blue "📋 SHOW DATA" button in the app!');