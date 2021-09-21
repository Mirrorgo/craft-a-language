"use strict";
/**
 * 语义分析功能
 * @version 0.5
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 *
 * 当前特性：
 * 1.树状的符号表
 * 2.简单的引用消解：没有考虑声明的先后顺序，也没有考虑闭包
 * 3.简单的作用域
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticError = exports.SemanticAnalyer = void 0;
const ast_1 = require("./ast");
const console_1 = require("console");
const symbol_1 = require("./symbol");
const scope_1 = require("./scope");
const types_1 = require("./types");
const scanner_1 = require("./scanner");
const error_1 = require("./error");
class SemanticAnalyer {
    constructor() {
        this.passes = [
            new Enter(),
            new RefResolver(),
            new TypeChecker(),
            // new TypeConverter(),
            new LeftValueAttributor(),
            new Trans()
        ];
        this.errors = []; //语义错误
        this.warnings = []; //语义报警信息
    }
    execute(prog) {
        this.errors = [];
        this.warnings = [];
        for (let pass of this.passes) {
            pass.visitProg(prog);
            this.errors = this.errors.concat(pass.errors);
            this.warnings = this.warnings.concat(pass.warnings);
        }
    }
}
exports.SemanticAnalyer = SemanticAnalyer;
class SemanticError extends error_1.CompilerError {
    constructor(msg, node, isWarning = false) {
        super(msg, node.beginPos, /* node.endPos, */ isWarning);
        this.node = node;
    }
}
exports.SemanticError = SemanticError;
class SemanticAstVisitor extends ast_1.AstVisitor {
    constructor() {
        super(...arguments);
        this.errors = []; //语义错误
        this.warnings = []; //语义报警信息
    }
    addError(msg, node) {
        this.errors.push(new SemanticError(msg, node));
        console.log("@" + node.beginPos.toString() + " : " + msg);
    }
    addWarning(msg, node) {
        this.warnings.push(new SemanticError(msg, node, true));
        console.log("@" + node.beginPos.toString() + " : " + msg);
    }
}
/////////////////////////////////////////////////////////////////////////
// 建立符号表
// 
/**
 * 把符号加入符号表。
 */
class Enter extends SemanticAstVisitor {
    constructor() {
        super(...arguments);
        this.scope = null; //当前所属的scope
        this.functionSym = null;
    }
    /**
     * 返回最顶级的Scope对象
     * @param prog
     */
    visitProg(prog) {
        let sym = new symbol_1.FunctionSymbol('main', new types_1.FunctionType(types_1.SysTypes.Integer, []));
        prog.sym = sym;
        this.functionSym = sym;
        return super.visitProg(prog);
    }
    /**
     * 把函数声明加入符号表
     * @param functionDecl
     */
    visitFunctionDecl(functionDecl) {
        let currentScope = this.scope;
        //创建函数的symbol
        let paramTypes = [];
        if (functionDecl.callSignature.paramList != null) {
            for (let p of functionDecl.callSignature.paramList.params) {
                paramTypes.push(p.theType);
            }
        }
        let sym = new symbol_1.FunctionSymbol(functionDecl.name, new types_1.FunctionType(functionDecl.callSignature.theType, paramTypes));
        sym.decl = functionDecl;
        functionDecl.sym = sym;
        //把函数加入当前scope
        if (currentScope.hasSymbol(functionDecl.name)) {
            this.addError("Dumplicate symbol: " + functionDecl.name, functionDecl);
        }
        else {
            currentScope.enter(functionDecl.name, sym);
        }
        //修改当前的函数符号
        let lastFunctionSym = this.functionSym;
        this.functionSym = sym;
        //创建新的Scope，用来存放参数
        let oldScope = currentScope;
        this.scope = new scope_1.Scope(oldScope);
        functionDecl.scope = this.scope;
        //遍历子节点
        super.visitFunctionDecl(functionDecl);
        //恢复当前函数
        this.functionSym = lastFunctionSym;
        //恢复原来的Scope
        this.scope = oldScope;
    }
    /**
     * 遇到块的时候，就建立一级新的作用域。
     * 支持块作用域
     * @param block
     */
    visitBlock(block) {
        //创建下一级scope
        let oldScope = this.scope;
        this.scope = new scope_1.Scope(this.scope);
        block.scope = this.scope;
        //调用父类的方法，遍历所有的语句
        super.visitBlock(block);
        //重新设置当前的Scope
        this.scope = oldScope;
    }
    /**
     * 把变量声明加入符号表
     * @param variableDecl
     */
    visitVariableDecl(variableDecl) {
        var _a;
        let currentScope = this.scope;
        if (currentScope.hasSymbol(variableDecl.name)) {
            this.addError("Dumplicate symbol: " + variableDecl.name, variableDecl);
        }
        //把变量加入当前的符号表
        let sym = new symbol_1.VarSymbol(variableDecl.name, variableDecl.theType);
        variableDecl.sym = sym;
        currentScope.enter(variableDecl.name, sym);
        //把本地变量也加入函数符号中，可用于后面生成代码
        (_a = this.functionSym) === null || _a === void 0 ? void 0 : _a.vars.push(sym);
    }
    /**
     * 对于for循环来说，由于可以在for的init部分声明变量，所以要新建一个Scope。
     * @param forStmt
     */
    visitForStatement(forStmt) {
        //创建下一级scope
        let oldScope = this.scope;
        this.scope = new scope_1.Scope(this.scope);
        forStmt.scope = this.scope;
        //调用父类的方法，遍历所有的语句
        super.visitForStatement(forStmt);
        //重新设置当前的Scope
        this.scope = oldScope;
    }
}
/////////////////////////////////////////////////////////////////////////
// 引用消解
// 1.函数引用消解
// 2.变量应用消解
/**
 * 引用消解
 * 遍历AST。如果发现函数调用和变量引用，就去找它的定义。
 */
