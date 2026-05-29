const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { streamText } = require('ai');
const { createDeepSeek } = require('@ai-sdk/deepseek');

const API_KEY_FILE = path.join(app.getPath('userData'), 'apikey.json');

function loadApiKey() {
  try {
    if (fs.existsSync(API_KEY_FILE)) {
      return JSON.parse(fs.readFileSync(API_KEY_FILE, 'utf-8')).key || '';
    }
  } catch {}
  return '';
}

function saveApiKey(key) {
  fs.writeFileSync(API_KEY_FILE, JSON.stringify({ key }), 'utf-8');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 750,
    minWidth: 600,
    minHeight: 500,
    title: '法考刷题助手',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

// ── IPCs ──

ipcMain.handle('save-api-key', (_event, key) => {
  saveApiKey(key);
  return true;
});

ipcMain.handle('get-api-key', () => {
  return loadApiKey();
});

ipcMain.handle('ai-chat-stream', async (event, messages) => {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error('请先设置 DeepSeek API Key');
  }

  const deepseek = createDeepSeek({ apiKey });

  try {
    const result = streamText({
      model: deepseek('deepseek-reasoner'),
      messages,
      temperature: 0.7,
      maxTokens: 2048,
    });

    for await (const chunk of result.textStream) {
      event.sender.send('ai-chat-chunk', chunk);
    }
    event.sender.send('ai-chat-chunk', '[[DONE]]');
  } catch (err) {
    event.sender.send('ai-chat-chunk', '[[ERROR]]' + (err.message || '未知错误'));
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
