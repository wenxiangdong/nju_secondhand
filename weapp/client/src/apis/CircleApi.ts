import "@tarojs/async-await";
import {VO, httpRequest, db, mockHttpRequest} from "./HttpRequest";
import { copy } from "./Util";

export interface ICircleApi {
  publishPost(post: PostDTO): Promise<void>;

  getPosts(lastIndex: number, size?: number): Promise<PostVO[]>;

  comment(postID: string, content: string): Promise<void>;

  getPostById(postId: string): Promise<PostVO>;
}

const postCollection = db.collection('post');
const functionName = 'circleApi'

class CircleApi implements ICircleApi {
  async publishPost(post: PostDTO): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "publishPost", post });
  }

  async getPosts(lastIndex: number, size: number = 10): Promise<PostVO[]> {
    let result = await postCollection
      .skip(lastIndex)
      .limit(size)
      .get()

    return copy<PostVO[]>(result.data);
  }
  async comment(postID: string, content: string): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "comment", postID, content });
  }

  async getPostById(postId: string): Promise<PostVO> {
    return await httpRequest.callFunction<PostVO>(functionName, { $url: "getPostById" });
  }
}

class MockCircleApi implements ICircleApi {
  publishPost(post: PostDTO): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getPosts(lastIndex: number, size: number = 10): Promise<PostVO[]> {
    console.log('getPosts', lastIndex, size);
    let posts = new Array(size).fill(null).map(() => MockCircleApi.createMockPost());
    return mockHttpRequest.success(posts)
  }
  comment(postID: string, content: string): Promise<void> {
    console.log('comment', postID, content)
    return mockHttpRequest.success();
  }

  getPostById(postId: string): Promise<PostVO> {
    let post = MockCircleApi.createMockPost();
    post._id = postId;
    return mockHttpRequest.success(post);
  }
  static createMockPost(): PostVO {
    return {
      _id: '1',
      topic: '二手书',
      ownerAvatar: '',
      comments: this.createMockComments(),
      desc: 'descdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdesc',
      ownerID: '1',
      ownerName: 'ownerName',
      pictures: ['', '', ''],
      publishTime: Date.now()
    }
  }
  static createMockComments(): Comment[] {
    return new Array(5).fill(null).map(() => this.createMockComment());
  }
  static createMockComment(): Comment {
    return {
      nickname: '',
      commentTime: Date.now(),
      content: ''
    }
  }
}

let circleApi: ICircleApi = new CircleApi();
let mockCircleApi: ICircleApi = new MockCircleApi();
export { circleApi, mockCircleApi, MockCircleApi }

export interface PostDTO {
  topic: string;
  desc: string;
  pictures: Array<string>;
}

export interface PostVO extends VO {
  topic: string;

  ownerID: string;
  ownerName: string;
  ownerAvatar: string;

  publishTime: number;

  desc: string;
  pictures: Array<string>;

  comments: Array<Comment>; // 如果可能出现一个 post 有很多评论，建议删除该属性，增加一个提供 post 的 ID 来取得评论的 API
}

export interface Comment {
  nickname: string;
  content: string;
  commentTime: number;
}

