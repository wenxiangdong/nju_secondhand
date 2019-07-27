const urlList = {
  CIRCLE: '/pages/circle/index',
  CIRCLE_SEND_POST: '/pages/circle/send-post/index',
  INDEX:  '/pages/index/index',
  INDEX_SEARCH_RESULT: '/pages/index/search-result/index',
  INDEX_CATEGORY_GOODS: '/pages/index/category-goods/index',
  MESSAGE: '/pages/message/index',
  MY: '/pages/my/index',
  MY_VISITED:'/pages/my/my-visited/index',
  MY_BOUGHT:'/pages/my/my-bought/index',
  MY_PUBLISH:'/pages/my/my-publish/index',
  MY_SOLD:'/pages/my/my-sold/index',
  MY_PLATFORM_ACCOUNT:'/pages/my/platform-account/index',
  MY_SOFTWARE_LICENSE_AGREEMENT:'/pages/my/software-license-agreement/index',
  MY_PRIVACY_POLICY:'/pages/my/privacy-policy/index',
  MY_PLATFORM_RULES:'/pages/my/platform-rules/index',
  MY_USER_INFO: '/pages/my/user-info/index',
  ERROR: ''
};

class IndexSearchUrlConfig {
  private WORD = 'word';

  public createIndexSearchUrl(word): string {
    return encodeURI(`${urlList.INDEX_SEARCH_RESULT}?${this.WORD}=${word}`);
  }

  public getSearchWord(that): string|undefined {
    try {
      return that.$router.params.word;
    } catch (e) {
      console.error('IndexSearchUrlConfig getSearchWord', e);
    }
  }
}

const indexSearchUrlConfig = new IndexSearchUrlConfig();

export default urlList;
export {
  indexSearchUrlConfig
};
