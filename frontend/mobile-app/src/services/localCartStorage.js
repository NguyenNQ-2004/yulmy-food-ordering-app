import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_CART_ITEMS_KEY = 'customer_local_cart_items';
const LOCAL_CART_VOUCHER_KEY = 'customer_local_cart_voucher';
const LEGACY_LOCAL_PRICE_MAP = {
  'local-1': 5.5,
  'local-2': 4.5,
  'local-3': 3.5,
  'local-4': 6,
};

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

export async function loadLocalCartItems() {
  const value = await AsyncStorage.getItem(LOCAL_CART_ITEMS_KEY);
  const items = parseJson(value, []);

  return items.map((item) => {
    if (!item?.id || Number(item.price) < 1000) {
      return item;
    }

    const mappedPrice = LEGACY_LOCAL_PRICE_MAP[item.id];

    if (!mappedPrice) {
      return item;
    }

    return {
      ...item,
      price: mappedPrice,
    };
  });
}

export async function saveLocalCartItems(items) {
  await AsyncStorage.setItem(LOCAL_CART_ITEMS_KEY, JSON.stringify(items));
}

export async function clearLocalCartItems() {
  await AsyncStorage.removeItem(LOCAL_CART_ITEMS_KEY);
}

export async function loadLocalCartVoucher() {
  const value = await AsyncStorage.getItem(LOCAL_CART_VOUCHER_KEY);
  return parseJson(value, null);
}

export async function saveLocalCartVoucher(voucher) {
  await AsyncStorage.setItem(LOCAL_CART_VOUCHER_KEY, JSON.stringify(voucher));
}

export async function clearLocalCartVoucher() {
  await AsyncStorage.removeItem(LOCAL_CART_VOUCHER_KEY);
}
