/**
* AST
* @version 0.5
* @author 宫文学
* @license 木兰开源协议
* @since 2021-06-04
*/

import {Symbol, FunctionSymbol, VarSymbol, built_ins} from './symbol'
import {Position, Op, Keyword, Token} from './scanner'
import {Scope} from './scope'
import {Type, SysTypes, FunctionType} from './types'

////////////////////////////////////////////////////////////////////////////////
//AST节点

/**
 * AST基类
 */
export abstract class AstNode{
    beginPos:Position; //在源代码中的第一个Token的位置
    endPos:Position;   //在源代码中的最后一个Token的位置
    isErrorNode:boolean;// = false;
    
    constructor(beginPos:Position, endPos:Position, isErrorNode:boolean){
        this.beginPos = beginPos;
        this.endPos = endPos;
        this.isErrorNode = isErrorNode;
    }

    //visitor模式中，用于接受vistor的访问。
    public abstract accept(visitor:AstVisitor, additional:any):any;  

     

    //简单的string格式
    // abstract toString():string;
}

/**
 * 语句
 * 其子类包括函数声明、表达式语句
 */
export abstract class Statement extends AstNode{
}

/**
 * 声明
 * 所有声明都会对应一个符号。
 */
export abstract class Decl extends AstNode{
    name:string;
    constructor(beginPos:Position, endPos:Position,name:string,isErrorNode:boolean){
        super(beginPos, endPos, isErrorNode);
        this.name = name;
    }
}

/////////////////////////////////////////////////////////////
//语句

/**
 * 函数声明节点
 */
export class FunctionDecl extends Decl{ 
    callSignature:CallSignature;
    body:Block;            //函数体
    scope:Scope|null=null; //该函数对应的Scope
    sym:FunctionSymbol|null = null;
    constructor(beginPos:Position, name:string, callSignature:CallSignature, body:Block,isErrorNode:boolean = false){
        super(beginPos, body.endPos,name,isErrorNode);
        this.callSignature = callSignature;
        this.body = body;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitFunctionDecl(this, additional);
    }
}

/**
 * 调用签名
 * 可以用在函数声明等多个地方。
 */
export class CallSignature extends AstNode{
    paramList:ParameterList|null;
    returnType:Type = SysTypes.Void;   //返回值类型
    returnTypeExp:TypeExp|null;        //返回值的表达式
    constructor(beginPos:Position, endPos:Position,paramList:ParameterList|null, returnTypeExp:TypeExp|null,isErrorNode:boolean = false){
        super(beginPos, endPos, isErrorNode);
        this.paramList = paramList;
        this.returnTypeExp = returnTypeExp;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitCallSignature(this, additional);
    }
}

export class ParameterList extends AstNode{
    params:VariableDecl[];
    constructor(beginPos:Position, endPos:Position,params:VariableDecl[],isErrorNode:boolean = false){
        super(beginPos, endPos,isErrorNode);
        this.params = params;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitParameterList(this, additional);
    }
}

/**
 * 函数体
 */
export class Block extends Statement{
    stmts: Statement[];
    scope:Scope|null = null;
    constructor(beginPos:Position, endPos:Position,stmts: Statement[],isErrorNode:boolean = false){
        super(beginPos, endPos,isErrorNode);
        this.stmts = stmts;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitBlock(this, additional);
    }
}

/**
 * 程序
 * 是AST的根节点
 * 程序可以看做是一个隐性的函数。运行程序时也是可以带参数的。
 */
export class Prog extends Block{
    // stmts:Statement[];
    sym:FunctionSymbol|null = null;
    constructor(beginPos:Position, endPos:Position,stmts:Statement[]){
        super(beginPos, endPos,stmts, false);
        this.stmts = stmts;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitProg(this,additional);
    }
}

/**
 * 变量声明语句
 */
export class VariableStatement extends Statement{
    variableDecl:VariableDecl;
    constructor(beginPos:Position, endPos:Position,variableDecl:VariableDecl, isErrorNode:boolean = false){
        super(beginPos, endPos, isErrorNode);
        this.variableDecl = variableDecl;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitVariableStatement(this,additional);
    }
}

