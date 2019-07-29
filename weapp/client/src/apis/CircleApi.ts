import "@tarojs/async-await";
import { VO, httpRequest } from "./HttpRequest";

export interface ICircleApi {
  publishPost(post: PostDTO): Promise<void>;

  getPosts(lastIndex: number, size?: number): Promise<PostVO[]>;

  comment(postID: string, content: string): Promise<void>;
}

class CircleApi implements ICircleApi {
  async publishPost(post: PostDTO): Promise<void> {
    return await httpRequest.callFunction<void>("publishPost", { post });
  }

  async getPosts(lastIndex: number, size: number = 10): Promise<PostVO[]> {
    return await httpRequest.callFunction<PostVO[]>("getPosts", { lastIndex, size });
  }
  async comment(postID: string, content: string): Promise<void> {
    return await httpRequest.callFunction<void>("publishPost", { postID, content });
  }
}

class MockCircleApi implements ICircleApi {
  publishPost(post: PostDTO): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getPosts(lastIndex: number, size: number = 10): Promise<PostVO[]> {
    throw new Error("Method not implemented.");
  }
  comment(postID: string, content: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

let circleApi: ICircleApi = new CircleApi();
let mockCircleApi: ICircleApi = new MockCircleApi();
export { circleApi, mockCircleApi }

export interface PostDTO {
  desc: string;
  picture: Array<string>;
}

export interface PostVO extends VO {
  ownerID: string;
  ownerName: string;

  publishTime: number;

  desc: string;
  picture: Array<string>;

  comments: Array<Comment>; // 如果可能出现一个 post 有很多评论，建议删除该属性，增加一个提供 post 的 ID 来取得评论的 API
}

export interface Comment {
  nickname: string;
  content: string;
  commentTime: number;
}

