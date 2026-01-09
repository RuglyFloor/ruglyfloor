import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import Cart from './pages/Cart';
import Commission from './pages/Commission';
import CustomBuilder from './pages/CustomBuilder';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Policies from './pages/Policies';
import Shop from './pages/Shop';
import AdminSEO from './pages/AdminSEO';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminDashboard": AdminDashboard,
    "AdminOrders": AdminOrders,
    "AdminProducts": AdminProducts,
    "Cart": Cart,
    "Commission": Commission,
    "CustomBuilder": CustomBuilder,
    "Home": Home,
    "Orders": Orders,
    "Policies": Policies,
    "Shop": Shop,
    "AdminSEO": AdminSEO,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};