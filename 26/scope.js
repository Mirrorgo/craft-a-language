"use strict";
/**
 * 作用域
 * @version 0.3
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeDumper = exports.Scope = void 0;
const symbol_1 = require("./symbol");
const ast_1 = require("./ast");
/**
 * 作用域
 * 用来限定标识符的可见性。
 */
class Scope {
    constructor(enclosingScope) {
        //以名称为key存储符号
        this.name2sym = new Map();
        this.enclosingScope = enclosingScope;
    }
    /**
     * 把符号记入符号表（作用域）
     * @param name
     * @param sym
     */
    enter(name, sym) {
        this.name2sym.set(name, sym);
    }
    /**
     * 查询是否有某名称的符号
     * @param name
     */
    hasSymbol(name) {
        return this.name2sym.has(name);
    }
    /**
     * 根据名称查找符号。
     * @param name 符号名称。
     * @returns 根据名称查到的Symbol。如果没有查到，则返回null。
     */
    getSymbol(name) {
        let sym = this.name2sym.get(name);
        if (typeof sym == 'object') {
            return sym;
        }
        else {
            return null;
        }
    }
    /**
     * 级联查找某个符号。
     * 先从本作用域查找，查不到就去上一级作用域，依此类推。
     * @param name
     */
    getSymbolCascade(name) {
        let sym = this.getSymbol(name);
        if (sym != null) {
            return sym;
        }
        else if (this.enclosingScope != null) {
            return this.enclosingScope.getSymbolCascade(name);
        }
        else {
            return null;
        }
    }
}
exports.Scope = Scope;
/**
 * 打印Scope信息
 */
class ScopeDumper extends ast_1.AstVisitor {
    visitFunctionDecl(functionDecl, prefix) {
        console.log(prefix + "Scope of function: " + functionDecl.name);
        //显示本级Scope
        if (functionDecl.scope != null) {
            this.dumpScope(functionDecl.scope, prefix);
        }
        else {
            console.log(prefix + "{null}");
        }
        //继续遍历
        super.visitFunctionDecl(functionDecl, prefix + "    ");
    }
    visitBlock(block, prefix) {
        console.log(prefix + "Scope of block");
        //显示本级Scope
        if (block.scope != null) {
            this.dumpScope(block.scope, prefix);
        }
        else {
            console.log(prefix + "{null}");
        }
        //继续遍历
        super.visitBlock(block, prefix + "    ");
    }
    visitForStatement(stmt, prefix) {
        console.log(prefix + "Scope of for statement");
        //显示本级Scope
        if (stmt.scope != null) {
            this.dumpScope(stmt.scope, prefix);
        }
        else {
            console.log(prefix + "{null}");
        }
        //继续遍历
        super.visitForStatement(stmt, prefix);
    }
    dumpScope(scope, prefix) {
        if (scope.name2sym.size > 0) {
            //遍历该作用域的符号。
            let symbolDumper = new symbol_1.SymbolDumper();
            for (let sym of scope.name2sym.values()) {
                symbolDumper.visit(sym, prefix + "    ");
            }
        }
        else {
            console.log(prefix + "    {empty}");
        }
    }
}
exports.ScopeDumper = ScopeDumper;
