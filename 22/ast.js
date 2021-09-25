"use strict";
/**
* AST
* @version 0.4
* @author 宫文学
* @license 木兰开源协议
* @since 2021-06-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstDumper = exports.AstVisitor = exports.ErrorStmt = exports.ErrorExp = exports.BooleanLiteral = exports.NullLiteral = exports.DecimalLiteral = exports.IntegerLiteral = exports.StringLiteral = exports.Variable = exports.FunctionCall = exports.Unary = exports.Binary = exports.Expression = exports.ForStatement = exports.IfStatement = exports.ReturnStatement = exports.ExpressionStatement = exports.VariableDecl = exports.VariableStatement = exports.Prog = exports.Block = exports.ParameterList = exports.CallSignature = exports.FunctionDecl = exports.Decl = exports.Statement = exports.AstNode = void 0;
const symbol_1 = require("./symbol");
const scanner_1 = require("./scanner");
const types_1 = require("./types");
////////////////////////////////////////////////////////////////////////////////
//Parser
/**
 * AST基类
 */
class AstNode {
    constructor(beginPos, endPos, isErrorNode) {
        this.beginPos = beginPos;
        this.endPos = endPos;
        this.isErrorNode = isErrorNode;
    }
}
exports.AstNode = AstNode;
/**
 * 语句
 * 其子类包括函数声明、表达式语句
 */
class Statement extends AstNode {
}
exports.Statement = Statement;
/**
 * 声明
 * 所有声明都会对应一个符号。
 */
class Decl extends AstNode {
    constructor(beginPos, endPos, name, isErrorNode) {
        super(beginPos, endPos, isErrorNode);
        this.name = name;
    }
}
exports.Decl = Decl;
/////////////////////////////////////////////////////////////
//语句
/**
 * 函数声明节点
 */
class FunctionDecl extends Decl {
    constructor(beginPos, name, callSignature, body, isErrorNode = false) {
        super(beginPos, body.endPos, name, isErrorNode);
        this.scope = null; //该函数对应的Scope
        this.sym = null;
        this.callSignature = callSignature;
        this.body = body;
    }
    accept(visitor, additional) {
        return visitor.visitFunctionDecl(this, additional);
    }
}
exports.FunctionDecl = FunctionDecl;
/**
 * 调用签名
 * 可以用在函数声明等多个地方。
 */
class CallSignature extends AstNode {
    constructor(beginPos, endPos, paramList, theType, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.paramList = paramList;
        this.theType = theType;
    }
    accept(visitor, additional) {
        return visitor.visitCallSignature(this, additional);
    }
}
exports.CallSignature = CallSignature;
class ParameterList extends AstNode {
    constructor(beginPos, endPos, params, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.params = params;
    }
    accept(visitor, additional) {
        return visitor.visitParameterList(this, additional);
    }
}
exports.ParameterList = ParameterList;
// export class Parameter extends Decl{
//     theType:string;       //变量类型
//     constructor(name:string, theType:string){
//         super(name);
//         this.theType = theType;
//     }
//     public accept(visitor:AstVisitor):any{
//         return visitor.visitParameter(this);
//     }
//     public dump(prefix:string):void{
//         console.log(prefix+"Parameter "+this.name +", type: " + this.theType);
//     }
// }
/**
 * 函数体
 */
class Block extends Statement {
    constructor(beginPos, endPos, stmts, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.scope = null;
        this.stmts = stmts;
    }
    accept(visitor, additional) {
        return visitor.visitBlock(this, additional);
    }
}
exports.Block = Block;
/**
 * 程序
 * 是AST的根节点
 * 程序可以看做是一个隐性的函数。运行程序时也是可以带参数的。
 */
class Prog extends Block {
    constructor(beginPos, endPos, stmts) {
        super(beginPos, endPos, stmts, false);
        // stmts:Statement[];
        this.sym = null;
        this.stmts = stmts;
    }
    accept(visitor, additional) {
        return visitor.visitProg(this, additional);
    }
}
exports.Prog = Prog;
/**
 * 变量声明语句
 */
class VariableStatement extends Statement {
    constructor(beginPos, endPos, variableDecl, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.variableDecl = variableDecl;
    }
    accept(visitor, additional) {
        return visitor.visitVariableStatement(this, additional);
    }
}
exports.VariableStatement = VariableStatement;
/**
 * 变量声明节点
 */
