import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

const getDb = async (): Promise<SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'myDatabase.db', location: 'default' });
  return db;
};

export type Category = {
  id: number;
  name: string;
}; 

export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type CartItem = {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImg: string;
  quantity: number;
  userId?: number;
};

export type Order = {
  id: number;
  orderCode: string;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  status: string; // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  items: OrderItem[];
  createdAt: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
};

const initialCategories: Category[] = [
  { id: 1, name: 'Áo' },
  { id: 2, name: 'Giày' },
  { id: 3, name: 'Balo' },
  { id: 4, name: 'Mũ' },
  { id: 5, name: 'Túi' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Áo sơ mi', price: 250000, img: 'hinh1.jpg', categoryId: 1 },
  { id: 2, name: 'Giày sneaker', price: 1100000, img: 'giay.jpg', categoryId: 2 },
  { id: 3, name: 'Balo thời trang', price: 490000, img: 'balo.jpg', categoryId: 3 },
  { id: 4, name: 'Mũ lưỡi trai', price: 120000, img: 'mu.jpg', categoryId: 4 },
  { id: 5, name: 'Túi xách nữ', price: 980000, img: 'tui.jpg', categoryId: 5 },
];

export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const database = await getDb();
    database.transaction(
      (tx) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)');
        initialCategories.forEach((category) => {
          tx.executeSql('INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)', [category.id, category.name]);
        });

        tx.executeSql(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE,
          price REAL,
          img TEXT,
          categoryId INTEGER,
          FOREIGN KEY (categoryId) REFERENCES categories(id)
        )`);

        // initialProducts.forEach((product) => {
        //   tx.executeSql('INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
        //     [product.id, product.name, product.price, product.img, product.categoryId]);
        // });
        // initialProducts.forEach((product) => {
        //   tx.executeSql(
        //     'INSERT OR IGNORE INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
        //     [product.name, product.price, product.img, product.categoryId]
        //   );
        // });
        tx.executeSql('SELECT COUNT(*) AS count FROM products', [], (_, result) => {
        const count = result.rows.item(0).count;
        if (count === 0) {
          initialProducts.forEach(product => {
            tx.executeSql(
              'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
              [product.name, product.price, product.img, product.categoryId]
            );
          });
        }
      });


        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
          )`,
          [],
          () => console.log('✅ Users table created'),
          (_, error) => console.error('❌ Error creating users table:', error)
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER,
            productName TEXT,
            productPrice REAL,
            productImg TEXT,
            quantity INTEGER,
            userId INTEGER
          )`,
          [],
          () => console.log('✅ Cart table created'),
          (_, error) => console.error('❌ Error creating cart table:', error)
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderCode TEXT UNIQUE,
            totalPrice REAL,
            customerName TEXT,
            customerPhone TEXT,
            customerEmail TEXT,
            shippingAddress TEXT,
            status TEXT,
            createdAt TEXT
          )`,
          [],
          () => console.log('✅ Orders table created'),
          (_, error) => console.error('❌ Error creating orders table:', error)
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS orderItems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER,
            productId INTEGER,
            productName TEXT,
            productPrice REAL,
            quantity INTEGER,
            FOREIGN KEY (orderId) REFERENCES orders(id)
          )`,
          [],
          () => console.log('✅ OrderItems table created'),
          (_, error) => console.error('❌ Error creating orderItems table:', error)
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS userProfiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER UNIQUE,
            fullName TEXT,
            phone TEXT,
            email TEXT,
            address TEXT,
            FOREIGN KEY (userId) REFERENCES users(id)
          )`,
          [],
          () => console.log('✅ UserProfiles table created'),
          (_, error) => console.error('❌ Error creating userProfiles table:', error)
        );

        tx.executeSql(
          `INSERT INTO users (username, password, role)
          SELECT 'admin', '123456', 'admin'
          WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')`,
          [],
          () => console.log('✅ Admin user added'),
          (_, error) => console.error('❌ Error inserting admin:', error)
        );
      },
