"use strict";
/**
 * 进行尾递归和尾调用的分析
 * @version 0.2
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-27
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TailAnalysisResult = exports.TailAnalyzer = void 0;
const ast_1 = require("./ast");
class TailAnalyzer extends ast_1.AstVisitor {
    constructor() {
        super(...arguments);
        this.currentFunction = null;
        this.result = null;
        this.inBranch = false;
    }
    visitProg(prog) {
        //初始化内部成员
        this.currentFunction = prog.sym;
        let rtn = new TailAnalysisResult();
        this.result = rtn;
        //遍历程序
        super.visitProg(prog);
        //重置内部成员
        this.currentFunction = null;
        this.result = null;
        return rtn;
    }
    /**
     * 遍历函数声明
     * @param functionDecl
     */
    visitFunctionDecl(functionDecl) {
        //修改当前函数
        let oldFunction = this.currentFunction;
        this.currentFunction = functionDecl.sym;
        //遍历函数声明
        super.visitFunctionDecl(functionDecl);
        //恢复当前函数
        this.currentFunction = oldFunction;
    }
    //只需要把自己这个节点本身返回给上一级节点就行。
    //在visitReturnStatement中如果接到这个节点，就可以进一步去处理。
    visitFunctionCall(functionCall) {
        return { type: "functionCall", node: functionCall };
    }
    //访问下级节点，看看它是不是一个函数调用表达式
    visitReturnStatement(returnStmt) {
        var _a, _b;
        if (returnStmt.exp != null) {
            let rtn = this.visit(returnStmt.exp);
            if (typeof rtn == 'object' && rtn.type == "functionCall") {
                let functionCall = rtn.node;
                if (functionCall.sym == this.currentFunction) {
                    (_a = this.result) === null || _a === void 0 ? void 0 : _a.tailRecursives.push(functionCall);
                }
                else if (functionCall.arguments.length <= 6) { //参数小于6个才能做尾调用的优化
                    console.log("functionCall.arguments.length");
                    console.log(functionCall.arguments.length);
                    (_b = this.result) === null || _b === void 0 ? void 0 : _b.tailCalls.push(functionCall);
                }
            }
        }
    }
    visitIfStatement(ifStmt) {
        let oldInBranch = this.inBranch;
        super.visitIfStatement(ifStmt);
        this.inBranch = oldInBranch;
    }
    visitForStatement(forStmt) {
        let oldInBranch = this.inBranch;
        super.visitForStatement(forStmt);
        this.inBranch = oldInBranch;
    }
}
exports.TailAnalyzer = TailAnalyzer;
/**
 * 保存TailAnalysis的结果。
 */
class TailAnalysisResult {
    constructor() {
        this.tailRecursives = []; //尾递归的函数调用
        this.tailCalls = []; //尾调用
    }
}
exports.TailAnalysisResult = TailAnalysisResult;
