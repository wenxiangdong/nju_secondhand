import React, {useRef, useState} from "react";
import {BackTop, Card, Divider, message, Modal, Radio, Tabs} from "antd";
import userApi, {USER_TYPES} from "../../apis/user";

import "./User.css";
import Logger from "../../utils/logger";
import useLoadMoreWithKeyword from "../../hooks/use-load-more-with-keyword";
import InputWithDebounce from "../../components/InputWithDebounce/InputWithDebounce";
import DTable from "../../components/DTable/DTable";
import type {ColumnItem} from "../../components/DTable/DTable";
import {DateUtil} from "../../utils/date";
import type {UserVO} from "../../apis/user";

const logger = Logger.getLogger("User");


const TYPES = [
    {
        title: "正常用户",
        key: USER_TYPES.NORMAL
    },
    {
        title: "冻结用户",
        key: USER_TYPES.FROZEN
    }
];

const getUserFns = {
    [USER_TYPES.NORMAL]: (index, count, keyword) => userApi.getNormalUsers(keyword, index, count),
    [USER_TYPES.FROZEN]: (index, count, keyword) => userApi.getFrozenUsers(keyword, index, count),
};


// _id: string;
// _openid: string;
//
// phone: string;
// nickname: string;
// address: Location;
// email: string;
//
// account: Account;
//
// signUpTime: number;
// state: number;
/**
 * 共有的列
 * @type {*[]}
 */
const COMMON_COLS: ColumnItem[] = [
    {
        title: "编号",
        key: "_id"
    },
    {
        title: "OPEN ID",
        key: "_openid"
    },
    {
        title: "昵称",
        key: "nickname"
    },
    {
        title: "邮箱",
        key: "email"
    },
    {
        title: "注册时间",
        key: "signUpTime",
        render: (row) => DateUtil.format(row.signUpTime)
    }
];
/**
 * 对用户的操作，根据状态不同
 * @type {{[p: string]: IUserApi.freezeUser|IUserApi.unfreezeUser}}
 */
const OPERATION_FNS = {
    [USER_TYPES.NORMAL]: userApi.freezeUser,
    [USER_TYPES.FROZEN]: userApi.unfreezeUser
};
/**
 * 用户操作提示
 * @type {{[p: string]: string}}
 */
const OPERATION_TIPS = {
    [USER_TYPES.NORMAL]:  "确定要冻结用户？",
    [USER_TYPES.FROZEN]: "确定要解冻用户？"
};

function User() {

    // inner components
    function UserDetailView(vo: UserVO = {}) {
        return (
            <Card className={"DetailView__wrapper"}
                  title={"用户详情"}
                  extra={<a onClick={() => setUser(null)}>返回</a>}>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>编号</span>
                    <span>：</span>
                    <span>{vo._id}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>OPEN ID</span>
                    <span>：</span>
                    <span>{vo._openid}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>昵称</span>
                    <span>：</span>
                    <span>{vo.nickname}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>邮箱</span>
                    <span>：</span>
                    <span>{vo.email}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>注册时间</span>
                    <span>：</span>
                    <span>{DateUtil.format(vo.signUpTime)}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>地址</span>
                    <span>：</span>
                    <div>
                        <div>{vo.address.name}</div>
                        <div>{vo.address.address}</div>
                    </div>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>账户</span>
                    <span>：</span>
                    <div>余额：￥{vo.account && vo.account.balance}</div>
                </div>
            </Card>
        );
    }

    /**
     * 将用户从显示列表中去掉
     * @param user
     */
    const removeUser = (user: UserVO) => {
      const index = data.findIndex(item => item._id == user._id);
      logger.info("remove", index, user);
      index !== -1 && data.splice(index, 1) && setData([...data]);
    };

    // cols
    const COL_SET = {
        [USER_TYPES.NORMAL]: [
            ...COMMON_COLS,
            {
                title: "操作",
                render: (row) => {
                    return (
                        <span>
                            <a onClick={() => handleViewUser(row)}>详情</a>
                            <Divider type={"vertical"}/>
                            <a onClick={() => handleClickOperation(USER_TYPES.NORMAL)(row)}>冻结</a>
                        </span>
                    );
                }
            }
        ],
        [USER_TYPES.FROZEN]: [
            ...COMMON_COLS,
            {
                title: "操作",
                render: (row) => {
                    return (
                        <span>
                            <a onClick={() => handleViewUser(row)}>详情</a>
                            <Divider type={"vertical"}/>
                            <a onClick={() => handleClickOperation(USER_TYPES.FROZEN)(row)}>解冻</a>
                        </span>
                    );
                }
            }
        ]
    };

    // states
    const [type, setType] = useState(USER_TYPES.NORMAL);
    const {data, setData, setKeyword, loadData} = useLoadMoreWithKeyword({
        dataSource: getUserFns[type],
        onSuccess: logger.info,
        onError: (e) => {
            logger.error(e);
            message.error("加载用户失败，请重试");
        }
    });
    const [selectedUser, setUser] = useState(null);

    // handlers
    const handleChangeRadio = (e) => {
        logger.info(e);
        setType(e.target.value);
        setData([]);
    };
    const handleViewUser = (user: UserVO) => {
        setUser(user);
    };
    const handleClickOperation = (type) => async (user: UserVO) => {
        logger.info("操作", type, user);
        Modal.warn({
            title: OPERATION_TIPS[type],
            onOk: async () => {
                try {
                    const fn = OPERATION_FNS[type];
                    fn && (await fn(user._id)) && removeUser(user);
                } catch (e) {
                    message.error("操作失败");
                }
            }
        });
    };

    // elements
    const radioBar = (
        <div className={"User__radio-bar"}>
            <Radio.Group value={type} onChange={handleChangeRadio}>
                {
                    TYPES.map(item => (
                        <Radio.Button
                            value={item.key}
                            key={item.key}>
                            {item.title}
                        </Radio.Button>
                    ))
                }
            </Radio.Group>
        </div>
    );
    const mainTableSection = (
        <div className={"User__main"}>
            <InputWithDebounce onChange={e => setKeyword(e.target.value)}/>
            <DTable
                columns={COL_SET[type]}
                dataSet={data}
                onLoad={loadData}/>
        </div>
    );

    return (
        <div className={"page"}>
            {
                selectedUser
                    ? <UserDetailView {...selectedUser} />
                    : <>
                        {radioBar}
                        {mainTableSection}
                    </>
            }
            <BackTop/>
        </div>
    );
}

export default User;