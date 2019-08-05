import React, {createContext, useContext} from 'react';
import './App.css';
import loadable from "@loadable/component";
import {HashRouter, Link, Route, Switch} from "react-router-dom";
import Goods from "./pages/Goods/Goods";
import User from "./pages/User/User";
import Complaint from "./pages/Complaint/Complaint";
import Order from "./pages/Orders/Order";
import {Button} from "antd";




// 页面
const Try = loadable(() => import('./pages/Try/Try'));
const Home = loadable(() => import("./pages/Home/Home"));


function App() {
    return (
       <div className={"App__page"}>
           <HashRouter>
           <div className={"App__header"}>
               南大小书童管理系统
               <Link to={"/home"}><Button style={{float: "right"}}>首页</Button></Link>
           </div>
               <Switch>
                   <Route path="/Goods" component={Goods}/>
                   <Route path="/User" component={User}/>
                   <Route path="/complaint" component={Complaint}/>
                   <Route path="/order" component={Order}/>
                   <Route path="/Try" component={Try}/>
                   <Route path="/home" component={Home}/>
               </Switch>
           </HashRouter>
       </div>
    );
}

export default App;
