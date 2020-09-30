// 不使用脚手架配置
// 先 配置json，配置babel
// dev注释掉打包时候的代码 
// 尽量拆分开发模式和打包模式，公共的抽离，使用merge拼接。



const path = require("path");
// 压缩css
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')


// 配置直接访问 index.html功能
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlPlugin = new HtmlWebpackPlugin({
    //设置生成预览页面的模板文件
    template: "./src/index.html",
    //设置生成的预览页面名称
    filename: "index.html",
    // 多页面时候引入的自己的js文件
    chunks: ['index', 'vender', 'common']
});
// 多页面入口
/* const htmlPlugin = new HtmlWebpackPlugin({
    template: "./src/other.html",
    filename: "other.html",
    chunks: ['other','common']
}); */


// 抽离css文件 npm i min-css-extract-plugin
const MiniCssExtractPlugin = require("min-css-extract-plugin");
const CssExtractPlugin = new MiniCssExtractPlugin({
    filename: "css/main.[contenthash:8].css",
})

// vue文件加载器  npm install vue-loader vue-template-compiler -D
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const vuePlugin = new VueLoaderPlugin();




// IgnorePlugin---- moment这个库中，如果引用了./locale/目录的内容，就忽略掉，不会打包进去
const IgnorePlugin = new Webpack.IgnorePlugin(/\.\/locale/, /moment/)
    /*  但是要手动引入所需要的语言包
    import 'moment/locale/zh-cn';
    moment.locale('zh-cn'); */


// ### 项目较大时候，使用多进程
// *happyPack  提升js打包速度 (看文档配置) npm i
const HappyPack = require('happypack');
// *ParallelUglifyPlugin 压缩js (看文档配置) npm i
const ParallelUglifyPlugin = require('ParallelUglifyPlugin...')



// --------------------------------------------------------------------
module.exports = {
    //可以设置为development(开发模式)，production(发布模式)
    mode: "development",
    //设置入口文件路径
    entry: {
        index: path.join(__dirname, "./src/index.js"),
        // 多页面入口
        // other: path.join(__dirname, "./src/other.js"),
    },
    //设置出口文件
    output: {
        //设置路径
        path: path.join(__dirname, "./dist"),
        //设置文件名
        filename: "bundle.js",

        // *** 生产模式记得改名字 
        // ***内容变，则hash值变，名字变，  都不变的话，返回304，请求更快
        // filename: 'bundle.[contenthash:8].js',
        // filename: '[name].[contenthash].js',  // 多页面出口
    },

    // 添加的配置
    plugins: [htmlPlugin, vuePlugin, CssExtractPlugin, IgnorePlugin],

    // babel-loader 语法转化
    module: {
        // noParse 性能提升：不去解析jquery中的依赖库
        noParse: /jquery/,

        rules: [
            // *css格式
            {
                // test设置需要匹配的文件类型，支持正则(以css结尾的文件)
                // use表示该文件类型需要调用的loader，***loader执行顺序从后往前
                // postcss兼容作用，需要配置 post.config.js
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader']

                // *在发布模式的时候，css要抽离出来提高性能，用MiniCssExtractPlugin.loader
                // use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
            }, {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader', 'postcss-loader']
            }, {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader']
            },

            // *img格式
            {
                test: /\.jpg|png|gif|bmp|ttf|eot|svg|woff|woff2$/,
                // limit用来设置字节数，只有小于limit值的图片，才会转换为base64图片
                use: "url-loader?limit=16940"
                    // 否则 打包到img1文件夹

            },

            // ***js格式 ---性能提升
            {
                test: /\.js$/,
                use: "babel-loader",
                // exclude为排除项，意思是不要处理node_modules中的js文件
                exclude: /node_modules/
            },

            // *vue格式
            {
                test: /\.vue$/,
                loader: "vue-loader",
            }
        ]
    },


    // *** 生产发布
    optimization: {
        // 发布模式，抽离css后 压缩css
        minimizer: [
            new TerserJSPlugin({}),
            new OptimizeCSSAssetsPlugin({})
        ],

        // ***分割代码
        splitChunks: {
            chunks: 'all',
            // 缓存分组
            cacheGroups: {
                // 1.第三方模块
                vender: {
                    name: 'vender',
                    test: /node_modules/, // 条件测试
                    priority: 1, // 权限更高，优先抽离 
                    minSize: 3, // 内存大小限制：3kb
                    minChunks: 1, // 只要引用1次 就抽离
                },
                // 2.公共模块
                vender: {
                    name: 'common',
                    priority: 0,
                    minSize: 0,
                    minChunks: 3 // 引用3次 就抽离
                }
            }
        }
    },


    // *** 开发环境
    devServer: {
        port: 8080,
        progress: true, // 显示打包进度条
        contentBase: xxx, // 根目录
        open: true, // 自动打开浏览器
        compress: true, // 启动gzip压缩

        // 代理
        proxy: {
            // 解决跨域
            // 匹配所有本地以 '/api'开头的请求路径，代理到'http://localhost:3000'
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true, // 支持跨域
                // 重写路径: 去掉路径中开头的'/api'
                pathRewrite: {
                    '^/api': ''
                }
            }
        },

    }
}