/**
 * 变量声明节点
 */
export class VariableDecl extends Decl{
    typeExp:TypeExp|null = null;   //代表Type的Ast节点
    theType:Type = SysTypes.Any;   //变量类型，是从typeExp解析出来的。缺省是Any类型。
    init:Expression|null;          //变量初始化所使用的表达式
    sym:VarSymbol|null = null;
    // inferredType:Type|null = null; //推测出的类型
    constructor(beginPos:Position, endPos:Position,name:string, typeExp:TypeExp|null, init:Expression|null,isErrorNode:boolean = false){
        super(beginPos, endPos, name,isErrorNode);
        this.typeExp = typeExp;
        this.init = init;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitVariableDecl(this,additional);
    }
}

/**
 * 表达式语句
 * 就是在表达式后面加个分号
 */
export class ExpressionStatement extends Statement{
    exp:Expression;
    constructor(endPos:Position,exp:Expression,isErrorNode:boolean = false){
        super(exp.beginPos, endPos,isErrorNode);
        this.exp = exp;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitExpressionStatement(this,additional);
    }
}

/**
 * Return语句
 */
export class ReturnStatement extends Statement{
    exp:Expression|null=null;
    constructor(beginPos:Position, endPos:Position,exp:Expression|null,isErrorNode:boolean = false){
        super(beginPos, endPos, isErrorNode);
        this.exp = exp;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitReturnStatement(this,additional);
    }
}

/**
 * if语句
 */
export class IfStatement extends Statement{
    condition:Expression;
    stmt:Statement;
    elseStmt:Statement|null = null;

    constructor(beginPos:Position, endPos:Position,condition:Expression, stmt:Statement, elseStmt: Statement|null,isErrorNode:boolean = false){
        super(beginPos,endPos,isErrorNode);
        this.condition = condition;
        this.stmt = stmt;
        this.elseStmt = elseStmt;
    }

    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitIfStatement(this,additional);
    }
}

/**
 * For语句
 */
export class ForStatement extends Statement{
    init:Expression|VariableDecl|null = null;
    condition:Expression|null =null;
    increment:Expression|null = null;
    stmt:Statement;

    scope:Scope|null = null;

    constructor(beginPos:Position, endPos:Position, init:Expression|VariableDecl|null, termination:Expression|null, increment:Expression|null, stmt:Statement,isErrorNode:boolean = false){
        super(beginPos,endPos,isErrorNode);
        this.init = init;
        this.condition = termination;
        this.increment = increment;
        this.stmt = stmt;
    }

    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitForStatement(this,additional);
    }
}

/////////////////////////////////////////////////////////////
//表达式

/**
 * 表达式
 */
export abstract class Expression extends AstNode{
    theType:Type|null = null;          //表达式的类型。
    shouldBeLeftValue:boolean = false; //当前位置需要一个左值。赋值符号、点符号的左边，需要左值。
    isLeftValue:boolean = false;       //是否是一个左值
    constValue:any = undefined;        //本表达式的常量值。在常量折叠、流程分析等时候有用。

    //推断出来的类型。
    //这个类型一般是theType的子类型。比如，theType是any，但inferredType是number.

    inferredType:Type|null = null;    
}

/**
 * 二元表达式
 */
export class Binary extends Expression{
    op:Op;      //运算符
    exp1:Expression; //左边的表达式
    exp2:Expression; //右边的表达式
    constructor(op:Op, exp1:Expression, exp2:Expression,isErrorNode:boolean = false){
        super(exp1.beginPos, exp2.endPos, isErrorNode);
        this.op = op;
        this.exp1 = exp1;
        this.exp2 = exp2;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitBinary(this, additional);
    }
}

export class Unary extends Expression{
    op:Op;       //运算符
    exp:Expression;  //表达式
    isPrefix:boolean;//前缀还是后缀
    constructor(beginPos:Position, endPos:Position, op:Op, exp:Expression, isPrefix:boolean, isErrorNode:boolean = false){
        super(beginPos, endPos, isErrorNode);
        this.op = op;
        this.exp = exp;
        this.isPrefix = isPrefix;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitUnary(this,additional);
    }
}