class RefResolver extends SemanticAstVisitor {
    constructor() {
        super(...arguments);
        this.scope = null; //当前的Scope
        //每个Scope已经声明了的变量的列表
        this.declaredVarsMap = new Map();
    }
    visitFunctionDecl(functionDecl) {
        //1.修改scope
        let oldScope = this.scope;
        this.scope = functionDecl.scope;
        console_1.assert(this.scope != null, "Scope不可为null");
        //为已声明的变量设置一个存储区域
        this.declaredVarsMap.set(this.scope, new Map());
        //2.遍历下级节点
        super.visitFunctionDecl(functionDecl);
        //3.重新设置scope
        this.scope = oldScope;
    }
    /**
     * 修改当前的Scope
     * @param block
     */
    visitBlock(block) {
        //1.修改scope
        let oldScope = this.scope;
        this.scope = block.scope;
        console_1.assert(this.scope != null, "Scope不可为null");
        //为已声明的变量设置一个存储区域
        this.declaredVarsMap.set(this.scope, new Map());
        //2.遍历下级节点
        super.visitBlock(block);
        //3.重新设置scope
        this.scope = oldScope;
    }
    visitForStatement(forStmt) {
        //1.修改scope
        let oldScope = this.scope;
        this.scope = forStmt.scope;
        console_1.assert(this.scope != null, "Scope不可为null");
        //为已声明的变量设置一个存储区域
        this.declaredVarsMap.set(this.scope, new Map());
        //2.遍历下级节点
        super.visitForStatement(forStmt);
        //3.重新设置scope
        this.scope = oldScope;
    }
    /**
     * 做函数的消解。
     * 函数不需要声明在前，使用在后。
     * @param functionCall
     */
    visitFunctionCall(functionCall) {
        let currentScope = this.scope;
        // console.log("in semantic.visitFunctionCall: " + functionCall.name);
        if (symbol_1.built_ins.has(functionCall.name)) { //系统内置函数
            functionCall.sym = symbol_1.built_ins.get(functionCall.name);
        }
        else {
            functionCall.sym = currentScope.getSymbolCascade(functionCall.name);
        }
        // console.log(functionCall.sym);
        //调用下级，主要是参数。
        super.visitFunctionCall(functionCall);
    }
    /**
     * 标记变量是否已被声明
     * @param variableDecl
     */
    visitVariableDecl(variableDecl) {
        let currentScope = this.scope;
        let declaredSyms = this.declaredVarsMap.get(currentScope);
        let sym = currentScope.getSymbol(variableDecl.name);
        if (sym != null) { //TODO 需要检查sym是否是变量
            declaredSyms.set(variableDecl.name, sym);
        }
        //处理初始化的部分
        super.visitVariableDecl(variableDecl);
    }
    /**
     * 变量引用消解
     * 变量必须声明在前，使用在后。
     * @param variable
     */
    visitVariable(variable) {
        let currentScope = this.scope;
        variable.sym = this.findVariableCascade(currentScope, variable);
    }
    /**
     * 逐级查找某个符号是不是在声明前就使用了。
     * @param scope
     * @param name
     * @param kind
     */
    findVariableCascade(scope, variable) {
        let declaredSyms = this.declaredVarsMap.get(scope);
        let symInScope = scope.getSymbol(variable.name);
        if (symInScope != null) {
            if (declaredSyms.has(variable.name)) {
                return declaredSyms.get(variable.name); //找到了，成功返回。
            }
            else {
                if (symInScope.kind == symbol_1.SymKind.Variable) {
                    this.addError("Variable: '" + variable.name + "' is used before declaration.", variable);
                }
                else {
                    this.addError("We expect a variable of name: '" + variable.name + "', but find a " + symbol_1.SymKind[symInScope.kind] + ".", variable);
                }
            }
        }
        else {
            if (scope.enclosingScope != null) {
                return this.findVariableCascade(scope.enclosingScope, variable);
            }
            else {
                this.addError("Cannot find a variable of name: '" + variable.name + "'", variable);
            }
        }
        return null;
    }
}
/////////////////////////////////////////////////////////////////////////
// 属性分析
// 1.类型计算和检查
// 
class LeftValueAttributor extends SemanticAstVisitor {
    constructor() {
        super(...arguments);
        this.parentOperator = null;
    }
    /**
     * 检查赋值符号和.符号左边是否是左值
     * @param binary
     */
    visitBinary(binary) {
        if (scanner_1.Operators.isAssignOp(binary.op) || binary.op == scanner_1.Op.Dot) {
            let lastParentOperator = this.parentOperator;
            this.parentOperator = binary.op;
            //检查左子节点
            this.visit(binary.exp1);
            if (!binary.exp1.isLeftValue) {
                this.addError("Left child of operator " + scanner_1.Op[binary.op] + " need a left value", binary.exp1);
            }
            //恢复原来的状态信息
            this.parentOperator = lastParentOperator;
            //继续遍历右子节点
            this.visit(binary.exp2);
        }
        else {
            super.visitBinary(binary);
        }
    }
    visitUnary(u) {
        //要求必须是个左值
        if (u.op == scanner_1.Op.Inc || u.op == scanner_1.Op.Dec) {
            let lastParentOperator = this.parentOperator;
            this.parentOperator = u.op;
            this.visit(u.exp);
            if (!u.exp.isLeftValue) {
                this.addError("Unary operator " + scanner_1.Op[u.op] + "can only be applied to a left value", u);
            }
            //恢复原来的状态信息
            this.parentOperator = lastParentOperator;
        }
        else {
            super.visitUnary(u);
        }
    }
    /**
     * 变量都可以作为左值，除非其类型是void
     * @param v
     */
    visitVariable(v) {
        if (this.parentOperator != null) {
            let t = v.theType;
            if (!t.hasVoid()) {
                v.isLeftValue = true;
            }
        }
    }
    /**
     * 但函数调用是在.符号左边，并且返回值不为void的时候，可以作为左值
     * @param functionCall
     */
    visitFunctionCall(functionCall) {
        if (this.parentOperator == scanner_1.Op.Dot) {
            let functionType = functionCall.theType;
            if (!functionType.returnType.hasVoid()) {
                functionCall.isLeftValue = true;
            }
        }
    }
}
/**
 * 类型检查
 */
