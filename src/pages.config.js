import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminSEO from './pages/AdminSEO';
import Blog from './pages/Blog';
import Cart from './pages/Cart';
import Commission from './pages/Commission';
import ContentManager from './pages/ContentManager';
import CustomBuilder from './pages/CustomBuilder';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Policies from './pages/Policies';
import Shop from './pages/Shop';
import TrackOrder from './pages/TrackOrder';
import AdminLogin from './pages/AdminLogin';
import AdminPortal from './pages/AdminPortal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminDashboard": AdminDashboard,
    "AdminOrders": AdminOrders,
    "AdminProducts": AdminProducts,
    "AdminSEO": AdminSEO,
    "Blog": Blog,
    "Cart": Cart,
    "Commission": Commission,
    "ContentManager": ContentManager,
    "CustomBuilder": CustomBuilder,
    "Home": Home,
    "Orders": Orders,
    "Policies": Policies,
    "Shop": Shop,
    "TrackOrder": TrackOrder,
    "AdminLogin": AdminLogin,
    "AdminPortal": AdminPortal,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};