/**
 * 函数调用
 */
export class FunctionCall extends Expression{
    name:string;
    arguments: Expression[];
    // decl: FunctionDecl|null=null;  //指向函数的声明
    sym:FunctionSymbol|null = null;
    constructor(beginPos:Position, endPos:Position, name:string, paramValues: Expression[],isErrorNode:boolean = false){
        super(beginPos, endPos, isErrorNode);
        this.name = name;
        this.arguments = paramValues;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitFunctionCall(this,additional);
    }
}

/**
 * 变量引用
 */
export class Variable extends Expression{
    name:string;
    sym:VarSymbol|null = null;
    constructor(beginPos:Position, endPos:Position, name:string,isErrorNode:boolean = false){
        super(beginPos, endPos, isErrorNode);
        this.name = name;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitVariable(this, additional);
    }
}

export abstract class Literal extends Expression{
    value:string|boolean|number|null;
    constructor(pos:Position, value:string|boolean|number|null,isErrorNode:boolean = false){
        super(pos, pos, isErrorNode);
        this.value = value;
        this.constValue = value;
    }
}
/**
 * 字符串字面量
 */
export class StringLiteral extends Literal{
    constructor(pos:Position, value:string,isErrorNode:boolean = false){
        super(pos, value, isErrorNode);
        this.theType = SysTypes.String;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitStringLiteral(this,additional);
    }
}

/**
 * 整型字面量
 */
export class IntegerLiteral extends Literal{
    constructor(pos:Position, value:number,isErrorNode:boolean = false){
        super(pos, value,isErrorNode);
        this.theType = SysTypes.Integer;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitIntegerLiteral(this,additional);
    }
}

/**
 * 实数字面量
 */
export class DecimalLiteral extends Literal{
    constructor(pos:Position, value:number,isErrorNode:boolean = false){
        super(pos, value, isErrorNode);
        this.theType = SysTypes.Decimal;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitDecimalLiteral(this,additional);
    }
}

/**
 * null字面量
 */
export class NullLiteral extends Literal{
    constructor(pos:Position,isErrorNode:boolean = false){
        super(pos, null,isErrorNode);
        this.theType = SysTypes.Null;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitNullLiteral(this, additional);
    }
}

/**
 * Boolean字面量
 */
export class BooleanLiteral extends Literal{
    constructor(pos:Position, value:boolean,isErrorNode:boolean = false){
        super(pos, value, isErrorNode);
        this.theType = SysTypes.Boolean;
        this.constValue = value;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitBooleanLiteral(this,additional);
    }
}

/**
 * 类型查询
 * 当前采用比较简单的语法规则：
 * primary:  literal | functionCall | '(' expression ')' | typeOfExp ;
 * typeOfExp : 'typeof' primary;
 */

export class TypeOfExp extends Expression{
    typeOfToken:Token;
    exp: Expression;
    constructor(beginPos:Position, endPos:Position, exp:Expression, typeOfToken:Token, isErrorNode:boolean = false){
        super(beginPos, endPos, isErrorNode);
        this.theType = SysTypes.String;
        this.exp = exp;
        this.typeOfToken = typeOfToken;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitTypeOfExp(this,additional);
    }
} 

/**
 * 代表了一个类型表达式
 */
export abstract class TypeExp extends AstNode{
}

export abstract class PrimTypeExp extends TypeExp{
}

export class PredefinedTypeExp extends PrimTypeExp{
    keyword :Keyword;
    constructor(beginPos:Position, endPos:Position, keyword:Keyword, isErrorNode:boolean=false){
        super(beginPos, endPos, isErrorNode);
        this.keyword = keyword;
    }

    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitPredefinedTypeExp(this,additional);
    }  
}

export class LiteralTypeExp extends PrimTypeExp{
    literal :Literal;
    constructor(beginPos:Position, endPos:Position, literal:Literal, isErrorNode:boolean=false){
        super(beginPos, endPos, isErrorNode);
        this.literal = literal;
    }

    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitLiteralTypeExp(this,additional);
    }  
}