class VariableDecl extends Decl {
    constructor(beginPos, endPos, name, theType, init, isErrorNode = false) {
        super(beginPos, endPos, name, isErrorNode);
        this.sym = null;
        this.inferredType = null; //推测出的类型
        this.theType = theType;
        this.init = init;
    }
    accept(visitor, additional) {
        return visitor.visitVariableDecl(this, additional);
    }
}
exports.VariableDecl = VariableDecl;
/**
 * 表达式语句
 * 就是在表达式后面加个分号
 */
class ExpressionStatement extends Statement {
    constructor(endPos, exp, isErrorNode = false) {
        super(exp.beginPos, endPos, isErrorNode);
        this.exp = exp;
    }
    accept(visitor, additional) {
        return visitor.visitExpressionStatement(this, additional);
    }
}
exports.ExpressionStatement = ExpressionStatement;
/**
 * Return语句
 */
class ReturnStatement extends Statement {
    constructor(beginPos, endPos, exp, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.exp = null;
        this.exp = exp;
    }
    accept(visitor, additional) {
        return visitor.visitReturnStatement(this, additional);
    }
}
exports.ReturnStatement = ReturnStatement;
/**
 * if语句
 */
class IfStatement extends Statement {
    constructor(beginPos, endPos, condition, stmt, elseStmt, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.elseStmt = null;
        this.condition = condition;
        this.stmt = stmt;
        this.elseStmt = elseStmt;
    }
    accept(visitor, additional) {
        return visitor.visitIfStatement(this, additional);
    }
}
exports.IfStatement = IfStatement;
/**
 * For语句
 */
class ForStatement extends Statement {
    constructor(beginPos, endPos, init, termination, increment, stmt, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.init = null;
        this.condition = null;
        this.increment = null;
        this.scope = null;
        this.init = init;
        this.condition = termination;
        this.increment = increment;
        this.stmt = stmt;
    }
    accept(visitor, additional) {
        return visitor.visitForStatement(this, additional);
    }
}
exports.ForStatement = ForStatement;
/////////////////////////////////////////////////////////////
//表达式
/**
 * 表达式
 */
class Expression extends AstNode {
    constructor() {
        super(...arguments);
        this.theType = null;
        this.shouldBeLeftValue = false; //当前位置需要一个左值。赋值符号、点符号的左边，需要左值。
        this.isLeftValue = false; //是否是一个左值
        this.constValue = undefined; //本表达式的常量值。在常量折叠、流程分析等时候有用。
        //推断出来的类型。
        //这个类型一般是theType的子类型。比如，theType是any，但inferredType是number.
        this.inferredType = null;
    }
}
exports.Expression = Expression;
/**
 * 二元表达式
 */
class Binary extends Expression {
    constructor(op, exp1, exp2, isErrorNode = false) {
        super(exp1.beginPos, exp2.endPos, isErrorNode);
        this.op = op;
        this.exp1 = exp1;
        this.exp2 = exp2;
    }
    accept(visitor, additional) {
        return visitor.visitBinary(this, additional);
    }
}
exports.Binary = Binary;
class Unary extends Expression {
    constructor(beginPos, endPos, op, exp, isPrefix, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.op = op;
        this.exp = exp;
        this.isPrefix = isPrefix;
    }
    accept(visitor, additional) {
        return visitor.visitUnary(this, additional);
    }
}
exports.Unary = Unary;
/**
 * 函数调用
 */
class FunctionCall extends Expression {
    constructor(beginPos, endPos, name, paramValues, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        // decl: FunctionDecl|null=null;  //指向函数的声明
        this.sym = null;
        this.name = name;
        this.arguments = paramValues;
    }
    accept(visitor, additional) {
        return visitor.visitFunctionCall(this, additional);
    }
}
exports.FunctionCall = FunctionCall;
/**
 * 变量引用
 */
class Variable extends Expression {
    constructor(beginPos, endPos, name, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.sym = null;
        this.name = name;
    }
    accept(visitor, additional) {
        return visitor.visitVariable(this, additional);
    }
}
exports.Variable = Variable;
/**
 * 字符串字面量
 */
