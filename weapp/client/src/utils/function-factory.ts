const createSimpleErrorHandler = function (name:string, that){
  return function (e) {
    console.error(name, e);
  }.bind(that);
};

export {
  createSimpleErrorHandler
}