export class TypeReferenceExp extends PrimTypeExp{
    typeName :String;
    constructor(beginPos:Position, endPos:Position, typeName:String, isErrorNode:boolean=false){
        super(beginPos, endPos, isErrorNode);
        this.typeName = typeName;
    }

    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitTypeReferenceExp(this,additional);
    }  
}

export class ParenthesizedPrimTypeExp extends PrimTypeExp{
    typeExp:TypeExp;
    constructor(beginPos:Position, endPos:Position, typeExp:TypeExp, isErrorNode:boolean=false){
        super(beginPos, endPos, isErrorNode);
        this.typeExp = typeExp;
    }

    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitParenthesizedPrimTypeExp(this,additional);
    }  
}

export class ArrayPrimTypeExp extends PrimTypeExp{
    primType:PrimTypeExp;
    constructor(beginPos:Position, endPos:Position, primType:PrimTypeExp, isErrorNode:boolean=false){
        super(beginPos, endPos, isErrorNode);
        this.primType = primType;
    }

    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitArrayPrimTypeExp(this,additional);
    }  
}


/**
 * 联合或交集类型
 */
export class UnionOrIntersectionTypeExp extends TypeExp{
    op:Op.BitOr | Op.BitAnd;
    types:TypeExp[];
    constructor(beginPos:Position, endPos:Position, op:Op.BitOr | Op.BitAnd, types:TypeExp[], isErrorNode:boolean = false){
        super(beginPos, endPos, isErrorNode);
        this.op = op;
        this.types = types;
    }

    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitUnionOrIntersectionTypeExp(this,additional);
    }
}


/**
 * 代表了一个错误的表达式。
 */
export class ErrorExp extends Expression{
    constructor(beginPos:Position, endPos:Position){
        super(beginPos, endPos, true);
        this.isErrorNode = true;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitErrorExp(this,additional);
    }
}

/**
 * 代表了一个错误的语句。
 */
export class ErrorStmt extends Statement{
    constructor(beginPos:Position, endPos:Position){
        super(beginPos, endPos, true);
        this.isErrorNode = true;
    }
    public accept(visitor:AstVisitor, additional:any):any{
        return visitor.visitErrorStmt(this, additional);
    }
}

////////////////////////////////////////////////////////////////////////////////
//Visitor

/**
 * 对AST做遍历的Vistor。
 * 这是一个基类，定义了缺省的遍历方式。子类可以覆盖某些方法，修改遍历方式。
 */
export abstract class AstVisitor{
    //对抽象类的访问。
    //相应的具体类，会调用visitor合适的具体方法。
    visit(node:AstNode, additional:any=undefined):any{
        return node.accept(this, additional);
    }

    visitProg(prog:Prog, additional:any=undefined):any{
        //缺省是调用visitBlock的行为
        return this.visitBlock(prog,additional);
    }

    visitVariableStatement(variableStmt:VariableStatement, additional:any=undefined){
        return this.visit(variableStmt.variableDecl, additional);
    }

    visitVariableDecl(variableDecl:VariableDecl, additional:any=undefined):any{
        if (variableDecl.typeExp != null){
            this.visit(variableDecl.typeExp);
        }
        if (variableDecl.init != null){
            return this.visit(variableDecl.init, additional);
        }
    }

    visitFunctionDecl(functionDecl:FunctionDecl, additional:any=undefined):any{
        this.visit(functionDecl.callSignature, additional);
        return this.visit(functionDecl.body, additional);
    }

    visitCallSignature(callSinature:CallSignature, additional:any=undefined):any{
        if (callSinature.paramList!=null){
            return this.visit(callSinature.paramList, additional);
        }
    }

    visitParameterList(paramList:ParameterList, additional:any=undefined):any{
        let retVal:any;
        for(let x of paramList.params){
            retVal = this.visit(x, additional);
        }
        return retVal;
    }

    visitBlock(block:Block, additional:any=undefined):any{
        let retVal:any;
        for(let x of block.stmts){
            retVal = this.visit(x, additional);
        }
        return retVal;
    }
    
    visitExpressionStatement(stmt: ExpressionStatement, additional:any=undefined):any{
        return this.visit(stmt.exp, additional);
    }

