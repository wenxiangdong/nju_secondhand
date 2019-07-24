# 数据结构 API 文档

## 数据结构

```typescript
// 前端传后端 -> XXXDTO
// 后端返前端 -> XXXVO
// 未涉及数据库对象

// 用户

interface UserDTO {
    phone: string;
    nickname: string;
    address: Location;
    email: string;  // 检查唯一性
}

interface Location {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
}

interface UserVO {
    _id: string; // 用户标识符
    _openid: string;

    phone: string;
    nickname: string;
    address: Location;
    email: string;

    account: Account;

    signUpTime: number;
    state: UserState;
}

interface Account {
    balance: string | number;
}

enum UserState {
    Normal,
    Frozen, // 被管理员冻结
}


// 商品

// 数据库对象
interface Category {
    _id: string;
    name: string;
    icon: string;
}

interface GoodsDTO {
    name: string;
    desc: string;
    price: string | number;
    pictures: Array<string>;
    categoryID: string; // -> Category._id
}

interface GoodsVO {
    _id: string;
    sellerID: string;

    name: string;
    desc: string;
    price: string | number;
    pictures: Array<string>;
    category: Category;

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

interface OrderVO {
    _id: string;

    buyerID: string;
    buyerName: string;

    sellerID: string;
    sellerName: string;

    goodsID: string;
    goodsName: string;
    goodsPrice: string | number;
    total: string | number;

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

interface ComplaintVO {
    _id: string;

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

interface PostVO {
    _id: string;
    ownerID: string;

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


// 通过单独的评论 API 取得的 VO
interface CommentVO {
    _id: string;
    postID: string;
    nickName: string;
    content: string;
    commentTime: number;
}


// 通知
interface Notification {
    userID: string;
    content: string;
    time: number;
}

// 聊天
interface MessageDTO {
    receiverID: string;
    content: string;   // "image://" "text://" 
}

interface MessageVO {
    senderID: string;
    senderName: string;

    receiverID: string;
    receiverName: string;

    content: string;

    time: number;
    read: boolean;
}
```

## 用户 API

 ```java
// 用户信息
void signUp(UserDTO user);
UserVO login();
void modifyInfo(UserDTO user);

// 发布闲置物品
List<Category> getCategorys();
void publishGoods(GoodsDTO goods);
List<GoodsVO> getPublishedGoods(int lastIndex, int size);
void deleteGoods(String goodsID);

// 购买闲置物品
List<GoodsVO> searchGoodsByKeyword(String keyword, int lastIndex, int size); // 无需注册
List<GoodsVO> searchGoodsByCategory(String categoryID, int lastIndex, int size); // 无需注册
void purchase(String goodsID); // 给卖家发通知

// 订单管理
List<OrderVO> getOngoingOrders(int lastIndex, int size);
void accept(String OrderID); // 给卖家发通知

List<OrderVO> getHistoryOrders(int lastIndex, int size);

// 投诉
void complain(ComplaintDTO complaint);

// 圈子
void publishPost(PostDTO post);
void comment(String postID, String content); // 给发分享的人发通知？
List<PostVO> getPosts(int lastIndex, int size);

// 聊天，使用websokcet TODO 全局共用一个 WebSocket
发送使用 MessageDTO 的 JSON 格式
接收解析 MessageVO 的 JSON 格式

// 提现
void withdraw(String amount);
 ```

## 管理员 API

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

