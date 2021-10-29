"use strict";
/**
* AST
* @version 0.5
* @author 宫文学
* @license 木兰开源协议
* @since 2021-06-04
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstDumper = exports.AstVisitor = exports.SuperExp = exports.ThisExp = exports.DotExp = exports.ClassDecl = exports.ErrorStmt = exports.ErrorExp = exports.FunctionTypeExp = exports.UnionOrIntersectionTypeExp = exports.ArrayPrimTypeExp = exports.ParenthesizedPrimTypeExp = exports.TypeReferenceExp = exports.LiteralTypeExp = exports.PredefinedTypeExp = exports.PrimTypeExp = exports.TypeExp = exports.TypeOfExp = exports.IndexedExp = exports.ArrayLiteral = exports.BooleanLiteral = exports.NullLiteral = exports.DecimalLiteral = exports.IntegerLiteral = exports.StringLiteral = exports.Literal = exports.Variable = exports.FunctionCall = exports.Unary = exports.Binary = exports.Expression = exports.EmptyStatement = exports.ForStatement = exports.IfStatement = exports.ReturnStatement = exports.ExpressionStatement = exports.VariableDecl = exports.VariableStatement = exports.Prog = exports.Block = exports.ParameterList = exports.CallSignature = exports.FunctionDecl = exports.Decl = exports.Statement = exports.AstNode = void 0;
const symbol_1 = require("./symbol");
const scanner_1 = require("./scanner");
const types_1 = require("./types");
////////////////////////////////////////////////////////////////////////////////
//AST节点
/**
 * AST基类
 */