class TypeChecker extends SemanticAstVisitor {
    visitVariableDecl(variableDecl) {
        super.visitVariableDecl(variableDecl);
        if (variableDecl.init != null) {
            let t1 = variableDecl.theType;
            let t2 = variableDecl.init.theType;
            if (!t2.LE(t1)) {
                this.addError("Operator '=' can not be applied to '" + t1.name + "' and '" + t2.name + "'.", variableDecl);
            }
            //类型推断：对于any类型，变成=号右边的具体类型
            if (t1 === types_1.SysTypes.Any) {
                variableDecl.theType = t2; //TODO：此处要调整
                // variableDecl.inferredType = t2;
                //重点是把类型记入符号中，这样相应的变量声明就会获得准确的类型
                //由于肯定是声明在前，使用在后，所以变量引用的类型是准确的。
                variableDecl.sym.theType = t2;
            }
        }
    }
    visitBinary(bi) {
        super.visitBinary(bi);
        let t1 = bi.exp1.theType;
        let t2 = bi.exp2.theType;
        if (scanner_1.Operators.isAssignOp(bi.op)) {
            bi.theType = t1;
            if (!t2.LE(t1)) { //检查类型匹配
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.name + "' and '" + t2.name + "'.", bi);
            }
        }
        else if (bi.op == scanner_1.Op.Plus) { //有一边是string，或者两边都是number才行。
            if (t1 == types_1.SysTypes.String || t2 == types_1.SysTypes.String) {
                bi.theType = types_1.SysTypes.String;
            }
            else if (t1.LE(types_1.SysTypes.Number) && t2.LE(types_1.SysTypes.Number)) {
                bi.theType = types_1.Type.getUpperBound(t1, t2);
            }
            else if (t1 == types_1.SysTypes.Any || t2 == types_1.SysTypes.Any) {
                bi.theType = types_1.SysTypes.Any;
            }
            else {
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.name + "' and '" + t2.name + "'.", bi);
            }
        }
        else if (scanner_1.Operators.isArithmeticOp(bi.op)) {
            if (t1.LE(types_1.SysTypes.Number) && t2.LE(types_1.SysTypes.Number)) {
                bi.theType = types_1.Type.getUpperBound(t1, t2);
            }
            else {
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.name + "' and '" + t2.name + "'.", bi);
            }
        }
        else if (scanner_1.Operators.isRelationOp(bi.op)) {
            if (t1.LE(types_1.SysTypes.Number) && t2.LE(types_1.SysTypes.Number)) {
                bi.theType = types_1.SysTypes.Boolean;
            }
            else {
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.name + "' and '" + t2.name + "'.", bi);
            }
        }
        else if (scanner_1.Operators.isLogicalOp(bi.op)) {
            if (t1.LE(types_1.SysTypes.Boolean) && t2.LE(types_1.SysTypes.Boolean)) {
                bi.theType = types_1.SysTypes.Boolean;
            }
            else {
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.name + "' and '" + t2.name + "'.", bi);
            }
        }
        else {
            this.addError("Unsupported binary operator: " + scanner_1.Op[bi.op], bi);
        }
    }
    visitUnary(u) {
        super.visitUnary(u);
        let t = u.exp.theType;
        //要求必须是个左值
        if (u.op == scanner_1.Op.Inc || u.op == scanner_1.Op.Dec) {
            if (t.LE(types_1.SysTypes.Number)) {
                u.theType = t;
            }
            else {
                this.addError("Unary operator " + scanner_1.Op[u.op] + "can not be applied to '" + t.name + "'.", u);
            }
        }
        else if (u.op == scanner_1.Op.Minus || u.op == scanner_1.Op.Plus) {
            if (t.LE(types_1.SysTypes.Number)) {
                u.theType = t;
            }
            else {
                this.addError("Unary operator " + scanner_1.Op[u.op] + "can not be applied to '" + t.name + "'.", u);
            }
        }
        else if (u.op == scanner_1.Op.Not) {
            if (t.LE(types_1.SysTypes.Boolean)) {
                u.theType = t;
            }
            else {
                this.addError("Unary operator " + scanner_1.Op[u.op] + "can not be applied to '" + t.name + "'.", u);
            }
        }
        else {
            this.addError("Unsupported unary operator: " + scanner_1.Op[u.op] + " applied to '" + t.name + "'.", u);
        }
    }
    /**
     * 用符号的类型（也就是变量声明的类型），来标注本节点
     * @param v
     */
    visitVariable(v) {
        if (v.sym != null) {
            v.theType = v.sym.theType;
        }
    }
    visitFunctionCall(functionCall) {
        if (functionCall.sym != null) {
            let functionType = functionCall.sym.theType;
            //注意：不使用函数类型，而是使用返回值的类型
            functionCall.theType = functionType.returnType;
            //检查参数数量
            if (functionCall.arguments.length != functionType.paramTypes.length) {
                this.addError("FunctionCall of " + functionCall.name + " has " + functionCall.arguments.length + " arguments, while expecting " + functionType.paramTypes.length + ".", functionCall);
            }
            //检查注意检查参数的类型
            for (let i = 0; i < functionCall.arguments.length; i++) {
                this.visit(functionCall.arguments[i]);
                if (i < functionType.paramTypes.length) {
                    let t1 = functionCall.arguments[i].theType;
                    let t2 = functionType.paramTypes[i];
                    if (!t1.LE(t2) && t2 !== types_1.SysTypes.String) {
                        this.addError("Argument " + i + " of FunctionCall " + functionCall.name + "is of Type " + t1.name + ", while expecting " + t2.name, functionCall);
                    }
                }
            }
        }
    }
}
/**
 * 类型转换
 * 添加必要的AST节点，来完成转换
 * 目前特性：其他类型转换成字符串
 */