class StringLiteral extends Expression {
    constructor(pos, value, isErrorNode = false) {
        super(pos, pos, isErrorNode);
        this.value = value;
        this.theType = types_1.SysTypes.String;
        this.constValue = value;
    }
    accept(visitor, additional) {
        return visitor.visitStringLiteral(this, additional);
    }
}
exports.StringLiteral = StringLiteral;
/**
 * 整型字面量
 */
class IntegerLiteral extends Expression {
    constructor(pos, value, isErrorNode = false) {
        super(pos, pos, isErrorNode);
        this.value = value;
        this.theType = types_1.SysTypes.Integer;
        this.constValue = value;
    }
    accept(visitor, additional) {
        return visitor.visitIntegerLiteral(this, additional);
    }
}
exports.IntegerLiteral = IntegerLiteral;
/**
 * 实数字面量
 */
class DecimalLiteral extends Expression {
    constructor(pos, value, isErrorNode = false) {
        super(pos, pos, isErrorNode);
        this.value = value;
        this.theType = types_1.SysTypes.Decimal;
        this.constValue = value;
    }
    accept(visitor, additional) {
        return visitor.visitDecimalLiteral(this, additional);
    }
}
exports.DecimalLiteral = DecimalLiteral;
/**
 * null字面量
 */
class NullLiteral extends Expression {
    constructor(pos, isErrorNode = false) {
        super(pos, pos, isErrorNode);
        this.value = null;
        this.theType = types_1.SysTypes.Null;
        this.constValue = this.value;
    }
    accept(visitor, additional) {
        return visitor.visitNullLiteral(this, additional);
    }
}
exports.NullLiteral = NullLiteral;
/**
 * Boolean字面量
 */
class BooleanLiteral extends Expression {
    constructor(pos, value, isErrorNode = false) {
        super(pos, pos, isErrorNode);
        this.value = value;
        this.theType = types_1.SysTypes.Boolean;
        this.constValue = value;
    }
    accept(visitor, additional) {
        return visitor.visitBooleanLiteral(this, additional);
    }
}
exports.BooleanLiteral = BooleanLiteral;
/**
 * 代表了一个错误的表达式。
 */
class ErrorExp extends Expression {
    constructor(beginPos, endPos) {
        super(beginPos, endPos, true);
        this.isErrorNode = true;
    }
    accept(visitor, additional) {
        return visitor.visitErrorExp(this, additional);
    }
}
exports.ErrorExp = ErrorExp;
/**
 * 代表了一个错误的语句。
 */
class ErrorStmt extends Statement {
    constructor(beginPos, endPos) {
        super(beginPos, endPos, true);
        this.isErrorNode = true;
    }
    accept(visitor, additional) {
        return visitor.visitErrorStmt(this, additional);
    }
}
exports.ErrorStmt = ErrorStmt;
////////////////////////////////////////////////////////////////////////////////
//Visitor
/**
 * 对AST做遍历的Vistor。
 * 这是一个基类，定义了缺省的遍历方式。子类可以覆盖某些方法，修改遍历方式。
 */
