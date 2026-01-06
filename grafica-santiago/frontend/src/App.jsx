import React, { useState, useEffect, createContext, useContext } from 'react';
import { ShoppingCart, Search, Bell, Package, Users, LogOut, Grid } from 'lucide-react';

// Context
const AuthContext = createContext();
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const apiCall = async (url, data) => {
    try {
      const response = await fetch(`http://localhost:3000/api${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        setToken(result.data.token);
        setUser(result.data.user);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const login = (email, password) => apiCall('/auth/login', { email, password });
  const register = (userData) => apiCall('/auth/register', userData);
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

// Formulario unificado de Login/Registro
const AuthForm = ({ isLogin, onSuccess, onSwitch }) => {
  const [formData, setFormData] = useState(
    isLogin 
      ? { email: '', password: '' }
      : { nombre: '', apellido: '', email: '', password: '', telefono: '' }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isLogin && (formData.password.length < 6 || !formData.email)) {
      setError('Completa todos los campos. Contraseña mín. 6 caracteres.');
      return;
    }
    
    setError('');
    setLoading(true);
    const result = await (isLogin ? login(formData.email, formData.password) : register(formData));
    setLoading(false);
    
    if (result.success) onSuccess();
    else setError(result.message || 'Error desconocido');
  };

  const fields = isLogin 
    ? [{ label: 'Email', type: 'email', key: 'email' }, { label: 'Contraseña', type: 'password', key: 'password' }]
    : [{ label: 'Nombre', type: 'text', key: 'nombre' }, { label: 'Apellido', type: 'text', key: 'apellido' }, { label: 'Email', type: 'email', key: 'email' }, { label: 'Contraseña (mín. 6)', type: 'password', key: 'password' }, { label: 'Teléfono', type: 'tel', key: 'telefono' }];

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {isLogin ? 'Iniciar Sesión' : 'Registro'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {isLogin ? fields.map(f => (
          <div key={f.key}>
            <label className="block text-gray-700 mb-2">{f.label}</label>
            <input type={f.type} value={formData[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        )) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {fields.slice(0,2).map(f => (
                <div key={f.key}>
                  <label className="block text-gray-700 mb-2">{f.label}</label>
                  <input type={f.type} value={formData[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            {fields.slice(2).map(f => (
              <div key={f.key}>
                <label className="block text-gray-700 mb-2">{f.label}</label>
                <input type={f.type} value={formData[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </>
        )}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'} 
        <button type="button" onClick={onSwitch} className="text-blue-600 hover:underline ml-1">
          {isLogin ? 'Regístrate' : 'Inicia sesión'}
        </button>
      </p>
    </div>
  );
};

// Páginas
const HomePage = ({ setCurrentView }) => (
  <div className="space-y-12">
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 text-center">
      <h2 className="text-4xl font-bold mb-4">Bienvenido a Gráfica Santiago</h2>
      <p className="text-xl mb-6">Tu tienda de confianza para artículos de papelería y más</p>
      <button onClick={() => setCurrentView('products')} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
        Ver Productos
      </button>
    </section>
    <section className="grid md:grid-cols-3 gap-8">
      {[{icon: Package, title: 'Envío Rápido', desc: 'Entregas en todo Ecuador'}, {icon: ShoppingCart, title: 'Precios Mayoristas', desc: 'Descuentos especiales'}, {icon: Users, title: 'Atención Personalizada', desc: 'Servicio al cliente 24/7'}].map(({icon: Icon, title, desc}) => (
        <div key={title} className="bg-white p-6 rounded-lg shadow-sm text-center">
          <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600">{desc}</p>
        </div>
      ))}
    </section>
  </div>
);

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(r => r.json())
      .then(d => d.success && setProducts(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Cargando productos...</div>;
  if (products.length === 0) return <div className="text-center py-12">No hay productos disponibles aún.</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Nuestros Productos</h2>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{p.nombre}</h3>
              <p className="text-sm text-gray-600 mb-3">{p.tipo}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">${p.precio?.minorista?.toFixed(2) || '0.00'}</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Agregar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoriesPage = () => (
  <div>
    <h2 className="text-3xl font-bold mb-8">Categorías</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {['Cuadernos', 'Papel', 'Artículos de Oficina', 'Impresión', 'Arte', 'Escolares'].map(cat => (
        <div key={cat} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer text-center">
          <Grid className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">{cat}</h3>
        </div>
      ))}
    </div>
  </div>
);

// App principal
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState(true); // true = login

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppLayout currentView={currentView} setCurrentView={setCurrentView} showAuth={showAuth} setShowAuth={setShowAuth} authMode={authMode} setAuthMode={setAuthMode} />
      </div>
    </AuthProvider>
  );
}

const AppLayout = ({ currentView, setCurrentView, showAuth, setShowAuth, authMode, setAuthMode }) => {
  const { user, isAuthenticated, logout } = useAuth();

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <AuthForm isLogin={authMode} onSuccess={() => setShowAuth(false)} onSwitch={() => setAuthMode(!authMode)} />
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
            <button className="p-2 hover:bg-gray-100 rounded-full"><Search className="w-5 h-5 text-gray-600" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full"><Bell className="w-5 h-5 text-gray-600" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full"><ShoppingCart className="w-5 h-5 text-gray-600" /></button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">Hola, {user?.nombre}</span>
                <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-full"><LogOut className="w-5 h-5 text-gray-600" /></button>
              </div>
            ) : (
              <button onClick={() => { setAuthMode(true); setShowAuth(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
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