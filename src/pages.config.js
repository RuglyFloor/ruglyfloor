import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminInbox from './pages/AdminInbox';
import AdminLogin from './pages/AdminLogin';
import AdminOrders from './pages/AdminOrders';
import AdminPortal from './pages/AdminPortal';
import AdminProducts from './pages/AdminProducts';
import AdminSEO from './pages/AdminSEO';
import Blog from './pages/Blog';
import Cart from './pages/Cart';
import Commission from './pages/Commission';
import Contact from './pages/Contact';
import ContentManager from './pages/ContentManager';
import CustomBuilder from './pages/CustomBuilder';
import Home from './pages/Home';
import NotionSync from './pages/NotionSync';
import Orders from './pages/Orders';
import Policies from './pages/Policies';
import Shop from './pages/Shop';
import TrackOrder from './pages/TrackOrder';
import Success from './pages/Success';
import AdminOrderDetail from './pages/AdminOrderDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminDashboard": AdminDashboard,
    "AdminInbox": AdminInbox,
    "AdminLogin": AdminLogin,
    "AdminOrders": AdminOrders,
    "AdminPortal": AdminPortal,
    "AdminProducts": AdminProducts,
    "AdminSEO": AdminSEO,
    "Blog": Blog,
    "Cart": Cart,
    "Commission": Commission,
    "Contact": Contact,
    "ContentManager": ContentManager,
    "CustomBuilder": CustomBuilder,
    "Home": Home,
    "NotionSync": NotionSync,
    "Orders": Orders,
    "Policies": Policies,
    "Shop": Shop,
    "TrackOrder": TrackOrder,
    "Success": Success,
    "AdminOrderDetail": AdminOrderDetail,
}

export const pagesConfig = {
    mainPage: "CustomBuilder",
    Pages: PAGES,
    Layout: __Layout,
};