import React, {createContext, useContext} from 'react';
import './App.css';
import {Button} from "antd";
import loadable from "@loadable/component";
import {HashRouter, Link, Route, Switch} from "react-router-dom";

// 页面
const Try = loadable(() => import('./pages/Try/Try'));
const Home = loadable(() => import("./pages/Home/Home"));
const Goods = loadable(() => import( "./pages/Goods/Goods"));
const User = loadable(() => import( "./pages/User/User"));
const Complaint = loadable(() => import( "./pages/Complaint/Complaint"));
const Order = loadable(() => import("./pages/Orders/Order"));
const Login = loadable(() => import("./pages/Login/Login"));


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
                   <Route path="/login" component={Login}/>
               </Switch>
           </HashRouter>
       </div>
    );
}

export default App;
