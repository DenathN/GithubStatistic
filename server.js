/*
* 服务端的主程序
* */
var express = require("express")
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var ws = require("ws")
var http = require("http")


var webpackDevConfig = require('./webpack.config')
var httpHandler = require("./httpHandler")
var wsHandler = require("./wsHandler")
var config = require("./config")

//定义好express app
app = express()
var compiler = webpack(webpackDevConfig)
app.use(webpackDevMiddleware(compiler))

//设置静态资源
app.use(express.static("./dist"))
app.use(express.static("./html"))

httpHandler(app)//注册一系列URL到函数的映射

//定义server
var server = http.createServer(app)
const crawlingWs = new ws.Server({noServer: true})//默认websocket也会创建一个服务器，现在不创建了，只用这个websocket来处理事件


//定义server的事件
crawlingWs.on("connection", wsHandler)
server.on('upgrade', function upgrade(request, socket, head) {
    console.log(`upgrade ${request.url}`)
    crawlingWs.handleUpgrade(request, socket, head, function done(conn) {
        crawlingWs.emit('connection', conn, request);//可以定义多个wsServer，调用server的emit函数就能够把消息发送过去
    })
})

//TODO：这个地方是不是应该监听全局IP
server.listen(config.port, function () {
    console.log("http://localhost/search.html")
})