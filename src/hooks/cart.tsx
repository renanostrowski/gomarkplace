import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsItem = await AsyncStorage.getItem('@GoMarketPlace:product');

      if (productsItem) {
        setProducts(JSON.parse(productsItem));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productsExists = products.find(p => p.id === product.id);

      if (productsExists) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(item =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );

      await AsyncStorage.setItem(
        '@GoMarketPlace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.filter(p => p.id === id);

      if (product[0].quantity > 1) {
        setProducts(
          products.map(item =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
          ),
        );
        await AsyncStorage.setItem(
          '@GoMarketPlace:product',
          JSON.stringify(products),
        );
      } else {
        setProducts(products.filter(itens => itens.id !== id));
        await AsyncStorage.setItem(
          '@GoMarketPlace:product',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
