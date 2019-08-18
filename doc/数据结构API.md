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
    UnRegistered = 0, // 未注册
    Normal = 1,
    Frozen = 2, // 被管理员冻结
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
    sellerName: string;

    name: string;
    desc: string;
    price: string;
    pictures: Array<string>;
    category: CategoryVO;

    publishTime: number;

    state: GoodsState;
}

export interface GoodsWithSellerVO {
  seller: UserVO;
  goods: GoodsVO
}

enum GoodsState {
    InSale = 0,
    Deleted = 1,
}

// 订单
interface OrderDTO {
    buyerID: string;

    goodID: string;
}

export interface OrderVO extends VO {
  buyerID: string;
  buyerName: string;

  sellerID: string;
  sellerName: string;

  goodsID: string;
  goodsName: string;
  goodsPrice: string;

  address: Location;

  orderTime: number;
  deliveryTime: number; // -1 表示还未送达

  state: OrderState;
}

enum OrderState {
    Ongoing = 0,
    Finished = 1,
    Paying = -1
}

// 投诉
export interface ComplaintDTO {
    orderID: string // 订单编号
    desc: string

    pictures: Array<string>;
}

export interface ComplaintVO extends VO {
  orderID: string // 订单编号
  desc: string

  complainantID: string;
  complainantName: string;

  pictures: Array<string>;

  complainTime: number;
  
  handling: Handling; // 若投诉未被处理，该属性不存在

  state: ComplaintState;
}

export interface Handling {
  time: number,
  result: string
}

enum ComplaintState {
    Ongoing = 0,
    Handled = 1
}

// 圈子
interface PostDTO {
    topic: string;
    desc: string;
    pictures: Array<string>;
}

interface PostVO extends VO {
    ownerID: string;
    ownerName: string;
    ownerAvatar: string;

    publishTime: number;

    topic: string;
    desc: string;
    pictures: Array<string>;

    comments: Array<Comment>; // 直接拿全部的
}

interface Comment {
    nickname: string;
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
  Success = 200,
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

// 需要注册且未冻结，特殊会说明
export interface IUserApi {
    // 检查用户状态
    checkState(): Promise<UserState>; // 不需要

    // 注册
    signUp(user: UserDTO): Promise<void>; // 不需要，且只能未注册

    // 登录
    login(): Promise<UserVO>; // 需要注册

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

    getPosts(lastIndex: number, size?: number): Promise<PostVO[]>; // 不需要

    comment(postID: string, content: string): Promise<void>;
  
    getPostById(postId: string): Promise<PostVO>;

    searchPostsByKeyword(keyword: string, lastIndex: number, size?: number): Promise<PostVO[]>; // 不需要
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


// 需要注册且未冻结，特殊会说明
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
  
  	// 关键字搜索商品和销售者信息
  	searchGoodsWithSellerByKeyword(keyword: string, lastIndex: number, size?: number): Promise<GoodsWithSellerVO[]>; // 不需要

  	// 种类搜索商品和销售者信息
  	searchGoodsWithSellerByCategory(categoryID: string, lastIndex: number, size?: number): Promise<GoodsWithSellerVO[]>; // 不需要
  
  	// 通过 id 获取商品和销售者信息
  	getGoodsWithSeller(goodsID: string): Promise<GoodsWithSellerVO>; // 不需要

  	// 通过 id 获取商品信息
  	getGoods(goodsID: string): Promise<GoodsVO>; // 不需要

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
  
    getOrderById(orderId: string): Promise<OrderVO>;

    getBuyerHistoryOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;

    getSellerOngoingOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;

    getSellerHistoryOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;
    
    orderCallback(orderID: string, result: {0 /* 成功 */, -1 /* 失败 */}): Promise<void>;
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
List<CategoryVO> getCategories();
List<GoodsVO> getGoodsByKeyword(String keyword, int lastIndex, int size);
List<GoodsVO> getGoodsByCategory(String categoryID, int lastIndex, int size);
void deleteGoods(String goodsID); // 下架商品，需要给卖家发通知


// 用户管理
List<UserVO> getNormalUsers(String keyword, int lastIndex, int size);
void freezeUser(String userID); // 发通知

List<UserVO> getFrozenUsers(String keyword, int lastIndex, int size);
void unfreezeUser(String userID); // 发通知
```