(error) => console.error('❌ Transaction error:', error),
      () => {
        console.log('✅ Database initialized');
        if (onSuccess) onSuccess();
      }
    );
  } catch (error) {
    console.error('❌ initDatabase outer error:', error);
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM categories');
    const items: Category[] = [];
    const rows = results[0].rows;
    for (let i = 0; i < rows.length; i++) {
      items.push(rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};
//
export const addCategory = async (name: string) => {
  try {
    const db = await getDb();
    await db.executeSql(
      'INSERT INTO categories (name) VALUES (?)',
      [name]
    );
    console.log('✅ Category added');
  } catch (err) {
    console.error('❌ Error adding category:', err);
  }
};

export const updateCategory = async (id: number, name: string) => {
  try {
    const db = await getDb();
    await db.executeSql(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name, id]
    );
    console.log('✅ Category updated');
  } catch (err) {
    console.error('❌ Error updating category:', err);
  }
};

export const deleteCategory = async (id: number) => {
  try {
    const db = await getDb();
    await db.executeSql(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );
    console.log('✅ Category deleted');
  } catch (err) {
    console.error('❌ Error deleting category:', err);
  }
};

///
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM products');
    const items: Product[] = [];
    const rows = results[0].rows;
    for (let i = 0; i < rows.length; i++) {
      const item = rows.item(i);
      items.push({
        ...item,
        price: item.price ? Number(item.price) : 0
      });
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const database = await getDb();
    await database.executeSql(
      'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
      [product.name, product.price, product.img, product.categoryId]
    );
    console.log('✅ Product added');
  } catch (error) {
    console.error('❌ Error adding product:', error);
  }
};

export const updateProduct = async (product: Product) => {
  try {
    const database = await getDb();
    await database.executeSql(
      'UPDATE products SET name = ?, price = ?, categoryId = ?, img = ? WHERE id = ?',
      [product.name, product.price, product.categoryId, product.img, product.id]
    );
    console.log('✅ Product updated with image');
  } catch (error) {
    console.error('❌ Error updating product:', error);
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const database = await getDb();
    await database.executeSql('DELETE FROM products WHERE id = ?', [id]);
    console.log('✅ Product deleted');
  } catch (error) {
    console.error('❌ Error deleting product:', error);
  }
};

export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM products WHERE categoryId = ?', [categoryId]);
    const products: Product[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      const item = rows.item(i);
      products.push({
        ...item,
        price: item.price ? Number(item.price) : 0
      });
    }
    return products;
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    return [];
  }
};

export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
  try {
    const db = await getDb();
const [results] = await db.executeSql(
      `
      SELECT products.* FROM products
      JOIN categories ON products.categoryId = categories.id
      WHERE products.name LIKE ? OR categories.name LIKE ?
      `,
      [`%${keyword}%`, `%${keyword}%`]
    );
    const products: Product[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      const item = rows.item(i);
      products.push({
        ...item,
        price: item.price ? Number(item.price) : 0
      });
    }
    return products;
  } catch (error) {
    console.error('❌ Error searching by name or category:', error);
    return [];
  }
};

export const addUser = async (username: string, password: string, role: string): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role]);
    console.log('✅ User added');
    return true;
  } catch (error) {
    console.error('❌ Error adding user:', error);
    return false;
  }
};

export const updateUser = async (user: User) => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?', [user.username, user.password, user.role, user.id]);
    console.log('✅ User updated');
  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
};

export const deleteUser = async (id: number) => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM users WHERE id = ?', [id]);
    console.log('✅ User deleted');
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM users');
    const users: User[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      users.push(rows.item(i));
    }
    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
};

export const getUserByCredentials = async (username: string, password: string): Promise<User | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    const rows = results.rows;
    if (rows.length > 0) {
      return rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user by credentials:', error);
    return null;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM users WHERE id = ?', [id]);
    const rows = results.rows;
    if (rows.length > 0) {
      return rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user by id:', error);
    return null;
  }
};

// ========== CART FUNCTIONS ==========

export const addToCart = async (product: Product, quantity: number, userId?: number): Promise<void> => {
  try {
    const db = await getDb();
    // Check if product already in cart for this user
    let query = 'SELECT * FROM cart WHERE productId = ?';
    let params: any[] = [product.id];
    
    if (userId) {
      query += ' AND userId = ?';
      params.push(userId);
    }
    
    const [result] = await db.executeSql(query, params);
    
    if (result.rows.length > 0) {
      // Update quantity
      let updateQuery = 'UPDATE cart SET quantity = quantity + ? WHERE productId = ?';
      let updateParams: any[] = [quantity, product.id];
      
      if (userId) {
        updateQuery += ' AND userId = ?';
        updateParams.push(userId);
      }
      
      await db.executeSql(updateQuery, updateParams);
    } else {
      // Add new item
      let insertQuery = 'INSERT INTO cart (productId, productName, productPrice, productImg, quantity';
      let insertParams: any[] = [product.id, product.name, product.price, product.img, quantity];
      
      if (userId) {
        insertQuery += ', userId';
        insertParams.push(userId);
      }
      
      insertQuery += ') VALUES (?, ?, ?, ?, ?';
      if (userId) {
        insertQuery += ', ?';
      }
      insertQuery += ')';
      
      await db.executeSql(insertQuery, insertParams);
    }
    console.log('✅ Added to cart');
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
  }
};