class AstVisitor {
    //对抽象类的访问。
    //相应的具体类，会调用visitor合适的具体方法。
    visit(node, additional = undefined) {
        return node.accept(this, additional);
    }
    visitProg(prog, additional = undefined) {
        //缺省是调用visitBlock的行为
        return this.visitBlock(prog, additional);
    }
    visitVariableStatement(variableStmt, additional = undefined) {
        return this.visit(variableStmt.variableDecl, additional);
    }
    visitVariableDecl(variableDecl, additional = undefined) {
        if (variableDecl.init != null) {
            return this.visit(variableDecl.init, additional);
        }
    }
    visitFunctionDecl(functionDecl, additional = undefined) {
        this.visit(functionDecl.callSignature, additional);
        return this.visit(functionDecl.body, additional);
    }
    visitCallSignature(callSinature, additional = undefined) {
        if (callSinature.paramList != null) {
            return this.visit(callSinature.paramList, additional);
        }
    }
    visitParameterList(paramList, additional = undefined) {
        let retVal;
        for (let x of paramList.params) {
            retVal = this.visit(x, additional);
        }
        return retVal;
    }
    // visitParameter(parameter: Parameter):any{
    //     return undefined;
    // }
    visitBlock(block, additional = undefined) {
        let retVal;
        for (let x of block.stmts) {
            retVal = this.visit(x, additional);
        }
        return retVal;
    }
    visitExpressionStatement(stmt, additional = undefined) {
        return this.visit(stmt.exp, additional);
    }
    visitReturnStatement(stmt, additional = undefined) {
        if (stmt.exp != null) {
            return this.visit(stmt.exp, additional);
        }
    }
    visitIfStatement(stmt, additional = undefined) {
        this.visit(stmt.condition, additional);
        this.visit(stmt.stmt, additional);
        if (stmt.elseStmt != null) {
            this.visit(stmt.elseStmt, additional);
        }
    }
    visitForStatement(stmt, additional = undefined) {
        if (stmt.init != null) {
            this.visit(stmt.init, additional);
        }
        if (stmt.condition != null) {
            this.visit(stmt.condition, additional);
        }
        if (stmt.increment != null) {
            this.visit(stmt.increment, additional);
        }
        this.visit(stmt.stmt, additional);
    }
    visitBinary(exp, additional = undefined) {
        this.visit(exp.exp1, additional);
        this.visit(exp.exp2, additional);
    }
    visitUnary(exp, additional = undefined) {
        this.visit(exp.exp, additional);
    }
    visitIntegerLiteral(exp, additional = undefined) {
        return exp.value;
    }
    visitDecimalLiteral(exp, additional = undefined) {
        return exp.value;
    }
    visitStringLiteral(exp, additional = undefined) {
        return exp.value;
    }
    visitNullLiteral(exp, additional = undefined) {
        return exp.value;
    }
    visitBooleanLiteral(exp, additional = undefined) {
        return exp.value;
    }
    visitVariable(variable, additional = undefined) {
        return undefined;
    }
    visitFunctionCall(functionCall, additional = undefined) {
        // console.log("in AstVisitor.visitFunctionCall "+ functionCall.name);
        for (let param of functionCall.arguments) {
            // console.log("in AstVisitor.visitFunctionCall, visiting param: "+ param.dump(""));
            this.visit(param, additional);
        }
        return undefined;
    }
    visitErrorExp(errorNode, additional = undefined) {
        return undefined;
    }
    visitErrorStmt(errorStmt, additional = undefined) {
        return undefined;
    }
}
exports.AstVisitor = AstVisitor;
/**
 * 打印AST的调试信息
 */
