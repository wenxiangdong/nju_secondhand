import React from 'react';
import './App.css';
import loadable from "@loadable/component";
import {HashRouter, Route, Switch} from "react-router-dom";




// 页面
const Try = loadable(() => import('./pages/Try/Try'));
const Home = loadable(() => import("./pages/Home/Home"));


function App() {
    return (
       <div className={"App__page"}>
           <div className={"App__header"}>
               南大小书童管理系统
           </div>
           <HashRouter>
               <Switch>
                   <Route path="/Try" component={Try}/>
                   <Route path="/home" component={Home}/>
               </Switch>
           </HashRouter>
       </div>
    );
}

export default App;