export const fetchCart = async (userId?: number): Promise<CartItem[]> => {
  try {
    const db = await getDb();
    let query = 'SELECT * FROM cart';
    let params: any[] = [];
    
    if (userId) {
      query += ' WHERE userId = ?';
      params = [userId];
    }
    
    const [results] = await db.executeSql(query, params);
    const items: CartItem[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      items.push(rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    return [];
  }
};

export const updateCartQuantity = async (cartId: number, quantity: number): Promise<void> => {
  try {
    const db = await getDb();
    if (quantity <= 0) {
      await db.executeSql('DELETE FROM cart WHERE id = ?', [cartId]);
    } else {
      await db.executeSql('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, cartId]);
    }
    console.log('✅ Cart updated');
  } catch (error) {
    console.error('❌ Error updating cart:', error);
  }
};

export const removeFromCart = async (cartId: number): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM cart WHERE id = ?', [cartId]);
    console.log('✅ Removed from cart');
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM cart');
    console.log('✅ Cart cleared');
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
  }
};

// ========== ORDER FUNCTIONS ==========

export const createOrder = async (
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  shippingAddress: string,
  cartItems: CartItem[]
): Promise<number | null> => {
  try {
    const db = await getDb();
    const orderCode = 'ORD' + Date.now();
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
    const createdAt = new Date().toISOString();

    // Insert order first
    const [orderResult] = await db.executeSql(
      `INSERT INTO orders (orderCode, totalPrice, customerName, customerPhone, customerEmail, shippingAddress, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderCode, totalPrice, customerName, customerPhone, customerEmail, shippingAddress, 'pending', createdAt]
    );

    const orderId = orderResult.insertId;

    // Insert order items sequentially. If any insert fails, rollback by deleting created records.
    try {
      for (const item of cartItems) {
        await db.executeSql(
          `INSERT INTO orderItems (orderId, productId, productName, productPrice, quantity)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.productName, item.productPrice, item.quantity]
        );
      }
    } catch (innerErr) {
      // Remove any partial data to avoid inconsistent state
      try {
        await db.executeSql('DELETE FROM orderItems WHERE orderId = ?', [orderId]);
        await db.executeSql('DELETE FROM orders WHERE id = ?', [orderId]);
      } catch (cleanupErr) {
        console.error('❌ Error during rollback cleanup:', cleanupErr);
      }
      throw innerErr;
    }

    console.log('✅ Order created:', orderCode);
    return orderId;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return null;
  }
};

export const fetchOrders = async (userId?: number): Promise<Order[]> => {
  try {
    const db = await getDb();
    let query = 'SELECT * FROM orders';
    let params: any[] = [];
    
    if (userId) {
      query += ' WHERE userId = ?';
      params = [userId];
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const [results] = await db.executeSql(query, params);
    const orders: Order[] = [];
    const rows = results.rows;

    for (let i = 0; i < rows.length; i++) {
      const order = rows.item(i);
      // Fetch order items
      const [itemResults] = await db.executeSql('SELECT * FROM orderItems WHERE orderId = ?', [order.id]);
      const items: OrderItem[] = [];
      for (let j = 0; j < itemResults.rows.length; j++) {
        items.push(itemResults.rows.item(j));
      }
      orders.push({ ...order, items });
    }
    return orders;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
  try {
    const db = await getDb();
    await db.executeSql('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    console.log('✅ Order status updated');
  } catch (error) {
    console.error('❌ Error updating order status:', error);
  }
};

// ========== USER PROFILE FUNCTIONS ==========

export const updateUserProfile = async (
  userId: number,
  fullName: string,
  phone: string,
  email: string,
  address: string
): Promise<boolean> => {
  try {
    const db = await getDb();
    const [result] = await db.executeSql('SELECT id FROM userProfiles WHERE userId = ?', [userId]);
    
    if (result.rows.length > 0) {
      // Update existing profile
      await db.executeSql(
        'UPDATE userProfiles SET fullName = ?, phone = ?, email = ?, address = ? WHERE userId = ?',
        [fullName, phone, email, address, userId]
      );
    } else {
      // Insert new profile
      await db.executeSql(
        'INSERT INTO userProfiles (userId, fullName, phone, email, address) VALUES (?, ?, ?, ?, ?)',
        [userId, fullName, phone, email, address]
      );
    }
    console.log('✅ User profile updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return false;
  }
};

export const getUserProfile = async (userId: number): Promise<User | null> => {
  try {
    const db = await getDb();
    const [userResult] = await db.executeSql('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (userResult.rows.length === 0) return null;
    
    const user = userResult.rows.item(0);
    const [profileResult] = await db.executeSql('SELECT * FROM userProfiles WHERE userId = ?', [userId]);
    
    if (profileResult.rows.length > 0) {
      const profile = profileResult.rows.item(0);
      return { ...user, ...profile };
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return null;
  }
};