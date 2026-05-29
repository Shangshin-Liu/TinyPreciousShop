<template>
  <div id="app-root">
    <!-- 全域頂部導覽列 -->
    <header class="app-header">
      <div class="container header-container">
        <!-- Cute Logo (點擊 7 次觸發暗門) -->
        <div class="logo-wrapper" @click="handleLogoClick" title="TinyPreciousShop">
          <span class="logo-emoji">✨🧸✨</span>
          <h1 class="logo-title">TinyPrecious</h1>
        </div>

        <!-- 導覽選單 -->
        <nav class="nav-links">
          <button 
            class="nav-btn" 
            :class="{ active: currentPage === 'homepage' }"
            @click="navigate('homepage')"
          >
            🏠 首頁
          </button>
          <button 
            class="nav-btn" 
            :class="{ active: currentPage === 'listing' && currentCategory === 'accessories' }"
            @click="navigate('listing', 'accessories')"
          >
            💍 飾品館
          </button>
          <button 
            class="nav-btn" 
            :class="{ active: currentPage === 'listing' && currentCategory === 'plushies' }"
            @click="navigate('listing', 'plushies')"
          >
            🧸 娃娃區
          </button>
          <button 
            class="nav-btn" 
            :class="{ active: currentPage === 'listing' && currentCategory === 'grocery' }"
            @click="navigate('listing', 'grocery')"
          >
            ☕ 雜貨小舖
          </button>
          <button 
            class="nav-btn nav-sold-btn" 
            :class="{ active: currentPage === 'listing' && currentCategory === 'sold' }"
            @click="navigate('listing', 'sold')"
          >
            🎉 已售出
          </button>
        </nav>

        <!-- 右側：管理員標記與我的收藏 -->
        <div class="header-right">
          <!-- 管理員標記 -->
          <span v-if="isAdmin" class="admin-badge" @click="logoutAdmin" title="點擊登出管理員">
            <span class="pc-only">🔧 管理模式 (登出)</span>
            <span class="mobile-only">🔧 登出</span>
          </span>

          <!-- 我的收藏圖示 -->
          <button class="cart-trigger-btn" @click="toggleFavorites" aria-label="打開我的收藏">
            ❤️ <span class="pc-only">我的收藏</span><span class="mobile-only">收藏</span>
            <span class="cart-count" v-if="favoritesCount > 0">{{ favoritesCount }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 主要內容區 -->
    <main class="app-main container">
      <KeepAlive include="ProductListing">
        <component 
          :is="currentView" 
          :products="products"
          :isAdmin="isAdmin"
          :initialCategory="currentCategory"
          :product="selectedProduct"
          :favorites="favorites"
          @select-category="handleCategorySelect"
          @view-product="handleViewProduct"
          @edit-product="openEditModal"
          @go-back="navigate('listing', currentCategory)"
          @toggle-favorite="toggleFavorite"
        />
      </KeepAlive>
    </main>

    <!-- 置底頁尾 -->
    <footer class="app-footer">
      <div class="container footer-content">
        <p>© 2026 TinyPreciousShop.<br class="mobile-only"> 療癒系二手小物與手作雜貨 💖</p>
        <p class="footer-sub">本網站為簡易二手商品販售系統，<br class="mobile-only">使用無頭式架構與 Google Sheets 資料庫。</p>
      </div>
    </footer>

    <!-- 我的收藏側欄抽屜 -->
    <div class="cart-drawer-overlay" v-if="isFavoritesOpen" @click.self="toggleFavorites">
      <div class="cart-drawer card-cute">
        <button class="modal-close" @click="toggleFavorites">×</button>
        <h3 class="cart-title">❤️ 我的收藏</h3>
        
        <div v-if="favorites.length === 0" class="empty-cart-view">
          <span class="empty-cart-emoji">❤️</span>
          <p>收藏清單空空如也，快去尋找一些有興趣的小物吧！</p>
        </div>
        
        <div v-else class="cart-items-container">
          <div 
            class="cart-item favorite-item-clickable" 
            v-for="item in favorites" 
            :key="item.id"
            @click="goToProductDetail(item.id)"
            title="點擊查看商品詳情"
          >
            <img :src="getImageUrl(item.image_urls)" :alt="item.product_name" class="cart-item-img" />
            <div class="cart-item-info">
              <h4 class="cart-item-name">{{ item.product_name }}</h4>
              <div class="cart-item-price">NT$ {{ item.price }}</div>
            </div>
            <button class="cart-item-remove" @click.stop="toggleFavorite(item)" title="移除">🗑️</button>
          </div>

          <div class="cart-summary">
            <div class="summary-row">
              <span>收藏總數：</span>
              <span>{{ favoritesCount }} 件</span>
            </div>
            <button class="btn-cute btn-primary checkout-btn" @click="copyShareLink">
              🔗 複製分享連結
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 就地編輯 Modal -->
    <EditModal 
      v-if="isEditModalOpen" 
      :product="editingProduct" 
      @close="closeEditModal" 
      @save="saveProduct"
      @delete="deleteProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Homepage from './components/Homepage.vue';
import ProductListing from './components/ProductListing.vue';
import ProductDetail from './components/ProductDetail.vue';
import EditModal from './components/EditModal.vue';
import initialProducts from './data/products.json';

// 狀態管理
const products = ref(initialProducts);
const currentPage = ref('homepage'); // 'homepage', 'listing', 'detail'
const currentCategory = ref('accessories');
const selectedProductId = ref(null);
const favorites = ref([]);
const isFavoritesOpen = ref(false);

// 管理員暗門狀態
const isAdmin = ref(false);
const logoClickCount = ref(0);
const clickTimer = ref(null);
const isEditModalOpen = ref(false);
const editingProduct = ref(null);

// 點擊 Logo 偵測
const handleLogoClick = () => {
  logoClickCount.value++;
  
  // 清除舊計時器
  if (clickTimer.value) clearTimeout(clickTimer.value);
  
  // 5秒內沒點完則重設
  clickTimer.value = setTimeout(() => {
    logoClickCount.value = 0;
  }, 5000);

  if (logoClickCount.value >= 7) {
    logoClickCount.value = 0;
    triggerAdminPrompt();
  }
};

// 彈出暗門通行密碼 Prompt
const triggerAdminPrompt = () => {
  const password = prompt('✨ 進入了隱藏暗門！請輸入管理通行密碼：');
  if (password === null) return; // 使用者按取消

  if (password === 'admin123') {
    sessionStorage.setItem('admin_password', password);
    isAdmin.value = true;
    alert('🎉 密碼正確！已開啟就地編輯管理模式。商品卡片將浮現編輯鉛筆。');
  } else {
    alert('❌ 密碼錯誤，請重新確認！');
  }
};

// 登出管理員
const logoutAdmin = () => {
  if (confirm('確定要結束並登出管理員編輯模式嗎？')) {
    sessionStorage.removeItem('admin_password');
    isAdmin.value = false;
  }
};

// 頁面渲染元件判定
const currentView = computed(() => {
  if (currentPage.value === 'homepage') return Homepage;
  if (currentPage.value === 'listing') return ProductListing;
  if (currentPage.value === 'detail') return ProductDetail;
  return Homepage;
});

// 當前詳細頁面選取的商品資料
const selectedProduct = computed(() => {
  return products.value.find(p => p.id === selectedProductId.value) || null;
});

// 路由導覽
const navigate = (page, category = 'accessories') => {
  currentPage.value = page;
  currentCategory.value = category === 'all' ? 'accessories' : category;
  if (page !== 'detail') {
    selectedProductId.value = null;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleCategorySelect = (category) => {
  navigate('listing', category);
};

const handleViewProduct = (id) => {
  selectedProductId.value = id;
  currentPage.value = 'detail';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 編輯 Modal
const openEditModal = (product) => {
  if (product) {
    editingProduct.value = product;
  } else {
    // 新增商品 (預設帶有空白欄位)
    editingProduct.value = {
      id: '',
      product_name: '',
      category: 'accessories',
      price: 0,
      material: '',
      dimensions: '',
      condition: '',
      image_urls: '/images/cat_earrings.png',
      status: 'active',
      isHot: false
    };
  }
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingProduct.value = null;
};

// 儲存商品修改（模擬 GAS POST）
const saveProduct = async (updatedProduct) => {
  try {
    const password = sessionStorage.getItem('admin_password');
    
    if (!updatedProduct.id) {
      // 1. 新增商品
      // 產生新 id (取目前最大 id + 1)
      const newId = (Math.max(...products.value.map(p => parseInt(p.id) || 0)) + 1).toString();
      updatedProduct.id = newId;

      const response = await mockGASPost(updatedProduct, password, 'CREATE');
      if (response.success) {
        products.value.unshift(updatedProduct); // 加到列表最前面
        alert(`✨ ${response.message}`);
        closeEditModal();
      }
    } else {
      // 2. 修改商品
      const response = await mockGASPost(updatedProduct, password, 'UPDATE');
      if (response.success) {
        const idx = products.value.findIndex(p => p.id === updatedProduct.id);
        if (idx !== -1) {
          products.value[idx] = updatedProduct;
        }
        alert(`✨ ${response.message}`);
        closeEditModal();
      }
    }
  } catch (error) {
    alert(`❌ 儲存失敗：${error.message}`);
  }
};

// 刪除商品
const deleteProduct = async (id) => {
  try {
    const password = sessionStorage.getItem('admin_password');
    const response = await mockGASDelete(id, password);
    
    if (response.success) {
      // 在前端移除該商品
      products.value = products.value.filter(p => p.id !== id);
      alert(`✨ ${response.message}`);
      closeEditModal();
      // 如果是在詳細頁刪除，回到列表頁
      if (currentPage.value === 'detail' && selectedProductId.value === id) {
        navigate('listing', currentCategory.value);
      }
    }
  } catch (error) {
    alert(`❌ 刪除失敗：${error.message}`);
  }
};

// 模擬 Google Apps Script Web App POST 接收端
const mockGASPost = (product, password, action) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === 'admin123') {
        const verb = action === 'CREATE' ? '新增上架' : '修改儲存';
        resolve({
          success: true,
          message: `商品「${product.product_name}」已成功 ${verb} 並同步寫入 Google 試算表！`
        });
      } else {
        reject(new Error('管理密碼驗證失敗！無法進行修改。'));
      }
    }, 600);
  });
};