    visitReturnStatement(stmt:ReturnStatement, additional:any=undefined):any{
        if (stmt.exp != null){
            return this.visit(stmt.exp, additional);
        }
    }

    visitIfStatement(stmt:IfStatement, additional:any=undefined):any{
        this.visit(stmt.condition, additional);
        this.visit(stmt.stmt, additional);
        if (stmt.elseStmt != null){
            this.visit(stmt.elseStmt, additional);
        }
    }

    visitForStatement(stmt:ForStatement, additional:any=undefined):any{
        if(stmt.init != null){
            this.visit(stmt.init, additional);
        }
        if (stmt.condition !=null){
            this.visit(stmt.condition, additional);
        }
        if (stmt.increment != null){
            this.visit(stmt.increment, additional);
        }
        this.visit(stmt.stmt, additional);
    }

    visitBinary(exp:Binary, additional:any=undefined):any{
        this.visit(exp.exp1, additional);
        this.visit(exp.exp2, additional);
    }

    visitUnary(exp:Unary, additional:any=undefined):any{
        this.visit(exp.exp, additional);
    }
   
    visitIntegerLiteral(exp:IntegerLiteral, additional:any=undefined):any{
        return exp.value;
    }

    visitDecimalLiteral(exp:DecimalLiteral, additional:any=undefined):any{
        return exp.value;
    }

    visitStringLiteral(exp:StringLiteral, additional:any=undefined):any{
        return exp.value;
    }

    visitNullLiteral(exp:NullLiteral, additional:any=undefined):any{
        return exp.value;
    }

    visitBooleanLiteral(exp:BooleanLiteral, additional:any=undefined):any{
        return exp.value;
    }

    visitTypeOfExp(exp:TypeOfExp, additional:any=undefined):any{
        return this.visit(exp.exp, additional);
    }

    visitVariable(variable:Variable, additional:any=undefined):any{
    }

    visitFunctionCall(functionCall:FunctionCall, additional:any=undefined):any{
        for(let param of functionCall.arguments){
            this.visit(param, additional);
        }
    }

    visitPredefinedTypeExp(t:PredefinedTypeExp, additional:any=undefined):any{
    }

    visitLiteralTypeExp(t:LiteralTypeExp, additional:any=undefined):any{
    }

    visitArrayPrimTypeExp(t:ArrayPrimTypeExp, additional:any=undefined):any{
        this.visit(t.primType);
    }

    visitParenthesizedPrimTypeExp(t:ParenthesizedPrimTypeExp, additional:any=undefined):any{
        this.visit(t.typeExp);
    }

    visitTypeReferenceExp(t:TypeReferenceExp, additional:any=undefined):any{
    }

    visitUnionOrIntersectionTypeExp(t:UnionOrIntersectionTypeExp, additional:any=undefined):any{
        for(let t1 of t.types){
            this.visit(t1);
        }
    }

    visitErrorExp(errorNode:ErrorExp, additional:any=undefined):any{
    }

    visitErrorStmt(errorStmt:ErrorStmt, additional:any=undefined):any{
    }
} 


/**
 * 打印AST的调试信息
 */
export class AstDumper extends AstVisitor{
    visitProg(prog:Prog, prefix:any):any{
        console.log(prefix+"Prog"+ (prog.isErrorNode? " **E** " : ""));
        for(let x of prog.stmts){
            this.visit(x, prefix+"    ");
        }
    }

    visitVariableStatement(variableStmt:VariableStatement, prefix:any){
        console.log(prefix+"VariableStatement " + (variableStmt.isErrorNode? " **E** " : ""));
        this.visit(variableStmt.variableDecl, prefix+"    ");
    }

    visitVariableDecl(variableDecl:VariableDecl, prefix:any):any{
        console.log(prefix+"VariableDecl "+variableDecl.name + (variableDecl.theType == null? "" : "("+variableDecl.theType.toString()+")") + (variableDecl.isErrorNode? " **E** " : ""));
        if(variableDecl.typeExp != null){
            this.visit(variableDecl.typeExp, prefix+"    ");
        }
        if (variableDecl.init == null){
            console.log(prefix+"no initialization.");
        }
        else{
            this.visit(variableDecl.init, prefix+"    ");
        }
    }