class AstDumper extends AstVisitor {
    visitProg(prog, prefix) {
        console.log(prefix + "Prog" + (prog.isErrorNode ? " **E** " : ""));
        for (let x of prog.stmts) {
            this.visit(x, prefix + "    ");
        }
    }
    visitVariableStatement(variableStmt, prefix) {
        console.log(prefix + "VariableStatement " + (variableStmt.isErrorNode ? " **E** " : ""));
        this.visit(variableStmt.variableDecl, prefix + "    ");
    }
    visitVariableDecl(variableDecl, prefix) {
        console.log(prefix + "VariableDecl " + variableDecl.name + (variableDecl.theType == null ? "" : "(" + variableDecl.theType.name + ")") + (variableDecl.isErrorNode ? " **E** " : ""));
        if (variableDecl.init == null) {
            console.log(prefix + "no initialization.");
        }
        else {
            this.visit(variableDecl.init, prefix + "    ");
        }
    }
    visitFunctionDecl(functionDecl, prefix) {
        console.log(prefix + "FunctionDecl " + functionDecl.name + (functionDecl.isErrorNode ? " **E** " : ""));
        this.visit(functionDecl.callSignature, prefix + "    ");
        this.visit(functionDecl.body, prefix + "    ");
    }
    visitCallSignature(callSinature, prefix) {
        console.log(prefix + (callSinature.isErrorNode ? " **E** " : "") + "Return type: " + callSinature.theType.name);
        if (callSinature.paramList != null) {
            this.visit(callSinature.paramList, prefix + "    ");
        }
    }
    visitParameterList(paramList, prefix) {
        console.log(prefix + "ParamList:" + (paramList.isErrorNode ? " **E** " : "") + (paramList.params.length == 0 ? "none" : ""));
        for (let x of paramList.params) {
            this.visit(x, prefix + "    ");
        }
    }
    // visitParameter(parameter: Parameter):any{
    //     return undefined;
    // }
    visitBlock(block, prefix) {
        if (block.isErrorNode) {
            console.log(prefix + "Block" + (block.isErrorNode ? " **E** " : ""));
        }
        for (let x of block.stmts) {
            this.visit(x, prefix + "    ");
        }
    }
    visitExpressionStatement(stmt, prefix) {
        console.log(prefix + "ExpressionStatement" + (stmt.isErrorNode ? " **E** " : ""));
        return this.visit(stmt.exp, prefix + "    ");
    }
    visitReturnStatement(stmt, prefix) {
        console.log(prefix + "ReturnStatement" + (stmt.isErrorNode ? " **E** " : ""));
        if (stmt.exp != null) {
            return this.visit(stmt.exp, prefix + "    ");
        }
    }
    visitIfStatement(stmt, prefix) {
        console.log(prefix + "IfStatement" + (stmt.isErrorNode ? " **E** " : ""));
        console.log(prefix + "    Condition:");
        this.visit(stmt.condition, prefix + "    ");
        console.log(prefix + "    Then:");
        this.visit(stmt.stmt, prefix + "    ");
        if (stmt.elseStmt != null) {
            console.log(prefix + "    Else:");
            this.visit(stmt.elseStmt, prefix + "    ");
        }
    }
    visitForStatement(stmt, prefix) {
        console.log(prefix + "ForStatement" + (stmt.isErrorNode ? " **E** " : ""));
        if (stmt.init != null) {
            console.log(prefix + "    Init:");
            this.visit(stmt.init, prefix + "    ");
        }
        if (stmt.condition != null) {
            console.log(prefix + "    Condition:");
            this.visit(stmt.condition, prefix + "    ");
        }
        if (stmt.increment != null) {
            console.log(prefix + "    Increment:");
            this.visit(stmt.increment, prefix + "    ");
        }
        console.log(prefix + "    Body:");
        this.visit(stmt.stmt, prefix + "    ");
    }
    visitBinary(exp, prefix) {
        console.log(prefix + "Binary:" + scanner_1.Op[exp.op] + (exp.theType == null ? "" : "(" + exp.theType.name + ")") + (exp.isErrorNode ? " **E** " : ""));
        this.visit(exp.exp1, prefix + "    ");
        this.visit(exp.exp2, prefix + "    ");
    }
    visitUnary(exp, prefix) {
        console.log(prefix + (exp.isPrefix ? "Prefix " : "PostFix ") + "Unary:" + scanner_1.Op[exp.op] + (exp.theType == null ? "" : "(" + exp.theType.name + ")") + (exp.isErrorNode ? " **E** " : ""));
        this.visit(exp.exp, prefix + "    ");
    }
    visitIntegerLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : "(" + exp.theType.name + ")") + (exp.isErrorNode ? " **E** " : ""));
    }
    visitDecimalLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : "(" + exp.theType.name + ")") + (exp.isErrorNode ? " **E** " : ""));
    }
    visitStringLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : "(" + exp.theType.name + ")") + (exp.isErrorNode ? " **E** " : ""));
    }
    visitNullLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : "(" + exp.theType.name + ")") + (exp.isErrorNode ? " **E** " : ""));
    }
    visitBooleanLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : "(" + exp.theType.name + ")") + (exp.isErrorNode ? " **E** " : ""));
    }
    visitVariable(variable, prefix) {
        console.log(prefix + "Variable: " + (variable.isErrorNode ? " **E** " : "") + variable.name + (variable.theType == null ? "" : "(" + variable.theType.name + ")") + (variable.isLeftValue ? ", LeftValue" : "") + (variable.sym != null ? ", resolved" : ", not resolved"));
    }
    visitFunctionCall(functionCall, prefix) {
        console.log(prefix + "FunctionCall " + (functionCall.theType == null ? "" : "(" + functionCall.theType.name + ")") + (functionCall.isErrorNode ? " **E** " : "") + functionCall.name +
            (symbol_1.built_ins.has(functionCall.name) ? ', built-in' :
                (functionCall.sym != null ? ", resolved" : ", not resolved")));
        for (let param of functionCall.arguments) {
            this.visit(param, prefix + "    ");
        }
    }
    visitErrorExp(errorNode, prefix) {
        console.log(prefix + "Error Expression **E**");
    }
    visitErrorStmt(errorStmt, prefix) {
        console.log(prefix + "Error Statement **E**");
    }
}
exports.AstDumper = AstDumper;
