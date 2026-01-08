import About from './pages/About';
import Cart from './pages/Cart';
import Commission from './pages/Commission';
import CustomBuilder from './pages/CustomBuilder';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Shop from './pages/Shop';
import AdminOrders from './pages/AdminOrders';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Cart": Cart,
    "Commission": Commission,
    "CustomBuilder": CustomBuilder,
    "Home": Home,
    "Orders": Orders,
    "Shop": Shop,
    "AdminOrders": AdminOrders,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};