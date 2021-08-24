"use strict";
/**
 * 第6节
 * 知识点：
 * 1.条件语句和循环语句
 * 2.块作用域
 * 3.如何避免
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
const scope_1 = require("./scope");
const vm_1 = require("./vm");
/////////////////////////////////////////////////////////////////////////
// 解释器
/**
 * 遍历AST，执行函数调用。
 */
class Intepretor extends ast_1.AstVisitor {
    constructor() {
        super();
        //调用栈
        this.callStack = [];
        //创建顶层的栈桢
        this.currentFrame = new StackFrame();
        this.callStack.push(this.currentFrame);
    }
    pushFrame(frame) {
        this.callStack.push(frame);
        this.currentFrame = frame;
    }
    popFrame() {
        if (this.callStack.length > 1) {
            let frame = this.callStack[this.callStack.length - 2];
            this.callStack.pop();
            this.currentFrame = frame;
        }
    }
    //函数声明不做任何事情。
    visitFunctionDecl(functionDecl) {
    }
    /**
     * 遍历一个块
     * @param block
     */
    visitBlock(block) {
        let retVal;
        for (let x of block.stmts) {
            retVal = this.visit(x);
            //如果当前执行了一个返回语句，那么就直接返回，不再执行后面的语句。
            //如果存在上一级Block，也是中断执行，直接返回。
            if (typeof retVal == 'object' &&
                ReturnValue.isReturnValue(retVal)) {
                return retVal;
            }
        }
        return retVal;
    }
    /**
     * 处理Return语句时，要把返回值封装成一个特殊的对象，用于中断后续程序的执行。
     * @param returnStatement
     */
    visitReturnStatement(returnStatement) {
        let retVal;
        if (returnStatement.exp != null) {
            retVal = this.visit(returnStatement.exp);
            this.setReturnValue(retVal);
        }
        return new ReturnValue(retVal); //这里是传递一个信号，让Block和for循环等停止执行。
    }
    //把返回值设置到上一级栈桢中（也就是调用者的栈桢）
    setReturnValue(retVal) {
        let frame = this.callStack[this.callStack.length - 2];
        frame.retVal = retVal;
    }
    /**
     * 执行if语句
     * @param ifStmt
     */
    visitIfStatement(ifStmt) {
        //计算条件
        let conditionValue = this.visit(ifStmt.condition);
        //条件为真，则执行then部分
        if (conditionValue) {
            return this.visit(ifStmt.stmt);
        }
        //条件为false，则执行else部分
        else if (ifStmt.elseStmt != null) {
            return this.visit(ifStmt.elseStmt);
        }
    }
    /**
     * 执行for语句
     * @param forStmt
     */
    visitForStatement(forStmt) {
        //执行init
        if (forStmt.init != null) {
            this.visit(forStmt.init);
        }
        //计算循环结束的条件
        let notTerminate = forStmt.condition == null ? true : this.visit(forStmt.condition);
        while (notTerminate) {
            //执行循环体
            let retVal = this.visit(forStmt.stmt);
            //处理循环体中的Return语句
            if (typeof retVal == 'object' && ReturnValue.isReturnValue(retVal)) {
                // console.log("is ReturnValue!!")
                return retVal;
            }
            //执行增量表达式
            if (forStmt.increment != null) {
                this.visit(forStmt.increment);
            }
            //执行循环判断
            notTerminate = forStmt.condition == null ? true : this.visit(forStmt.condition);
        }
    }
    /**
     * 运行函数调用。
     * 原理：根据函数定义，执行其函数体。
     * @param functionCall
     */
    visitFunctionCall(functionCall) {
        // console.log("running funciton:" + functionCall.name);
        if (functionCall.name == "println") { //内置函数
            return this.println(functionCall.arguments);
        }
        else if (functionCall.name == "tick") {
            return this.tick();
        }
        else if (functionCall.name == "integer_to_string") {
            return this.integer_to_string(functionCall.arguments);
        }
        if (functionCall.sym != null) {
            //清空返回值
            this.currentFrame.retVal = undefined;
            //1.创建新栈桢
            let frame = new StackFrame();
            //2.计算参数值，并保存到新创建的栈桢
            let functionDecl = functionCall.sym.decl;
            if (functionDecl.callSignature.paramList != null) {
                let params = functionDecl.callSignature.paramList.params;
                for (let i = 0; i < params.length; i++) {
                    let variableDecl = params[i];
                    let val = this.visit(functionCall.arguments[i]);
                    frame.values.set(variableDecl.sym, val); //设置到新的frame里。
                }
            }
            //3.把新栈桢入栈 
            this.pushFrame(frame);
            //4.执行函数
            this.visit(functionDecl.body);
            //5.弹出当前的栈桢
            this.popFrame();
            //5.函数的返回值
            return this.currentFrame.retVal;
        }
        else {
            console.log("Runtime error, cannot find declaration of " + functionCall.name + ".");
            return;
        }
    }
    /**
     * 内置函数println
     * @param functionCall
     */
    println(args) {
        if (args.length > 0) {
            let retVal = this.visit(args[0]);
            console.log(retVal);
        }
        else {
            console.log();
        }
        return 0;
    }
    /**
     * 内置函数tick
     */
    tick() {
        let date = new Date();
        let value = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        return value;
    }
    /**
     * 把整型转成字符串
     * @param functionCall
     */
    integer_to_string(args) {
        if (args.length > 0) {
            let arg = this.visit(args[0]);
            return arg.toString();
        }
        return "";
    }
    /**
     * 变量声明
     * 如果存在变量初始化部分，要存下变量值。
     * @param functionDecl
     */
    visitVariableDecl(variableDecl) {
        if (variableDecl.init != null) {
            let v = this.visit(variableDecl.init);
            this.setVariableValue(variableDecl.sym, v);
            return v;
        }
    }
    /**
     * 获取变量的值。
     * 左值的情况，返回符号。否则，返回值。
     * @param v
     */
    visitVariable(v) {
        if (v.isLeftValue) {
            return v.sym;
        }
        else {
            return this.getVariableValue(v.sym);
        }
    }
    getVariableValue(sym) {
        return this.currentFrame.values.get(sym);
    }
    setVariableValue(sym, value) {
        return this.currentFrame.values.set(sym, value);
    }
    visitBinary(bi) {
        // console.log("visitBinary:" + bi.op);
        let ret;
        let v1 = this.visit(bi.exp1);
        let v2 = this.visit(bi.exp2);
        switch (bi.op) {
            case scanner_1.Op.Plus: //'+'
                ret = v1 + v2;
                break;
            case scanner_1.Op.Minus: //'-'
                ret = v1 - v2;
                break;
            case scanner_1.Op.Multiply: //'*'
                ret = v1 * v2;
                break;
            case scanner_1.Op.Divide: //'/'
                ret = v1 / v2;
                break;
            case scanner_1.Op.Modulus: //'%'
                ret = v1 % v2;
                break;
            case scanner_1.Op.G: //'>'
                ret = v1 > v2;
                break;
            case scanner_1.Op.GE: //'>='
                ret = v1 >= v2;
                break;
            case scanner_1.Op.L: //'<'
                ret = v1 < v2;
                break;
            case scanner_1.Op.LE: //'<='
                ret = v1 <= v2;
                break;
            case scanner_1.Op.EQ: //'=='
                ret = v1 == v2;
                break;
            case scanner_1.Op.NE: //'!='
                ret = v1 != v2;
                break;
            case scanner_1.Op.And: //'&&'
                ret = v1 && v2;
                break;
            case scanner_1.Op.Or: //'||'
                ret = v1 || v2;
                break;
            case scanner_1.Op.Assign: //'='
                let varSymbol = v1;
                this.setVariableValue(varSymbol, v2);
                break;
            default:
                console.log("Unsupported binary operation: " + scanner_1.Op[bi.op]);
        }
        return ret;
    }
    /**
     * 计算一元表达式
     * @param u
     */
    visitUnary(u) {
        let v = this.visit(u.exp);
        let varSymbol;
        let value;
        switch (u.op) {
            case scanner_1.Op.Inc: //'++'
                varSymbol = v;
                value = this.getVariableValue(varSymbol);
                this.setVariableValue(varSymbol, value + 1);
                if (u.isPrefix) {
                    return value + 1;
                }
                else {
                    return value;
                }
                break;
            case scanner_1.Op.Dec: //'--'
                varSymbol = v;
                value = this.getVariableValue(varSymbol);
                this.setVariableValue(varSymbol, value - 1);
                if (u.isPrefix) {
                    return value - 1;
                }
                else {
                    return value;
                }
                break;
            case scanner_1.Op.Plus: //'+'
                return v; //不需要做任何动作
            case scanner_1.Op.Minus: //'-'
                return -v; //对值取反   
            default:
                console.log("Unsupported unary op: " + scanner_1.Op[u.op]);
        }
    }
}
// /**
//  * 左值。
//  * 目前先只是指变量。
//  */
// class LeftValue{
//     variable:VarSymbol;
//     constructor(variable:VarSymbol){
//         this.variable = variable;
//     }
// }
/**
 * 栈桢
 * 每个函数对应一级栈桢.
 */