    visitFunctionDecl(functionDecl:FunctionDecl, prefix:any):any{
        console.log(prefix+"FunctionDecl "+ functionDecl.name + (functionDecl.isErrorNode? " **E** " : ""));
        this.visit(functionDecl.callSignature, prefix+"    ");
        this.visit(functionDecl.body, prefix+"    ");
    }

    visitCallSignature(callSinature:CallSignature, prefix:any):any{
        console.log(prefix+ (callSinature.isErrorNode? " **E** " : "")+"Return type: " + callSinature.returnType.toString());
        if (callSinature.paramList!=null){
            this.visit(callSinature.paramList, prefix + "    ");
        }
    }

    visitParameterList(paramList:ParameterList, prefix:any):any{
        console.log(prefix+"ParamList:" + (paramList.isErrorNode? " **E** " : "") + (paramList.params.length== 0 ? "none":""));
        for(let x of paramList.params){
            this.visit(x, prefix+"    ");
        }
    }

    visitBlock(block:Block, prefix:any):any{
        if(block.isErrorNode){
            console.log(prefix + "Block" + (block.isErrorNode? " **E** " : ""))
        }
        for(let x of block.stmts){
            this.visit(x, prefix+"    ");
        }
    }
    
    visitExpressionStatement(stmt: ExpressionStatement, prefix:any):any{
        console.log(prefix+"ExpressionStatement" + (stmt.isErrorNode? " **E** " : ""));
        return this.visit(stmt.exp, prefix+"    ");
    }

    visitReturnStatement(stmt:ReturnStatement, prefix:any):any{
        console.log(prefix+"ReturnStatement" + (stmt.isErrorNode? " **E** " : ""));
        if (stmt.exp != null){
            return this.visit(stmt.exp, prefix+"    ");
        }
    }

    visitIfStatement(stmt:IfStatement, prefix:any):any{
        console.log(prefix+"IfStatement" + (stmt.isErrorNode? " **E** " : ""));
        console.log(prefix+"    Condition:");
        this.visit(stmt.condition, prefix+"    ");
        console.log(prefix+"    Then:");
        this.visit(stmt.stmt, prefix+"    ");
        if (stmt.elseStmt != null){
            console.log(prefix+"    Else:");
            this.visit(stmt.elseStmt, prefix+"    ");
        }
    }

    visitForStatement(stmt:ForStatement, prefix:any):any{
        console.log(prefix+"ForStatement" + (stmt.isErrorNode? " **E** " : ""));
        if (stmt.init != null){
            console.log(prefix+"    Init:");
            this.visit(stmt.init, prefix+"    ");
        }
        if (stmt.condition != null){
            console.log(prefix+"    Condition:");
            this.visit(stmt.condition, prefix+"    ");
        }
        if (stmt.increment != null){
            console.log(prefix+"    Increment:");
            this.visit(stmt.increment, prefix+"    ");
        }
        console.log(prefix+"    Body:"); 
        this.visit(stmt.stmt, prefix+"    ");
    }

    visitBinary(exp:Binary, prefix:any):any{
        console.log(prefix+"Binary:"+Op[exp.op]
        + (exp.theType == null? "" : "("+exp.theType.toString()+")") 
        + (exp.constValue != undefined ? ", constValue:"+exp.constValue : "") 
        + (exp.isErrorNode? " **E** " : ""));
        this.visit(exp.exp1, prefix+"    ");
        this.visit(exp.exp2, prefix+"    ");
    }

    visitUnary(exp:Unary, prefix:any):any{
        console.log(prefix 
        + (exp.isPrefix ? "Prefix ": "PostFix ") 
        + "Unary:"+Op[exp.op]+ (exp.theType == null? "" : "("+exp.theType.toString()+")") 
        + (typeof exp.constValue != 'undefined' ? ", constValue:"+exp.constValue : "") 
        + (exp.isErrorNode? " **E** " : ""));
        this.visit(exp.exp, prefix+"    ");
    }
   
    visitIntegerLiteral(exp:IntegerLiteral, prefix:any):any{
        console.log(prefix+exp.value + (exp.theType == null? "" : "("+exp.theType.toString()+")") + (exp.isErrorNode? " **E** " : ""));
    }

