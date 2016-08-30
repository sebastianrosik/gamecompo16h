module.exports = {
    entry: "./main.js",
    output: {
        path: __dirname,
        filename: "dist/bundle.js"
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel', // 'babel-loader' is also a legal name to reference
              query: {
                presets: ['es2015']
              }
            },{
              test: /\.json$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'json', // 'babel-loader' is also a legal name to reference
            }
        ]
    }
};