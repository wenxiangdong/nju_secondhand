import React, {useState} from "react";
import {Icon, Tooltip} from "antd";

const SIZE = "100px";
function DImage({image = ""} = {}) {
    // states
    /**
     * 是否全屏显示
     */
    const [fullScreen, setFullScreen] = useState(false);

    // handlers
    const handleClickThumb = () => {
        setFullScreen(true);
    };
    const handleCancelFullScreen = () => {
        setFullScreen(false);
    };


    // elements
    const thumb = (
        <div
            onClick={handleClickThumb}
            style={{
                width: SIZE,
                height: SIZE,
                margin: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
            <Tooltip title={"点击全屏查看"}>
                <img src={image} width={SIZE} height={"auto"}/>
            </Tooltip>
        </div>
    );

    const full = (
        <div style={{
            position: "fixed",
            top: "0",
            left: "0",
            bottom: "0",
            right: "0",
            backgroundColor: "rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <img src={image}/>
            <Icon
                onClick={handleCancelFullScreen}
                type="close-circle"
                style={{
                    margin: "16px",
                    fontSize: "32px",
                    cursor: "pointer",
                    color: "rgba(255,0,0,0.5)"
                }} />
        </div>
    );

    return (
        <>
            {thumb}
            {fullScreen ? full : null}
        </>
    );
}


export default DImage;