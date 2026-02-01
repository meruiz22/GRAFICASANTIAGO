import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { 
  ShoppingCart, Search, BarChart3, LogOut, Grid, DollarSign, 
  Plus, X, User as UserIcon, Users, Menu, ArrowRight, Star, Package,
  Book, StickyNote, PenTool, Briefcase, Monitor, Backpack,
  FileText, Sheet, Truck, CheckCircle, AlertCircle,
  MapPin, Phone, CreditCard, ShieldCheck, Calendar, Lock, Trash2, Edit,
  MessageSquare, Filter, SlidersHorizontal, ChevronDown, Bell, Download,
  Heart, TrendingUp, Award, Zap, ShoppingBag
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Logo } from './components/Logo';

const API_URL = 'http://localhost:3000/api/v1';
const TAX_RATE = 0.15; // 15% IVA
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// ==========================================
// 🎨 ESTILOS CSS INYECTADOS
// ==========================================
const styles = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideInDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.5s ease-out; }
.animate-slideInRight { animation: slideInRight 0.4s ease-out; }
.animate-slideInDown { animation: slideInDown 0.3s ease-out; }
.animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #3b82f6, #06b6d4); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #2563eb, #0891b2); }
`;
if (typeof document !== 'undefined') { const styleSheet = document.createElement("style"); styleSheet.textContent = styles; document.head.appendChild(styleSheet); }

// ==========================================
// 🔔 NOTIFICACIONES
// ==========================================
const NotificationToast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
  if (!message) return null;
  
  const styles = { 
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-300', 
    error: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-300', 
    info: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-300', 
    warning: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-800 border-orange-300' 
  };
  
  const icons = { success: <CheckCircle size={22} className="text-green-600"/>, error: <AlertCircle size={22} className="text-red-600"/>, info: <Truck size={22} className="text-blue-600"/>, warning: <AlertCircle size={22} className="text-orange-600"/> };
  
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 ${styles[type] || styles.info} min-w-[320px] backdrop-blur-sm animate-slideInRight`}>
      {icons[type] || icons.info}
      <div className="flex-1"><h4 className="font-bold text-sm uppercase tracking-wide">{type === 'error' ? 'Error' : 'Notificación'}</h4><p className="text-sm font-medium">{message}</p></div>
      <button onClick={onClose} className="ml-auto opacity-50 hover:opacity-100 transition-opacity hover:scale-110 transform"><X size={18}/></button>
    </div>
  );
};

// ==========================================
// 🎉 FESTIVIDADES
// ==========================================
const FESTIVITIES = [
  { id: 'san_valentin', name: '❤️ San Valentín', start: { month: 0, day: 20 }, end: { month: 1, day: 15 }, keywords: ['regalo', 'amor', 'tarjeta', 'detalle', 'rojo'], color: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-300', banner: '¡Celebra el amor con nuestros detalles especiales!' },
  { id: 'carnaval', name: '🎭 ¡Llegó el Carnaval!', start: { month: 1, day: 16 }, end: { month: 2, day: 5 }, keywords: ['globo', 'agua', 'espuma', 'fiesta', 'carioca', 'pistola'], color: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300', banner: '¡Juega y diviértete! Todo para este Carnaval 🎈💦' },
  { id: 'escolar', name: '🎒 Regreso a Clases', start: { month: 3, day: 1 }, end: { month: 4, day: 30 }, keywords: ['cuaderno', 'escolar', 'lápiz', 'mochila', 'juego geométrico'], color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300', banner: '¡Prepara tu mochila con los mejores útiles!' },
  { id: 'navidad', name: '🎄 Feliz Navidad', start: { month: 11, day: 1 }, end: { month: 11, day: 31 }, keywords: ['navidad', 'regalo', 'juguete', 'adorno'], color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300', banner: 'Los mejores regalos para esta Navidad 🎁' }
];
const useFestivity = () => {
  const today = new Date();
  return FESTIVITIES.find(f => { const start = new Date(today.getFullYear(), f.start.month, f.start.day); const end = new Date(today.getFullYear(), f.end.month, f.end.day); return today >= start && today <= end; }) || null;
};

// ==========================================
// 🔐 CONTEXTO AUTH
// ==========================================
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => { const stored = localStorage.getItem('grafica_user'); if (stored) { const { user, token } = JSON.parse(stored); setUser(user); setToken(token); } setLoading(false); }, []);

  useEffect(() => {
    if (!token) return;
    const fetchNotis = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          if (soundEnabled && data.notifications.length > notifications.length && notifications.length > 0) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
          }
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter(n => !n.leido).length);
        }
      } catch (e) { console.error("Error polling"); }
    };
    fetchNotis();
    const interval = setInterval(fetchNotis, 15000);
    return () => clearInterval(interval);
  }, [token, notifications, soundEnabled]);

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, leido: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await fetch(`${API_URL}/notifications/read/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); } catch {}
  };

  const saveSession = (u, t) => { setUser(u); setToken(t); localStorage.setItem('grafica_user', JSON.stringify({ user: u, token: t })); };
  const login = async (email, password) => { try { const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await res.json(); if (data.success) { saveSession(data.user, data.token); return { success: true }; } return { success: false, message: data.message }; } catch (e) { return { success: false, message: 'Error de conexión' }; } };
  const register = async (userData) => { try { const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }); const data = await res.json(); if (data.success) { saveSession(data.user, data.token); return { success: true }; } return { success: false, message: data.message }; } catch (e) { return { success: false, message: 'Error de conexión' }; } };
  const logout = () => { setUser(null); setToken(null); localStorage.removeItem('grafica_user'); window.location.href = "/"; };
  const updateProfile = async (d) => { try { const r = await fetch(`${API_URL}/me/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(d) }); const dt = await r.json(); if(dt.success) { saveSession(dt.user, token); return { success: true }; } return { success: false, message: dt.message }; } catch { return { success: false, message: "Error" }; } };
  
  return <AuthContext.Provider value={{ user, token, login, register, updateProfile, logout, isAuthenticated: !!user, loading, notifications, unreadCount, markAsRead, soundEnabled, setSoundEnabled }}>{children}</AuthContext.Provider>;
};