class StackFrame {
    constructor() {
        //存储变量的值
        this.values = new Map();
        //返回值，当调用函数的时候，返回值放在这里
        this.retVal = undefined;
    }
}
/**
 * 用于封装Return语句的返回结果，并结束后续语句的执行。
 */
class ReturnValue {
    constructor(value) {
        this.tag_ReturnValue = 0;
        this.value = value;
    }
    static isReturnValue(v) {
        return typeof v.tag_ReturnValue != 'undefined';
    }
}
/////////////////////////////////////////////////////////////////////////
// 主程序
function compileAndRun(fileName, program) {
    //源代码
    console.log("源代码:");
    console.log(program);
    //词法分析
    console.log("\n词法分析结果:");
    let scanner = new scanner_1.Scanner(new scanner_1.CharStream(program));
    while (scanner.peek().kind != scanner_1.TokenKind.EOF) {
        console.log(scanner.next().toString());
    }
    scanner = new scanner_1.Scanner(new scanner_1.CharStream(program)); //重置tokenizer,回到开头。
    //语法分析
    let parser = new parser_1.Parser(scanner);
    let prog = parser.parseProg();
    console.log("\n语法分析后的AST:");
    let astDumper = new ast_1.AstDumper();
    astDumper.visit(prog, "");
    //语义分析
    let semanticAnalyer = new semantic_1.SemanticAnalyer();
    semanticAnalyer.execute(prog);
    console.log("\n符号表：");
    new scope_1.ScopeDumper().visit(prog, "");
    console.log("\n语义分析后的AST，注意变量和函数已被消解:");
    astDumper.visit(prog, "");
    if (parser.errors.length > 0 || semanticAnalyer.errors.length > 0) {
        console.log("\n共发现" + parser.errors.length + "个语法错误，" + semanticAnalyer.errors.length + "个语义错误。");
        return;
    }
    //运行程序
    console.log("\n通过AST解释器运行程序:");
    let date1 = new Date();
    let retVal = new Intepretor().visit(prog);
    let date2 = new Date();
    console.log("程序返回值：");
    // console.log(retVal);
    console.log("耗时：" + (date2.getTime() - date1.getTime()) / 1000 + "秒");
    // 用vm运行程序
    console.log("\n编译成字节码:");
    let generator = new vm_1.BCGenerator();
    let bcModule = generator.visit(prog);
    let bcModuleDumper = new vm_1.BCModuleDumper();
    bcModuleDumper.dump(bcModule);
    // console.log(bcModule);
    console.log("\n使用栈机运行程序:");
    date1 = new Date();
    retVal = new vm_1.VM().execute(bcModule);
    date2 = new Date();
    console.log("程序返回值：");
    // console.log(retVal);
    console.log("耗时：" + (date2.getTime() - date1.getTime()) / 1000 + "秒");
    console.log("\n生成字节码文件：");
    let writer = new vm_1.BCModuleWriter();
    let code = writer.write(bcModule);
    let str = '';
    for (let c of code) {
        str += c.toString(16) + " ";
    }
    console.log(str);
    //保存成二进制字节码
    let bcFileName = fileName.substr(0, fileName.indexOf('.')) + ".bc";
    writeByteCode(bcFileName, code);
    let newCode = readByteCode(bcFileName);
    console.log(newCode);
    //读取字节码文件并执行
    console.log("\n从字节码中生成新BCModule:");
    let reader = new vm_1.BCModuleReader();
    let newModule = reader.read(code);
    bcModuleDumper.dump(newModule);
    console.log("\n用栈机执行新的BCModule:");
    date1 = new Date();
    retVal = new vm_1.VM().execute(newModule);
    date2 = new Date();
    console.log("程序返回值：");
    console.log(retVal);
    console.log("耗时：" + (date2.getTime() - date1.getTime()) / 1000 + "秒");
}
function writeByteCode(fileName, bc) {
    let fs = require('fs');
    let buffer = Buffer.alloc(bc.length);
    for (let i = 0; i < bc.length; i++) {
        buffer[i] = bc[i];
    }
    console.log(buffer);
    try {
        fs.writeFileSync(fileName, buffer);
    }
    catch (err) {
        console.log(err);
    }
}
function readByteCode(fileName) {
    let fs = require('fs');
    let bc = [];
    var buffer;
    try {
        buffer = fs.readFileSync(fileName, buffer);
        for (let i = 0; i < buffer.length; i++) {
            bc[i] = buffer[i];
        }
    }
    catch (err) {
        console.log(err);
    }
    return bc;
}
function writeTextFile(fileName, data) {
    let fs = require('fs');
    try {
        fs.writeFileSync(fileName, data);
    }
    catch (err) {
        console.log(err);
    }
}
function readTextFile(fileName) {
    let fs = require('fs');
    let str = "";
    fs.readFile(fileName, 'utf8', function (err, data) {
        if (err)
            throw err;
        // str = data;
        console.log(data);
    });
    return str;
}
//处理命令行参数，从文件里读取源代码
const process = __importStar(require("process"));
// 要求命令行的第三个参数，一定是一个文件名。
if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
}
//编译和运行源代码
let fileName = process.argv[2];
let fs = require('fs');
fs.readFile(fileName, 'utf8', function (err, data) {
    if (err)
        throw err;
    compileAndRun(fileName, data);
});
