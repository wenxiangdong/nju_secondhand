# 数据结构 API 文档

## 数据结构

```typescript
// 前端传后端 -> XXXDTO
// 后端返前端 -> XXXVO
// 未涉及数据库对象

interface VO {
  	_id;
}

// 用户
interface UserDTO {
    phone: string;
    avatar: string;
    nickname: string;
    address: Location;
    email: string;  // 检查唯一性
}

interface UserVO extends VO {
    // _openid: string;  为安全性考虑，不将该属性返回

    phone: string;
    avatar: string;
    nickname: string;
    address: Location;
    email: string;

    account: AccountVO;

    signUpTime: number;
    state: UserState;
}

interface Location {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
}

interface AccountVO {
    balance: string;
}

enum UserState {
    UnRegistered, // 未注册
    Normal,
    Forzen, // 被管理员冻结
}


// 商品
interface CategoryVO extends VO {
    name: string;
    icon: string;
}

interface GoodsDTO {
    name: string;
    desc: string;
    price: string;
    pictures: Array<string>;
    categoryID: string; // -> Category._id
}

interface GoodsVO extends VO {
    sellerID: string;

    name: string;
    desc: string;
    price: string;
    pictures: Array<string>;
    category: CategoryVO;

    publishTime: number;

    state: GoodsState;
}

enum GoodsState {
    InSale,
    Deleted
}

// 订单
interface OrderDTO {
    buyerID: string;

    goodID: string;
}

interface OrderVO extends VO {
    buyerID: string;
    buyerName: string;

    sellerID: string;
    sellerName: string;

    goodsID: string;
    goodsName: string;
    goodsPrice: string;
    total: string;

    address: Location;

    orderTime: number;
    deliveryTime: number;

    state: OrderState;
}

enum OrderState {
    OnGoing,
    Finished,
}

// 投诉
interface ComplaintDTO {
    orderID: string // 订单编号
    desc: string

    pictures: Array<string>;
}

interface ComplaintVO extends VO {
    orderID: string // 订单编号
    desc: string

    complainantID: string;
    complainantName: string;

    pictures: Array<string>;

    complainTime: number;
    handleTime: number;
  
    result: string;
    state: ComplaintState;
}

enum ComplaintState {
    OnGoing,
    Handled
}

// 圈子
interface PostDTO {
    desc: string;
    picture: Array<string>;
}

interface PostVO extends VO {
    ownerID: string;
  	ownerName: string;

    publishTime: number;

    desc: string;
    picture: Array<string>;

    comments: Array<Comment>; // 直接拿全部的
}

interface Comment {
    nickName: string;
    content: string;
    commentTime: number;
}

// 通知
interface NotificationDTO  {
    userID: string;
    content: string;
}

interface NotificationVO extends VO {
    userID: string;
    content: string;
    time: number;
}

// 聊天
interface MessageDTO {
    receiverID: string;
    content: string;   // "image://" "text://" 
}

interface MessageVO extends VO {
    senderID: string;
    senderName: string;

    receiverID: string;
    receiverName: string;

    content: string;

    time: number;
    read: boolean;
}

export enum HttpCode {
  Forbidden = 403, // 403
  Not_Found = 404, // 404
  Conflict = 409, // 409 冲突
  Fail = 500 // 
}

export class Fail {
    code: HttpCode;
    message: string;
}
```



## 用户API

 ```typescript
// API 如果成功调用，则返回 Promise 的返回类型，如 GoodsVO；如果失败，抛出异常，异常的数据结构为 Fail（数据结构部分最后一个）

// 部分需要注册且未冻结，不需要的会指明
export interface IUserApi {
    // 检查用户状态
    checkState(): Promise<UserState>; // 不需要

    // 注册
    signUp(user: UserDTO): Promise<void>; // 不需要

    // 登录
    login(): Promise<UserVO>;

    // 修改个人信息
    modifyInfo(user: UserDTO): Promise<void>;

    // 根据 ID 取得用户信息
    getUserInfo(userID: string): Promise<UserVO>;
}

// 需要注册且未冻结
export interface IAccountApi {
    // 取款
    withdraw(amount: String): Promise<void>;
}

// 需要注册且未冻结
export interface ICircleApi {
    publishPost(post: PostDTO): Promise<void>;

    getPosts(lastIndex: number, size?: number): Promise<PostVO[]>;

    comment(postID: string, content: string): Promise<void>;
}

// 需要注册且未冻结
export interface IComplaintApi {
    complain(complaint: ComplaintDTO): Promise<void>;

    getComplaints(lastIndex: number, size?: number): Promise<ComplaintVO[]>;
}

// 需要注册且未冻结
export interface IFileApi {
    uploadFile(cloudPath: string, filePath: string): Promise<string>;

    downloadFile(fileID: string): Promise<string>;

    getTempFileURL(fileList: string[]): Promise<GetTempFileURLResultItem[]>;

    deleteFile(fileList: string[]): Promise<DeleteFileResultItem[]>;
}


// 部分需要注册且未冻结，不需要的会指明
export interface IGoodsApi {
    // 取得商品分类
    getCategories(): Promise<CategoryVO[]>; // 不需要

    // 发布闲置物品
    publishGoods(goods: GoodsDTO): Promise<void>;

    // 查看自己正在卖的物品
    getOngoingGoods(): Promise<GoodsVO[]>;

    // 下架商品
    deleteGoods(goodsId: string): Promise<void>;

    // 关键字搜索商品
    searchGoodsByKeyword(keyword: string, lastIndex: number, size?: number): Promise<GoodsVO[]>; // 不需要

    // 种类搜索商品
    searchGoodsByCategory(categoryID: string, lastIndex: number, size?: number): Promise<GoodsVO[]>; // 不需要

    // 购买商品
    purchase(goodsID: string): Promise<void>;
}

// 需要注册且未冻结
export interface INotificationApi {
    // 取得通知消息
    getNotifications(): Promise<NotificationVO[]>;

    // 发送通知消息（供其他接口调用）
    sendNotification(notification: NotificationDTO): Promise<void>;
}

// 需要注册且未冻结
export interface IOrderApi {
    getBuyerOngoingOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;

    accept(orderID: string): Promise<void>;

    getBuyerHistoryOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;

    getSellerOngoingOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;

    getSellerHistoryOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;
}

// 聊天，使用websokcet
发送使用 MessageDTO 的 JSON 格式
接收解析 MessageVO 的 JSON 格式
 ```

## 管理员API

```java
// 投诉管理
List<ComplaintVO> getComplaints(String keyword, int lastIndex, int size);
void handle(String complaintID, String result);

// 订单管理
List<OrderVO> getOrders(String keyword, int lastIndex, int size);

// 商品管理
// 查看商品见用户API，省略
void deleteGoods(String goodsID); // 下架商品，需要给卖家发通知


// 用户管理
List<UserVO> getNormalUsers(String keyword, int lastIndex, int size);
void freezeUser(String userID); // 发通知

List<UserVO> getForzenUsers(String keyword, int lastIndex, int size);
void unfreezeUser(String userID); // 发通知
```