// ==========================================
// 🎨 UI HELPERS
// ==========================================
const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const vars = { 
    primary: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl", 
    secondary: "bg-white text-blue-900 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50", 
    dark: "bg-gradient-to-r from-blue-900 to-blue-800 text-white hover:from-blue-800 hover:to-blue-700 shadow-lg hover:shadow-xl", 
    danger: "bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 border-2 border-red-200" 
  };
  return <button onClick={onClick} className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 hover:scale-105 transform ${vars[variant]} ${className}`} {...props}>{children}</button>;
};

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wide">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />}
      <input className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white hover:border-gray-300`} {...props} />
    </div>
  </div>
);

const getCategoryIcon = (n) => { const x = n.toLowerCase(); if(x.includes('cuaderno')) return Book; if(x.includes('papel')) return StickyNote; if(x.includes('escritura') || x.includes('bolígrafo')) return PenTool; if(x.includes('oficina')) return Briefcase; if(x.includes('tecno') || x.includes('comput')) return Monitor; if(x.includes('escolar')) return Backpack; return Package; };

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, soundEnabled, setSoundEnabled } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useEffect(() => { const handleClickOutside = (event) => { if (ref.current && !ref.current.contains(event.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-full group transition-all duration-300 hover:scale-110 transform">
        <Bell size={22} className={`text-gray-600 group-hover:text-blue-900 transition-colors ${unreadCount > 0 ? 'animate-bounce text-blue-900' : ''}`} />
        {unreadCount > 0 && <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold animate-pulse">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50 animate-slideInDown">
          <div className="p-5 border-b-2 flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50">
            <h4 className="font-black text-gray-800 flex items-center gap-2"><Bell size={18} className="text-blue-600"/> Notificaciones</h4>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white transition-all">{soundEnabled ? '🔊 On' : '🔇 Off'}</button>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? <div className="p-10 text-center"><Bell size={48} className="mx-auto text-gray-300 mb-3"/><p className="text-gray-400 text-sm font-medium">No tienes notificaciones nuevas</p></div> : notifications.map(n => (
              <div key={n._id} onClick={() => markAsRead(n._id)} className={`p-4 border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer transition-all ${!n.leido ? 'bg-blue-50/70' : ''}`}>
                <div className="flex gap-3"><div className={`w-2.5 h-2.5 mt-2 rounded-full ${n.tipo === 'warning' ? 'bg-orange-500' : n.tipo === 'success' ? 'bg-green-500' : 'bg-blue-500'} ${!n.leido ? 'animate-pulse' : ''}`}></div><div className="flex-1"><p className={`text-sm ${!n.leido ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.mensaje}</p><p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(n.fecha).toLocaleDateString()} - {new Date(n.fecha).toLocaleTimeString()}</p></div></div></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// VISTAS PRINCIPALES (Home, Auth, ProductList)
// ==========================================

const AuthScreen = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', apellido: '' });
  const { login, register } = useAuth();
  const handleSubmit = async (e) => { e.preventDefault(); const res = isLogin ? await login(formData.email, formData.password) : await register(formData); if (res.success) { if(onSuccess) onSuccess(); onClose(); } else alert(res.message); };
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/95 via-cyan-900/95 to-blue-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md relative shadow-2xl border-4 border-blue-100 animate-scaleIn">
        <button onClick={onClose} className="absolute top-5 right-5 p-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-full transition-all hover:scale-110 transform"><X className="text-gray-400 hover:text-red-500"/></button>
        <div className="text-center mb-10"><div className="flex justify-center mb-6"><Logo className="h-24 drop-shadow-lg"/></div><h2 className="text-3xl font-black text-gray-900">{isLogin ? '👋 Bienvenido de nuevo' : '✨ Crear Cuenta Nueva'}</h2><p className="text-gray-500 mt-2 font-medium">{isLogin ? 'Ingresa tus credenciales' : 'Completa tus datos'}</p></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && <div className="grid grid-cols-2 gap-4"><Input placeholder="Nombre" icon={UserIcon} onChange={e => setFormData({...formData, nombre: e.target.value})} required /><Input placeholder="Apellido" onChange={e => setFormData({...formData, apellido: e.target.value})} required /></div>}
          <Input type="email" placeholder="Correo electrónico" icon={CreditCard} onChange={e => setFormData({...formData, email: e.target.value})} required /><Input type="password" placeholder="Contraseña" icon={Lock} onChange={e => setFormData({...formData, password: e.target.value})} required />
          <Button type="submit" className="w-full mt-6 py-4 text-lg" variant="dark">{isLogin ? '🚀 Ingresar' : '✨ Registrarse'}</Button>
        </form>
        <p className="text-center mt-8 text-sm text-gray-600">{isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}<button onClick={() => setIsLogin(!isLogin)} className="ml-2 font-black text-blue-600 hover:text-blue-700 hover:underline transition-colors">{isLogin ? 'Regístrate aquí' : 'Ingresa aquí'}</button></p>
      </div>
    </div>
  );
};

const Home = ({ setView, onCategorySelect, addToCart }) => {
  const [categories, setCategories] = useState([]);
  const [festiveProducts, setFestiveProducts] = useState([]);
  const activeFestivity = useFestivity();
  useEffect(() => {
    fetch(`${API_URL}/categories`).then(res => res.json()).then(data => { if(data.success) setCategories(data.categories); });
    if (activeFestivity) { fetch(`${API_URL}/products?keyword=${activeFestivity.keywords[0]}`).then(res => res.json()).then(data => { if(data.success) setFestiveProducts(data.products.slice(0, 4)); }); }
  }, []);
  return (
    <div className="animate-fadeIn space-y-16">
      {activeFestivity && (
        <div className={`p-8 rounded-[2rem] border-3 ${activeFestivity.color} flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm`}>
          <div className="flex items-center gap-6"><div className="text-6xl animate-bounce">{activeFestivity.name.split(' ')[0]}</div><div><h3 className="text-2xl font-black uppercase tracking-tight">{activeFestivity.name}</h3><p className="font-bold opacity-90 mt-1">{activeFestivity.banner}</p></div></div>
          <Button onClick={() => onCategorySelect(null)} className="bg-white/80 border-0 shadow-lg text-current hover:bg-white">Ver Ofertas <ArrowRight size={20}/></Button>
        </div>
      )}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 text-white rounded-[3rem] p-16 md:p-28 text-center shadow-2xl">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div><div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse delay-1000"></div></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-blue-900 px-6 py-2 rounded-full text-sm font-black mb-8 shadow-lg animate-bounce"><Zap size={18}/><span>NUEVO 2026</span></div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">Calidad que imprime <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">éxito.</span></h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 font-medium max-w-2xl mx-auto">Descubre los mejores productos de papelería y útiles escolares</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center"><Button onClick={() => setView('products')} variant="primary" className="px-10 py-5 text-lg shadow-2xl hover:shadow-yellow-400/50"><ShoppingBag size={22}/> Ver Catálogo</Button><Button variant="secondary" className="px-10 py-5 text-lg"><Award size={22}/> Ofertas Especiales</Button></div>
        </div>
      </div>
      {activeFestivity && festiveProducts.length > 0 && (
        <div className="animate-fadeIn">
          <div className="flex items-center justify-between mb-8"><h2 className="text-3xl font-black text-gray-900 flex items-center gap-3"><TrendingUp className="text-purple-600" size={32}/> Especial de {activeFestivity.name}</h2><Button variant="secondary" className="text-sm">Ver Todos <ArrowRight size={16}/></Button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {festiveProducts.map(p => (
              <div key={p._id} className="bg-white border-2 border-gray-100 p-5 rounded-3xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-4 relative"><img src={p.imagenes?.[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/><span className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">DESTACADO</span></div>
                <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">{p.nombre}</h4>
                <div className="flex justify-between items-center mt-3"><span className="font-black text-xl text-purple-600">${p.precio.minorista}</span><button onClick={() => addToCart(p)} className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-xl hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all shadow-md hover:shadow-lg transform hover:scale-110"><ShoppingCart size={18}/></button></div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="animate-fadeIn">
        <h2 className="text-3xl font-black mb-8 text-gray-900 flex items-center gap-3"><Grid className="text-blue-600" size={32}/> Categorías Destacadas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">{categories.map(cat => { const Icon = getCategoryIcon(cat); return (<button key={cat} onClick={() => onCategorySelect(cat)} className="bg-white p-8 rounded-3xl shadow-md border-2 border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 group text-center flex flex-col items-center gap-4 hover:-translate-y-2 transform"><div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-cyan-600 transition-all shadow-md group-hover:shadow-xl group-hover:scale-110 transform"><Icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors"/></div><h3 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{cat}</h3></button>); })}</div>
      </div>
    </div>
  );
};

const ProductList = ({ addToCart, selectedCategory, searchTerm, openProductModal }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOption, setSortOption] = useState('default');
  const [localCategory, setLocalCategory] = useState(selectedCategory || 'Todas');
  const [showFilters, setShowFilters] = useState(false);
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&q=80";

  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/products?limit=1000`;
    if(searchTerm) url += `&keyword=${searchTerm}`;
    fetch(url).then(res => res.json()).then(data => { if(data.success) { setProducts(data.products); setFilteredProducts(data.products); } setLoading(false); }).catch(() => setLoading(false));
  }, [searchTerm]);

  useEffect(() => { if(selectedCategory) setLocalCategory(selectedCategory); }, [selectedCategory]);

  useEffect(() => {
    let result = [...products];
    if (localCategory && localCategory !== 'Todas') { result = result.filter(p => p.categoria === localCategory); }
    if (priceRange.min) result = result.filter(p => p.precio.minorista >= Number(priceRange.min));
    if (priceRange.max) result = result.filter(p => p.precio.minorista <= Number(priceRange.max));
    if (sortOption === 'price-asc') result.sort((a, b) => a.precio.minorista - b.precio.minorista);
    else if (sortOption === 'price-desc') result.sort((a, b) => b.precio.minorista - a.precio.minorista);
    else if (sortOption === 'alpha') result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    setFilteredProducts(result);
  }, [products, priceRange, sortOption, localCategory]);

  const uniqueCategories = ['Todas', ...new Set(products.map(p => p.categoria))].sort();
  if(loading) return <div className="text-center py-32"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600 font-bold">Cargando catálogo...</p></div>;

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div><h2 className="text-4xl font-black text-gray-900 mb-2">Catálogo Completo</h2><p className="text-gray-500 font-medium flex items-center gap-2"><Package size={18}/> {filteredProducts.length} productos disponibles</p></div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"><Filter size={18}/> Filtros</button>
          <div className="relative group min-w-[200px]"><select className="appearance-none w-full bg-white border-2 border-gray-200 px-5 py-3 pr-10 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none cursor-pointer shadow-md hover:shadow-lg transition-all" value={sortOption} onChange={(e) => setSortOption(e.target.value)}><option value="default">🔥 Relevancia</option><option value="price-asc">💰 Precio: Menor a Mayor</option><option value="price-desc">💎 Precio: Mayor a Menor</option><option value="alpha">🔤 Nombre: A - Z</option></select><ChevronDown size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-600 transition-colors"/></div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className={`md:w-72 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
            <h3 className="font-black text-gray-800 mb-5 flex items-center gap-3 text-sm uppercase tracking-wide"><div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md"><DollarSign size={20} className="text-white"/></div> Rango de Precio</h3>
            <div className="flex items-center gap-3 mb-4"><input type="number" placeholder="Min" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all font-bold" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}/><span className="text-gray-400 font-bold">-</span><input type="number" placeholder="Max" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all font-bold" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}/></div>
            {(priceRange.min || priceRange.max) && (<button onClick={() => setPriceRange({min:'', max:''})} className="text-xs text-red-500 hover:text-red-700 hover:underline font-bold w-full text-right transition-colors">✖ Limpiar precio</button>)}
          </div>
          <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all"><h3 className="font-black text-gray-800 mb-5 flex items-center gap-3 text-sm uppercase tracking-wide"><div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md"><Grid size={20} className="text-white"/></div> Categorías</h3><ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">{uniqueCategories.map(cat => (<li key={cat}><button onClick={() => setLocalCategory(cat)} className={`w-full text-left text-sm py-3 px-4 rounded-xl transition-all font-bold ${localCategory === cat ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105 transform' : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700'}`}>{cat}</button></li>))}</ul></div>
        </aside>
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredProducts.map(p => (
                <div key={p._id} onClick={() => openProductModal(p)} className="bg-white rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full cursor-pointer relative hover:-translate-y-3 transform">
                  <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    <img src={(p.imagenes?.[0]?.url && !p.imagenes[0].url.startsWith('data:')) ? p.imagenes[0].url : FALLBACK_IMAGE} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} />
                    {p.stock <= 5 && <span className="absolute bottom-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">¡Últimos {p.stock}!</span>}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 transform"><Heart size={20} className="text-red-500"/></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2"><div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(p.ratingPromedio || 0) ? "currentColor" : "none"} className="drop-shadow-sm" />)}</div><span className="text-xs text-gray-500 font-bold">({p.numResenas || 0})</span></div>
                    <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2 text-base group-hover:text-blue-600 transition-colors">{p.nombre}</h3>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-gray-50"><div><p className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1">Precio</p><span className="text-2xl font-black text-blue-900">${p.precio?.minorista?.toFixed(2)}</span></div><button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3.5 rounded-2xl hover:from-yellow-400 hover:to-orange-400 hover:text-blue-900 transition-all shadow-lg hover:shadow-xl active:scale-90 transform hover:scale-110"><ShoppingCart size={20}/></button></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (<div className="flex flex-col items-center justify-center py-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300 text-center"><div className="bg-white p-8 rounded-3xl mb-6 shadow-xl"><SlidersHorizontal size={64} className="text-gray-300"/></div><h3 className="text-2xl font-black text-gray-900 mb-2">No hay resultados</h3><p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">No encontramos productos que coincidan con tus filtros.</p><button onClick={() => {setPriceRange({min:'',max:''}); setLocalCategory('Todas'); setSortOption('default');}} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105 transform">🔄 Limpiar todos los filtros</button></div>)}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTES MODALES Y ADMIN (Estilizados y Funcionales)
// ==========================================

const CheckoutModal = ({ cart, user, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [formData, setFormData] = useState({ cedula: user.cedulaRuc || '', telefono: user.telefono || '', direccion: user.direcciones?.[0]?.calle || '', ciudad: user.direcciones?.[0]?.ciudad || 'Loja', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' });

  const subtotal = cart.reduce((acc, item) => acc + (item.precio.minorista * item.quantity), 0);
  const iva = subtotal * TAX_RATE;
  const total = subtotal + iva;

  const handleSubmit = (e) => { e.preventDefault(); if (step === 1) { if (!formData.cedula || !formData.telefono || !formData.direccion) return; setStep(2); } else { onConfirm({ ...formData, paymentMethod }); } };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fadeIn">
      <div className="bg-[#f5f5f5] w-full max-w-lg md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-scaleIn">
        <div className="bg-white p-6 flex justify-between items-center border-b"><h3 className="font-black text-xl flex items-center gap-2"><ShieldCheck className="text-green-500"/> Checkout Seguro</h3><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X/></button></div>
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-1 font-medium"><span>Subtotal (Base Imponible)</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium"><span>IVA (15%)</span><span>{formatCurrency(iva)}</span></div>
              <div className="flex justify-between text-xl font-black text-blue-900 border-t pt-3 mt-2"><span>Total a Pagar</span><span>{formatCurrency(total)}</span></div>
          </div>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide"><MapPin size={18} className="text-blue-900"/> Datos de Facturación</h4>
                  <div className="grid grid-cols-2 gap-4"><div className="col-span-2"><Input label="Cédula / RUC" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} required /></div><div className="col-span-2"><Input label="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} required /></div><div className="col-span-2"><textarea rows="2" placeholder="Dirección de Envío" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none transition-all" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} required /></div><Input placeholder="Ciudad" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} /></div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide"><CreditCard size={18} className="text-blue-900"/> Método de Pago</h4>
                  <div className="grid grid-cols-3 gap-3 mb-6">{['tarjeta', 'transferencia', 'efectivo'].map(m => (<button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`py-3 px-2 rounded-xl text-xs font-bold border-2 capitalize transition-all ${paymentMethod === m ? 'bg-blue-900 text-white border-blue-900 shadow-md transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>{m}</button>))}</div>
                  {paymentMethod === 'tarjeta' && (<div className="space-y-4 animate-fadeIn"><div className="p-5 bg-gradient-to-br from-gray-800 to-black rounded-2xl text-white shadow-xl mb-4"><div className="flex justify-between mb-8"><span className="text-xs opacity-70 tracking-widest uppercase">Credit Card</span><span className="font-bold italic text-lg">VISA</span></div><div className="text-2xl tracking-widest mb-4 font-mono">{formData.cardNumber || '•••• •••• •••• ••••'}</div></div><Input placeholder="Número de Tarjeta" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} maxLength="19" required/><div className="grid grid-cols-2 gap-4"><Input placeholder="MM/YY" value={formData.cardExpiry} onChange={e => setFormData({...formData, cardExpiry: e.target.value})} maxLength="5" required/><Input type="password" placeholder="CVV" value={formData.cardCvv} onChange={e => setFormData({...formData, cardCvv: e.target.value})} maxLength="3" required/></div></div>)}
                  {paymentMethod === 'transferencia' && (<div className="p-5 bg-blue-50 rounded-2xl text-sm text-blue-900 border-2 border-blue-100 animate-fadeIn"><p className="font-bold text-lg mb-2">Banco Pichincha</p><p>Cuenta Corriente: <span className="font-mono font-bold">2100456789</span></p><p>RUC: <span className="font-mono font-bold">1104567890001</span></p><p className="mt-4 text-xs font-bold bg-blue-100 p-2 rounded-lg text-center">Sube tu comprobante después de confirmar.</p></div>)}
                  {paymentMethod === 'efectivo' && (<div className="p-5 bg-green-50 rounded-2xl text-sm text-green-900 border-2 border-green-100 animate-fadeIn text-center"><Truck size={48} className="mx-auto text-green-600 mb-2"/><p className="font-bold text-lg">Pago Contra Entrega</p><p>Paga al recibir tu pedido en la dirección indicada.</p></div>)}
              </div>
            )}
          </form>
        </div>
        <div className="bg-white p-6 border-t safe-area-bottom"><button type="submit" form="checkout-form" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-black py-4 rounded-xl shadow-lg text-lg flex items-center justify-center gap-2 transform transition-transform hover:scale-[1.02]">{step === 1 ? <>Continuar <ArrowRight/></> : <>Confirmar Pago <CheckCircle/></>}</button></div>
      </div>
    </div>
  );
};

const Cart = ({ cart, removeFromCart, setView, setShowAuth, notify }) => {
  const { token, user, updateProfile } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const subtotal = cart.reduce((acc, item) => acc + (item.precio.minorista * item.quantity), 0);
  const iva = subtotal * TAX_RATE;
  const total = subtotal + iva;

  const handlePlaceOrder = async (data) => {
    if (!token) return notify('Sesión expirada', 'error');
    await updateProfile({ telefono: data.telefono, cedulaRuc: data.cedula });
    const orderData = { orderItems: cart.map(i => ({ product: i._id, nombre: i.nombre, cantidad: i.quantity, precio: i.precio.minorista, imagen: i.imagenes?.[0]?.url })), shippingInfo: { direccion: data.direccion, ciudad: data.ciudad, telefono: data.telefono }, paymentInfo: { method: data.paymentMethod, status: data.paymentMethod === 'tarjeta' ? 'Pagado' : 'Pendiente' }, itemsPrice: subtotal, taxPrice: iva, totalPrice: total };
    try { const res = await fetch(`${API_URL}/order/new`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(orderData) }); const resData = await res.json(); if (resData.success) { setShowCheckout(false); notify('🎉 ¡Pedido realizado!', 'success'); setTimeout(() => window.location.reload(), 2000); } else { notify(`Error: ${resData.message}`, 'error'); } } catch(e) { notify('Error de conexión', 'error'); }
  };

  if(cart.length === 0) return <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-200"><ShoppingBag className="mx-auto text-gray-300 mb-6" size={64}/><h3 className="text-2xl font-bold text-gray-900">Tu carrito está vacío</h3><p className="text-gray-500 mt-2">¡Explora nuestro catálogo y llénalo de cosas increíbles!</p></div>;
  
  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
        <h2 className="text-4xl font-black mb-10 text-gray-900">Carrito de Compras</h2>
        <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-6">
                {cart.map(item => (
                    <div key={item._id} className="bg-white p-5 rounded-3xl flex items-center gap-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                        <img src={item.imagenes?.[0]?.url} className="w-24 h-24 rounded-2xl object-cover bg-gray-50 shadow-sm"/>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{item.nombre}</h4>
                            <p className="text-sm text-gray-500 font-medium mt-1">{formatCurrency(item.precio.minorista)} x {item.quantity}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-xl text-blue-900">{formatCurrency(item.precio.minorista * item.quantity)}</p>
                            <button onClick={() => removeFromCart(item._id)} className="text-red-500 text-xs font-bold hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg mt-2 transition-colors">Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] h-fit shadow-xl border-2 border-gray-100 sticky top-24">
                <h3 className="font-bold text-xl mb-6">Resumen del Pedido</h3>
                <div className="space-y-3 mb-8 border-b pb-6">
                    <div className="flex justify-between text-gray-600 font-medium"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between text-gray-600 font-medium"><span>IVA (15%)</span><span>{formatCurrency(iva)}</span></div>
                </div>
                <div className="flex justify-between text-3xl font-black text-blue-900 mb-8"><span>Total</span><span>{formatCurrency(total)}</span></div>
                <Button onClick={() => { if(!user) { notify("Inicia sesión para continuar", "info"); setShowAuth(true); return; } setShowCheckout(true); }} className="w-full py-5 text-xl shadow-xl hover:shadow-yellow-400/50">Comprar Ahora</Button>
            </div>
        </div>
        {showCheckout && <CheckoutModal cart={cart} user={user} onClose={() => setShowCheckout(false)} onConfirm={handlePlaceOrder} />}
    </div>
  );
};

const RoleConfirmModal = ({ isOpen, onClose, onConfirm, targetUser, newRole }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    if (!isOpen) return null;
    const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); await onConfirm(password); setLoading(false); setPassword(''); };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative animate-scaleIn">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
                <div className="text-center mb-6"><div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} /></div><h3 className="text-xl font-bold text-gray-900">Confirmar Cambio</h3><p className="text-sm text-gray-500 mt-2">Estás cambiando a <span className="font-bold text-gray-800">{targetUser?.nombre}</span> al rol de <span className="font-bold uppercase text-blue-600">{newRole}</span>.</p></div>
                <form onSubmit={handleSubmit}><div className="mb-6"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ingresa tu contraseña de Admin:</label><input type="password" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 outline-none transition" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus /></div><div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button><button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-lg disabled:opacity-70 transition">{loading ? '...' : 'Confirmar'}</button></div></form>
            </div>
        </div>
    );
};

const AdminPanel = ({ token, userRole, notify }) => {
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]); 
    const [viewMode, setViewMode] = useState('list');
    const [showUserModal, setShowUserModal] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState(null);
    const [pendingRole, setPendingRole] = useState('');
    const [products, setProducts] = useState([]);

    const generatePDF = () => {
        const doc = new jsPDF(); doc.text("Reporte General - Grafica Santiago", 14, 15); doc.setFontSize(10); doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 22); doc.text("Sistema Compatible: MatrixPort / Dobra", 14, 27);
        const tableColumn = ["ID", "Fecha", "Cliente", "Método", "Subtotal", "IVA 15%", "Total", "Estado"];
        const tableRows = []; orders.forEach(o => { tableRows.push([o._id.slice(-6).toUpperCase(), new Date(o.createdAt).toLocaleDateString(), `${o.user?.nombre} ${o.user?.apellido}`, o.paymentInfo?.method || 'N/A', formatCurrency(o.itemsPrice||0), formatCurrency(o.taxPrice||0), formatCurrency(o.totalPrice||0), o.orderStatus]); });
        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 35 }); doc.save("reporte_pedidos.pdf"); notify("PDF generado", "success");
    };

    const refreshData = async () => {
        try {
            const prodRes = await fetch(`${API_URL}/products?limit=0`); const prodData = await prodRes.json(); if(prodData.success) setProducts(prodData.products);
            const ordRes = await fetch(`${API_URL}/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } }); const ordData = await ordRes.json(); if(ordData.success) setOrders(ordData.orders);
            if (userRole === 'admin') {
                const repRes = await fetch(`${API_URL}/reports/summary`, { headers: { 'Authorization': `Bearer ${token}` } }); const repData = await repRes.json(); if(repData.success) setStats(repData.summary);
                const userRes = await fetch(`${API_URL}/auth/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }); if (userRes.ok) { const userData = await userRes.json(); setUsers(userData.users); }
            }
        } catch (error) { notify("Error cargando panel", "error"); }
    };
    useEffect(() => { refreshData(); }, [userRole]);

    const handleStatusChange = async (id, status) => { try { await fetch(`${API_URL}/admin/order/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) }); notify(`Pedido actualizado: ${status}`, 'success'); refreshData(); } catch { notify('Error actualizando', 'error'); } };
    const initiateRoleChange = (user, newRole) => { setTargetUser(user); setPendingRole(newRole); setRoleModalOpen(true); };
    const confirmRoleChange = async (adminPassword) => { try { const res = await fetch(`${API_URL}/auth/admin/user/${targetUser._id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ role: pendingRole, adminPassword }) }); const data = await res.json(); if(res.ok) { notify('Rol actualizado', 'success'); setRoleModalOpen(false); refreshData(); } else { notify(data.message, 'error'); } } catch { notify('Error de conexión', 'error'); } };
    const handleDeleteUser = async (userId) => { if(!confirm("⚠️ ¿Eliminar usuario permanentemente?")) return; try { const res = await fetch(`${API_URL}/auth/admin/user/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if(res.ok) { notify('Usuario eliminado', 'success'); refreshData(); } } catch { notify('Error de conexión', 'error'); } };
    const exportToExcel = () => { const wb = XLSX.utils.book_new(); const ws = XLSX.utils.json_to_sheet(products); XLSX.utils.book_append_sheet(wb, ws, "Inventario"); XLSX.writeFile(wb, "Reporte.xlsx"); };

    const StatCard = ({ title, value, icon: Icon, color }) => (<div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4"><div className={`${color} p-4 rounded-2xl text-white shadow-lg`}><Icon size={24} /></div><div><p className="text-gray-500 text-sm font-medium uppercase">{title}</p><h4 className="text-2xl font-black text-gray-900">{value}</h4></div></div>);

    const ProductForm = ({ token, onCancel, onSuccess }) => {
        const [formData, setFormData] = useState({ nombre: '', descripcion: '', precioMinorista: '', precioMayorista: '', stock: '', categoria: 'Papelería', imagenUrl: '' });
        const handleSubmit = async (e) => { e.preventDefault(); try { const body = { nombre: formData.nombre, descripcion: formData.descripcion, precio: { minorista: Number(formData.precioMinorista), mayorista: Number(formData.precioMayorista) }, stock: Number(formData.stock), categoria: formData.categoria, imagenes: [{ url: formData.imagenUrl || 'https://via.placeholder.com/300' }] }; const res = await fetch(`${API_URL}/admin/product/new`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) }); const data = await res.json(); if (data.success) { alert('✅ Creado'); onSuccess(); } } catch { alert('Error'); } };
        return (<div className="bg-white p-8 rounded-3xl shadow-lg max-w-2xl mx-auto"><h2 className="text-2xl font-bold mb-6">Nuevo Producto</h2><form onSubmit={handleSubmit} className="space-y-4"><Input placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /><Input placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required /><div className="grid grid-cols-2 gap-4"><Input type="number" placeholder="Precio ($)" value={formData.precioMinorista} onChange={e => setFormData({...formData, precioMinorista: e.target.value})} required /><Input type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required /></div><Input placeholder="URL Imagen" value={formData.imagenUrl} onChange={e => setFormData({...formData, imagenUrl: e.target.value})} /><div className="flex justify-end gap-3 mt-6"><Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button><Button type="submit">Guardar</Button></div></form></div>);
    };

    if (viewMode === 'addProduct') return <ProductForm token={token} onCancel={() => setViewMode('list')} onSuccess={() => {setViewMode('list'); refreshData();}} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center"><h2 className="text-3xl font-bold">{userRole === 'bodega' ? '📦 Panel de Bodega' : '📊 Admin & Contabilidad'}</h2><div className="flex gap-2">{userRole === 'admin' && <><button onClick={generatePDF} className="px-4 py-2 bg-red-600 text-white rounded-lg flex gap-2 items-center hover:bg-red-700 transition shadow-lg"><Download size={18}/> PDF</button><button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg flex gap-2 items-center hover:bg-green-700 transition"><Sheet size={18}/> Excel</button></>}<Button onClick={() => setViewMode('addProduct')}><Plus size={18}/> Nuevo Producto</Button></div></div>
            {userRole === 'admin' && (<div className="flex gap-4 border-b pb-2 overflow-x-auto">{['dashboard', 'orders', 'products', 'users'].map(tab => (<button key={tab} onClick={()=>setActiveTab(tab)} className={`px-4 py-2 font-bold capitalize ${activeTab===tab?'text-blue-900 border-b-2 border-blue-900':''}`}>{tab}</button>))}</div>)}
            {activeTab === 'dashboard' && stats && (<div className="grid grid-cols-1 md:grid-cols-4 gap-6"><StatCard title="Ventas Totales" value={formatCurrency(stats.totalSales)} icon={DollarSign} color="bg-emerald-500" /><StatCard title="Total Pedidos" value={stats.ordersCount} icon={Package} color="bg-blue-500" /><StatCard title="Usuarios" value={stats.usersCount} icon={Users} color="bg-purple-500" /><StatCard title="Productos" value={stats.productsCount} icon={Grid} color="bg-orange-500" /></div>)}
            {activeTab === 'orders' && (<div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-auto max-h-96"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 sticky top-0"><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{orders.map(o => (<tr key={o._id} className="border-b hover:bg-gray-50"><td className="p-3 font-mono text-xs">{o._id.slice(-6).toUpperCase()}<br/>{new Date(o.createdAt).toLocaleDateString()}</td><td className="p-3">{o.user?.nombre}</td><td className="p-3 font-bold text-green-700">{formatCurrency(o.totalPrice)}</td><td className="p-3 capitalize">{o.paymentInfo?.method || 'N/A'}</td><td className="p-3"><select value={o.orderStatus} onChange={(e) => handleStatusChange(o._id, e.target.value)} className={`border rounded p-1 text-xs font-bold ${o.orderStatus==='Entregado'?'text-green-600 bg-green-50':o.orderStatus==='Enviado'?'text-blue-600 bg-blue-50':'text-yellow-600 bg-yellow-50'}`}><option value="Procesando">Procesando</option><option value="Enviado">Enviado</option><option value="Entregado">Entregado</option></select></td><td className="p-3"><button className="text-gray-400 hover:text-blue-600"><FileText size={18}/></button></td></tr>))}</tbody></table></div>)}
            {activeTab === 'users' && userRole === 'admin' && (<div className="space-y-4"><div className="flex justify-end"><Button onClick={() => setShowUserModal(true)} variant="secondary"><Plus size={16}/> Crear Usuario</Button></div><div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-auto max-h-96"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 sticky top-0"><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>{users.map(u => (<tr key={u._id} className="border-b hover:bg-gray-50"><td className="p-3 font-bold">{u.nombre}</td><td className="p-3 text-gray-500">{u.email}</td><td className="p-3"><select value={u.role} onChange={(e) => initiateRoleChange(u, e.target.value)} className="border rounded p-1 text-xs"><option value="user">Usuario</option><option value="bodega">Bodega</option><option value="admin">Admin</option></select></td><td className="p-3"><button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div></div>)}
            {(activeTab === 'products' || userRole === 'bodega') && (<div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-auto max-h-96"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 sticky top-0"><tr><th>Producto</th><th>Cat</th><th>Stock</th></tr></thead><tbody>{products.map(p => (<tr key={p._id} className="border-b hover:bg-gray-50"><td className="p-3 font-medium">{p.nombre}</td><td className="p-3 text-gray-500 text-xs">{p.categoria}</td><td className={`p-3 font-bold ${p.stock<5?'text-red-500':'text-green-600'}`}>{p.stock}</td></tr>))}</tbody></table></div>)}
            {showUserModal && <UserFormModal onClose={() => setShowUserModal(false)} onSuccess={() => { notify('Usuario creado', 'success'); refreshData(); }} />}
            <RoleConfirmModal isOpen={roleModalOpen} onClose={() => { setRoleModalOpen(false); refreshData(); }} onConfirm={confirmRoleChange} targetUser={targetUser} newRole={pendingRole} />
        </div>
    );
};

const OrderHistory = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    useEffect(() => { fetch(`${API_URL}/orders/me`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => { if (data.success) setOrders(data.orders); }); }, [token]);
    return <div className="max-w-4xl mx-auto animate-fadeIn"><h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Package className="text-blue-900"/> Mis Pedidos</h2>{orders.length===0?<div className="text-center py-20 bg-white rounded-3xl border border-dashed"><p className="text-gray-500">Sin compras.</p></div>:<div className="space-y-6">{orders.map(o=>(<div key={o._id} className="bg-white p-6 rounded-3xl shadow-sm border"><div className="flex justify-between items-center mb-4 pb-4 border-b"><div><span className={`px-3 py-1 rounded-full text-xs font-bold border ${o.orderStatus==='Entregado'?'bg-green-50 text-green-700':o.orderStatus==='Enviado'?'bg-blue-50 text-blue-700':'bg-yellow-50 text-yellow-700'}`}>{o.orderStatus}</span><p className="text-xs text-gray-400 mt-2">ID: {o._id}</p></div><div className="text-right"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-black text-blue-900">{formatCurrency(o.totalPrice)}</p></div></div><div className="space-y-3">{o.orderItems.map((i,k)=>(<div key={k} className="flex items-center gap-4"><div className="flex-1"><p className="font-bold text-sm">{i.nombre}</p><p className="text-xs text-gray-500">{i.cantidad} x {formatCurrency(i.precio)}</p></div></div>))}</div></div>))}</div>}</div>;
};

const ProductDetailModal = ({ product, onClose, addToCart, user, token, notify }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState(product.reviews || []);
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&q=80";

  const submitReview = async (e) => {
    e.preventDefault(); if (!token) return notify('Inicia sesión para opinar', 'info'); if (rating === 0) return notify('Selecciona una calificación', 'error');
    try { const res = await fetch(`${API_URL}/review`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ rating, comment, productId: product._id }) }); if (res.ok) { notify('¡Gracias por tu opinión!', 'success'); setReviews([...reviews, { user: user._id, nombre: user.nombre, rating, comentario: comment }]); setComment(''); setRating(0); } else notify('Error al guardar reseña', 'error'); } catch { notify('Error de conexión', 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-scaleIn">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition"><X size={20}/></button>
        <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8"><img src={product.imagenes?.[0]?.url && !product.imagenes[0].url.startsWith('data:') ? product.imagenes[0].url : FALLBACK_IMAGE} className="max-h-80 object-contain drop-shadow-xl hover:scale-105 transition duration-500" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} /></div>
        <div className="md:w-1/2 p-8 overflow-y-auto">
          <div className="mb-6"><span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase">{product.categoria}</span><h2 className="text-3xl font-black text-gray-900 mt-2 leading-tight">{product.nombre}</h2><div className="flex items-center gap-2 mt-2"><div className="flex text-yellow-400">{[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= (product.ratingPromedio || 0) ? "currentColor" : "none"} />)}</div><span className="text-sm text-gray-500">({product.numResenas || 0} opiniones)</span></div><p className="text-3xl font-black text-[var(--color-gs-blue)] mt-4">${product.precio?.minorista?.toFixed(2)}</p><Button onClick={() => { addToCart(product); onClose(); }} className="w-full mt-4 py-4 text-lg shadow-lg shadow-yellow-200"><ShoppingCart size={20}/> Agregar al Carrito</Button></div>
          <div className="border-t pt-6"><h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare size={20}/> Opiniones</h3>{user ? (<form onSubmit={submitReview} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100"><p className="text-xs font-bold uppercase text-gray-500 mb-2">Tu Calificación:</p><div className="flex gap-1 mb-3">{[1,2,3,4,5].map(star => (<button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="focus:outline-none transition transform hover:scale-110"><Star size={24} className={star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} /></button>))}</div><textarea className="w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none" rows="2" placeholder="¿Qué te pareció el producto?" value={comment} onChange={e => setComment(e.target.value)} required /><button type="submit" className="mt-2 text-xs font-bold bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800">Publicar</button></form>) : <p className="text-sm text-gray-500 mb-4 italic bg-gray-50 p-3 rounded-lg text-center">Inicia sesión para dejar una reseña.</p>}<div className="space-y-4">{reviews.length > 0 ? reviews.map((r, i) => (<div key={i} className="border-b pb-4 last:border-0"><div className="flex justify-between items-start"><p className="font-bold text-sm text-gray-800">{r.nombre}</p><div className="flex text-yellow-400">{[...Array(5)].map((_,x) => <Star key={x} size={12} fill={x < r.rating ? "currentColor" : "none"}/>)}</div></div><p className="text-sm text-gray-600 mt-1">{r.comentario}</p></div>)) : <p className="text-sm text-gray-400 text-center py-4">Sé el primero en opinar ⭐</p>}</div></div>
        </div>
      </div>
    </div>
  );
};

const AppContent = ({ view, setView, showAuth, setShowAuth, cart, addToCart, removeFromCart, searchTerm, setSearchTerm, handleCategorySelect, selectedCategory, notify, openProductModal }) => {
    const { user, isAuthenticated, logout, updateProfile } = useAuth();
    const ProfilePage = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [loading, setLoading] = useState(false);
        const [formData, setFormData] = useState({ nombre: user?.nombre||'', apellido: user?.apellido||'', email: user?.email||'', telefono: user?.telefono||'', cedulaRuc: user?.cedulaRuc||'', password: '' });
        useEffect(() => { setFormData({ nombre: user?.nombre||'', apellido: user?.apellido||'', email: user?.email||'', telefono: user?.telefono||'', cedulaRuc: user?.cedulaRuc||'', password: '' }); }, [user, isEditing]);
        const handleSave = async (e) => { e.preventDefault(); setLoading(true); const result = await updateProfile({ nombre: formData.nombre, apellido: formData.apellido, telefono: formData.telefono, cedulaRuc: formData.cedulaRuc, password: formData.password || undefined }); setLoading(false); if (result.success) { notify('Perfil actualizado', 'success'); setIsEditing(false); } else { notify(result.message, 'error'); } };
        return (<div className="max-w-2xl mx-auto animate-fadeIn"><div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"><div className="text-center mb-8"><div className="w-24 h-24 bg-blue-50 text-[var(--color-gs-blue)] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg"><UserIcon size={48} /></div><h2 className="text-3xl font-bold text-gray-900">{user?.nombre} {user?.apellido}</h2><p className="text-gray-500 font-medium">{user?.email}</p><span className="inline-block mt-3 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">{user?.role}</span></div><form onSubmit={handleSave} className="space-y-5"><div className="grid grid-cols-2 gap-5"><Input label="Nombre" disabled={!isEditing} value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} /><Input label="Apellido" disabled={!isEditing} value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} /></div><div className="grid grid-cols-2 gap-5"><Input label="Teléfono" disabled={!isEditing} value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} /><Input label="Cédula/RUC" disabled={!isEditing} value={formData.cedulaRuc} onChange={e => setFormData({...formData, cedulaRuc: e.target.value})} /></div>{isEditing && <Input label="Nueva Contraseña" type="password" placeholder="Opcional" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />}<div className="flex gap-3 pt-6">{!isEditing ? <Button type="button" onClick={() => setIsEditing(true)} className="w-full"><Edit size={18}/> Editar</Button> : <><Button type="button" variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>Cancelar</Button><Button type="submit" variant="dark" className="flex-1" disabled={loading}>Guardar</Button></>}</div></form></div></div>);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm/50 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div onClick={()=>{setView('home');setSearchTerm('')}} className="flex items-center gap-3 cursor-pointer"><Logo className="h-12 w-auto object-contain" /></div>
                        <div className="hidden md:flex gap-1"><button onClick={()=>setView('home')} className="px-5 py-2 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100">Inicio</button><button onClick={()=>setView('products')} className="px-5 py-2 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100">Catálogo</button></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border focus-within:border-[var(--color-gs-blue)]"><Search className="w-4 h-4 text-gray-400 mr-2" /><input className="bg-transparent border-none outline-none text-sm w-full" placeholder="Buscar..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setView('products'); }} /></div>
                        {isAuthenticated && <NotificationDropdown />}
                        <button onClick={()=>setView('cart')} className="relative p-2.5 hover:bg-gray-100 rounded-full group"><ShoppingCart size={22} className="text-gray-600 group-hover:text-blue-900"/>{cart.length>0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}</button>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                <button onClick={()=>setView('profile')} className="text-sm font-bold text-gray-900 hover:underline">{user?.nombre}</button>
                                <button onClick={()=>setView('my-orders')} className="p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100" title="Mis Pedidos"><Package size={20}/></button>
                                {(user?.role === 'admin' || user?.role === 'bodega') && <button onClick={()=>setView('admin')} className="p-2.5 bg-gray-100 rounded-full hover:bg-yellow-400"><BarChart3 size={20}/></button>}
                                <button onClick={logout} className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full"><LogOut size={20}/></button>
                            </div>
                        ) : <Button onClick={()=>setShowAuth(true)} variant="dark" className="text-sm px-6">Ingresar</Button>}
                    </div>
                </div>
            </nav>
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                {view === 'home' && <Home setView={setView} onCategorySelect={handleCategorySelect} addToCart={addToCart} />}
                {view === 'products' && <ProductList addToCart={addToCart} searchTerm={searchTerm} selectedCategory={selectedCategory} openProductModal={openProductModal} />}
                {view === 'cart' && <Cart cart={cart} removeFromCart={removeFromCart} setView={setView} setShowAuth={setShowAuth} notify={notify} />}
                {view === 'my-orders' && <OrderHistory />}
                {view === 'profile' && <ProfilePage />}
                {view === 'admin' && <AdminPanel token={localStorage.getItem('grafica_user') ? JSON.parse(localStorage.getItem('grafica_user')).token : ''} userRole={user?.role} notify={notify} />}
            </main>
            {showAuth && <AuthScreen onClose={()=>setShowAuth(false)} onSuccess={()=>notify('Sesión iniciada', 'success')} />}
        </div>
    );
};

export default function App() {
    const [view, setView] = useState('home');
    const [showAuth, setShowAuth] = useState(false);
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const [selectedProduct, setSelectedProduct] = useState(null);

    const notify = (message, type = 'info') => { setNotification({ message, type, visible: true }); };
    const addToCart = (product) => { setCart(prev => { const exists = prev.find(p=>p._id===product._id); return exists ? prev.map(p=>p._id===product._id ? {...p, quantity: p.quantity+1}:p) : [...prev, {...product, quantity:1}] }); notify("Agregado al carrito", "success"); };
    const removeFromCart = (id) => setCart(prev => prev.filter(p => p._id !== id));
    const handleCategorySelect = (cat) => { setSelectedCategory(cat); setView('products'); };

    return (
        <AuthProvider>
            {notification.visible && <NotificationToast message={notification.message} type={notification.type} onClose={()=>setNotification({...notification, visible:false})} />}
            <AppContent view={view} setView={setView} showAuth={showAuth} setShowAuth={setShowAuth} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} notify={notify} openProductModal={setSelectedProduct} />
            {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={()=>setSelectedProduct(null)} addToCart={addToCart} user={JSON.parse(localStorage.getItem('grafica_user'))?.user} token={JSON.parse(localStorage.getItem('grafica_user'))?.token} notify={notify} />}
        </AuthProvider>
    );
}