// 模擬 Google Apps Script Web App DELETE 接收端
const mockGASDelete = (id, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === 'admin123') {
        resolve({
          success: true,
          message: `商品編號 [${id}] 已成功自 Google 試算表刪除！`
        });
      } else {
        reject(new Error('管理密碼驗證失敗！無法進行刪除。'));
      }
    }, 600);
  });
};

// 我的收藏邏輯
const contributedFavs = ref([]);

const loadContributedFavs = () => {
  try {
    const data = localStorage.getItem('contributed_favs');
    if (data) {
      contributedFavs.value = JSON.parse(data) || [];
    }
  } catch (e) {
    console.error('Failed to load contributed_favs', e);
  }

  // 對於所有已在 contributedFavs 裡的商品，進行 favoritesCount 的初始化補償 +1
  contributedFavs.value.forEach(id => {
    const prod = products.value.find(p => p.id === id.toString());
    if (prod) {
      prod.favoritesCount = (parseInt(prod.favoritesCount) || 0) + 1;
    }
  });
};

const toggleFavorites = () => {
  isFavoritesOpen.value = !isFavoritesOpen.value;
  if (isFavoritesOpen.value) {
    // 開啟抽屜時，自動移出已售出的收藏項目 (比對 products 中最新 status)
    favorites.value = favorites.value.filter(item => {
      const latestProd = products.value.find(p => p.id === item.id.toString());
      return latestProd ? latestProd.status !== 'sold' : false;
    });
  }
};

