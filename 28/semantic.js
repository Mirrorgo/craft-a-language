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
const config_1 = require("./config");
class SemanticAnalyer {
    constructor() {
        this.passes = [
            new TypeResolver(),
            new Enter(),
            new RefResolver(),
            new TypeChecker(),
            new AssignAnalyzer(),
            new LiveAnalyzer(),
            new LeftValueAttributor(),
            // new TypeConverter(),
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
        console.log("Error: @" + node.beginPos.toString() + " : " + msg);
    }
    addWarning(msg, node) {
        this.warnings.push(new SemanticError(msg, node, true));
        console.log("Warning: @" + node.beginPos.toString() + " : " + msg);
    }
}
/////////////////////////////////////////////////////////////////////////
// 消解类型
//
/**
 * 基于TypeExp的AST节点，来确定真正的Type。
 * 注意：这个步骤一定要在建立符号表的前面去做，因为创建符号的时候，需要把类型信息拷贝过去。
 * todo: 需要处理类型先使用后声明的情况。
 */
class TypeResolver extends SemanticAstVisitor {
    visitVariableDecl(variableDecl) {
        //这是第一次类型推导。后面还会基于数据流算法进行更精确的推导。
        if (variableDecl.typeExp != null) {
            variableDecl.theType = this.visit(variableDecl.typeExp);
        }
    }
    visitCallSignature(callSignature) {
        if (callSignature.returnTypeExp != null)
            callSignature.returnType = this.visit(callSignature.returnTypeExp);
        super.visitCallSignature(callSignature);
    }
    visitPredefinedTypeExp(te) {
        let t = types_1.SysTypes.Any;
        switch (te.keyword) {
            case scanner_1.Keyword.Boolean:
                t = types_1.SysTypes.Boolean;
                break;
            case scanner_1.Keyword.Number:
                t = types_1.SysTypes.Number;
                break;
            case scanner_1.Keyword.String:
                t = types_1.SysTypes.String;
                break;
            case scanner_1.Keyword.Void:
                t = types_1.SysTypes.Void;
                break;
        }
        return t;
    }
    visitLiteralTypeExp(te) {
        let v = te.literal.value;
        return types_1.TypeUtil.createTypeByValue(v);
    }
    visitArrayPrimTypeExp(te) {
        //求出基础类型
        let t = this.visit(te.primType);
        //创建ArrayType
        let t1 = new types_1.ArrayType(t);
        return t1;
    }
    visitParenthesizedPrimTypeExp(te) {
        return this.visit(te.typeExp);
    }
    visitUnionOrIntersectionTypeExp(te) {
        if (te.op == scanner_1.Op.BitOr) { //'|'
            let types = [];
            for (let t of te.types) {
                types.push(this.visit(t));
            }
            return types_1.TypeUtil.mergeTypes(types);
        }
    }
    visitTypeReferenceExp(te) {
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
        let sym = new symbol_1.FunctionSymbol(functionDecl.name, new types_1.FunctionType(functionDecl.callSignature.returnType, paramTypes));
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
/**
 * 标注哪个表达式是左值
 * 规则：赋值符号、.号、++和--符号作用的对象，一定是个左值。
 * 左值属性会被用于代码生成。对于左值，需要生成赋值指令。
 *
 * 同时，又进行左值检查。比如，a++不能作为左值。而a++中的a必须是左值。
 * 我们是先计算左值属性，再进行左值检查
 *
 * 左值属性是一个继承属性，所以要知道上级节点是什么节点。
 */
class LeftValueAttributor extends SemanticAstVisitor {
    /**
     * 检查赋值符号和.符号左边是否是左值
     * @param binary
     */
    visitBinary(binary) {
        if (scanner_1.Operators.isAssignOp(binary.op)) {
            //检查左子节点
            this.visit(binary.exp1, true); //参数true，代表上级节点要求是左值
            if (!binary.exp1.isLeftValue) {
                this.addError("Left child of operator " + scanner_1.Op[binary.op] + " need a left value", binary.exp1);
            }
            //继续遍历右子节点
            this.visit(binary.exp2);
        }
        else {
            super.visitBinary(binary);
        }
    }
    visitUnary(u, shouldBeLeftValue = undefined) {
        if (shouldBeLeftValue) {
            this.addError("Unary expression cannot be left value: " + u.toString(), u);
        }
        //对于++和--要求必须是个左值
        if (u.op == scanner_1.Op.Inc || u.op == scanner_1.Op.Dec) {
            this.visit(u.exp, true); //要求下级是leftValue
            if (!u.exp.isLeftValue) {
                this.addError("Unary operator " + scanner_1.Op[u.op] + "can only be applied to a left value", u);
            }
        }
        else {
            super.visitUnary(u);
        }
    }
    visitIndexedExp(exp, shouldBeLeftValue = undefined) {
        this.visit(exp.indexExp);
        this.visit(exp.baseExp, shouldBeLeftValue); //要求基础类型必须是左值。对于a[i][j]这样的多维数组，会导致a[i]、a都标记为左值。
        if (shouldBeLeftValue) {
            if (exp.baseExp.isLeftValue) {
                exp.isLeftValue = true; //只有基础类型是左值的情况下，这里才能是左值。比如foo()[i]就不可以作为左值，因为foo()不能作为左值。
            }
            else {
                this.addError("Expression '" + exp.toString() + "'can not be assigned, because '" + exp.baseExp.toString() + "' is not a left value", exp);
            }
        }
    }
    /**
     * 变量都可以作为左值，除非其类型是void
     * @param v
     */
    visitVariable(v, shouldBeLeftValue = undefined) {
        //原来这段代码是要检查是否是void的，这应该放在类型检查里去做
        // if (this.parentOperator != null){
        //     let t = v.theType as Type;
        //     if (!t.hasVoid()){
        //         v.isLeftValue = true;
        //     }
        // }
        if (shouldBeLeftValue)
            v.isLeftValue = true;
    }
}
/**
 * 类型检查
 */
class TypeChecker extends SemanticAstVisitor {
    constructor() {
        super(...arguments);
        //每个变量动态的取值范围
        this.varRanges = new Map();
        /*
        inIfCondition 用于标记条件表达式、逻辑表达式是不是在if条件里。
        在下面的例子中，必须把等值表达式"age != null"放在if条件里才能被语义分析程序所使用。如果把它放在外面，
        再用tsc --strict编译，仍然会报错。所以，编译器的智能程度还有待于进一步提升:)
        
           function foo8_1(age : number|null){
               let age1 : string|number;
               let b = age != null;
               if (b){
                   age1 = age;     //这里会报错
               }
           }
        */
        this.inIfCondition = false;
    }
    //克隆
    cloneMap(map1) {
        let map2 = new Map();
        for (let sym of map1.keys()) {
            let value = map1.get(sym);
            map2.set(sym, value);
        }
        return map2;
    }
    //把两个值域求并集
    unionRanges(map1, map2) {
        let map3 = new Map();
        for (let sym of map1.keys()) {
            let t1 = map1.get(sym);
            if (map2.has(sym)) {
                let t2 = map2.get(sym);
                let t3 = types_1.TypeUtil.unionTypes(t1, t2);
                map3.set(sym, t3);
            }
            else { //map1有，而map2没有的变量
                map3.set(sym, t1);
            }
        }
        //加进去map2有，而map1没有的变量
        for (let sym of map2.keys()) {
            let t2 = map2.get(sym);
            if (!map1.has(sym)) {
                map3.set(sym, t2);
            }
        }
        return map3;
    }
    //求两个值域的交集
    intersectRanges(map1, map2) {
        let map3 = new Map();
        for (let sym of map1.keys()) {
            let t1 = map1.get(sym);
            if (map2.has(sym)) {
                let t2 = map2.get(sym);
                let t3 = types_1.TypeUtil.intersectTypes(t1, t2);
                if (t3 !== undefined)
                    map3.set(sym, t3);
            }
            else { //map1有，而map2没有的变量
                map3.set(sym, t1);
            }
        }
        //加进去map2有，而map1没有的变量
        for (let sym of map2.keys()) {
            let t2 = map2.get(sym);
            if (!map1.has(sym)) {
                map3.set(sym, t2);
            }
        }
        return map3;
    }
    //求值域的补集
    getComplementRanges(map) {
        let map2 = new Map();
        for (let sym of map.keys()) {
            let t = map.get(sym);
            map2.set(sym, types_1.TypeUtil.getComplementType(t));
        }
        return map2;
    }
    //设置varSym的常量值。修改其值域。
    setVarConstValue(varSym, v) {
        let t = types_1.TypeUtil.createTypeByValue(v);
        this.varRanges.set(varSym, t);
    }
    getVarConstValue(varSym) {
        if (this.varRanges.has(varSym)) {
            let t = this.varRanges.get(varSym);
            if (t.kind == types_1.TypeKind.Value) {
                let tv = t;
                return tv.value;
            }
        }
    }
    //获取表达式的类型。
    //如果表达式是变量，要从varRanges中去查询
    getDynamicType(exp) {
        if (exp instanceof ast_1.Variable) {
            let varSym = exp.sym;
            if (this.varRanges.has(varSym)) {
                return this.varRanges.get(varSym);
            }
            else {
                return varSym.theType;
            }
        }
        else {
            return exp.theType;
        }
    }
    //显示调试信息
    dumpRange(map) {
        for (let sym of map.keys()) {
            let t = map.get(sym);
            console.log(sym.name + " -> " + t.toString());
        }
    }
    visitProg(prog) {
        if (config_1.CONFIG.traceTypeChecker) {
            console.log("Enter type checker for main programm:");
        }
        super.visitProg(prog);
        if (config_1.CONFIG.traceTypeChecker) {
            console.log("Exit type checker for main programm.");
        }
    }
    visitFunctionDecl(functionDecl) {
        if (config_1.CONFIG.traceTypeChecker) {
            console.log("Enter type checker for function '" + functionDecl.name + "':");
        }
        let lastVarRanges = this.varRanges;
        super.visitFunctionDecl(functionDecl);
        this.varRanges = lastVarRanges;
        if (config_1.CONFIG.traceTypeChecker) {
            console.log("Exit type checker for function '" + functionDecl.name + "'.");
        }
    }
    visitVariableDecl(variableDecl) {
        var _a;
        super.visitVariableDecl(variableDecl);
        let c = (_a = variableDecl.init) === null || _a === void 0 ? void 0 : _a.constValue;
        if (variableDecl.init != null) {
            let t1 = variableDecl.theType;
            let t2 = variableDecl.init.theType;
            if (!types_1.TypeUtil.LE(t2, t1)) {
                this.addError("Operator '=' can not be applied to '" + t1.toString() + "' and '" + t2.toString() + "'.", variableDecl);
            }
            else {
                //设置变量的常量值
                let varSym = variableDecl.sym;
                let tRight; //右边的类型
                if (c !== undefined) {
                    this.setVarConstValue(varSym, c); //todo: 这里是否需要检查c2的类型？
                    tRight = types_1.TypeUtil.getNamedTypeByValue(c);
                }
                else { //设置值域
                    tRight = this.getDynamicType(variableDecl.init);
                    this.varRanges.set(varSym, tRight);
                }
                if (config_1.CONFIG.traceTypeChecker) {
                    console.log("in variableDecl");
                    console.log(this.varRanges);
                }
                //第二次类型推导
                //类型推导：如果变量声明没有带类型标注，则根据=号右边的表达式来推导类型
                if (variableDecl.typeExp == null) {
                    tRight = types_1.TypeUtil.getBestCommonType(tRight); //合并值类型
                    variableDecl.theType = tRight;
                    //由于肯定是声明在前，使用在后，所以变量引用的类型是准确的。
                    variableDecl.sym.theType = t2;
                }
            }
        }
    }
    visitBinary(bi) {
        let v1 = this.visit(bi.exp1);
        let v2 = this.visit(bi.exp2);
        let c1 = bi.exp1.constValue;
        let c2 = bi.exp2.constValue;
        let t1 = this.getDynamicType(bi.exp1);
        let t2 = this.getDynamicType(bi.exp2);
        if (scanner_1.Operators.isAssignOp(bi.op)) {
            bi.theType = t1;
            t2 = this.getDynamicType(bi.exp2);
            //对于赋值运算来说，t1不需要用动态类型，用原来的类型就可以。赋值操作可以修改它的动态类型。
            let t1_static = bi.exp1.theType;
            if (!types_1.TypeUtil.LE(t2, t1_static)) {
                this.addError("Can not assign '" + t2.toString() + "' to '" + t1.toString() + "'.", bi);
            }
            else {
                //设置变量和节点的常量值
                if (bi.exp1 instanceof ast_1.Variable) { //保护性的条件
                    let varSym = bi.exp1.sym;
                    if (c2 !== undefined) {
                        if (this.inIfCondition)
                            this.setVarConstValue(varSym, c2); //todo: 这里是否需要检查c2的类型？
                        bi.constValue = c2;
                    }
                    else { //如果不是常量，那就把值域设置为右侧的值                        
                        if (this.inIfCondition)
                            this.varRanges.set(varSym, t1);
                    }
                }
                if (config_1.CONFIG.traceTypeChecker) {
                    console.log("in visitBinary, assignOP:");
                    console.log(this.varRanges);
                }
            }
        }
        else if (bi.op == scanner_1.Op.Plus) { //有一边是string，或者两边都是number才行。
            if (t1 == types_1.SysTypes.String || t2 == types_1.SysTypes.String) {
                bi.theType = types_1.SysTypes.String;
                //计算常量值
                if (c1 !== undefined && c2 !== undefined) {
                    bi.constValue = "" + c1 + c2;
                }
            }
            else if (types_1.TypeUtil.LE(t1, types_1.SysTypes.Number) && types_1.TypeUtil.LE(t2, types_1.SysTypes.Number)) {
                bi.theType = types_1.TypeUtil.getUpperBound(t1, t2);
                //计算常量值
                if (typeof c1 == 'number' && typeof c2 == 'number') {
                    bi.constValue = c1 + c2;
                }
            }
            else if (t1 == types_1.SysTypes.Any || t2 == types_1.SysTypes.Any) {
                bi.theType = types_1.SysTypes.Any;
                //计算常量值                
                if (c1 !== undefined && c2 !== undefined) {
                    bi.constValue = c1 + c2;
                }
            }
            else {
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.toString() + "' and '" + t2.toString() + "'.", bi);
            }
        }
        else if (scanner_1.Operators.isArithmeticOp(bi.op)) {
            if (types_1.TypeUtil.LE(t1, types_1.SysTypes.Number) && types_1.TypeUtil.LE(t2, types_1.SysTypes.Number)) {
                bi.theType = types_1.TypeUtil.getUpperBound(t1, t2);
                //计算常量的值
                if (typeof c1 == 'number' && typeof c2 == 'number') {
                    if (bi.op == scanner_1.Op.Minus) {
                        bi.constValue = c1 - c2;
                    }
                    else if (bi.op == scanner_1.Op.Multiply) {
                        bi.constValue = c1 * c2;
                    }
                    else if (bi.op == scanner_1.Op.Divide) {
                        bi.constValue = c1 / c2;
                    }
                }
            }
            else {
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.toString() + "' and '" + t2.toString() + "'.", bi);
            }
        }
        else if (bi.op == scanner_1.Op.EQ || bi.op == scanner_1.Op.NE || bi.op == scanner_1.Op.IdentityEquals || bi.op == scanner_1.Op.IdentityNotEquals) {
            bi.theType = types_1.SysTypes.Boolean;
            //需要两个集合有OverLap，也就是交集不为空
            if (!types_1.TypeUtil.overlap(t1, t2)) {
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.toString() + "' and '" + t2.toString() + "'.", bi);
            }
            //计算常量值
            if (c1 !== undefined && c2 !== undefined) {
                bi.constValue = (bi.op == scanner_1.Op.EQ || bi.op == scanner_1.Op.IdentityEquals) ? c1 == c2 : c1 != c2;
            }
            if (this.inIfCondition) {
                //计算值域
                let range = undefined;
                let c;
                let varSym;
                let processed = false;
                //一边是变量，一边具有常量的情况
                if (bi.exp1 instanceof ast_1.Variable && c2 !== undefined) {
                    varSym = bi.exp1.sym;
                    c = c2;
                }
                else if (bi.exp2 instanceof ast_1.Variable && c1 !== undefined) {
                    varSym = bi.exp2.sym;
                    c = c1;
                }
                if (varSym) {
                    let t = types_1.TypeUtil.createTypeByValue(c);
                    t.isComplement = bi.op == scanner_1.Op.NE || bi.op == scanner_1.Op.IdentityNotEquals;
                    range = new Map();
                    range.set(varSym, t);
                    processed = true;
                }
                //一边是typeOf表达式，一边是string常量的情况
                if (!processed) {
                    let typeOfExp;
                    let typeStr;
                    if (bi.exp1 instanceof ast_1.TypeOfExp && typeof c2 === 'string') {
                        typeOfExp = bi.exp1;
                        typeStr = c2;
                    }
                    else if (bi.exp2 instanceof ast_1.TypeOfExp && c1 === 'string') {
                        typeOfExp = bi.exp2;
                        typeStr = c1;
                    }
                    if (typeOfExp && typeOfExp.exp instanceof ast_1.Variable) {
                        let t = types_1.TypeUtil.getNamedType(typeStr);
                        if (t != types_1.SysTypes.Never) {
                            varSym = typeOfExp.exp.sym;
                            range = new Map();
                            range.set(varSym, t);
                            processed = true;
                        }
                    }
                }
                if (config_1.CONFIG.traceTypeChecker && range !== undefined) {
                    console.log("in visitBinary, RalationOp '" + scanner_1.Op[bi.op] + "':");
                    console.log(range);
                }
                return range;
            }
        }
        else if (scanner_1.Operators.isRelationOp(bi.op)) {
            bi.theType = types_1.SysTypes.Boolean;
            // > >= < <= 需要两边是Number      
            if (types_1.TypeUtil.isComparable(t1) && types_1.TypeUtil.isComparable(t2)) {
                //计算常量值
                if (c1 !== undefined && c2 !== undefined) {
                    switch (bi.op) {
                        case scanner_1.Op.G:
                            bi.constValue = c1 > c2;
                            break;
                        case scanner_1.Op.GE:
                            bi.constValue = c1 >= c2;
                            break;
                        case scanner_1.Op.L:
                            bi.constValue = c1 < c2;
                            break;
                        case scanner_1.Op.LE:
                            bi.constValue = c1 <= c2;
                            break;
                    }
                }
            }
            else {
                this.addError("Operator '" + scanner_1.Op[bi.op] + "' can not be applied to '" + t1.toString() + "' and '" + t2.toString() + "'.", bi);
            }
        }
        else if (scanner_1.Operators.isLogicalOp(bi.op)) {
            bi.theType = types_1.SysTypes.Boolean;
            //计算常量值
            if (c1 !== undefined && c2 !== undefined) {
                bi.constValue = bi.op == scanner_1.Op.And ? c1 && c2 : c1 || c2;
            }
            //计算值域
            if (this.inIfCondition && (typeof v1 == 'object' || typeof v2 == 'object')) {
                let range1 = typeof v1 == 'object' ? v1 : null;
                let range2 = typeof v2 == 'object' ? v2 : null;
                let range = undefined;
                if (range1 == null && range2 != null) {
                    range = range2;
                }
                else if (range1 != null && range2 == null) {
                    range = range1;
                }
                else if (range1 != null && range2 != null) {
                    if (bi.op == scanner_1.Op.Or) {
                        range = this.unionRanges(range1, range2);
                    }
                    else {
                        range = this.intersectRanges(range1, range2);
                    }
                }
                if (config_1.CONFIG.traceTypeChecker && range !== undefined) {
                    console.log("in visitBinary, LogicalOp '" + scanner_1.Op[bi.op] + "':");
                    console.log(range);
                }
                return range;
            }
        }
        else {
            this.addError("Unsupported binary operator: " + scanner_1.Op[bi.op], bi);
        }
    }
    visitUnary(u) {
        // super.visitUnary(u);
        let v = this.visit(u.exp);
        let c = u.exp.constValue;
        // let t = u.exp.theType as Type;
        let t = this.getDynamicType(u.exp);
        //要求必须是个左值
        if (u.op == scanner_1.Op.Inc || u.op == scanner_1.Op.Dec) {
            if (types_1.TypeUtil.LE(t, types_1.SysTypes.Number)) {
                u.theType = t;
                //设置常量值
                if (u.exp.constValue !== undefined) {
                    let varSym = u.exp.sym;
                    if (typeof c == 'number') {
                        //更新变量的常量值
                        let n = u.op == scanner_1.Op.Inc ? c + 1 : c - 1;
                        this.setVarConstValue(varSym, n);
                        //设置当前节点的常量值
                        //如果是前序运算符，常量是新值，否则是旧值
                        u.constValue = u.isPrefix ? n : c;
                    }
                }
            }
            else {
                this.addError("Unary operator " + scanner_1.Op[u.op] + "can not be applied to '" + t.toString() + "'.", u);
            }
        }
        else if (u.op == scanner_1.Op.Minus || u.op == scanner_1.Op.Plus) {
            if (types_1.TypeUtil.LE(t, types_1.SysTypes.Number)) {
                u.theType = t;
                //设置常量值
                if (u.exp.constValue !== undefined) {
                    if (typeof c == 'number') {
                        u.constValue = u.op == scanner_1.Op.Plus ? c : -c;
                    }
                }
            }
            else {
                this.addError("Unary operator " + scanner_1.Op[u.op] + "can not be applied to '" + t.toString() + "'.", u);
            }
        }
        else if (u.op == scanner_1.Op.Not) {
            if (types_1.TypeUtil.LE(t, types_1.SysTypes.Boolean)) {
                u.theType = t;
                //设置常量值
                if (!u.exp.isErrorNode && u.exp.constValue !== undefined && c !== undefined) {
                    u.constValue = !c;
                }
                //修改值域
                if (this.inIfCondition) {
                    if (typeof v == 'object') {
                        let range = this.getComplementRanges(v);
                        if (config_1.CONFIG.traceTypeChecker) {
                            console.log("in visitBinary, RalationOp");
                            console.log(range);
                        }
                        return range;
                    }
                    else {
                    }
                }
            }
            else {
                this.addError("Unary operator " + scanner_1.Op[u.op] + "can not be applied to '" + t.toString() + "'.", u);
            }
        }
        else {
            this.addError("Unsupported unary operator: " + scanner_1.Op[u.op] + " applied to '" + t.toString() + "'.", u);
        }
    }
    /**
     * 根据动态类型，计算出typeof的值。
     * 这些类型，有些是能在编译期确定的，有些不能。
     * @param typeOfExp
     */
    visitTypeOfExp(typeOfExp) {
        //先求下级节点的类型
        this.visit(typeOfExp.exp);
        //根据基础类型信息，设置constValue
        let theType = this.getDynamicType(typeOfExp.exp); //获取动态的值域（或叫做类型）     
        typeOfExp.constValue = types_1.TypeUtil.evaluateTypeOf(theType);
    }
    /**
     * 用符号的类型（也就是变量声明的类型），来标注本节点
     * @param v
     */
    visitVariable(v) {
        if (v.sym != null) {
            v.theType = v.sym.theType;
            //如果变量当前的值是个常量，那么就把常量传播出去
            let c = this.getVarConstValue(v.sym);
            if (c !== undefined) {
                v.constValue = c;
            }
        }
    }
    /**
     * 基于构成元素的类型，推导ArrayLiteral的类型，并进行类型检查
     * @param literal
     */
    visitArrayLiteral(literal) {
        let allHaveConstValue = true;
        let constValues = [];
        let types = [];
        let ut = new types_1.UnionType(types);
        for (let exp of literal.exps) {
            this.visit(exp);
            if (exp.constValue !== 'undefined') {
                allHaveConstValue = false;
            }
            else {
                constValues.push(exp.constValue);
            }
            let t = exp.theType;
            if (!types_1.TypeUtil.LE(t, ut)) {
                ut = types_1.TypeUtil.unionTypes(ut, t);
            }
        }
        //设置类型
        literal.theType = new types_1.ArrayType(ut);
        //设置常量
        if (allHaveConstValue) {
            literal.constValue = constValues;
        }
    }
    /**
     * 计算数组表达式的类型。并检查下标的类型。
     *
     * 如果变量a是这样声明的：
     * let a:number[][]
     * 那么，
     * a[0][1]的类型是number
     * a[0]的类型是number[]
     * a的类型当然是number[][]
     *
     * 更复杂的情况下，函数的返回值作为数组：
     * foo()[0][1];
     *
     * @param exp
     */
    visitIndexedExp(exp) {
        var _a;
        //前确定baseExp的类型
        this.visit(exp.baseExp);
        let t = exp.baseExp.theType;
        //当前类型比baseExp的维度减少一维
        if (t instanceof types_1.ArrayType) {
            exp.theType = t.baseType;
        }
        else {
            this.addError("Expection an array type, while we got: " + ((_a = exp.theType) === null || _a === void 0 ? void 0 : _a.toString()), exp);
        }
        //检查下标的类型
        this.visit(exp.indexExp);
        if (!types_1.TypeUtil.LE(exp.indexExp.theType, types_1.SysTypes.Number)) {
            console.log("The index of array elements should be of type number.");
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
                    // let t1 = functionCall.arguments[i].theType as Type;
                    let t1 = this.getDynamicType(functionCall.arguments[i]);
                    let t2 = functionType.paramTypes[i];
                    if (!types_1.TypeUtil.LE(t1, t2)) {
                        // if (!TypeUtil.LE(t1,t2) && t2 !== SysTypes.String){
                        this.addError("Argument " + i + " of FunctionCall '" + functionCall.name + "' is of Type " + t1.toString() + ", while expecting " + t2.toString(), functionCall);
                    }
                }
            }
        }
    }
    visitIfStatement(ifStmt) {
        //设置新的变量值域
        let lastVarRanges = this.varRanges;
        this.varRanges = this.cloneMap(this.varRanges);
        //访问条件部分，这时候会修改变量的值域
        this.inIfCondition = true;
        let ranges = this.visit(ifStmt.condition);
        this.inIfCondition = false;
        //基于真值判断来做窄化
        //对于if(a)的情况
        if (ifStmt.condition instanceof ast_1.Variable) {
            if (ranges === undefined)
                ranges = new Map();
            let varSym = ifStmt.condition.sym;
            let t = types_1.TypeUtil.getTruethfulConditions(varSym.theType);
            ranges.set(varSym, t);
            // this.dumpRange(ranges);
        }
        //对于if(!a)的情况
        else if (ifStmt.condition instanceof ast_1.Unary && ifStmt.condition.op == scanner_1.Op.Not && ifStmt.condition.exp instanceof ast_1.Variable) {
            if (ranges === undefined)
                ranges = new Map();
            let varSym = ifStmt.condition.exp.sym;
            let t = types_1.TypeUtil.getTruethfulConditions(varSym.theType);
            t = types_1.TypeUtil.getComplementType(t); //取补集
            ranges.set(varSym, t);
        }
        //访问Then部分
        if (typeof ranges == 'object') {
            let r1 = ranges;
            for (let varSym of r1.keys()) {
                if (!this.varRanges.has(varSym)) {
                    this.varRanges.set(varSym, varSym.theType);
                }
            }
            let ranges1 = this.intersectRanges(this.varRanges, ranges);
            if (typeof ranges1 == 'object') {
                this.varRanges = ranges1;
                if (config_1.CONFIG.traceTypeChecker) {
                    console.log("in visitIfStatement, before entering Then block, this.varRanges=");
                    this.dumpRange(this.varRanges);
                }
            }
        }
        this.visit(ifStmt.stmt);
        //访问Else部分，要把所有的条件取补集
        if (ifStmt.elseStmt != null) {
            if (typeof ranges == 'object') {
                let ranges1 = this.getComplementRanges(ranges);
                let ranges2 = this.intersectRanges(lastVarRanges, ranges1);
                if (typeof ranges2 == 'object') {
                    this.varRanges = ranges2;
                    if (config_1.CONFIG.traceTypeChecker) {
                        console.log("in visitIfStatement, before entering Else block, this.varRanges=");
                        console.log(this.varRanges);
                    }
                }
            }
            this.visit(ifStmt.elseStmt);
        }
        //恢复变量的值域
        this.varRanges = lastVarRanges;
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
 * 常量折叠和传播
 */
class ConstFolder extends SemanticAstVisitor {
    visitBinary(bi) {
        let v1 = bi.exp1.constValue;
        let v2 = bi.exp2.constValue;
        if (scanner_1.Operators.isAssignOp(bi.op)) {
            if (v2 !== undefined) {
                if (bi.op == scanner_1.Op.Assign) { //暂时只支持=号
                    bi.exp1.constValue = v1;
                    bi.constValue = v1;
                }
                else {
                    this.addError("Unsupported operator: " + scanner_1.Op[bi.op] + "in ConstFolder", bi);
                }
            }
        }
        else if (v1 !== undefined && v2 !== undefined) {
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
        if (v1 !== undefined) {
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
/**
 * 检查每个变量是否都被赋值了。
 */
class AssignAnalyzer extends SemanticAstVisitor {
    constructor() {
        super(...arguments);
        //每个变量的赋值情况
        this.assignMode = new Map();
    }
    cloneMap(map1) {
        let map2 = new Map();
        for (let sym of map1.keys()) {
            let value = map1.get(sym);
            map2.set(sym, value);
        }
        return map2;
    }
    merge(map1, map2) {
        let map = new Map();
        for (let sym of map1.keys()) {
            let value1 = map1.get(sym);
            let value2 = map2.get(sym);
            map.set(sym, value1 && value2);
        }
        return map;
    }
    visitProg(prog) {
        this.assignMode = new Map();
        super.visitProg(prog);
        return this.assignMode;
    }
    //参数都是被赋值过的。
    visitParameterList(paramList) {
        for (let varDecl of paramList.params) {
            this.assignMode.set(varDecl.sym, true);
        }
    }
    //略过死代码
    visitBlock(block) {
        for (let stmt of block.stmts) {
            let alive = this.visit(stmt);
            if (typeof alive == 'boolean') {
                //如果遇到return语句，后面的就是死代码了，必须忽略掉。
                return;
            }
        }
    }
    //检测return语句
    visitReturnStatement(rtnStmt) {
        if (rtnStmt.exp != null)
            this.visit(rtnStmt.exp);
        return false; //表示代码活跃性为false
    }
    //变量声明中可能会初始化变量
    visitVariableDecl(variableDecl) {
        if (variableDecl.init != null)
            this.visit(variableDecl.init);
        //如果有初始化部分，那么assigned就设置为true
        this.assignMode.set(variableDecl.sym, variableDecl.init != null);
    }
    //检查变量使用前是否被赋值了
    visitVariable(variable) {
        let varSym = variable.sym;
        if (this.assignMode.has(varSym)) {
            let assigned = this.assignMode.get(varSym);
            if (!assigned) {
                this.addError("variable '" + variable.name + "' is used before being assigned.", variable);
            }
        }
        else {
            console.log("whoops,不可能到这里@semantic.ts/visitVariable");
        }
    }
    //处理赋值语句
    visitBinary(binary) {
        if (scanner_1.Operators.isAssignOp(binary.op)) {
            this.visit(binary.exp2); //表达式右侧要照常遍历，但左侧就没有必要了。
            if (binary.exp1 instanceof ast_1.Variable) {
                let varSym = binary.exp1.sym;
                this.assignMode.set(varSym, true);
            }
        }
        else {
            super.visitBinary(binary);
        }
    }
    visitIfStatement(ifStmt) {
        //if条件有没有常量的值，是否为常真或常假
        if (ifStmt.condition.constValue !== undefined) {
            if (ifStmt.condition.constValue) {
            }
            else {
                if (ifStmt.elseStmt == null) {
                }
                else {
                }
            }
        }
        else {
            //算法：把assignMode克隆两份，分别代表遍历左支和右支的结果，然后做交汇运算
            let oldMode = this.cloneMap(this.assignMode);
            //遍历if块
            this.visit(ifStmt.stmt);
            let mode1 = this.assignMode;
            //遍历else块
            this.assignMode = this.cloneMap(oldMode);
            if (ifStmt.elseStmt != null)
                this.visit(ifStmt.elseStmt);
            let mode2 = this.assignMode;
            //交汇运算
            this.assignMode = this.merge(mode1, mode2);
        }
    }
    /**
     * 因为我们现在不支持break，所以检查起来比较简单。
     * @param forStmt
     */
    visitForStatement(forStmt) {
        //for循环语句的初始化部分也可能有
        if (forStmt.init != null)
            super.visit(forStmt.init);
        //查看是否满足跳过loop的条件
        let skipLoop = forStmt.condition != null && forStmt.condition.constValue !== undefined && !forStmt.condition.constValue;
        if (!skipLoop) {
            this.visit(forStmt.stmt);
            if (forStmt.increment != null)
                this.visit(forStmt.increment);
        }
    }
}
/**
 * 检查函数的所有分枝是否都正确的返回。
 */
class LiveAnalyzer extends SemanticAstVisitor {
    /**
     * 分析主程序是否正确的renturn了。如果没有，那么自动添加return语句。
     * @param prog
     */
    visitProg(prog) {
        let alive = super.visitBlock(prog);
        //如果主程序没有return语句，那么在最后面加一下。
        if (alive) {
            prog.stmts.push(new ast_1.ReturnStatement(prog.endPos, prog.endPos, null));
        }
    }
    /**
     * 检查每个函数是否都正确的return了。也就是alive是false。
     * @param functionDecl
     */
    visitFunctionDecl(functionDecl) {
        let alive = true;
        let sym = functionDecl.sym;
        let functionType = sym.theType;
        if (functionType.returnType != types_1.SysTypes.Any && functionType.returnType != types_1.SysTypes.Void && functionType.returnType != types_1.SysTypes.Undefined) {
            alive = super.visitBlock(functionDecl.body);
        }
        else {
            alive = false;
        }
        if (alive) {
            this.addError("Function lacks ending return statement and return type does not include 'undefined'.", functionDecl);
        }
        return alive;
    }
    visitBlock(block) {
        let alive = true;
        let deadCodes = []; //死代码
        for (let stmt of block.stmts) {
            if (alive) {
                alive = this.visit(stmt);
            }
            //return语句之后的语句，都是死代码。
            else {
                //作为Warning，而不是错误。
                this.addWarning("Unreachable code detected.", stmt);
                deadCodes.push(stmt);
            }
        }
        //去除死代码
        for (let stmt of deadCodes) {
            let index = block.stmts.indexOf(stmt);
            block.stmts.splice(index, 1);
        }
        return alive;
    }
    visitReturnStatement(stmt) {
        return false;
    }
    visitVariableStatement(stmt) {
        return true;
    }
    visitExpressionStatement(stmt) {
        return true;
    }
    /**
     *
     * @param ifStmt
     */
    visitIfStatement(ifStmt) {
        let alive;
        //if条件有没有常量的值，是否为常真或长假
        if (ifStmt.condition.constValue) {
            if (ifStmt.condition.constValue) {
                alive = this.visit(ifStmt.stmt);
            }
            else {
                if (ifStmt.elseStmt == null) {
                    alive = true;
                }
                else {
                    alive = this.visit(ifStmt.stmt);
                }
            }
        }
        else {
            let alive1 = this.visit(ifStmt.stmt);
            let alive2 = ifStmt.elseStmt == null ? true : this.visit(ifStmt.elseStmt);
            alive = alive1 || alive2; //只有两个分支都是false，才返回false；
        }
        return alive;
    }
    /**
     * 因为我们现在不支持break，所以检查起来比较简单。只要有return语句，我们就认为alive=false;
     * @param forStmt
     */
    visitForStatement(forStmt) {
        // //查看是否满足进入条件
        // if (forStmt.condition && forStmt.condition.constValue){
        //     if (forStmt.condition.constValue){
        //         return this.visit(forStmt.stmt);
        //     }
        //     else{ //如果不可能进入循环体，那么就不用继续遍历了
        //         return true;
        //     }
        // }
        // else{
        //     return this.visit(forStmt.stmt);
        // }
        return this.visit(forStmt.stmt);
    }
}
