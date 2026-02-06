/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import AdminCatalog from './pages/AdminCatalog';
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
import CustomBuilderDrawer from './pages/CustomBuilderDrawer';
import CustomBuilderSimple from './pages/CustomBuilderSimple';
import CustomBuilderTabs from './pages/CustomBuilderTabs';
import Home from './pages/Home';
import NotionSync from './pages/NotionSync';
import Orders from './pages/Orders';
import Policies from './pages/Policies';
import SMSComplianceSample from './pages/SMSComplianceSample';
import SMSConsent from './pages/SMSConsent';
import Shop from './pages/Shop';
import Success from './pages/Success';
import TrackOrder from './pages/TrackOrder';
import FixMyRug from './pages/FixMyRug';
import AdminFixMyRugOrders from './pages/AdminFixMyRugOrders';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminCatalog": AdminCatalog,
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
    "CustomBuilderDrawer": CustomBuilderDrawer,
    "CustomBuilderSimple": CustomBuilderSimple,
    "CustomBuilderTabs": CustomBuilderTabs,
    "Home": Home,
    "NotionSync": NotionSync,
    "Orders": Orders,
    "Policies": Policies,
    "SMSComplianceSample": SMSComplianceSample,
    "SMSConsent": SMSConsent,
    "Shop": Shop,
    "Success": Success,
    "TrackOrder": TrackOrder,
    "FixMyRug": FixMyRug,
    "AdminFixMyRugOrders": AdminFixMyRugOrders,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};