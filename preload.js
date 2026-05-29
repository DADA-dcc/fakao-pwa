const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aiTeacher', {
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),

  chatStream: (messages, onChunk) => {
    return new Promise((resolve, reject) => {
      const handler = (_event, chunk) => {
        if (chunk === '[[DONE]]') {
          ipcRenderer.removeListener('ai-chat-chunk', handler);
          resolve();
        } else if (typeof chunk === 'string' && chunk.startsWith('[[ERROR]]')) {
          ipcRenderer.removeListener('ai-chat-chunk', handler);
          reject(new Error(chunk.slice(9)));
        } else {
          onChunk(chunk);
        }
      };
      ipcRenderer.on('ai-chat-chunk', handler);
      ipcRenderer.invoke('ai-chat-stream', messages).catch((err) => {
        ipcRenderer.removeListener('ai-chat-chunk', handler);
        reject(err);
      });
    });
  },
});
