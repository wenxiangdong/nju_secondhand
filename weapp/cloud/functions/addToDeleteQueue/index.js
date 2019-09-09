// 云函数入口文件
const cloud = require('wx-server-sdk');
const dbName = "deletePlan";
const durations = {
  "goods": 7 * 24 * 60 * 60 * 1000,
  "post": 5 * 24 * 60 * 60 * 1000,
};

cloud.init();


// 云函数入口函数
// 删除计划，资源清理
exports.main = async (event, context) => {
  
  const {/** @type {string} */collectionName, /** @type {string} */id} = event;

  const collection = cloud.database().collection(dbName);
  const now = new Date().getTime();
  /** @type {DeletePlan} */
  const plan = {
    id,
    collectionName,
    createdOn: now,
    dueTo: now + parseInt(durations[collectionName] || 0),
  };
  
  const result = await collection.add({
    data: plan
  });

  return {
    code: 200,
    data: result._id
  };
}

/**
 * @typedef {object} DeletePlan
 * @property {string} id
 * @property {string} collectionName
 * @property {number} createdOn 创建时间
 * @property {number} dueTo 执行时间
 */