const goToProductDetail = (id) => {
  isFavoritesOpen.value = false;
  handleViewProduct(id);
};

const favoritesCount = computed(() => favorites.value.length);

const toggleFavorite = (product) => {
  const index = favorites.value.findIndex(item => item.id === product.id);
  if (index !== -1) {
    // 移出收藏
    favorites.value.splice(index, 1);
  } else {
    // 加入收藏
    // 限制已售出商品不可收藏
    if (product.status === 'sold') return;

    favorites.value.push(product);

    // 檢查是否為此瀏覽器首次收藏該商品
    const hasContributed = contributedFavs.value.includes(product.id.toString());
    if (!hasContributed) {
      // 記錄該商品 ID，並將關注度直接 +1
      contributedFavs.value.push(product.id.toString());
      product.favoritesCount = (parseInt(product.favoritesCount) || 0) + 1;
      
      // 持久化至 LocalStorage
      try {
        localStorage.setItem('contributed_favs', JSON.stringify(contributedFavs.value));
      } catch (e) {
        console.error('Failed to save contributed_favs', e);
      }
    }
  }
};

// 取得正確的圖片靜態資源 URL，防 GitHub Pages 破圖
const getImageUrl = (urlStr) => {
  if (!urlStr) return '';
  const firstUrl = urlStr.split(',')[0].trim();
  if (firstUrl.startsWith('http://') || firstUrl.startsWith('https://') || firstUrl.startsWith('data:')) {
    return firstUrl;
  }
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${firstUrl.replace(/^\//, '')}`;
};

// 複製分享連結
const copyShareLink = async () => {
  if (favorites.value.length === 0) return;
  const ids = favorites.value.map(item => item.id).join(',');
  const shareUrl = `${window.location.origin}${window.location.pathname}?favs=${ids}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    alert('🎉 已複製收藏分享連結！分享給朋友吧 ❤️');
  } catch (err) {
    alert(`❌ 複製失敗：${err.message}`);
  }
};

// Mounted 時讀取 sessionStorage 是否有登入過，並解析分享連結的收藏商品
onMounted(() => {
  const savedPassword = sessionStorage.getItem('admin_password');
  if (savedPassword === 'admin123') {
    isAdmin.value = true;
  }
  
  // 1. 載入並校正本地已貢獻關注度
  loadContributedFavs();
  
  // 2. 解析分享連結中的 favs 參數
  const params = new URLSearchParams(window.location.search);
  const favsParam = params.get('favs');
  if (favsParam) {
    const ids = favsParam.split(',').map(id => id.trim()).filter(Boolean);
    ids.forEach(id => {
      const prod = products.value.find(p => p.id === id);
      // 排除已售出的商品
      if (prod && prod.status !== 'sold' && !favorites.value.some(item => item.id === prod.id)) {
        favorites.value.push(prod);
        
        // 分享連結載入時，若該商品 ID 不在 contributedFavs 裡，也算入第一次貢獻
        const hasContributed = contributedFavs.value.includes(prod.id.toString());
        if (!hasContributed) {
          contributedFavs.value.push(prod.id.toString());
          prod.favoritesCount = (parseInt(prod.favoritesCount) || 0) + 1;
        }
      }
    });
    // 儲存一次 contributedFavs
    try {
      localStorage.setItem('contributed_favs', JSON.stringify(contributedFavs.value));
    } catch (e) {}

    // 自動開啟我的收藏抽屜，讓使用者看到載入的商品
    if (favorites.value.length > 0) {
      isFavoritesOpen.value = true;
    }
  }
});
</script>

<style>
/* 全域版面配置 */
#app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 頂部導覽 */
.app-header {
  background-color: #FFF;
  border-bottom: var(--border-thick);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10px 0;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

/* Logo */
.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.logo-emoji {
  font-size: 1.8rem;
}

.logo-title {
  font-size: 1.6rem;
  font-family: var(--font-cute);
  color: var(--color-wood);
  font-weight: 700;
}

/* 導覽連結 */
.nav-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-btn {
  background: none;
  border: 2px solid transparent;
  padding: 6px 14px;
  font-family: var(--font-cute);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-wood-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}

.nav-btn:hover {
  background-color: var(--bg-cream);
  color: var(--color-wood);
}

.nav-btn.active {
  background-color: var(--bg-cream);
  border-color: var(--color-wood);
  color: var(--color-wood);
}

.nav-sold-btn {
  color: #D32F2F;
}

.nav-sold-btn:hover {
  background-color: var(--bg-pink);
}

.nav-sold-btn.active {
  background-color: var(--bg-pink);
  border-color: #FF8A8A;
  color: #D32F2F;
}

/* 右側區塊 */
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-badge {
  background-color: var(--bg-pink);
  border: var(--border-thin);
  padding: 4px 10px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
}

.cart-trigger-btn {
  background-color: var(--bg-pink);
  border: var(--border-thin);
  padding: 8px 16px;
  font-family: var(--font-cute);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-wood);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 2px 2px 0px var(--color-wood);
  transition: transform 0.1s;
}

.cart-trigger-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--color-wood);
}

.cart-trigger-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px var(--color-wood);
}

.cart-count {
  background-color: var(--color-accent);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 主要區塊 */
.app-main {
  flex: 1;
  padding-top: 20px;
  padding-bottom: 40px;
}

/* 頁尾 */
.app-footer {
  background-color: var(--bg-cream);
  border-top: var(--border-thick);
  padding: 30px 0;
  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-sub {
  font-size: 0.85rem;
  color: var(--color-wood-light);
}

/* 購物車側邊抽屜 */
.cart-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(90, 69, 53, 0.4);
  z-index: 1000;
}

.cart-drawer {
  position: fixed;
  top: 10px;
  right: 10px;
  bottom: 10px;
  width: 380px;
  max-width: 90%;
  background-color: var(--bg-warm);
  border: var(--border-thick);
  border-radius: var(--radius-lg);
  padding: 30px 20px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.cart-title {
  font-size: 1.4rem;
  margin-bottom: 20px;
  border-bottom: 2px dashed var(--color-wood-light);
  padding-bottom: 10px;
}

.empty-cart-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  color: var(--color-wood-light);
  text-align: center;
  gap: 15px;
}

.empty-cart-emoji {
  font-size: 4rem;
}

.cart-items-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  gap: 15px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: var(--border-thin);
  border-radius: var(--radius-md);
  background-color: #FFF;
}

.favorite-item-clickable {
  cursor: pointer;
  transition: transform 0.15s, background-color 0.15s;
}

.favorite-item-clickable:hover {
  background-color: var(--bg-cream);
  transform: translateY(-2px);
}

.cart-item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: var(--border-thin);
}

.cart-item-info {
  flex-grow: 1;
  text-align: left;
}

.cart-item-name {
  font-size: 0.95rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.cart-item-price {
  color: var(--color-accent);
  font-weight: 700;
  font-size: 0.9rem;
}

.cart-item-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.1s;
}

.cart-item-remove:hover {
  transform: scale(1.15);
}

/* 購物車結算 */
.cart-summary {
  margin-top: auto;
  border-top: 2px dashed var(--color-wood-light);
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.total-row {
  font-weight: 700;
  font-size: 1.15rem;
}

.total-price {
  color: var(--color-accent);
}

.checkout-btn {
  width: 100%;
  padding: 12px 20px;
  font-size: 1.1rem;
  margin-top: 10px;
}

.pc-only {
  display: inline-block;
}

.mobile-only {
  display: none !important;
}

@media (max-width: 768px) {
  .pc-only {
    display: none !important;
  }

  .mobile-only {
    display: inline-block !important;
  }

  .header-container {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 12px 10px;
    align-items: center;
    width: 100%;
  }
  
  .logo-wrapper {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    justify-self: start;
  }
  
  .header-right {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    justify-self: end;
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    width: auto;
  }
  
  .cart-trigger-btn {
    width: auto;
    padding: 6px 12px;
    font-size: 0.85rem;
    justify-content: center;
  }
  
  .nav-links {
    grid-column: 1 / 3;
    grid-row: 2 / 3;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    width: 100%;
    padding: 4px 10px 8px 10px;
    margin: 0;
    justify-content: flex-start;
    flex-wrap: nowrap; /* 強制橫向不折行 */
    -webkit-overflow-scrolling: touch;
    
    /* 隱藏滾動條 */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .nav-links::-webkit-scrollbar {
    display: none;
  }
  
  .nav-btn {
    flex-shrink: 0; /* 禁止按鈕被擠壓收縮 */
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .app-footer {
    padding: 20px 10px !important;
  }
  .footer-content {
    gap: 6px !important;
  }
  .app-footer p {
    font-size: 0.8rem !important;
    line-height: 1.45 !important;
  }
  .footer-sub {
    font-size: 0.7rem !important;
  }
}

@media (max-width: 500px) {
  .logo-title {
    font-size: 1.3rem;
  }
  .logo-emoji {
    font-size: 1.4rem;
  }
}
</style>
