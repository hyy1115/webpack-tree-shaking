# webpack-tree-shaking

### 目的

本文将会介绍下面几个部分的内容：

1、babel7结合webpack3的用法

2、tree-shaking对于普通js函数的影响

3、tree-shaking对于react组件的影响

### 相关技术
这里我们将使用babel7，也是目前最新的版本，你会看到不再需要babel-preset-es2015这些东西了。所有的babel插件都改成@babel/xxx的形式。

babel-loader也必须使用8+版本。

webpack版本必须3+。

react和react-dom均采用16+。
```json
"devDependencies": {
    "@babel/core": "^7.0.0-beta.36",
    "@babel/preset-env": "^7.0.0-beta.36",
    "@babel/preset-react": "^7.0.0-beta.36",
    "babel-loader": "^8.0.0-beta.0",
    "uglifyjs-webpack-plugin": "^1.1.6",
    "webpack": "^3.10.0"
  },
  "dependencies": {
    "react": "^16.2.0",
    "react-dom": "^16.2.0"
  }
```

### 配置公共开发环境

安装好上面的插件之后，需要配置几个公共文件。

#### 1、.babelrc

babel8的写法是下面这种，需要注意了，别用以前的写法了。
```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"],
  "env": {
    "production": {
      "presets": ["react-optimize"]
    }
  }
}
```

#### 2、.eslint
很简单的配置，可以不关注
```json
{
	"env": {
		"browser": true,
        "es6": true
	},
	"parserOptions": {
		"sourceType": "module"
	},
	"rules": {
		"keyword-spacing": 0,
		"node/no-unsupported-features": 0
	}
}
```
#### 3、webpack.config.js

webpack配置了2个对象，打包后的app.js和shaking.js分别用来测试普通函数和React组件对于tree-shaking的支持。

```javascript
const path = require('path');
const webpack = require('webpack');
//压缩js的插件
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

//入口文件和输出文件的路径
const PATHS = {
  app: path.join(__dirname, 'app', 'entry'), //react入口文件
  build: path.join(__dirname, 'build'), //输出文件
  shaking: path.join(__dirname, 'app', 'shaking') //普通函数入口文件
};

module.exports = [
    //react打包配置
    {
        entry: {
            vendor: ['react', 'react-dom'],
            app: PATHS.app,
        },
        output: {
            path: path.join(PATHS.build),
            filename: '[name].js',
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor'
            }),
            new UglifyJSPlugin()
        ],
        module: {
            rules: [{
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            }]
        }
    },
    //普通函数打包配置
    {
        entry: {
            shaking: PATHS.shaking,
        },
        output: {
            path: path.join(PATHS.build),
            filename: '[name].js',
        },
        plugins: [
            new UglifyJSPlugin()
        ]
    }
];

```
### 主文件

#### 1、主文件位于app目录下面。

#### 2、有2个入口文件，分别是entry.js和shaking.js

```javascript
//entry.js
import React from 'react'
import { ReactDOm } from 'react-dom'
import App from './App'

ReactDOM.render(
    App,
    document.getElementById('root')
);
```
```javascript
//shaking.js
//这是来自webpack官方例子
import { square } from './lib/utils.js';

function component() {
    var element = document.createElement('pre');
    
    element.innerHTML = [
        'Hello webpack!',
        '5 cubed is equal to ' + square(10)
    ].join('\n\n');
    
    return element;
}

document.body.appendChild(component());
```
#### 3、App.js

react组件顶层容器
```javascript
import React from 'react'
import A from './components/A'

const App = () => {
    return <A />
}
export default App
```
#### 4、components文件夹

react子组件
```javascript
import React from 'react'
import { square } from '../lib/utils'

const A = () => {
    return (
        <div>
            测试tree shaking的效果 {square(10)}
        </div>
    )
}
```
#### 5、lib文件夹

export模块导出函数
```javascript
export function square(x) {
    return x * x;
}

export function cube(x) {
    return x * x * x;
}
```

### 打包测试tree-shaking

#### 1、普通函数打包结果

下面的代码你前面全都可以忽略，只需要看函数的末尾，可以看到函数最末尾只打包了square方法，没有使用到的cube方法成功被干掉了，这说明tree-shaking生效。
```javascript
!function(e) {
    var n = {};
    function t(r) {
        if (n[r])
            return n[r].exports;
        var o = n[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return e[r].call(o.exports, o, o.exports, t),
        o.l = !0,
        o.exports
    }
    t.m = e,
    t.c = n,
    t.d = function(e, n, r) {
        t.o(e, n) || Object.defineProperty(e, n, {
            configurable: !1,
            enumerable: !0,
            get: r
        })
    }
    ,
    t.n = function(e) {
        var n = e && e.__esModule ? function() {
            return e.default
        }
        : function() {
            return e
        }
        ;
        return t.d(n, "a", n),
        n
    }
    ,
    t.o = function(e, n) {
        return Object.prototype.hasOwnProperty.call(e, n)
    }
    ,
    t.p = "",
    t(t.s = 0)
}([function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
        value: !0
    });
    var r, o = t(1);
    document.body.appendChild(((r = document.createElement("pre")).innerHTML = ["Hello webpack!", "5 cubed is equal to " + Object(o.a)(10)].join("\n\n"),
    r))
}
, function(e, n, t) {
    "use strict";
    //只打包了square
    n.a = function(e) {
        return e * e
    }
}
]);

```
#### 2、react组件打包结果

同样，你只需要看函数的最末尾，发现square和cube都打包进来，tree-shaking没有生效。
这是为什么呢？我想可能和使用了babel-loader有关，而webpack官方的demo也没有对react组件的tree-shaking做说明，所以我暂时认为它还存在一定的缺陷。让我们期待webpack4，看它能不能更好的解决大部分js的tree-shaking功能。
```javascript
webpackJsonp([0], {
    27: function(e, t, u) {
        "use strict";
        r(u(2)),
        u(8);
        var n = r(u(28));
        function r(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        ReactDOM.render(n.default, document.getElementById("root"))
    },
    28: function(e, t, u) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
        t.default = void 0;
        var n, r = (n = u(2)) && n.__esModule ? n : {
            default: n
        }, o = u(29);
        var c = function() {
            return r.default.createElement("div", null, (0,
            o.square)(10))
        };
        t.default = c
    },
    29: function(e, t, u) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
        //打包了square
        t.square = function(e) {
            return e * e
        }
        ,
        //打包了cube
        t.cube = function(e) {
            return e * e * e
        }
    }
}, [27]);

```