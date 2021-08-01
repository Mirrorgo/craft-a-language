"use strict";
/**
 * 第4节
 * 知识点：
 * 1.语法分析：变量声明和变量赋值
 * 2.符号表
 * 3.变量的引用消解
 * 4.解释器：变量的存取
 * 5.左值
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const scanner_1 = require("./scanner");
const ast_1 = require("./ast");
const parser_1 = require("./parser");
const semantic_1 = require("./semantic");
/////////////////////////////////////////////////////////////////////////
// 解释器
/**
 * 遍历AST，执行函数调用。
 */
class Intepretor extends ast_1.AstVisitor {
    constructor() {
        super(...arguments);
        //存储变量值的区域
        this.globalFrame = new Map();
    }
    //函数声明不做任何事情。
    visitFunctionDecl(functionDecl) {
    }
    /**
     * 运行函数调用。
     * 原理：根据函数定义，执行其函数体。
     * @param functionCall
     */
    visitFunctionCall(functionCall) {
        // console.log("running funciton:" + functionCall.name);
        if (functionCall.name == "println") { //内置函数
            if (functionCall.parameters.length > 0) {
                let retVal = this.visit(functionCall.parameters[0]);
                if (typeof retVal.variable == 'object') {
                    retVal = this.getVariableValue(retVal.variable.name);
                }
                console.log(retVal);
            }
            else {
                console.log();
            }
            return 0;
        }
        else { //找到函数定义，继续遍历函数体
            if (functionCall.decl != null) {
                this.visitBlock(functionCall.decl.body);
            }
        }
    }
    /**
     * 变量声明
     * 如果存在变量初始化部分，要存下变量值。
     * @param functionDecl
     */
    visitVariableDecl(variableDecl) {
        if (variableDecl.init != null) {
            let v = this.visit(variableDecl.init);
            if (this.isLeftValue(v)) {
                v = this.getVariableValue(v.variable.name);
            }
            this.setVariableValue(variableDecl.name, v);
            return v;
        }
    }
    /**
     * 获取变量的值。
     * 这里给出的是左值。左值既可以赋值（写），又可以获取当前值（读）。
     * @param v
     */
    visitVariable(v) {
        return new LeftValue(v);
    }
    getVariableValue(varName) {
        return this.globalFrame.get(varName);
    }
    setVariableValue(varName, value) {
        return this.globalFrame.set(varName, value);
    }
    isLeftValue(v) {
        return typeof v.variable == 'object';
    }
    visitBinary(bi) {
        // console.log("visitBinary:" + bi.op);
        let ret;
        let v1 = this.visit(bi.exp1);
        let v2 = this.visit(bi.exp2);
        let v1left = null;
        let v2left = null;
        if (this.isLeftValue(v1)) {
            v1left = v1;
            v1 = this.getVariableValue(v1left.variable.name);
            console.log("value of " + v1left.variable.name + " : " + v1);
        }
        if (this.isLeftValue(v2)) {
            v2left = v2;
            v2 = this.getVariableValue(v2left.variable.name);
        }
        switch (bi.op) {
            case '+':
                ret = v1 + v2;
                break;
            case '-':
                ret = v1 - v2;
                break;
            case '*':
                ret = v1 * v2;
                break;
            case '/':
                ret = v1 / v2;
                break;
            case '%':
                ret = v1 % v2;
                break;
            case '>':
                ret = v1 > v2;
                break;
            case '>=':
                ret = v1 >= v2;
                break;
            case '<':
                ret = v1 < v2;
                break;
            case '<=':
                ret = v1 <= v2;
            case '&&':
                ret = v1 && v2;
                break;
            case '||':
                ret = v1 || v2;
                break;
            case '=':
                if (v1left != null) {
                    this.setVariableValue(v1left.variable.name, v2);
                }
                else {
                    console.log("Assignment need a left value: ");
                }
                break;
            default:
                console.log("Unsupported binary operation: " + bi.op);
        }
        return ret;
    }
}
/**
 * 左值。
 * 目前先只是指变量。
 */
class LeftValue {
    constructor(variable) {
        this.variable = variable;
    }
}
/////////////////////////////////////////////////////////////////////////
// 主程序
function compileAndRun(program) {
    //源代码
    console.log("源代码:");
    console.log(program);
    //词法分析
    console.log("\n词法分析结果:");
    let tokenizer = new scanner_1.Scanner(new scanner_1.CharStream(program));
    while (tokenizer.peek().kind != scanner_1.TokenKind.EOF) {
        console.log(tokenizer.next());
    }
    tokenizer = new scanner_1.Scanner(new scanner_1.CharStream(program)); //重置tokenizer,回到开头。
    //语法分析
    let prog = new parser_1.Parser(tokenizer).parseProg();
    console.log("\n语法分析后的AST:");
    prog.dump("");
    //语义分析
    let symTable = new semantic_1.SymTable();
    new semantic_1.Enter(symTable).visit(prog); //建立符号表
    new semantic_1.RefResolver(symTable).visit(prog); //引用消解
    console.log("\n语法分析后的AST，注意变量和函数已被消解:");
    prog.dump("");
    //运行程序
    console.log("\n运行当前的程序:");
    let retVal = new Intepretor().visit(prog);
    console.log("程序返回值：" + retVal);
}
//处理命令行参数，从文件里读取源代码
const process = __importStar(require("process"));
// 要求命令行的第三个参数，一定是一个文件名。
if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
}
// 读取源代码
let fs = require('fs');
let filename = process.argv[2];
fs.readFile(filename, 'utf8', function (err, data) {
    if (err)
        throw err;
    compileAndRun(data);
});
