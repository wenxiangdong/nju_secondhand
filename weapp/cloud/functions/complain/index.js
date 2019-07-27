// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const user = cloud.callFunction('isNormal')

  let complaint = event.complaint

  complaint.complaintID = user._id
  complaint.complaintName = user.nickName

  complaint.complainTime = Date.now()

  complaint.handling = null

  complaint.state = ComplaintState.OnGoing

  await db.collection('complaint')
    .add({
      data: complaint
    })
}

const ComplaintState = {
  OnGoing: 0,
  Handled: 1
}