class AstNode {
    constructor(beginPos, endPos, isErrorNode) {
        this.parentNode = null; //父节点。父节点为null代表这是根节点。
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
    constructor(beginPos, name, callSignature, body, functionKind, isErrorNode = false) {
        super(beginPos, body.endPos, name, isErrorNode);
        this.scope = null; //该函数对应的Scope
        this.sym = null;
        this.callSignature = callSignature;
        this.body = body;
        this.functionKind = functionKind;
        this.body.parentNode = this;
        this.callSignature.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitFunctionDecl(this, additional);
    }
    toString() {
        return "Function:" + this.name;
    }
}
exports.FunctionDecl = FunctionDecl;
/**
 * 调用签名
 * 可以用在函数声明等多个地方。
 */
class CallSignature extends AstNode {
    constructor(beginPos, endPos, paramList, returnTypeExp, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.returnType = types_1.SysTypes.Void; //返回值类型
        this.paramList = paramList;
        this.returnTypeExp = returnTypeExp;
        if (this.returnTypeExp)
            this.returnTypeExp.parentNode = this;
        if (this.paramList)
            this.paramList.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitCallSignature(this, additional);
    }
    toString() {
        return "CallSignature";
    }
}
exports.CallSignature = CallSignature;
CallSignature.dumbInst = new CallSignature(scanner_1.Position.origion, scanner_1.Position.origion, null, null, true);
class ParameterList extends AstNode {
    constructor(beginPos, endPos, params, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.params = params;
        for (let p of params) {
            p.parentNode = this;
        }
    }
    accept(visitor, additional) {
        return visitor.visitParameterList(this, additional);
    }
    toString() {
        return "ParameterList";
    }
}
exports.ParameterList = ParameterList;
/**
 * 函数体
 */
class Block extends Statement {
    constructor(beginPos, endPos, stmts, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.scope = null;
        this.stmts = stmts;
        for (let s of stmts) {
            s.parentNode = this;
        }
    }
    accept(visitor, additional) {
        return visitor.visitBlock(this, additional);
    }
    toString() {
        return "Block";
    }
}
exports.Block = Block;
Block.dumbInst = new Block(scanner_1.Position.origion, scanner_1.Position.origion, [], true);
/**
 * 程序
 * 是AST的根节点
 * 程序可以看做是一个隐性的函数。运行程序时也是可以带参数的。
 */
class Prog extends Block {
    constructor(beginPos, endPos, stmts) {
        super(beginPos, endPos, stmts, false);
        this.sym = null;
        //在本模块新声明的类型
        this.name2Type = new Map();
        this.stmts = stmts;
        for (let stmt of this.stmts) {
            stmt.parentNode = this;
        }
    }
    //获取自定义类型
    getType(typeName) {
        let t = this.name2Type.get(typeName);
        if (t) {
            return t;
        }
        else {
            return null;
        }
    }
    accept(visitor, additional) {
        return visitor.visitProg(this, additional);
    }
    toString() {
        return "Prog";
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
        this.variableDecl.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitVariableStatement(this, additional);
    }
    toString() {
        return "VariableStatement";
    }
}
exports.VariableStatement = VariableStatement;
/**
 * 变量声明节点
 */
class VariableDecl extends Decl {
    // inferredType:Type|null = null; //推测出的类型
    constructor(beginPos, endPos, name, typeExp, init, isErrorNode = false) {
        super(beginPos, endPos, name, isErrorNode);
        // letToken:Token;
        this.typeExp = null; //代表Type的Ast节点
        this.theType = types_1.SysTypes.Any; //变量类型，是从typeExp解析出来的。缺省是Any类型。
        this.sym = null;
        this.typeExp = typeExp;
        this.init = init;
        // this.letToken = letToken;
        if (this.typeExp)
            this.typeExp.parentNode = this;
        if (this.init)
            this.init.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitVariableDecl(this, additional);
    }
    toString() {
        return "VariableDecl:" + this.name;
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
        this.exp.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitExpressionStatement(this, additional);
    }
    toString() {
        return "ExpressionStatement";
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
        if (this.exp)
            this.exp.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitReturnStatement(this, additional);
    }
    toString() {
        return "ReturnStatement";
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
        this.condition.parentNode = this;
        this.stmt.parentNode = this;
        if (this.elseStmt)
            this.elseStmt.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitIfStatement(this, additional);
    }
    toString() {
        return "IfStatement";
    }
}
exports.IfStatement = IfStatement;
/**
 * For语句
 */
class ForStatement extends Statement {
    constructor(beginPos, endPos, init, condition, increment, stmt, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.init = null;
        this.condition = null;
        this.increment = null;
        this.scope = null;
        this.init = init;
        this.condition = condition;
        this.increment = increment;
        this.stmt = stmt;
        if (this.init)
            this.init.parentNode = this;
        if (this.condition)
            this.condition.parentNode = this;
        if (this.increment)
            this.increment.parentNode = this;
        this.stmt.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitForStatement(this, additional);
    }
    toString() {
        return "ForStatement";
    }
}
exports.ForStatement = ForStatement;
class EmptyStatement extends Statement {
    constructor(pos, isErrorNode = false) {
        super(pos, pos, isErrorNode);
    }
    accept(visitor, additional) {
        return visitor.visitEmptyStatement(this, additional);
    }
    toString() {
        return "EmptyStatement";
    }
}
exports.EmptyStatement = EmptyStatement;
/////////////////////////////////////////////////////////////
//表达式
/**
 * 表达式
 */
class Expression extends AstNode {
    constructor() {
        super(...arguments);
        this.theType = null; //表达式的类型。
        this.shouldBeLeftValue = false; //当前位置需要一个左值。赋值符号、点符号的左边，需要左值。
        this.isLeftValue = false; //是否是一个左值
        this.constValue = undefined; //本表达式的常量值。在常量折叠、流程分析等时候有用。
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
        this.exp1.parentNode = this;
        this.exp2.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitBinary(this, additional);
    }
    toString() {
        return "Binary:" + scanner_1.Op[this.op];
    }
}
exports.Binary = Binary;
class Unary extends Expression {
    constructor(beginPos, endPos, op, exp, isPrefix, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.op = op;
        this.exp = exp;
        this.isPrefix = isPrefix;
        this.exp.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitUnary(this, additional);
    }
    toString() {
        return "Unary:" + scanner_1.Op[this.op] + (this.isPrefix ? "prefix" : "postfix");
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
        for (let v of this.arguments)
            v.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitFunctionCall(this, additional);
    }
    toString() {
        return "FunctionCall:" + this.name;
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
    toString() {
        // return "Variable("+this.name+")";
        return this.name;
    }
}
exports.Variable = Variable;
class Literal extends Expression {
    constructor(begionPos, endPos, value, isErrorNode = false) {
        super(begionPos, endPos, isErrorNode);
        this.value = value;
        this.constValue = value;
    }
    toString() {
        return "" + this.value;
    }
}
exports.Literal = Literal;
/**
 * 字符串字面量
 */
class StringLiteral extends Literal {
    constructor(pos, value, isErrorNode = false) {
        super(pos, pos, value, isErrorNode);
        this.theType = types_1.SysTypes.String;
    }
    get literal() {
        return this.value;
    }
    accept(visitor, additional) {
        return visitor.visitStringLiteral(this, additional);
    }
}
exports.StringLiteral = StringLiteral;
/**
 * 整型字面量
 */
class IntegerLiteral extends Literal {
    constructor(pos, value, isErrorNode = false) {
        super(pos, pos, value, isErrorNode);
        this.theType = types_1.SysTypes.Integer;
    }
    get literal() {
        return this.value;
    }
    accept(visitor, additional) {
        return visitor.visitIntegerLiteral(this, additional);
    }
}
exports.IntegerLiteral = IntegerLiteral;
/**
 * 实数字面量
 */
class DecimalLiteral extends Literal {
    constructor(pos, value, isErrorNode = false) {
        super(pos, pos, value, isErrorNode);
        this.theType = types_1.SysTypes.Decimal;
    }
    get literal() {
        return this.value;
    }
    accept(visitor, additional) {
        return visitor.visitDecimalLiteral(this, additional);
    }
}
exports.DecimalLiteral = DecimalLiteral;
/**
 * null字面量
 */
class NullLiteral extends Literal {
    constructor(pos, isErrorNode = false) {
        super(pos, pos, null, isErrorNode);
        this.theType = types_1.SysTypes.Null;
    }
    accept(visitor, additional) {
        return visitor.visitNullLiteral(this, additional);
    }
}
exports.NullLiteral = NullLiteral;
/**
 * Boolean字面量
 */
class BooleanLiteral extends Literal {
    constructor(pos, value, isErrorNode = false) {
        super(pos, pos, value, isErrorNode);
        this.theType = types_1.SysTypes.Boolean;
        this.constValue = value;
    }
    get literal() {
        return this.value;
    }
    accept(visitor, additional) {
        return visitor.visitBooleanLiteral(this, additional);
    }
}
exports.BooleanLiteral = BooleanLiteral;
/**
 * 数组字面量。
 * 说是字面量，但它不是继承自Literal，因为它的元素是一个个表达式。
 */
class ArrayLiteral extends Expression {
    constructor(beginPos, endPos, exps, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.exps = exps;
    }
    accept(visitor, additional) {
        return visitor.visitArrayLiteral(this, additional);
    }
    toString() {
        let str = "[";
        for (let i = 0; i < this.exps.length; i++) {
            str += this.exps[i].toString();
            if (i < this.exps.length - 1)
                str += ", ";
        }
        str += "]";
        return str;
    }
}
exports.ArrayLiteral = ArrayLiteral;
class IndexedExp extends Expression {
    constructor(beginPos, endPos, baseExp, indexExp, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.baseExp = baseExp;
        this.indexExp = indexExp;
        this.baseExp.parentNode = this;
        this.indexExp.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitIndexedExp(this, additional);
    }
    toString() {
        return this.baseExp.toString() + "[" + this.indexExp.toString() + "]";
    }
}
exports.IndexedExp = IndexedExp;
/**
 * 类型查询
 * 当前采用比较简单的语法规则：
 * primary:  literal | functionCall | '(' expression ')' | typeOfExp ;
 * typeOfExp : 'typeof' primary;
 */
class TypeOfExp extends Expression {
    constructor(beginPos, endPos, exp, typeOfToken, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.theType = types_1.SysTypes.String;
        this.exp = exp;
        this.typeOfToken = typeOfToken;
        this.exp.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitTypeOfExp(this, additional);
    }
    toString() {
        return "TypeOfExp";
    }
}
exports.TypeOfExp = TypeOfExp;
/**
 * 代表了一个类型表达式
 */
class TypeExp extends AstNode {
}
exports.TypeExp = TypeExp;
class PrimTypeExp extends TypeExp {
}
exports.PrimTypeExp = PrimTypeExp;
class PredefinedTypeExp extends PrimTypeExp {
    constructor(beginPos, endPos, keyword, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.keyword = keyword;
    }
    accept(visitor, additional) {
        return visitor.visitPredefinedTypeExp(this, additional);
    }
    toString() {
        return "PredefinedTypeExp:" + scanner_1.Keyword[this.keyword];
    }
}
exports.PredefinedTypeExp = PredefinedTypeExp;
class LiteralTypeExp extends PrimTypeExp {
    constructor(beginPos, endPos, literal, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.literal = literal;
        this.literal.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitLiteralTypeExp(this, additional);
    }
    toString() {
        return "LiteralTypeExp:" + this.literal.toString();
    }
}
exports.LiteralTypeExp = LiteralTypeExp;
class TypeReferenceExp extends PrimTypeExp {
    constructor(beginPos, endPos, typeName, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.typeName = typeName;
    }
    accept(visitor, additional) {
        return visitor.visitTypeReferenceExp(this, additional);
    }
    toString() {
        return "TypeReferenceExp:" + this.typeName;
    }
}
exports.TypeReferenceExp = TypeReferenceExp;
class ParenthesizedPrimTypeExp extends PrimTypeExp {
    constructor(beginPos, endPos, typeExp, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.typeExp = typeExp;
        this.typeExp.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitParenthesizedPrimTypeExp(this, additional);
    }
    toString() {
        return "ParenthesizedPrimTypeExp";
    }
}
exports.ParenthesizedPrimTypeExp = ParenthesizedPrimTypeExp;
class ArrayPrimTypeExp extends PrimTypeExp {
    constructor(beginPos, endPos, primType, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.primType = primType;
        this.primType.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitArrayPrimTypeExp(this, additional);
    }
    toString() {
        return "ArrayPrimTypeExp";
    }
}
exports.ArrayPrimTypeExp = ArrayPrimTypeExp;
/**
 * 联合或交集类型
 */
class UnionOrIntersectionTypeExp extends TypeExp {
    constructor(beginPos, endPos, op, types, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.op = op;
        this.types = types;
        for (let t of this.types)
            t.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitUnionOrIntersectionTypeExp(this, additional);
    }
    toString() {
        return "UnionOrIntersectionTypeExp";
    }
}
exports.UnionOrIntersectionTypeExp = UnionOrIntersectionTypeExp;
class FunctionTypeExp extends TypeExp {
    constructor(beginPos, endPos, paramList, returnType, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.returnType = returnType;
        this.paramList = paramList;
        this.returnType.parentNode = this;
        this.paramList.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitFunctionTypeExp(this, additional);
    }
    toString() {
        return "FunctionTypeExp";
    }
}
exports.FunctionTypeExp = FunctionTypeExp;
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
    toString() {
        return "ErrorExp";
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
    toString() {
        return "ErrorStmt";
    }
}
exports.ErrorStmt = ErrorStmt;
///////////////////////////////////////////////////////////////////////////////////////
//与class有关的一些节点
/**
 * classDecl : Class Identifier classTail ;
 * classTail :  '{' classElement* '}' ;
 * classElement : constructorDecl | propertyMemberDecl ;
 * constructorDecl : Constructor '(' parameterList? ')' '{' functionBody '}' ;
 * propertyMemberDecl : Identifier typeAnnotation? ('=' expression)? ';'
 *                    | Identifier callSignature  '{' functionBody '}' ;
 */
class ClassDecl extends Decl {
    constructor(classToken, endPos, name, body, superClass = null, isErrorNode = false) {
        super(classToken.pos, endPos, name, isErrorNode);
        this.superClass = null;
        this.sym = null;
        this.classToken = classToken;
        this.body = body;
        this.superClass = superClass;
        this.body.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitClassDecl(this, additional);
    }
    toString() {
        return "ClassDecl";
    }
}
exports.ClassDecl = ClassDecl;
// export class ClassBody extends Block{
//     props:(FunctionDecl|VariableDecl|FunctionDecl)[];
//     constructor(openBrace:Token, closeBrace:Token, props:(FunctionDecl|VariableDecl|FunctionDecl)[], isErrorNode:boolean = false){
//         super(openBrace.pos, closeBrace.pos, isErrorNode);
//         this.openBrace = openBrace;
//         this.closeBrace = closeBrace;
//         this.props = props;
//         for(let p of this.props){
//             p.parentNode = this;
//         }
//     }
//     public accept(visitor:AstVisitor, additional:any):any{
//         return visitor.visitClassBody(this,additional);
//     }
//     toString():string{
//         return "ClassBody";
//     }  
// }
// export class VariableDecl extends VariableDecl{
//     constructor(beginPos:Position, endPos:Position,name:string, typeExp:TypeExp|null, init:Expression|null,isErrorNode:boolean = false){
//         super(beginPos, endPos, name, typeExp, init, isErrorNode);
//         if (this.typeExp) this.typeExp.parentNode = this;
//         if (this.init) this.init.parentNode = this;
//     }
//     public accept(visitor:AstVisitor, additional:any):any{
//         return visitor.visitPropertyDecl(this,additional);
//     }
//     toString():string{
//         return "PropertyDecl:"+this.name;
//     }  
// }
// export class FunctionDecl extends Callable{ 
//     constructor(beginPos:Position, name:string, callSignature:CallSignature, body:Block,isErrorNode:boolean = false){
//         super(beginPos, name, callSignature, body, isErrorNode);
//         callSignature.parentNode = this;
//         body.parentNode = this;
//     }
//     public accept(visitor:AstVisitor, additional:any):any{
//         return visitor.visitMethodDecl(this, additional);
//     }
//     toString():string{
//         return "Method:" + this.name;
//     }
// }
// export class FunctionDecl extends Callable{ 
//     constructor(beginPos:Position, name:string, callSignature:CallSignature, body:Block,isErrorNode:boolean = false){
//         super(beginPos, name, callSignature, body, isErrorNode);
//         callSignature.parentNode = this;
//         body.parentNode = this;
//     }
//     getClassDecl() : ClassDecl{
//         return this.parentNode as ClassDecl;
//     }
//     public accept(visitor:AstVisitor, additional:any):any{
//         return visitor.visitConstructorDecl(this, additional);
//     }
//     toString():string{
//         return "Constructor:" + (this.parentNode as ClassDecl).name;
//     }
//     static dumbInst = new FunctionDecl(Position.origion,"",CallSignature.dumbInst,Block.dumbInst); 
// }
class DotExp extends Expression {
    constructor(beginPos, endPos, baseExp, property, isErrorNode = false) {
        super(beginPos, endPos, isErrorNode);
        this.baseExp = baseExp;
        this.property = property;
        this.baseExp.parentNode = this;
        this.property.parentNode = this;
    }
    accept(visitor, additional) {
        return visitor.visitDotExp(this, additional);
    }
    toString() {
        return "DotExp";
    }
}
exports.DotExp = DotExp;
class ThisExp extends Expression {
    constructor(pos, isErrorNode = false) {
        super(pos, pos, isErrorNode);
        // thisToken:Token;
        this.sym = null;
        // this.thisToken = thisToken;
    }
    accept(visitor, additional) {
        return visitor.visitThisExp(this, additional);
    }
    toString() {
        return "This";
    }
}
exports.ThisExp = ThisExp;
class SuperExp extends Expression {
    constructor(superToken, isErrorNode = false) {
        super(superToken.pos, superToken.pos, isErrorNode);
        this.classDecl = null; //指的在哪个类声明里使用的super关键字
        this.superToken = superToken;
    }
    accept(visitor, additional) {
        return visitor.visitSuperExp(this, additional);
    }
    toString() {
        var _a;
        return "This:" + ((_a = this.classDecl) === null || _a === void 0 ? void 0 : _a.name);
    }
}
exports.SuperExp = SuperExp;
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
    getProg(node) {
        while (node.parentNode) {
            node = node.parentNode;
        }
        return node;
    }
    //获取该节点所处的FunctionDecl
    getEnclosingFunctionDecl(node) {
        let parent = node.parentNode;
        while (parent) {
            if (parent instanceof FunctionDecl) {
                return parent;
            }
            else if (parent instanceof ClassDecl) { //中间
                return null;
            }
            parent = parent.parentNode;
        }
        return null;
    }
    //获取该节点所处的ClassDecl
    getEnclosingClassDecl(node) {
        let parent = node.parentNode;
        while (parent) {
            if (parent instanceof ClassDecl) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return null;
    }
    visitProg(prog, additional = undefined) {
        //缺省是调用visitBlock的行为
        return this.visitBlock(prog, additional);
    }
    visitVariableStatement(variableStmt, additional = undefined) {
        return this.visit(variableStmt.variableDecl, additional);
    }
    visitVariableDecl(variableDecl, additional = undefined) {
        if (variableDecl.typeExp != null) {
            this.visit(variableDecl.typeExp);
        }
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
    visitEmptyStatement(stmt, additional = undefined) {
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
    visitArrayLiteral(arrayLiteral, additional = undefined) {
        let values = [];
        for (let exp of arrayLiteral.exps) {
            values.push(this.visit(exp, additional));
        }
        return values;
    }
    visitIndexedExp(exp, additional = undefined) {
        this.visit(exp.baseExp, additional);
        this.visit(exp.indexExp, additional);
    }
    visitTypeOfExp(exp, additional = undefined) {
        this.visit(exp.exp, additional);
    }
    visitVariable(variable, additional = undefined) {
    }
    visitFunctionCall(functionCall, additional = undefined) {
        for (let param of functionCall.arguments) {
            this.visit(param, additional);
        }
    }
    visitPredefinedTypeExp(t, additional = undefined) {
    }
    visitLiteralTypeExp(t, additional = undefined) {
    }
    visitArrayPrimTypeExp(t, additional = undefined) {
        this.visit(t.primType, additional);
    }
    visitParenthesizedPrimTypeExp(t, additional = undefined) {
        this.visit(t.typeExp, additional);
    }
    visitTypeReferenceExp(t, additional = undefined) {
    }
    visitUnionOrIntersectionTypeExp(t, additional = undefined) {
        for (let t1 of t.types) {
            this.visit(t1, additional);
        }
    }
    visitFunctionTypeExp(t, additional = undefined) {
        this.visit(t.paramList, additional);
        this.visit(t.returnType, additional);
    }
    visitErrorExp(errorNode, additional = undefined) {
    }
    visitErrorStmt(errorStmt, additional = undefined) {
    }
    visitClassDecl(classDecl, additional = undefined) {
        this.visit(classDecl.body, additional);
    }
    // visitClassBody(body:ClassBody, additional:any=undefined):any{
    //     for (let p of body.props){
    //         this.visit(p, additional);
    //     }
    // }
    // visitConstructorDecl(constructorDecl:FunctionDecl, additional:any=undefined):any{
    //     //访问自身的body
    //     this.visit(constructorDecl.body, additional);
    // }
    // visitMethodDecl(methodDecl:FunctionDecl, additional:any=undefined):any{
    //     this.visit(methodDecl.callSignature, additional);
    //     this.visit(methodDecl.body, additional);
    // }
    // visitPropertyDecl(propertyDecl:VariableDecl, additional:any=undefined):any{
    //     if (propertyDecl.typeExp != null){
    //         this.visit(propertyDecl.typeExp, additional);
    //     }
    //     if (propertyDecl.init != null){
    //         return this.visit(propertyDecl.init, additional);
    //     }
    // }
    visitDotExp(dotExp, additional = undefined) {
        this.visit(dotExp.baseExp, additional);
        this.visit(dotExp.property, additional);
    }
    visitThisExp(thisExp, additional = undefined) {
    }
    visitSuperExp(superExp, additional = undefined) {
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
        console.log(prefix + "VariableDecl " + variableDecl.name + (variableDecl.theType == null ? "" : ":" + variableDecl.theType.toString()) + (variableDecl.isErrorNode ? " **E** " : ""));
        if (variableDecl.typeExp != null) {
            this.visit(variableDecl.typeExp, prefix + "    ");
        }
        if (variableDecl.init == null) {
            console.log(prefix + "    no initialization.");
        }
        else {
            this.visit(variableDecl.init, prefix + "    ");
        }
    }
    visitFunctionDecl(functionDecl, prefix) {
        console.log(prefix + "FunctionDecl " + functionDecl.name
            + (functionDecl.functionKind != symbol_1.FunctionKind.Function ? ":" + symbol_1.FunctionKind[functionDecl.functionKind] : "")
            + (functionDecl.isErrorNode ? " **E** " : ""));
        this.visit(functionDecl.callSignature, prefix + "    ");
        this.visit(functionDecl.body, prefix + "    ");
    }
    visitCallSignature(callSinature, prefix) {
        console.log(prefix + (callSinature.isErrorNode ? " **E** " : "") + "Return type: " + callSinature.returnType.toString());
        if (callSinature.paramList != null) {
            this.visit(callSinature.paramList, prefix);
        }
    }
    visitParameterList(paramList, prefix) {
        console.log(prefix + "ParamList:" + (paramList.isErrorNode ? " **E** " : "") + (paramList.params.length == 0 ? "none" : ""));
        for (let x of paramList.params) {
            this.visit(x, prefix + "    ");
        }
    }
    visitBlock(block, prefix) {
        console.log(prefix + "Block:" + (block.isErrorNode ? " **E** " : ""));
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
    visitEmptyStatement(stmt, prefix) {
        console.log(prefix + "EmptyStatement");
    }
    visitBinary(exp, prefix) {
        var _a;
        console.log(prefix + "Binary:" + scanner_1.Op[exp.op]
            + (exp.theType == null ? "" : ":" + ((_a = exp.theType) === null || _a === void 0 ? void 0 : _a.toString()))
            + (exp.constValue != undefined ? ", constValue:" + exp.constValue : "")
            + (exp.isLeftValue ? ", LeftValue" : "") //连续赋值的情况下，二元表达式可以是左值
            + (exp.isErrorNode ? " **E** " : ""));
        this.visit(exp.exp1, prefix + "    ");
        this.visit(exp.exp2, prefix + "    ");
    }
    visitUnary(exp, prefix) {
        console.log(prefix
            + (exp.isPrefix ? "Prefix " : "PostFix ")
            + "Unary:" + scanner_1.Op[exp.op] + (exp.theType == null ? "" : ":" + exp.theType.toString())
            + (typeof exp.constValue != 'undefined' ? ", constValue:" + exp.constValue : "")
            + (exp.isErrorNode ? " **E** " : ""));
        this.visit(exp.exp, prefix + "    ");
    }
    visitIntegerLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : ":" + exp.theType.toString()) + (exp.isErrorNode ? " **E** " : ""));
    }
    visitDecimalLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : ":" + exp.theType.toString()) + (exp.isErrorNode ? " **E** " : ""));
    }
    visitStringLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : ":" + exp.theType.toString()) + (exp.isErrorNode ? " **E** " : ""));
    }
    visitNullLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : ":" + exp.theType.toString()) + (exp.isErrorNode ? " **E** " : ""));
    }
    visitBooleanLiteral(exp, prefix) {
        console.log(prefix + exp.value + (exp.theType == null ? "" : ":" + exp.theType.toString()) + (exp.isErrorNode ? " **E** " : ""));
    }
    visitArrayLiteral(exp, prefix) {
        console.log(prefix + "ArrayLiteral:" + exp.toString() + (exp.theType == null ? "" : ":" + exp.theType.toString()) + (exp.isErrorNode ? " **E** " : ""));
        for (let elem of exp.exps) {
            this.visit(elem, prefix + "    ");
        }
    }
    visitIndexedExp(exp, prefix) {
        console.log(prefix + "IndexedExp: " + exp.toString()
            + (exp.isErrorNode ? " **E** " : "")
            + (exp.theType == null ? "" : ":" + exp.theType.toString())
            + (exp.isLeftValue ? ", LeftValue" : ""));
        console.log(prefix + "  baseExp:");
        this.visit(exp.baseExp, prefix + "    ");
        console.log(prefix + "  subscript:");
        this.visit(exp.indexExp, prefix + "    ");
    }
    visitTypeOfExp(exp, prefix) {
        console.log(prefix + "typeof "
            + (exp.isErrorNode ? " **E** " : ""));
        this.visit(exp.exp, prefix + "    ");
    }
    visitVariable(variable, prefix) {
        console.log(prefix + "Variable: "
            + (variable.isErrorNode ? " **E** " : "") + variable.name
            + (variable.theType == null ? "" : ":" + variable.theType.toString())
            + (variable.isLeftValue ? ", LeftValue" : "")
            + (typeof variable.constValue != 'undefined' ? ", constValue:" + variable.constValue : "")
            + (variable.sym != null ? ", resolved" : ", not resolved"));
    }
    visitFunctionCall(functionCall, prefix) {
        console.log(prefix + "FunctionCall " + (functionCall.theType == null ? "" : "(" + functionCall.theType.toString() + ")") + (functionCall.isErrorNode ? " **E** " : "") + functionCall.name +
            (symbol_1.built_ins.has(functionCall.name) ? ', built-in' :
                (functionCall.sym != null ? ", resolved" : ", not resolved")));
        for (let param of functionCall.arguments) {
            this.visit(param, prefix + "    ");
        }
    }
    visitPredefinedTypeExp(t, prefix) {
        console.log(prefix + (t.isErrorNode ? " **E** " : "") + scanner_1.Keyword[t.keyword]);
    }
    visitLiteralTypeExp(t, prefix) {
        console.log(prefix + (t.isErrorNode ? " **E** " : "") + "LiteralType：" + t.literal.value);
    }
    visitArrayPrimTypeExp(t, prefix) {
        console.log(prefix + (t.isErrorNode ? " **E** " : "") + "ArrayPrimType");
        this.visit(t.primType, prefix + "    ");
    }
    visitParenthesizedPrimTypeExp(t, prefix) {
        console.log(prefix + (t.isErrorNode ? " **E** " : "") + "ParenthesizedPrimType");
        this.visit(t.typeExp, prefix + "    ");
    }
    visitTypeReferenceExp(t, prefix) {
        console.log(prefix + (t.isErrorNode ? " **E** " : "") + t.typeName);
    }
    visitUnionOrIntersectionTypeExp(typeExp, prefix) {
        console.log(prefix + (typeExp.isErrorNode ? " **E** " : "") + (typeExp.op == scanner_1.Op.BitOr ? "UnionType" : "IntersectionType"));
        for (let t of typeExp.types) {
            this.visit(t, prefix + "    ");
        }
    }
    visitFunctionTypeExp(typeExp, prefix) {
        console.log(prefix + "FunctionType:" + (typeExp.isErrorNode ? " **E** " : ""));
        console.log(prefix + "  paramList:");
        this.visit(typeExp.paramList, prefix + "    ");
        console.log(prefix + "  returnType:");
        this.visit(typeExp.returnType, prefix + "    ");
    }
    visitErrorExp(errorNode, prefix) {
        console.log(prefix + "Error Expression **E**");
    }
    visitErrorStmt(errorStmt, prefix) {
        console.log(prefix + "Error Statement **E**");
    }
    visitClassDecl(classDecl, prefix) {
        console.log(prefix + "class " + classDecl.name);
        this.visit(classDecl.body, prefix + "    ");
    }
    // visitClassBody(body:ClassBody, prefix:any):any{
    //     console.log(prefix + "Body");
    //     for (let p of body.props){
    //         this.visit(p, prefix+"    ");
    //     }
    // }
    // visitConstructorDecl(constructorDecl:FunctionDecl, prefix:any):any{
    //     console.log(prefix + "Constructor" + (constructorDecl.isErrorNode? " **E** " : ""));
    //     this.visit(constructorDecl.callSignature, prefix+"    ");
    //     this.visit(constructorDecl.body,prefix+"    ");
    // }
    // visitMethodDecl(methodDecl:FunctionDecl, prefix:any):any{
    //     console.log(prefix+"MethodDecl "+ methodDecl.name + (methodDecl.isErrorNode? " **E** " : ""));
    //     this.visit(methodDecl.callSignature, prefix+"    ");
    //     this.visit(methodDecl.body, prefix+"    ");
    // }
    // visitPropertyDecl(propertyDecl:VariableDecl, prefix:any):any{
    //     console.log(prefix+"PropertyDecl "+propertyDecl.name + (propertyDecl.theType == null? "" : ":"+propertyDecl.theType.toString()) + (propertyDecl.isErrorNode? " **E** " : ""));
    //     if(propertyDecl.typeExp != null){
    //         this.visit(propertyDecl.typeExp, prefix+"    ");
    //     }
    //     if (propertyDecl.init == null){
    //         console.log(prefix+"    no initialization.");
    //     }
    //     else{
    //         this.visit(propertyDecl.init, prefix+"    ");
    //     }
    // }
    visitDotExp(dotExp, prefix) {
        console.log(prefix + "DotExp "
            + (dotExp.theType == null ? "" : ":" + dotExp.theType.toString())
            + (dotExp.isErrorNode ? " **E** " : "")
            + (dotExp.isLeftValue ? ", LeftValue" : "")
            + (typeof dotExp.constValue != 'undefined' ? ", constValue:" + dotExp.constValue : ""));
        console.log(prefix + "  base:");
        this.visit(dotExp.baseExp, prefix + "    ");
        console.log(prefix + "  property:");
        this.visit(dotExp.property, prefix + "    ");
    }
    visitThisExp(thisExp, prefix) {
        console.log(prefix + "ThisExp");
    }
    visitSuperExp(superExp, prefix) {
        console.log(prefix + "SuperExp");
    }
}
exports.AstDumper = AstDumper;