class TypeConverter extends SemanticAstVisitor {
    visitBinary(bi) {
        super.visitBinary(bi);
        let t1 = bi.exp1.theType;
        let t2 = bi.exp2.theType;
        if (scanner_1.Operators.isAssignOp(bi.op)) {
            if (t1 === types_1.SysTypes.String && t2 !== types_1.SysTypes.String) {
                if (t2 === types_1.SysTypes.Integer) {
                    let exp = new ast_1.FunctionCall(bi.exp2.beginPos, bi.exp2.endPos, "integer_to_string", [bi.exp2]);
                    exp.sym = symbol_1.built_ins.get("integer_to_string");
                    bi.exp2 = exp;
                }
            }
        }
        else if (bi.op == scanner_1.Op.Plus) { //有一边是string，或者两边都是number才行。
            if (t1 === types_1.SysTypes.String || t2 === types_1.SysTypes.String) {
                if (t1 === types_1.SysTypes.Integer || t1 === types_1.SysTypes.Number) {
                    let exp = new ast_1.FunctionCall(bi.exp1.beginPos, bi.exp1.endPos, "integer_to_string", [bi.exp1]);
                    exp.sym = symbol_1.built_ins.get("integer_to_string");
                    bi.exp1 = exp;
                }
                if (t2 === types_1.SysTypes.Integer || t2 === types_1.SysTypes.Number) {
                    let exp = new ast_1.FunctionCall(bi.exp2.beginPos, bi.exp2.endPos, "integer_to_string", [bi.exp2]);
                    exp.sym = symbol_1.built_ins.get("integer_to_string");
                    bi.exp2 = exp;
                }
            }
        }
    }
    visitFunctionCall(functionCall) {
        if (functionCall.sym != null) {
            let functionType = functionCall.sym.theType;
            //看看参数有没有可以转换的。
            for (let i = 0; i < functionCall.arguments.length; i++) {
                this.visit(functionCall.arguments[i]);
                if (i < functionType.paramTypes.length) {
                    let t1 = functionCall.arguments[i].theType;
                    let t2 = functionType.paramTypes[i];
                    if ((t1 === types_1.SysTypes.Integer || t1 === types_1.SysTypes.Number) && t2 === types_1.SysTypes.String) {
                        let exp = new ast_1.FunctionCall(functionCall.arguments[i].beginPos, functionCall.arguments[i].endPos, "integer_to_string", [functionCall.arguments[i]]);
                        exp.sym = symbol_1.built_ins.get("integer_to_string");
                        functionCall.arguments[i] = exp;
                    }
                }
            }
        }
    }
}
/**
 * 常量折叠
 */
