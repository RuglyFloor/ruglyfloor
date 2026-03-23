import React from 'react';
import __Layout from './Layout.jsx';

const About = React.lazy(() => import('./pages/About'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminInbox = React.lazy(() => import('./pages/AdminInbox'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminMarketing = React.lazy(() => import('./pages/AdminMarketing'));
const AdminOrderDetail = React.lazy(() => import('./pages/AdminOrderDetail'));
const AdminOrders = React.lazy(() => import('./pages/AdminOrders'));
const AdminPortal = React.lazy(() => import('./pages/AdminPortal'));
const AdminPricing = React.lazy(() => import('./pages/AdminPricing'));
const AdminProducts = React.lazy(() => import('./pages/AdminProducts'));
const AdminSEO = React.lazy(() => import('./pages/AdminSEO'));
const Blog = React.lazy(() => import('./pages/Blog'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Collections = React.lazy(() => import('./pages/Collections'));
const Commission = React.lazy(() => import('./pages/Commission'));
const Contact = React.lazy(() => import('./pages/Contact'));
const ContentManager = React.lazy(() => import('./pages/ContentManager'));
const CustomBuilder = React.lazy(() => import('./pages/CustomBuilder'));
const Home = React.lazy(() => import('./pages/Home'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Policies = React.lazy(() => import('./pages/Policies'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Products = React.lazy(() => import('./pages/Products'));
const Robots = React.lazy(() => import('./pages/Robots'));
const SMSComplianceSample = React.lazy(() => import('./pages/SMSComplianceSample'));
const SMSConsent = React.lazy(() => import('./pages/SMSConsent'));
const Shop = React.lazy(() => import('./pages/Shop'));
const Sitemap = React.lazy(() => import('./pages/Sitemap'));
const Success = React.lazy(() => import('./pages/Success'));
const TrackOrder = React.lazy(() => import('./pages/TrackOrder'));

export const PAGES = {
    "About": About,
    "AdminDashboard": AdminDashboard,
    "AdminInbox": AdminInbox,
    "AdminLogin": AdminLogin,
    "AdminMarketing": AdminMarketing,
    "AdminOrderDetail": AdminOrderDetail,
    "AdminOrders": AdminOrders,
    "AdminPortal": AdminPortal,
    "AdminPricing": AdminPricing,
    "AdminProducts": AdminProducts,
    "AdminSEO": AdminSEO,
    "Blog": Blog,
    "Cart": Cart,
    "Collections": Collections,
    "Commission": Commission,
    "Contact": Contact,
    "ContentManager": ContentManager,
    "CustomBuilder": CustomBuilder,
    "Home": Home,
    "Orders": Orders,
    "Policies": Policies,
    "ProductDetail": ProductDetail,
    "Products": Products,
    "Robots": Robots,
    "SMSComplianceSample": SMSComplianceSample,
    "SMSConsent": SMSConsent,
    "Shop": Shop,
    "Sitemap": Sitemap,
    "Success": Success,
    "TrackOrder": TrackOrder,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
