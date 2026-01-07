import Home from './pages/Home';
import CustomBuilder from './pages/CustomBuilder';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "CustomBuilder": CustomBuilder,
    "Shop": Shop,
    "Cart": Cart,
    "Orders": Orders,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};