class ConstFolder extends SemanticAstVisitor {
    visitBinary(bi) {
        let v1 = bi.exp1.constValue;
        let v2 = bi.exp2.constValue;
        if (scanner_1.Operators.isAssignOp(bi.op)) {
            if (typeof v2 != 'undefined') {
                if (bi.op == scanner_1.Op.Assign) { //暂时只支持=号
                    bi.exp1.constValue = v1;
                    bi.constValue = v1;
                }
                else {
                    this.addError("Unsupported operator: " + scanner_1.Op[bi.op] + "in ConstFolder", bi);
                }
            }
        }
        else if (typeof v1 != 'undefined' && typeof v2 != 'undefined') {
            let v;
            switch (bi.op) {
                case scanner_1.Op.Plus: //'+'
                    v = v1 + v2;
                    break;
                case scanner_1.Op.Minus: //'-'
                    v = v1 - v2;
                    break;
                case scanner_1.Op.Multiply: //'*'
                    v = v1 * v2;
                    break;
                case scanner_1.Op.Divide: //'/'
                    v = v1 / v2;
                    break;
                case scanner_1.Op.Modulus: //'%'
                    v = v1 % v2;
                    break;
                case scanner_1.Op.G: //'>'
                    v = v1 > v2;
                    break;
                case scanner_1.Op.GE: //'>='
                    v = v1 >= v2;
                    break;
                case scanner_1.Op.L: //'<'
                    v = v1 < v2;
                    break;
                case scanner_1.Op.LE: //'<='
                    v = v1 <= v2;
                    break;
                case scanner_1.Op.EQ: //'=='
                    v = v1 == v2;
                    break;
                case scanner_1.Op.NE: //'!='
                    v = v1 != v2;
                    break;
                case scanner_1.Op.And: //'&&'
                    v = v1 && v2;
                    break;
                case scanner_1.Op.Or: //'||'
                    v = v1 || v2;
                    break;
                default:
                    this.addError("Unsupported binary operator: " + scanner_1.Op[bi.op] + "in ConstFolder", bi);
            }
            bi.op = v;
        }
    }
    visitUnary(u) {
        let v1 = u.exp.constValue;
        if (typeof v1 != 'undefined') {
            if (u.op == scanner_1.Op.Inc) {
                if (u.isPrefix) {
                    u.exp.constValue += 1;
                    u.constValue = u.exp.constValue;
                }
                else {
                    u.constValue = v1;
                    u.exp.constValue += 1;
                }
            }
            else if (u.op == scanner_1.Op.Dec) {
                if (u.isPrefix) {
                    u.exp.constValue -= 1;
                    u.constValue = u.exp.constValue;
                }
                else {
                    u.constValue = v1;
                    u.exp.constValue -= 1;
                }
            }
            else if (u.op == scanner_1.Op.Plus) {
                u.constValue = v1;
            }
            else if (u.op == scanner_1.Op.Minus) {
                u.constValue = -v1;
            }
            else if (u.op == scanner_1.Op.Not) {
                u.constValue = !v1;
            }
            else {
                this.addError("Unsupported unary operator: " + scanner_1.Op[u.op] + "in ConstFolder", u);
            }
        }
    }
}
/////////////////////////////////////////////////////////////////////////
// 数据流分析
//
/**
 * 检查函数的所有分枝是否都会返回某个规定的值
 * 使用方法：针对每个函数调用visitFunctionDecl()
 */
