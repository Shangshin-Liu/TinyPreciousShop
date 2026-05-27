# ✨ TinyPreciousShop 療癒系二手小物與手作雜貨 ✨

一個精美、具備豐富微交互與 App 級響應式體驗的二手商品展示與收藏分享網站。本專案使用 Vue 3 + Vite 開發，並支援透過 GitHub Actions 進行自動化測試與 GitHub Pages 靜態部署。

---

## 🚀 核心功能特色

* **❤️ 我的收藏系統**：使用者可將感興趣的商品加入收藏，並支援一鍵複製專屬的「分享連結」傳給好友。
* **🔥 防刷關注度統計**：商品會顯示被收藏的次數。透過 LocalStorage 機制進行防刷去重，使用者重複加退收藏不會任意洗高關注度。
* **🎉 已售出連動機制**：
  * 商品被管理員標記為「已售出」時，會自動連動取消並禁用首頁「熱門標籤」。
  * 已售出商品不顯示收藏燈號、詳細頁收藏按鈕變為灰底不可點擊，且當使用者打開「我的收藏」時，會自動過濾並移除已售出的商品。
* **🔧 管理員就地編輯暗門**：點擊頂部 Logo 7 次可觸發密碼輸入，驗證成功後即可在商品小卡上開啟「就地編輯/新增/刪除」功能。
* **📱 行動裝置 RWD 完美排版**：採用雙列 CSS Grid、滑動分類導覽列（Horizontal Scroll Tab Bar）與自適應字串縮寫，杜絕任何跑版重疊。

---

## 🛠️ 本機開發與指令說明

在開始之前，請確保您的系統已安裝 [Node.js](https://nodejs.org/)（建議 v18+）。

### 1. 安裝相依套件
在專案根目錄下執行：
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm run dev
```
啟動後，在瀏覽器打開 `http://localhost:5173/` 即可進行開發與預覽。

> [!NOTE]
> **圖片路徑動態防破圖**：本專案已對靜態資源（商品圖片）實作了動態路徑校正。在本機開發環境下，圖片會自動指向 `/images/...`。

### 3. 執行單元測試
本專案使用 Vitest 進行測試，涵蓋了管理員模式、商品增刪、收藏防重複刷、已售出商品連動限制等多項核心邏輯。
* **持續監聽模式 (Watch)**:
  ```bash
  npm run test
  ```
* **單次執行模式 (CI 環境適用)**:
  ```bash
  npm run test -- --run
  ```

### 4. 編譯與打包 (Production Build)
```bash
npm run build
```
打包完成後，編譯出的靜態網頁檔案將會輸出至 `dist/` 資料夾。

---

## 📦 GitHub Actions 自動部署至 GitHub Pages

本專案已配置 GitHub Actions 工作流（位於 [deploy.yml](file:///.github/workflows/deploy.yml)）。當您將程式碼推送（Push）至 `master` 分支時，GitHub Actions 會自動執行以下流程：
1. **單元測試**：確認所有測試項目皆 100% 通過（若測試失敗，則會中斷部署以確保線上版本穩定）。
2. **打包編譯**：使用 Vite 編譯出適合生產環境的靜態檔案。在此步驟中，圖片資源路徑會自動被校正為 `https://<username>.github.io/TinyPreciousShop/images/...` 以防止破圖。
3. **發布部署**：自動將 `dist/` 目錄的內容推送到 `gh-pages` 分支。

### ⚠️ 首次部署必要設定步驟

為使 GitHub Actions 能夠順利將網頁部署到您倉庫的 `gh-pages` 分支，您必須在 GitHub 網頁端手動開啟寫入權限：

#### 步驟 A：開啟 Actions 寫入權限
1. 前往您的 GitHub 專案倉庫頁面。
2. 點擊頂部的 **Settings** 頁籤。
3. 在左側選單中，點選 **Actions** > **General**。
4. 滾動到最下方的 **Workflow permissions** 區塊。
5. 將預設的 *Read repository contents and packages permissions* 修改為 **Read and write permissions**。
6. 點擊 **Save**。

#### 步驟 B：設定 Pages 顯示來源分支
1. 在 **Settings** 左側選單中，點選 **Pages**。
2. 在 **Build and deployment** 下的 **Source**，確保選擇的是 **Deploy from a branch**。
3. 在 **Branch** 選擇 **`gh-pages`**，目錄選擇 **`/ (root)`**。
4. 點擊 **Save**。

完成上述設定後，只要您推送新程式碼到 `master` 分支，GitHub 就會在幾分鐘內自動部署並更新您的網站！
