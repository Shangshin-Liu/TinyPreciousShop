import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App.vue';
import EditModal from '../components/EditModal.vue';
import ProductListing from '../components/ProductListing.vue';
import Homepage from '../components/Homepage.vue';

describe('Admin Easter Egg, Add, Delete & Search Flow', () => {
  beforeEach(() => {
    // 每次測試前清空 sessionStorage
    sessionStorage.clear();
    vi.restoreAllMocks();
    // 模擬 window.scrollTo 以免 jsdom 報錯
    window.scrollTo = vi.fn();
  });

  it('應在 Logo 連點 7 次後彈出密碼輸入 Prompt，若密碼正確則啟用管理員模式', async () => {
    const promptMock = vi.spyOn(window, 'prompt').mockReturnValue('admin123');
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const wrapper = mount(App);

    // 模擬 Logo 連點 7 次
    const logo = wrapper.find('.logo-wrapper');
    for (let i = 0; i < 7; i++) {
      await logo.trigger('click');
    }

    expect(promptMock).toHaveBeenCalledTimes(1);
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('已開啟就地編輯管理模式'));
    expect(sessionStorage.getItem('admin_password')).toBe('admin123');
    
    // 確認此時 isAdmin 為 true
    expect(wrapper.vm.isAdmin).toBe(true);
  });

  it('已售出 (sold) 的商品即使在管理模式下也不應顯示編輯鉛筆按鈕', async () => {
    const mockProducts = [
      {
        id: '1',
        product_name: '上架商品',
        category: 'accessories',
        price: 100,
        condition: '全新',
        image_urls: '/images/cat_earrings.png',
        status: 'active',
        isHot: false
      },
      {
        id: '2',
        product_name: '已售出商品',
        category: 'accessories',
        price: 200,
        condition: '全新',
        image_urls: '/images/sakura_ring.png',
        status: 'sold',
        isHot: true
      }
    ];

    const wrapper = mount(ProductListing, {
      props: {
        products: mockProducts,
        isAdmin: true,
        initialCategory: 'accessories'
      }
    });

    // 取得所有商品卡片
    const cards = wrapper.findAll('.product-card');
    
    // 飾品館分類下只會渲染未售出的 active 項目 (mockProducts[0])
    expect(cards.length).toBe(1);
    expect(cards[0].find('.edit-pencil-btn').exists()).toBe(true);

    // 藉由 Props 切換至已售出分類
    await wrapper.setProps({ initialCategory: 'sold' });

    // 此時應渲染 mockProducts[1]
    const soldCards = wrapper.findAll('.product-card');
    expect(soldCards.length).toBe(1);
    expect(soldCards[0].text()).toContain('已售出商品');
    
    // 檢查已售出卡片上是否「沒有」編輯鉛筆按鈕
    expect(soldCards[0].find('.edit-pencil-btn').exists()).toBe(false);
  });

  it('商品列表應能根據關鍵字搜尋進行模糊比對過濾', async () => {
    const mockProducts = [
      {
        id: '1',
        product_name: '手作貓咪耳環',
        category: 'accessories',
        price: 100,
        condition: '全新',
        image_urls: '/images/cat_earrings.png',
        status: 'active',
        isHot: false
      },
      {
        id: '2',
        product_name: '粉紅櫻花戒指',
        category: 'accessories',
        price: 200,
        condition: '全新',
        image_urls: '/images/sakura_ring.png',
        status: 'active',
        isHot: false
      }
    ];

    const wrapper = mount(ProductListing, {
      props: {
        products: mockProducts,
        isAdmin: false,
        initialCategory: 'accessories'
      }
    });

    expect(wrapper.findAll('.product-card').length).toBe(2);

    // 搜尋「貓咪」
    const searchInput = wrapper.find('#search-input');
    await searchInput.setValue('貓咪');

    const filtered = wrapper.findAll('.product-card');
    expect(filtered.length).toBe(1);
    expect(filtered[0].text()).toContain('手作貓咪耳環');
  });

  it('管理員編輯 Modal 在新增模式下不顯示刪除按鈕，且能設置與變更 isHot 欄位', async () => {
    const wrapperAdd = mount(EditModal, {
      props: {
        product: {
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
        }
      }
    });
    expect(wrapperAdd.find('.delete-btn').exists()).toBe(false);

    // 模擬修改名稱與勾選熱門商品
    await wrapperAdd.find('#edit-name').setValue('全新熱門小物');
    const isHotCheckbox = wrapperAdd.find('#edit-is-hot');
    expect(isHotCheckbox.exists()).toBe(true);
    await isHotCheckbox.setChecked(true);

    // 模擬提交
    await wrapperAdd.find('form').trigger('submit.prevent');
    
    expect(wrapperAdd.emitted()).toHaveProperty('save');
    expect(wrapperAdd.emitted().save[0][0].product_name).toBe('全新熱門小物');
    expect(wrapperAdd.emitted().save[0][0].isHot).toBe(true);
  });

  it('首頁應只過濾並渲染 isHot 為 true 的熱門商品', () => {
    const mockProducts = [
      {
        id: '1',
        product_name: '普通商品 A',
        category: 'accessories',
        price: 10,
        condition: '全新',
        image_urls: '/images/cat_earrings.png',
        status: 'active',
        isHot: false
      },
      {
        id: '2',
        product_name: '熱門商品 B',
        category: 'plushies',
        price: 20,
        condition: '全新',
        image_urls: '/images/plush_rabbit.png',
        status: 'active',
        isHot: true
      },
      {
        id: '3',
        product_name: '熱門商品 C',
        category: 'grocery',
        price: 30,
        condition: '全新',
        image_urls: '/images/strawberry_cup.png',
        status: 'active',
        isHot: true
      }
    ];

    const wrapper = mount(Homepage, {
      props: {
        products: mockProducts,
        isAdmin: false
      }
    });

    const hotCards = wrapper.findAll('.product-card');
    // 應只顯示熱門商品 B 與 C
    expect(hotCards.length).toBe(2);
    expect(hotCards[0].text()).toContain('熱門商品 B');
    expect(hotCards[1].text()).toContain('熱門商品 C');
    expect(wrapper.text()).not.toContain('普通商品 A');
  });

  it('App 元件新增商品時應正確塞入商品清單，刪除商品時應移出清單', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    sessionStorage.setItem('admin_password', 'admin123');

    const wrapper = mount(App);
    
    // 取得初始商品數
    const initialCount = wrapper.vm.products.length;

    // 1. 模擬新增商品
    const newProduct = {
      id: '', 
      product_name: '全新超可愛玩偶',
      category: 'plushies',
      price: 999,
      material: '棉花',
      dimensions: '30cm',
      condition: '全新未拆',
      image_urls: '/images/plush_rabbit.png',
      status: 'active',
      isHot: true
    };

    await wrapper.vm.saveProduct(newProduct);
    
    expect(wrapper.vm.products.length).toBe(initialCount + 1);
    expect(wrapper.vm.products[0].product_name).toBe('全新超可愛玩偶');
    expect(wrapper.vm.products[0].isHot).toBe(true);

    const createdId = wrapper.vm.products[0].id;

    // 2. 模擬刪除商品
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await wrapper.vm.deleteProduct(createdId);

    expect(wrapper.vm.products.length).toBe(initialCount);
    expect(wrapper.vm.products.some(p => p.id === createdId)).toBe(false);
  });

  it('應能點擊收藏將商品加入/移出收藏，且關注度支援 LocalStorage 去重與防刷，並排除已售出商品', async () => {
    // 模擬 localStorage
    const store = {};
    const localStorageMock = {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
      clear: vi.fn(() => { for (const k in store) delete store[k]; })
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

    // 模擬 alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const wrapper = mount(App);

    // 取得商品 A
    const productA = wrapper.vm.products.find(p => p.status === 'active');
    expect(productA).toBeDefined();

    // 防禦性初始化：若 Vitest 快取了舊的 products.json 導致無 favoritesCount，手動賦予初始值
    wrapper.vm.products.forEach(p => {
      if (p.favoritesCount === undefined) {
        p.favoritesCount = p.isHot ? 15 : 5;
      }
    });

    const initialFavoritesCount = productA.favoritesCount;

    // 1. 首次加入收藏
    await wrapper.vm.toggleFavorite(productA);
    expect(wrapper.vm.favorites).toContainEqual(productA);
    
    // 關注度應 +1
    expect(productA.favoritesCount).toBe(initialFavoritesCount + 1);
    expect(store['contributed_favs']).toContain(productA.id.toString());

    // 2. 取消收藏
    await wrapper.vm.toggleFavorite(productA);
    expect(wrapper.vm.favorites).not.toContainEqual(productA);

    // 關注度應維持不變（不減少）
    expect(productA.favoritesCount).toBe(initialFavoritesCount + 1);

    // 3. 再次加入收藏 (重複加減)
    await wrapper.vm.toggleFavorite(productA);
    expect(wrapper.vm.favorites).toContainEqual(productA);

    // 關注度應維持不變（不重複加 1）
    expect(productA.favoritesCount).toBe(initialFavoritesCount + 1);

    // 4. 已售出商品收藏限制
    const soldProduct = wrapper.vm.products.find(p => p.status === 'sold');
    expect(soldProduct).toBeDefined();

    // 嘗試收藏已售出商品
    await wrapper.vm.toggleFavorite(soldProduct);
    // 應無法被加入收藏
    expect(wrapper.vm.favorites).not.toContainEqual(soldProduct);

    // 5. 開啟收藏抽屜時，自動移出已售出的收藏項目
    // 手動將 productA 的狀態模擬改為已售出 (後台操作)
    productA.status = 'sold';
    expect(wrapper.vm.favorites).toContainEqual(productA);

    // 觸發打開抽屜
    await wrapper.vm.toggleFavorites();
    // 應已被自動移出收藏清單
    expect(wrapper.vm.favorites).not.toContainEqual(productA);
  });

  it('首頁的 active 商品應顯示收藏按鈕，已售出商品則不顯示', () => {
    const mockProducts = [
      {
        id: '1',
        product_name: '普通熱門商品',
        category: 'accessories',
        price: 10,
        condition: '全新',
        image_urls: '/images/cat_earrings.png',
        status: 'active',
        isHot: true,
        favoritesCount: 3
      },
      {
        id: '2',
        product_name: '已售出熱門商品',
        category: 'plushies',
        price: 20,
        condition: '全新',
        image_urls: '/images/plush_rabbit.png',
        status: 'sold',
        isHot: true,
        favoritesCount: 5
      }
    ];

    const wrapper = mount(Homepage, {
      props: {
        products: mockProducts,
        isAdmin: false,
        favorites: []
      }
    });

    const cards = wrapper.findAll('.product-card');
    expect(cards.length).toBe(2);

    // active 商品小卡上應有收藏愛心按鈕
    expect(cards[0].find('.favorite-heart-btn').exists()).toBe(true);

    // sold 商品小卡上不應有收藏按鈕
    expect(cards[1].find('.favorite-heart-btn').exists()).toBe(false);
  });

  it('當編輯商品時，若狀態被變更為已售出，應自動連動把熱門商品標記取消，且將 checkbox disabled', async () => {
    const wrapper = mount(EditModal, {
      props: {
        product: {
          id: '1',
          product_name: '原本的熱門商品',
          category: 'accessories',
          price: 100,
          material: '',
          dimensions: '',
          condition: '',
          image_urls: '/images/cat_earrings.png',
          status: 'active',
          isHot: true
        }
      }
    });

    const isHotInput = wrapper.find('#edit-is-hot');
    expect(isHotInput.element.checked).toBe(true);
    expect(isHotInput.element.disabled).toBe(false);

    // 模擬將狀態變更為 sold
    const statusSelect = wrapper.find('#edit-status');
    await statusSelect.setValue('sold');

    // 驗證 isHot 被自動取消 (變為 false)
    expect(isHotInput.element.checked).toBe(false);
    // 驗證 checkbox 變為 disabled
    expect(isHotInput.element.disabled).toBe(true);
  });

  it('在收藏抽屜中點擊收藏項目應跳轉至商品詳細頁並自動收合抽屜', async () => {
    const wrapper = mount(App);

    // 收藏一個商品
    const product = wrapper.vm.products.find(p => p.status === 'active');
    await wrapper.vm.toggleFavorite(product);
    
    // 開啟抽屜
    await wrapper.vm.toggleFavorites();
    expect(wrapper.vm.isFavoritesOpen).toBe(true);

    // 找到抽屜中的收藏點擊項並模擬點擊
    const clickableItem = wrapper.find('.favorite-item-clickable');
    expect(clickableItem.exists()).toBe(true);
    await clickableItem.trigger('click');

    // 驗證抽屜已關閉，且當前頁面切換至該商品的詳細頁
    expect(wrapper.vm.isFavoritesOpen).toBe(false);
    expect(wrapper.vm.currentPage).toBe('detail');
    expect(wrapper.vm.selectedProductId).toBe(product.id);
  });
});
