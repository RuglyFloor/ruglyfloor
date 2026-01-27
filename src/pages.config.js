import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminDocuments from './pages/AdminDocuments';
import AdminInbox from './pages/AdminInbox';
import AdminLogin from './pages/AdminLogin';
import AdminOrderDetail from './pages/AdminOrderDetail';
import AdminOrders from './pages/AdminOrders';
import AdminPortal from './pages/AdminPortal';
import AdminPricing from './pages/AdminPricing';
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
import SMSComplianceSample from './pages/SMSComplianceSample';
import SMSConsent from './pages/SMSConsent';
import Shop from './pages/Shop';
import Success from './pages/Success';
import TrackOrder from './pages/TrackOrder';
import CustomBuilderTabs from './pages/CustomBuilderTabs';
import CustomBuilderDrawer from './pages/CustomBuilderDrawer';
import CustomBuilderSimple from './pages/CustomBuilderSimple';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminDashboard": AdminDashboard,
    "AdminDocuments": AdminDocuments,
    "AdminInbox": AdminInbox,
    "AdminLogin": AdminLogin,
    "AdminOrderDetail": AdminOrderDetail,
    "AdminOrders": AdminOrders,
    "AdminPortal": AdminPortal,
    "AdminPricing": AdminPricing,
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
    "SMSComplianceSample": SMSComplianceSample,
    "SMSConsent": SMSConsent,
    "Shop": Shop,
    "Success": Success,
    "TrackOrder": TrackOrder,
    "CustomBuilderTab": CustomBuilderTabs,
    "CustomBuilderDrawer": CustomBuilderDrawer,
    "CustomBuilderSimple": CustomBuilderSimple,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};