class LiveAnalyzer extends SemanticAstVisitor {
    /**
     * 返回程序是否是alive的。
     * 如果每个分枝都有正确的return语句，那么返回false。否则，返回true。
     * @param functionDecl
     */
    visitFunctionDecl(functionDecl) {
        let sym = functionDecl.sym;
        let functionType = sym.theType;
        if (functionType.returnType != types_1.SysTypes.Any && functionType.returnType != types_1.SysTypes.Void) {
            return super.visitBlock(functionDecl.body);
        }
        else {
            return false;
        }
    }
    visitBlock(block) {
        let alive = true;
        for (let stmt of block.stmts) {
            if (alive) {
                alive = this.visit(stmt);
            }
            //return语句之后的语句，都是死代码。
            //作为Warning，而不是错误。
            else {
                this.addWarning("Unreachable code detected.", stmt);
            }
        }
        return alive;
    }
    visitReturnStatement(stmt) {
        return false;
    }
    visitIfStatement(ifStmt) {
        //如果没有else语句，则看看if条件有没有常量的值，是否为常真。
        if (ifStmt.elseStmt == null) {
            if (ifStmt.condition.constValue) {
                return this.visit(ifStmt.stmt);
            }
            else {
                return true;
            }
        }
        else {
            let alive1 = this.visit(ifStmt.stmt);
            let alive2 = this.visit(ifStmt.elseStmt);
            return alive1 || alive2; //只有两个分支都是false，才返回false；
        }
    }
    /**
     * 因为我们现在不支持break，所以检查起来比较简单。只要有return语句，我们就认为alive=false;
     * @param forStmt
     */
    visitForStatement(forStmt) {
        //查看是否满足进入条件
        if (forStmt.condition != null && typeof forStmt.condition.constValue != 'undefined') {
            if (forStmt.condition.constValue) {
                return this.visit(forStmt.stmt);
            }
            else { //如果不可能进入循环体，那么就不用继续遍历了
                return true;
            }
        }
        else {
            return this.visit(forStmt.stmt);
        }
    }
}
/////////////////////////////////////////////////////////////////////////
// 自动添加return语句，以及其他导致AST改变的操作
// todo 后面用数据流分析的方法
class Trans extends SemanticAstVisitor {
    visitProg(prog) {
        //在后面添加return语句
        //TODO: 需要判断最后一个语句是不是已经是Return语句
        prog.stmts.push(new ast_1.ReturnStatement(prog.endPos, prog.endPos, null));
    }
}
