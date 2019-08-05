const { override, fixBabelImports,  addDecoratorsLegacy, addLessLoader} = require('customize-cra');

module.exports = override(
    addDecoratorsLegacy(),
    fixBabelImports('import', {
        libraryName: "antd",
        // libraryDirectory: "es",
        // style: "css"
        style: true
    }),
);
