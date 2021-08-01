"use strict";
/**
 * 语义分析功能
 * @version 0.2
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 *
 * 当前特性：
 * 1.简单的符号表
 * 2.简单的函数消解
 * 3.简单的变量消解
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefResolver = exports.Enter = exports.SymKind = exports.SymTable = void 0;
const ast_1 = require("./ast");
/////////////////////////////////////////////////////////////////////////
// 符号表
// 
/**
 * 符号表
 * 保存变量、函数、类等的名称和它的类型、声明的位置（AST节点）
 */
class SymTable {
    constructor() {
        this.table = new Map();
    }
    set(name, decl, symType) {
        this.table.set(name, new SymTableItem(decl, symType));
    }
    has(name) {
        return this.table.has(name);
    }
    getKind(name) {
        let item = this.table.get(name);
        if (typeof item == 'object') {
            return item.kind;
        }
        else {
            return null;
        }
    }
    getDecl(name) {
        let item = this.table.get(name);
        if (typeof item == 'object') {
            return item.decl;
        }
        else {
            return null;
        }
    }
}
exports.SymTable = SymTable;
/**
 * 符号表条目
 */
class SymTableItem {
    constructor(decl, kind) {
        this.decl = decl;
        this.kind = kind;
    }
}
/**
 * 符号类型
 */
var SymKind;
(function (SymKind) {
    SymKind[SymKind["Variable"] = 0] = "Variable";
    SymKind[SymKind["Function"] = 1] = "Function";
    SymKind[SymKind["Class"] = 2] = "Class";
    SymKind[SymKind["Interface"] = 3] = "Interface";
})(SymKind = exports.SymKind || (exports.SymKind = {}));
;
/////////////////////////////////////////////////////////////////////////
// 建立符号表
// 
/**
 * 把符号加入符号表。
 */
class Enter extends ast_1.AstVisitor {
    constructor(symTable) {
        super();
        this.symTable = symTable;
    }
    /**
     * 把函数声明加入符号表
     * @param functionDecl
     */
    visitFunctionDecl(functionDecl) {
        if (this.symTable.has(functionDecl.name)) {
            console.log("Dumplicate symbol: " + functionDecl.name);
        }
        this.symTable.set(functionDecl.name, functionDecl, SymKind.Function);
    }
    /**
     * 把函数声明加入符号表
     * @param functionDecl
     */
    visitVariableDecl(variableDecl) {
        if (this.symTable.has(variableDecl.name)) {
            console.log("Dumplicate symbol: " + variableDecl.name);
        }
        this.symTable.set(variableDecl.name, variableDecl, SymKind.Variable);
    }
}
exports.Enter = Enter;
/////////////////////////////////////////////////////////////////////////
// 引用消解
// 1.函数引用消解
// 2.变量应用消解
/**
 * 引用消解
 * 遍历AST。如果发现函数调用和变量引用，就去找它的定义。
 */
class RefResolver extends ast_1.AstVisitor {
    constructor(symTable) {
        super();
        this.symTable = symTable;
    }
    visitFunctionCall(functionCall) {
        let decl = this.symTable.getDecl(functionCall.name);
        if (decl != null || this.symTable.getKind(functionCall.name) == SymKind.Function) {
            functionCall.decl = decl;
        }
        else {
            if (functionCall.name != "println") { //系统内置函数不用报错
                console.log("Error: cannot find declaration of function " + functionCall.name);
            }
        }
    }
    visitVariable(variable) {
        let decl = this.symTable.getDecl(variable.name);
        if (decl != null || this.symTable.getKind(variable.name) == SymKind.Variable) {
            variable.decl = decl;
        }
        else {
            console.log("Error: cannot find declaration of variable " + variable.name);
        }
    }
}
exports.RefResolver = RefResolver;
