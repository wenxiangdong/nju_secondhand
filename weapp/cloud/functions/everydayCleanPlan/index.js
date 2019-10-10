// 云函数入口文件
const cloud = require('wx-server-sdk');
const fileFields = {
  "goods": "pictures",
  "post": "pictures"
}
const collectionName = "deletePlan";

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const planCollection = db.collection(collectionName);
  const _ = db.command;

  const now = new Date().getTime();

  // 找出所有今天到期的 计划
  /** @type {DeletePlan[]} */
  const plans = (await planCollection.where({
    dueTo: _.lte(now)
  }).get()).data;
  console.log(plans);

  // 按 collectionName分类
  /** @type {{[key: string]: string[]}} */
  const idMap = plans.reduce((pre, cur) => ({
    ...pre,
    [cur.collectionName]: [...(pre[cur.collectionName] || []), cur.id]
  }), {});
  console.log(idMap);


  // 将各collection里的 记录取出来
  /** @type {Promise<{collectionName: string, data: any[]}>[]} */
  const getItemPromises = Object.keys(idMap)
    .map(async (collectionName) => {
      let data = [];
      try {
        let collection = db.collection(collectionName);
        let ids = idMap[collectionName] || [];
        const queryResult = await collection.where({
          _id: _.in(ids)
        }).get();
        data = [...queryResult.data];
      } catch (error) {
        console.log(collectionName, error);
      }
      return {
        data,
        collectionName
      };
    });
  // 查询到所有数据记录
  const result = await Promise.all(getItemPromises);
  console.log("记录", result);
  // 拿到所有要清理的文件
  const fileIdList = result.reduce((preList, curItem) => {
    const {collectionName, data} = curItem;
    const fieldName = fileFields[collectionName] || "pictures";
    const files = data.reduce((list, item) => (
      [...list, ...(item[fieldName] || [])]
    ), []);
    return [...preList, ...files];
  }, []);
  console.log("fileList", fileIdList);

  // 删除数据库记录
  Object.keys(idMap)
    .map(async (collectionName) => {
      try {
        let collection = db.collection(collectionName);
        let ids = idMap[collectionName] || [];
        const removeResult = await collection.where({
          _id: _.in(ids)
        })
        .remove();
        return removeResult.stats;
      } catch (error) {
        console.log("remove", collectionName, error);
      }
    });
  // 删除文件
  fileIdList.length && cloud.deleteFile({
    fileList: fileIdList
  });
  // 删除计划
  planCollection.where({
    _id: _.in(plans.map(item => item._id))
  })
  .remove();
}

  
  /**
 * @typedef {object} DeletePlan
 * @property {string} id
 * @property {string} collectionName
 * @property {number} createdOn 创建时间
 * @property {number} dueTo 执行时间
 */