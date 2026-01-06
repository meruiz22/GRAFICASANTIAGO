import React, { useState, useEffect, createContext, useContext } from 'react';
import { ShoppingCart, User, Search, Menu, X, Bell, Package, BarChart3, Users, LogOut, Home, Grid, FileText } from 'lucide-react';

// Context para autenticación
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

// Provider de autenticación
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

 // Busca esta parte y déjala ASÍ:
  const login = async (email, password) => {
    try {
      // 1. Corregimos la URL agregando /v1
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        // 2. Corregimos: El backend devuelve 'token' y 'user' directamente, no dentro de 'data'
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Busca esta parte y déjala ASÍ:
  const register = async (userData) => {
    try {
      // 1. Corregimos la URL agregando /v1
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();

      if (data.success) {
        // 2. Corregimos la estructura aquí también
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Componente de Login
const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </div>
      <p className="mt-4 text-center text-gray-600">
        ¿No tienes cuenta?{' '}
        <button onClick={onSwitchToRegister} className="text-blue-600 hover:underline">
          Regístrate
        </button>
      </p>
    </div>
  );
};

// Componente de Registro
const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || formData.password.length < 6) {
      setError('Por favor completa todos los campos. La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const result = await register(formData);
    setLoading(false);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Registro</h2>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Apellido</label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Contraseña (mín. 6 caracteres)</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </div>
      <p className="mt-4 text-center text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline">
          Inicia sesión
        </button>
      </p>
    </div>
  );
};

// Página principal de la aplicación
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent 
          currentView={currentView}
          setCurrentView={setCurrentView}
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          authMode={authMode}
          setAuthMode={setAuthMode}
        />
      </div>
    </AuthProvider>
  );
}

const AppContent = ({ currentView, setCurrentView, showAuth, setShowAuth, authMode, setAuthMode }) => {
  const { user, isAuthenticated, logout } = useAuth();

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm
            onSuccess={() => setShowAuth(false)}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={() => setShowAuth(false)}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600">Gráfica Santiago</h1>
            <nav className="hidden md:flex space-x-6">
              <button onClick={() => setCurrentView('home')} className="text-gray-700 hover:text-blue-600">Inicio</button>
              <button onClick={() => setCurrentView('products')} className="text-gray-700 hover:text-blue-600">Productos</button>
              <button onClick={() => setCurrentView('categories')} className="text-gray-700 hover:text-blue-600">Categorías</button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">Hola, {user?.nombre}</span>
                <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-full">
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthMode('login'); setShowAuth(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' && <HomePage setCurrentView={setCurrentView} />}
        {currentView === 'products' && <ProductsPage />}
        {currentView === 'categories' && <CategoriesPage />}
      </main>
    </>
  );
};

const HomePage = ({ setCurrentView }) => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Bienvenido a Gráfica Santiago</h2>
        <p className="text-xl mb-6">Tu tienda de confianza para artículos de papelería y más</p>
        <button 
          onClick={() => setCurrentView('products')}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Ver Productos
        </button>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
          <p className="text-gray-600">Entregas en todo Ecuador</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <ShoppingCart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Precios Mayoristas</h3>
          <p className="text-gray-600">Descuentos especiales</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Atención Personalizada</h3>
          <p className="text-gray-600">Servicio al cliente 24/7</p>
        </div>
      </section>
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Busca esta parte y déjala ASÍ:
  const fetchProducts = async () => {
    try {
      // 1. Corregimos la URL agregando /v1
      const response = await fetch('http://localhost:3000/api/v1/products');
      const data = await response.json();
      
      if (data.success) {
        // 2. CORRECCIÓN VITAL: El backend envía "products", no "data"
        // Si data.products viene vacío, usamos un array vacío [] para que no explote
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando productos...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Nuestros Productos</h2>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.nombre}</h3>
              <p className="text-sm text-gray-600 mb-3">{product.tipo}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">
                  ${product.precio?.minorista?.toFixed(2)}
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoriesPage = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Categorías</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Cuadernos', 'Papel', 'Artículos de Oficina', 'Impresión', 'Arte', 'Escolares'].map((cat) => (
          <div key={cat} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer text-center">
            <Grid className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">{cat}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};