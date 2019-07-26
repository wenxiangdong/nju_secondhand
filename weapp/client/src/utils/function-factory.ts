const createSimpleErrorHandler = function (name:string, that){
  return function (e: Error) {
    console.error(name, e);
    const errMsg = e.message || '出错了，请稍后重试';
    this.setState({errMsg})
  }.bind(that);
};

export {
  createSimpleErrorHandler
}
