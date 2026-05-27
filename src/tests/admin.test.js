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
});
