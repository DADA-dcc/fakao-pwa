/* 题库解析 Worker：把 fetch + JSON.parse 从主线程挪走，避免大文件解析卡顿 */
self.onmessage = async function (e) {
  const msg = e.data || {};
  const id = msg.id;
  const url = msg.url;
  if (!id || !url) return;
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) {
      self.postMessage({ id: id, ok: false, status: res.status });
      return;
    }
    const json = await res.json();
    self.postMessage({ id: id, ok: true, url: url, json: json });
  } catch (err) {
    self.postMessage({ id: id, ok: false, error: String(err) });
  }
};
