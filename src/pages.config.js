import Cart from './pages/Cart';
import CustomBuilder from './pages/CustomBuilder';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Shop from './pages/Shop';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Cart": Cart,
    "CustomBuilder": CustomBuilder,
    "Home": Home,
    "Orders": Orders,
    "Shop": Shop,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};