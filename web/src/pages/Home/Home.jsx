import "./Home.css";
import {Card, Icon} from "antd";
import React from "react";
import {Link} from "react-router-dom";


/**
 * 菜单项
 * @param title
 * @param link
 * @param color
 * @returns {*}
 * @constructor
 */
function Tile({title, link = "", color = "#1890ff", icon = ""} = {}) {
    return (
        <Link to={link}>
            <Card
                className={"Home__tile"}
                style={{backgroundColor: color}}>
                <div className={"Home__tile-title"}>
                    {title}
                </div>
                <Icon className={"Home__tile-icon"} type={icon} />
            </Card>
        </Link>
    );
}

/**
 * tile 配置项列表
 * @type {*[]}
 */
const TILE_LIST = [
    {
        title: "商品管理",
        link: "/goods",
        color: "#67D5B5",
        icon: "appstore"
    },
    {
        title: "用户管理",
        link: "/user",
        color: "#EE7785",
        icon: "user"
    },
    {
        title: "投诉管理",
        link: "/complaint",
        color: "#C89EC4",
        icon: "frown"
    },
    {
        title: "订单管理",
        link: "/appeal",
        color: "#84B1ED",
        icon: "account-book"
    },
];

function Home() {
    return (
        <div className={"Home__main"}>
            {
                TILE_LIST.map(tile => (
                   <Tile {...tile} key={tile.title} />
                ))
            }
        </div>
    );
}


export default Home;