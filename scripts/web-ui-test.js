import http from 'http';
import { JSDOM } from 'jsdom';

const TARGET_URL = 'http://localhost:5173';

console.log(`🔍 正在檢查 Web UI 開發伺服器是否在運作：${TARGET_URL}...`);

// 檢測伺服器連線
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get(TARGET_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ online: true, statusCode: res.statusCode, html: data });
      });
    });

    req.on('error', (err) => {
      resolve({ online: false, error: err });
    });
    
    // 設定超時 3 秒
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ online: false, error: new Error('連線超時') });
    });
  });
};

async function runTest() {
  const result = await checkServer();

  if (!result.online) {
    console.error('\n❌ [錯誤] 無法連線至開發伺服器 localhost:5173！');
    console.error('👉 請確保您已經在另一個終端機視窗中執行了:');
    console.error('   npm run dev');
    console.error('👉 待伺服器啟動成功後，再重新執行此 Web UI 測試。\n');
    process.exit(1);
  }

  console.log('✅ 開發伺服器連線成功！開始進行 UI 基礎整合測試...');
  
  try {
    const dom = new JSDOM(result.html, { url: TARGET_URL });
    const { document } = dom.window;

    // 1. 測試 HTML Title 是否符合 SEO 設定
    const title = document.title;
    console.log(`   - 檢查網頁標題: "${title}"`);
    if (!title.includes('TinyPreciousShop')) {
      throw new Error(`網頁標題不符合預期！預期包含 'TinyPreciousShop'，實際為 '${title}'`);
    }
    console.log('     🎉 [通過] 網頁標題正確！');

    // 2. 測試是否含有 Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      throw new Error('未找到 meta description 標籤！');
    }
    console.log(`   - 檢查 Meta Description: "${metaDesc.getAttribute('content')}"`);
    console.log('     🎉 [通過] Meta Description 存在！');

    // 3. 檢查主掛載容器 #app
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('未找到 Vue 掛載容器 #app！');
    }
    console.log('     🎉 [通過] Vue 掛載點 #app 存在！');

    // 4. 檢查是否有 script 進入點
    const mainScript = document.querySelector('script[src="/src/main.js"]');
    if (!mainScript) {
      throw new Error('未找到主 JavaScript 載入點 main.js！');
    }
    console.log('     🎉 [通過] 入口 main.js 載入正常！');

    console.log('\n🌟 所有 Web UI 基礎整合測試均已成功通過！');
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ [測試失敗] 偵測到 UI 結構異常：`, error.message);
    process.exit(1);
  }
}

runTest();