    visitDecimalLiteral(exp:DecimalLiteral, prefix:any):any{
        console.log(prefix+exp.value+ (exp.theType == null? "" : "("+exp.theType.toString()+")")+ (exp.isErrorNode? " **E** " : ""));
    }

    visitStringLiteral(exp:StringLiteral, prefix:any):any{
        console.log(prefix+exp.value+ (exp.theType == null? "" : "("+exp.theType.toString()+")") + (exp.isErrorNode? " **E** " : ""));
    }

    visitNullLiteral(exp:NullLiteral, prefix:any):any{
        console.log(prefix+exp.value+ (exp.theType == null? "" : "("+exp.theType.toString()+")") + (exp.isErrorNode? " **E** " : ""));
    }

    visitBooleanLiteral(exp:BooleanLiteral, prefix:any):any{
        console.log(prefix+exp.value+ (exp.theType == null? "" : "("+exp.theType.toString()+")") + (exp.isErrorNode? " **E** " : ""));
    }

    visitTypeOfExp(exp:TypeOfExp, prefix:any):any{
        console.log(prefix + "typeof "
        + (exp.isErrorNode? " **E** " : ""));
        this.visit(exp.exp, prefix+"    ");
    }

    visitVariable(variable:Variable, prefix:any):any{
        console.log(prefix+"Variable: "
        + (variable.isErrorNode? " **E** " : "")+variable.name 
        + (variable.theType == null? "" : "("+variable.theType.toString()+")") 
        + (variable.isLeftValue ? ", LeftValue" : "") 
        + (typeof variable.constValue != 'undefined' ? ", constValue:"+variable.constValue : "") 
        + (variable.sym!=null ? ", resolved" : ", not resolved"));
    }

    visitFunctionCall(functionCall:FunctionCall, prefix:any):any{
        console.log(prefix+"FunctionCall "+ (functionCall.theType == null? "" : "("+functionCall.theType.toString()+")")+ (functionCall.isErrorNode? " **E** " : "")+functionCall.name + 
                    (built_ins.has(functionCall.name) ? ', built-in' :
                        (functionCall.sym!=null ? ", resolved" : ", not resolved")));
        for(let param of functionCall.arguments){
            this.visit(param, prefix+"    ");
        }
    }

    visitPredefinedTypeExp(t:PredefinedTypeExp, prefix:any):any{
        console.log(prefix + (t.isErrorNode? " **E** " : "") + Keyword[t.keyword]);
    }

    visitLiteralTypeExp(t:LiteralTypeExp, prefix:any):any{
        console.log(prefix + (t.isErrorNode? " **E** " : "") + "LiteralType："+t.literal.value);
    }

    visitArrayPrimTypeExp(t:ArrayPrimTypeExp, prefix:any):any{
        console.log(prefix + (t.isErrorNode? " **E** " : "") + "ArrayPrimType");
        this.visit(t.primType, prefix+"    ");
    }

    visitParenthesizedPrimTypeExp(t:ParenthesizedPrimTypeExp, prefix:any):any{
        console.log(prefix + (t.isErrorNode? " **E** " : "") + "ParenthesizedPrimType");
        this.visit(t.typeExp, prefix+"    ");
    }

    visitTypeReferenceExp(t:TypeReferenceExp, prefix:any):any{
        console.log(prefix + (t.isErrorNode? " **E** " : "") + t.typeName);
    }

    visitUnionOrIntersectionTypeExp(typeExp:UnionOrIntersectionTypeExp, prefix:any):any{
        console.log(prefix + (typeExp.isErrorNode? " **E** " : "") + (typeExp.op == Op.BitOr? "UnionType" : "IntersectionType"));
        for (let t of typeExp.types){
            this.visit(t, prefix+"    ");
        }
    }

    visitErrorExp(errorNode:ErrorExp, prefix:any):any{
        console.log(prefix+"Error Expression **E**");
    }

    visitErrorStmt(errorStmt:ErrorStmt, prefix:any):any{
        console.log(prefix+"Error Statement **E**");
    }
} 
