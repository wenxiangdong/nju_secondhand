const { override, fixBabelImports,  addDecoratorsLegacy, addLessLoader} = require('customize-cra');

module.exports = override(
    addDecoratorsLegacy(),
    fixBabelImports('import', {
        libraryName: "antd",
        // libraryDirectory: "es",
        // style: "css"
        style: true
    }),
    // addLessLoader({
    //     javascriptEnabled: true,
    //     modifyVars: { '@primary-color': '#6A005F' },
    // })
);
