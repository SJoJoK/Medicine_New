// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

exports.main = (event, context) => {
  console.log(event)
  console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  return {
    openid: event.userInfo.openId,
  }
}
