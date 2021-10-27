/**
 * 语法分析器
 * @version 0.5
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 * 
 * 当前特性：
 * 1.简化版的函数声明
 * 2.简化版的函数调用
 * 3.简化版的表达式
 * 
 * 当前语法规则：
 * prog : statementList? EOF;
 * statementList : statement+ ;
 * statement: block | expressionStatement | returnStatement | ifStatement | forStatement 
 *          | emptyStatement | functionDecl | variableDecl | classDecl;
 * block : '{' statementList? '}' ;
 * ifStatement : 'if' '(' expression ')' statement ('else' statement)? ;
 * forStatement : 'for' '(' (expression | 'let' variableDecl)? ';' expression? ';' expression? ')' statement ;
 * variableStatement : 'let' variableDecl ';';
 * variableDecl : (Identifier|arrayLiteral) typeAnnotation？ ('=' expression)? ;
 * typeAnnotation : ':' type_;
 * type_ : unionOrIntersectionOrPrimaryType | functionType;
 * unionOrIntersectionOrPrimaryType : primaryType ('|' | '&' primaryType)* ;
 * primaryType : primaryTypeLeft ('[' ']') * ;
 * primaryTypeLeft : predefinedType | literal | typeReference | '(' type_ ')' ;
 * predefinedType : 'number' | 'string' | 'boolean' | 'any' | 'void';
 * typeReference : Identifier ;
 * functionType : '(' parameterList? ')' '=>' type_;
 * functionDecl: "function" Identifier callSignature  block ;
 * callSignature: '(' parameterList? ')' typeAnnotation? ;
 * returnStatement: 'return' expression? ';' ;
 * emptyStatement: ';' ;
 * expressionStatement: expression ';' ;
 * expression: assignment ; 
 * assignment: binary (assignmentOp binary)* ;
 * binary: unary (binOp unary)* ;
 * unary: primary | prefixOp unary | primary postfixOp ;
 * primary:  primaryLeft ('[' expression ']') | '.' expression)* ;
 * primaryLeft: Identifier | functionCall | constructorCall | '(' expression ')' | arrayLiteral | literal | 'typeof' expression | 'this' | 'super' ;
 * literal: StringLiteral | DecimalLiteral | IntegerLiteral | BooleanLiteral | NullLiteral ;
 * assignmentOp : '=' | '+=' | '-=' | '*=' | '/=' | '>>=' | '<<=' | '>>>=' | '^=' | '|=' ;
 * binOp: '+' | '-' | '*' | '/' | '==' | '!=' | '<=' | '>=' | '<'
 *      | '>' | '&&'| '||'|...;
 * prefixOp : '+' | '-' | '++' | '--' | '!' | '~';
 * postfixOp : '++' | '--'; 
 * functionCall : Identifier '(' argumentList? ')' ;
 * argumentList : expression (',' expression)* ;
 * arrayLiteral : ('[' elementList? ']');
 * elementList : arrayElement (','+ arrayElement)* ;
 * arrayElement : expression ','? ;
 * classDecl : Class Identifier ( 'extends' Identifier)? classTail ;
 * classTail :  '{' classElement* '}' ;
 * classElement : constructorDecl | propertyMemberDecl ;
 * constructorDecl : Constructor '(' parameterList? ')' '{' functionBody '}' ;
 * propertyMemberDecl : Identifier typeAnnotation? ('=' expression)? ';'                  
 *                     | Identifier callSignature  '{' functionBody '}' ;
 * constructorCall : New Identifier (' argumentList? ')' ;
 * 
 */


import {Token, TokenKind, Scanner, Op, Seperator, Keyword, Position, Operators} from './scanner';
import {AstVisitor, AstNode, Block, Prog, VariableStatement, VariableDecl, FunctionDecl, CallSignature, ParameterList ,FunctionCall, Statement, Expression, ExpressionStatement, Binary, Unary, IntegerLiteral, DecimalLiteral, StringLiteral, NullLiteral, BooleanLiteral, Literal, Variable, ReturnStatement, IfStatement, ForStatement, TypeExp, PrimTypeExp, PredefinedTypeExp, LiteralTypeExp, TypeReferenceExp, ParenthesizedPrimTypeExp, ArrayPrimTypeExp, IndexedExp, UnionOrIntersectionTypeExp, ErrorExp, ErrorStmt, TypeOfExp, ArrayLiteral, EmptyStatement, ClassDecl, ThisExp, SuperExp, DotExp, FunctionTypeExp} from './ast';
import { assert } from 'console';
import { SysTypes, Type, UnionType} from './types';
import {CompilerError} from './error'
import { FunctionKind } from './symbol';
import { SSL_OP_NO_TLSv1_1 } from 'constants';


////////////////////////////////////////////////////////////////////////////////
//Parser

/**
 * 语法解析器。
 * 通常用parseProg()作为入口，解析整个程序。也可以用下级的某个节点作为入口，只解析一部分语法。
 */
export class Parser{
    scanner:Scanner;
    constructor(scanner:Scanner){
        this.scanner = scanner;
    }

    errors:CompilerError[] = [];   //语法错误
    warnings:CompilerError[] = []; //语法报警

    addError(msg:string, pos:Position){
        this.errors.push(new CompilerError(msg,pos,false));
        console.log("@" + pos.toString() +" : " + msg);
    }

    addWarning(msg:string, pos:Position){
        this.warnings.push(new CompilerError(msg,pos,true));
        console.log("@" + pos.toString() +" : " + msg);
    }

    /**
     * 解析Prog
     * 语法规则：
     * prog = (functionDecl | functionCall)* ;
     */
    parseProg():Prog{  
        let beginPos = this.scanner.peek().pos;
        let stmts  = this.parseStatementList();

        return new Prog(beginPos, this.scanner.getLastPos(), stmts);
    }

    parseStatementList():Statement[]{
        let stmts: Statement[] = [];
        let t = this.scanner.peek();    
        //statementList的Follow集合里有EOF和'}'这两个元素，分别用于prog和Block等场景。
        while(t.kind != TokenKind.EOF && t.code != Seperator.CloseBrace){   //'}'
            let stmt = this.parseStatement();
            stmts.push(stmt);
            t = this.scanner.peek(); 
        }
        return stmts;
    }

    /**
     * 解析语句。
     * 知识点：在这里，遇到了函数调用、变量声明和变量赋值，都可能是以Identifier开头的情况，所以预读一个Token是不够的，
     * 所以这里预读了两个Token。
     */
    parseStatement():Statement{
        let t = this.scanner.peek();
        //根据'function'关键字，去解析函数声明
        if (t.code == Keyword.Function){
            return this.parseFunctionDecl();
        }
        // else if (t.kind == TokenKind.Identifier){
        //     let t2 = this.scanner.peek2();
        //     if (t2.code == Seperator.OpenParen){
        //         return this.parseFunctionDecl();  //类的方法
        //     }
        //     else{
        //         return this.parseExpressionStatement();
        //     }
        // }
        // else if (t.code == Keyword.Constructor){
        //     return this.parseFunctionDecl();  //类的构造方法
        // }
        else if (t.code == Keyword.Let){
            return this.parseVariableStatement();
        }
        //根据'return'关键字，解析return语句
        else if (t.code == Keyword.Return){
            return this.parseReturnStatement();
        }
        else if (t.code == Keyword.If){
            return this.parseIfStatement();
        }
        else if (t.code == Keyword.For){
            return this.parseForStatement();
        }
        else if (t.code == Seperator.OpenBrace){  //'{'
            return this.parseBlock();
        }
        else if (t.kind == TokenKind.Identifier ||
                 t.kind == TokenKind.DecimalLiteral ||
                 t.kind == TokenKind.IntegerLiteral ||
                 t.kind == TokenKind.StringLiteral ||
                 t.code == Seperator.OpenParen || //'('
                 t.code == Keyword.This){  
            return this.parseExpressionStatement();
        }
        else if (t.code == Keyword.Super){
            let t1 = this.scanner.peek2();
            if(t1.code == Seperator.OpenParen){
                return this.parseFunctionCall();
            }
            else{
                return this.parseExpressionStatement();
            }
        }
        else if (t.code == Keyword.Class){
            return this.parseClassDecl();
        }
        else if (t.code == Seperator.SemiColon){
            this.scanner.next();
            return new EmptyStatement(this.scanner.getLastPos());
        }
        else{
            this.addError("Can not recognize a statement starting with: " + this.scanner.peek().text, this.scanner.getLastPos());
            let beginPos = this.scanner.getNextPos();
            this.skip();
            return new ErrorStmt(beginPos,this.scanner.getLastPos());
        }
    }

    /**
     * Return语句
     * 无论是否出错都会返回一个ReturnStatement。
     */
    parseReturnStatement():ReturnStatement{
        let beginPos = this.scanner.getNextPos();
        let exp:Expression|null = null;

        //跳过'return'
        this.scanner.next();
        // console.log(this.scanner.peek().toString());

        //解析后面的表达式
        let t = this.scanner.peek();
        if (t.code != Seperator.SemiColon){  //';'
            exp = this.parseExpression();
        }

        //跳过';'
        t = this.scanner.peek();
        if (t.code == Seperator.SemiColon){  //';'
            this.scanner.next();
        }
        else{
            this.addError("Expecting ';' after return statement.", this.scanner.getLastPos());
        }

        return new ReturnStatement(beginPos, this.scanner.getLastPos(), exp);
    }

    /**
     * 解析If语句
     * ifStatement : 'if' '(' expression ')' statement ('else' statement)? ;
     */
    parseIfStatement():IfStatement{
        let beginPos = this.scanner.getNextPos();
        //跳过if
        this.scanner.next();
        let isErrorNode = false;

        //解析if条件
        let condition: Expression;
        if(this.scanner.peek().code == Seperator.OpenParen){  //'('
            //跳过'('
            this.scanner.next();
            //解析if的条件
            condition = this.parseExpression();
            if(this.scanner.peek().code == Seperator.CloseParen){  //')'
                //跳过')'
                this.scanner.next();
            }
            else{
                this.addError("Expecting ')' after if condition.", this.scanner.getLastPos());
                this.skip();
                isErrorNode = true;
            }
        }
        else{
            this.addError("Expecting '(' after 'if'.", this.scanner.getLastPos());
            this.skip();
            condition = new ErrorExp(beginPos,this.scanner.getLastPos());
        }
        
        //解析then语句
        let stmt = this.parseStatement();

        //解析else语句
        let elseStmt:Statement|null = null;
        if (this.scanner.peek().code == Keyword.Else){  
            //跳过'else'
            this.scanner.next();
            elseStmt = this.parseStatement();
        }

        return new IfStatement(beginPos, this.scanner.getLastPos(), condition, stmt, elseStmt, isErrorNode);      
    }

    /**
     * 解析For语句
     * forStatement : 'for' '(' expression? ';' expression? ';' expression? ')' statement ;
     */
    parseForStatement():ForStatement{
        let beginPos = this.scanner.getNextPos();
        //跳过'for'
        this.scanner.next();

        let isErrorNode = false;
        let init:Expression|VariableDecl|null = null;
        let terminate:Expression|null = null;
        let increment:Expression|null = null;

        if(this.scanner.peek().code == Seperator.OpenParen){  //'('
            //跳过'('
            this.scanner.next();

            //init
            if (this.scanner.peek().code != Seperator.SemiColon){  //';'
                if (this.scanner.peek().code == Keyword.Let){  
                    this.scanner.next(); //跳过'let'
                    init = this.parseVariableDecl();
                }
                else{
                    init = this.parseExpression();
                }
            }
            if (this.scanner.peek().code == Seperator.SemiColon){  //';'
                //跳过';'
                this.scanner.next();
            }
            else{
                this.addError("Expecting ';' after init part of for statement.", this.scanner.getLastPos());
                this.skip();
                //跳过后面的';'
                if (this.scanner.peek().code == Seperator.SemiColon){  //';'
                    this.scanner.next();
                }
                isErrorNode = true;
            }

            //terminate
            if (this.scanner.peek().code != Seperator.SemiColon){  //';'
                terminate = this.parseExpression();
            }
            if (this.scanner.peek().code == Seperator.SemiColon){  //';'
                //跳过';'
                this.scanner.next();
            }
            else{
                this.addError("Expecting ';' after terminate part of for statement.", this.scanner.getLastPos());
                this.skip();
                //跳过后面的';'
                if (this.scanner.peek().code == Seperator.SemiColon){  //';'
                    this.scanner.next();
                }
                isErrorNode = true;
            }

            //increment
            if (this.scanner.peek().code != Seperator.CloseParen){  //')'
                increment = this.parseExpression();
            }
            if (this.scanner.peek().code == Seperator.CloseParen){  //')'
                //跳过')'
                this.scanner.next();
            }
            else{
                this.addError("Expecting ')' after increment part of for statement.", this.scanner.getLastPos());
                this.skip();
                //跳过后面的')'
                if (this.scanner.peek().code==Seperator.CloseParen){  //')'
                    this.scanner.next();
                }
                isErrorNode = true;
            }
        }
        else{
            this.addError("Expecting '(' after 'for'.", this.scanner.getLastPos());
            this.skip();
            isErrorNode = true;
        }

        //stmt
        let stmt = this.parseStatement();

        return new ForStatement(beginPos, this.scanner.getLastPos(), init, terminate, increment, stmt, isErrorNode);
        
    }

    /**
     * 解析变量声明语句
     * variableStatement : 'let' variableDecl ';';
     */
    parseVariableStatement():VariableStatement{
        let beginPos = this.scanner.getNextPos();
        let isErrorNode = false;
        //跳过'let'    
        this.scanner.next();

        let variableDecl = this.parseVariableDecl();

        //分号，结束变量声明
        let t = this.scanner.peek();
        if (t.code==Seperator.SemiColon){   //';'
            this.scanner.next();
        }
        else{
            this.skip();
            isErrorNode = true;
        }

        return new VariableStatement(beginPos,this.scanner.getLastPos(), variableDecl,isErrorNode);
    }


    /**
     * 解析变量声明
     * 语法规则：
     * variableDecl : Identifier typeAnnotation？ ('=' sigleExpression)?;
     */
    parseVariableDecl():VariableDecl{  
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.next();
        if (t.kind == TokenKind.Identifier){
            let varName:string = t.text;

            let typeExp:TypeExp|null = null;
            let init:Expression|null = null;
            let isErrorNode = false;

            let t1 = this.scanner.peek();
            //可选的类型注解
            if (t1.code == Seperator.Colon){  //':'
                typeExp = this.parseTypeAnnotation(); 
            }
            
            //可选的初始化部分
            t1 = this.scanner.peek();
            if (t1.code == Op.Assign){  //'='
                this.scanner.next();
                init = this.parseExpression();
            }
            
            return new VariableDecl(beginPos, this.scanner.getLastPos(), varName, typeExp, init, isErrorNode);
        }
        else{
            this.addError("Expecting variable name in VariableDecl, while we meet " + t.text, this.scanner.getLastPos());
            this.skip();
            return new VariableDecl(beginPos, this.scanner.getLastPos(), "unknown", null, null, true);
        }
    }

    parseTypeAnnotation():TypeExp{
        this.scanner.next(); //跳过‘:’

        return this.parseType();
    }

    /**
     * 解析类型。
     */
    private parseType():TypeExp{
        let t1 = this.scanner.peek();
        let rtn:TypeExp;

        if (t1.code == Seperator.OpenParen){
            let t2 = this.scanner.peek2();
            if (t2.kind == TokenKind.Identifier){
                let t3 = this.scanner.peek3();
                if (t3.code == Seperator.Colon){
                    rtn = this.parseFunctionType();
                }
                else{
                    rtn = this.parseUnionOrIntersectionOrPrimaryType();
                }
            }
            else{
                rtn = this.parseUnionOrIntersectionOrPrimaryType();
            }
        }
        else{
            rtn = this.parseUnionOrIntersectionOrPrimaryType();
        }

        return rtn as TypeExp;
    }

    private parseFunctionType():FunctionTypeExp{
        let beginPos = this.scanner.getNextPos();

        this.scanner.next(); //跳过'('
        let paramList = this.parseParameterList();
        console.log("\nparamList");
        console.log(paramList);
        let t = this.scanner.peek();
        if (t.code == Seperator.CloseParen){
            this.scanner.next(); //跳过‘)’
        }
        else{
            this.skip();
            this.addError("Expecting ')' when parsing FunctionType, while we got '" + t.text + "'.", t.pos);
        }

        let t1 = this.scanner.peek();
        let returnType: TypeExp|null = null; 
        if (t1.code == Op.ARROW){ //'=>'
            this.scanner.next();  //跳过'=>'
            returnType = this.parseType();
        }
        else{
            this.skip();
            this.addError("Expecting '=>' when parsing FunctionType, while we got '" + t1.text + "'.", t1.pos)
        }

        if(!returnType) returnType =  new TypeReferenceExp(beginPos, this.scanner.getLastPos(), t1.text, true);  //一个用于占位的错误类型

        return new FunctionTypeExp(beginPos, this.scanner.getLastPos(), paramList, returnType);
    }

    /**
     * unionOrIntersectionOrPrimaryType : primaryType ('|' | '&' primaryType)* ;
     * todo：目前只支持联合类型，不支持交集类型。
     */
    private parseUnionOrIntersectionOrPrimaryType():TypeExp{
        let beginPos = this.scanner.getNextPos();

        //可能会解析出多个PrimaryType
        let types: TypeExp[] = []; 
        
        //解析第一个PrimaryType
        types.push(this.parsePrimTypeExp());

        //解析后续的PrimaryType
        while (this.scanner.peek().code == Op.BitOr){ //‘|’
            this.scanner.next(); //跳过'|'
            types.push(this.parsePrimTypeExp());
        }

        //返回primaryType或者UnionOrIntersectionType
        if (types.length > 1){
            return new UnionOrIntersectionTypeExp(beginPos, this.scanner.getLastPos(), Op.BitOr, types);
        }
        else{
            return types[0];
        }
    }

    /**
     * 解析基础类型
     * primaryType : predefinedType | literal | typeReference | '(' type_ ')' | primaryType '[' ']' ;
     * predefinedType : 'number' | 'string' | 'boolean' | 'any' ;
     * 目前其实只支持预定义的类型（PredefinedType）。
     */
    private parsePrimTypeExp():PrimTypeExp{
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.peek();     

        let primType:PrimTypeExp;
            
        //自定义类型
        if (t.kind== TokenKind.Identifier){ 
            this.scanner.next();
            primType = new TypeReferenceExp(beginPos, this.scanner.getLastPos(), t.text);
        }
        //预定义类型
        else if (t.code == Keyword.Any || t.code == Keyword.Boolean || t.code == Keyword.String || t.code == Keyword.Number || t.code == Keyword.Void){
            this.scanner.next();
            primType = new PredefinedTypeExp(beginPos, this.scanner.getLastPos(), t.code);  
        }
        //直面量类型
        else if(t.kind == TokenKind.IntegerLiteral || t.kind == TokenKind.DecimalLiteral || t.kind == TokenKind.StringLiteral ||
            t.code == Keyword.Null || t.code == Keyword.True || t.code == Keyword.False){
            let literal = this.parseLiteral();
            primType = new LiteralTypeExp(beginPos, this.scanner.getLastPos(), literal);
        }
        else if (t.code == Seperator.OpenParen){ //'('
            this.scanner.next(); //跳过'('
            let typeExp = this.parseType();
            let isErrorNode = (this.scanner.peek().code != Seperator.CloseParen);
            if (isErrorNode){
                this.addError("Expecting ')' when parsing ParenthesizedPrimType.", this.scanner.getLastPos());
                this.skip();
            }
            else{
                this.scanner.next(); //跳过‘)’
            }
            primType = new ParenthesizedPrimTypeExp(beginPos, this.scanner.getLastPos(), typeExp, isErrorNode);
        }
        else{
            this.addError("Unsupported type expression: " + t.text, t.pos);
            primType = new TypeReferenceExp(beginPos, this.scanner.getLastPos(), t.text, true);  //一个用于占位的错误类型
            this.scanner.next();
        }

        //看看是不是数组类型。可以连续解析多个‘[]’
        while (this.scanner.peek().code == Seperator.OpenBracket){
            this.scanner.next(); //跳过'['
            let isErrorNode = (this.scanner.peek().code != Seperator.CloseBracket);
            if (isErrorNode){
                this.addError("Expecting ']' when parsing ArrayPrimType.", this.scanner.getLastPos());
                primType.isErrorNode = true;
                this.skip();
                break;
            }
            else{
                this.scanner.next(); //跳过']'
                primType = new ArrayPrimTypeExp(beginPos, this.scanner.getLastPos(), primType);
            }
        }
    
        return primType;
    }

    /**
     * 解析函数声明
     * 语法规则：
     * functionDecl: "function" Identifier callSignature  block ;
     * callSignature: '(' parameterList? ')' typeAnnotation? ;
     * parameterList : parameter (',' parameter)* ;
     * parameter : Identifier typeAnnotation? ;
     * block : '{' statementList? '}' ;
     * 返回值：
     * null-意味着解析过程出错。
     */
    parseFunctionDecl():FunctionDecl{
        let beginPos = this.scanner.getNextPos();
        let isErrorNode = false;

        //区分函数、方法还是constructor
        let functionKind = FunctionKind.Function;
        let firstToken = this.scanner.peek();
        if (firstToken.code == Keyword.Function){
            this.scanner.next(); //跳过'function'
        }
        else if (firstToken.code == Keyword.Constructor){
            functionKind = FunctionKind.Constructor;
        }
        else{
            functionKind = FunctionKind.Method;
        }

        let tName = this.scanner.next();       
        if (tName.kind != TokenKind.Identifier && tName.code != Keyword.Constructor){
            this.addError("Expecting a function name, while we got a " + tName.text, this.scanner.getLastPos());
            this.skip();
            isErrorNode = true;
        }

        //解析callSignature
        let callSignature:CallSignature;
        let t1 = this.scanner.peek();
        if (t1.code==Seperator.OpenParen){  //'('
            callSignature = this.parseCallSignature();            
        }
        else{
            this.addError("Expecting '(' in FunctionDecl, while we got a " + t1.text, this.scanner.getLastPos());
            this.skip();
            callSignature = new CallSignature(beginPos,this.scanner.getLastPos(),null,null,true);
        }      
        
        //解析block
        let functionBody:Block;
        t1 = this.scanner.peek();
        if (t1.code == Seperator.OpenBrace){   //'{'
            functionBody = this.parseBlock();
        }
        else{
            this.addError("Expecting '{' in FunctionDecl, while we got a " + t1.text, this.scanner.getLastPos());
            this.skip();
            functionBody = new Block(beginPos,this.scanner.getLastPos(),[],true);
        }

        return new FunctionDecl(beginPos,tName.text, callSignature, functionBody, functionKind, isErrorNode);
    }

    /**
     * 解析函数签名
     * callSignature: '(' parameterList? ')' typeAnnotation? ;
     */
    parseCallSignature():CallSignature{
        let beginPos = this.scanner.getNextPos();
        //跳过'('
        let t = this.scanner.next();

        let paramList = null;
        if (this.scanner.peek().code != Seperator.CloseParen){  //')'
            paramList = this.parseParameterList();
        }

        //看看后面是不是')'
        t = this.scanner.peek();
        if (t.code == Seperator.CloseParen){  //')'
            //跳过')'
            this.scanner.next();

            //解析typeAnnotation
            let typeExp:TypeExp|null = null;
            if (this.scanner.peek().code == Seperator.Colon){  //':'
                typeExp = this.parseTypeAnnotation();
            }
            return new CallSignature(beginPos,this.scanner.getLastPos(),paramList, typeExp);
        }
        else{
            this.addError("Expecting a ')' after for a call signature", this.scanner.getLastPos());
            return new CallSignature(beginPos,this.scanner.getLastPos(),paramList, null, true);
        }
    }

    /**
     * 解析参数列表
     * parameterList : parameter (',' parameter)* ;
     */
    parseParameterList():ParameterList{
        let params:VariableDecl[] = [];
        let beginPos = this.scanner.getNextPos();
        let isErrorNode = false;
        let t = this.scanner.peek();
        while (t.code != Seperator.CloseParen && t.kind != TokenKind.EOF){  //')'
            if (t.kind == TokenKind.Identifier){
                this.scanner.next();
                let t1 = this.scanner.peek();
                let typeExp:TypeExp|null = null;
                if (t1.code == Seperator.Colon){  //':'
                    typeExp = this.parseTypeAnnotation();
                }
                params.push(new VariableDecl(beginPos, this.scanner.getLastPos(), t.text, typeExp, null));

                //处理','
                t = this.scanner.peek();
                if (t.code != Seperator.CloseParen){  //')'
                    if (t.code == Op.Comma){  //','
                        this.scanner.next(); //跳过','
                        // console.log("meet a comma in parseParameterList");
                        t = this.scanner.peek();
                    }
                    else{
                        this.addError("Expecting ',' or '）' after a parameter", this.scanner.getLastPos());
                        this.skip();
                        isErrorNode = true;
                        let t2 = this.scanner.peek();
                        if (t2.code == Op.Comma){   //','
                            this.scanner.next();  //跳过','
                            t = this.scanner.peek();
                        }
                        else{
                            break;
                        }
                    }
                }
            }
            else{
                this.addError("Expecting an identifier as name of a Parameter", this.scanner.getLastPos());
                this.skip();
                isErrorNode = true;
                if (t.code == Op.Comma){  //','
                    this.scanner.next();  //跳过','
                    t = this.scanner.peek();
                }
                else{
                    break;
                }
            }
        }

        return new ParameterList(beginPos, this.scanner.getLastPos(),params,isErrorNode);
    }

      /**
     * 解析函数体
     * 语法规则：
     * block : '{' statementList? '}' ;
     */
    parseBlock():Block{
        let beginPos = this.scanner.getNextPos();
        let t:Token = this.scanner.peek();
        //跳过'{'
        this.scanner.next();
        let stmts = this.parseStatementList();
        t = this.scanner.peek();
        if (t.code == Seperator.CloseBrace){  //'}'
            this.scanner.next();
            return new Block(beginPos, this.scanner.getLastPos(), stmts);
        }
        else{
            this.addError("Expecting '}' while parsing a block, but we got a " + t.text, this.scanner.getLastPos());
            this.skip();
            return new Block(beginPos, this.scanner.getLastPos(), stmts, true);
        }
    }

    /**
     * 解析表达式语句
     */
    parseExpressionStatement():ExpressionStatement{
        let exp = this.parseExpression();
        let t = this.scanner.peek();
        let stmt = new ExpressionStatement(this.scanner.getLastPos(),exp);
        if (t.code == Seperator.SemiColon){  //';'
            this.scanner.next(); 
        }
        else{
            this.addError("Expecting a semicolon at the end of an expresson statement, while we got a " + t.text, this.scanner.getLastPos());
            this.skip();
            stmt.endPos = this.scanner.getLastPos();
            stmt.isErrorNode = true;
        }
        return stmt;
    }

    /**
     * 解析表达式
     */
    parseExpression():Expression{
        let beginPos = this.scanner.getNextPos();

        //带有前缀的表达式，比如: typeof var;
        let prefix:Keyword.Typeof | null = null;
        let t = this.scanner.peek();
        if (t.code == Keyword.Typeof){
            this.scanner.next(); //跳过这个typeof关键字
            prefix = t.code;
        }

        let exp = this.parseAssignment();
        
        if (prefix == Keyword.Typeof){
            return new TypeOfExp(beginPos, this.scanner.getLastPos(),exp,t);
        }
        else{
            return exp;
        }
        
    }


    /**
     * 二元运算符的优先级。
     */
    private opPrec:Map<Op,number> = new Map([
        [Op.Assign,                     2],
        [Op.PlusAssign,                 2],
        [Op.MinusAssign,                2],
        [Op.MultiplyAssign,             2],
        [Op.DivideAssign,               2],
        [Op.ModulusAssign,              2],
        [Op.BitAndAssign,               2],
        [Op.BitOrAssign,                2],
        [Op.BitXorAssign,               2],
        [Op.LeftShiftArithmeticAssign,  2],
        [Op.RightShiftArithmeticAssign, 2],
        [Op.RightShiftLogicalAssign,    2],
        [Op.Or,                         4],
        [Op.And,                        5],
        [Op.BitOr,                      6],
        [Op.BitXOr,                     7],
        [Op.BitAnd,                     8],
        [Op.EQ,                         9],
        [Op.IdentityEquals,             9],
        [Op.NE,                         9],
        [Op.IdentityNotEquals,          9],
        [Op.G,                          10],
        [Op.GE,                         10],
        [Op.L,                          10],
        [Op.LE,                         10],
        [Op.LeftShiftArithmetic,        11],
        [Op.RightShiftArithmetic,       11],
        [Op.RightShiftLogical,          11],
        [Op.Plus,                       12],
        [Op.Minus,                      12],
        [Op.Divide,                     13],
        [Op.Multiply,                   13],
        [Op.Modulus,                    13],
        ]);

    private getPrec(op:Op):number{
        let ret = this.opPrec.get(op);
        if (typeof ret == 'undefined'){
            return -1;
        }
        else{
            return ret;
        }
    }

    /**
     * 解析赋值表达式。
     * 注意：赋值表达式是右结合的。
     */
    parseAssignment():Expression{
        let assignPrec = this.getPrec(Op.Assign);
        //先解析一个优先级更高的表达式
        let exp1 = this.parseBinary(assignPrec);
        let t = this.scanner.peek();
        let tprec = this.getPrec(t.code as Op);
        //存放赋值运算符两边的表达式
        let expStack:Expression[] = [];
        expStack.push(exp1);
        //存放赋值运算符
        let opStack:Op[] = [];
            
        //解析赋值表达式
        while (t.kind == TokenKind.Operator &&  tprec == assignPrec){
            opStack.push(t.code as Op);
            this.scanner.next();  //跳过运算符
            //获取运算符优先级高于assignment的二元表达式
            exp1 = this.parseBinary(assignPrec);
            expStack.push(exp1);
            t = this.scanner.peek()
            tprec = this.getPrec(t.code as Op);
        }

        //组装成右结合的AST
        exp1 = expStack[expStack.length-1];
        if(opStack.length>0){
            for(let i:number = expStack.length-2; i>=0; i--){
                exp1 = new Binary(opStack[i],expStack[i], exp1);
            }
        }
        return exp1;
    }

    /**
     * 采用运算符优先级算法，解析二元表达式。
     * 这是一个递归算法。一开始，提供的参数是最低优先级，
     * 
     * @param prec 当前运算符的优先级
     */
    parseBinary(prec:number):Expression{
        // console.log("parseBinary : " + prec);
        let exp1 = this.parseUnary();
        let t = this.scanner.peek();
        let tprec = this.getPrec(t.code as Op);
        
        //下面这个循环的意思是：只要右边出现的新运算符的优先级更高，
        //那么就把右边出现的作为右子节点。
        /**
         * 对于2+3*5
         * 第一次循环，遇到+号，优先级大于零，所以做一次递归的parseBinary
         * 在递归的binary中，遇到乘号，优先级大于+号，所以形成3*5返回，又变成上一级的右子节点。
         * 
         * 反过来，如果是3*5+2
         * 第一次循环还是一样，遇到*号，做一次递归的parseBinary
         * 在递归中，新的运算符的优先级要小，所以只返回一个5，跟前一个节点形成3*5,成为新的左子节点。
         * 接着做第二次循环，遇到+号，返回5，并作为右子节点，跟3*5一起组成一个新的binary返回。
         */
        
        while (t.kind == TokenKind.Operator &&  tprec > prec){
            this.scanner.next();  //跳过运算符
            let exp2 = this.parseBinary(tprec);
            let exp:Binary = new Binary(t.code as Op, exp1, exp2);
            exp1 = exp;
            t = this.scanner.peek()
            tprec = this.getPrec(t.code as Op);
        }
        return exp1;
    }

    /**
     * 解析一元运算
     * unary: primary | prefixOp unary | primary postfixOp ;
     */
    parseUnary():Expression{
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.peek();

        //前缀的一元表达式
        if(t.kind == TokenKind.Operator){  //todo:应该明确是哪些运算符吧？
            this.scanner.next();//跳过运算符
            let exp = this.parseUnary();
            return new Unary(beginPos, this.scanner.getLastPos(), t.code as Op, exp, true);
        }
        //后缀只能是++或--
        else{
            //首先解析一个primary
            let exp = this.parsePrimary();
            let t1 = this.scanner.peek();
            if (t1.kind == TokenKind.Operator && (t1.code == Op.Inc || t1.code == Op.Dec)){
                this.scanner.next(); //跳过运算符
                return new Unary(beginPos, this.scanner.getLastPos(), t1.code as Op, exp, false);
            }
            else{
                return exp;
            }
        }
    }

    /**
     * 解析基础表达式。
     */
    parsePrimary():Expression{
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.peek();

        let exp:Expression;
        
        //知识点：以Identifier开头，可能是函数调用，也可能是一个变量，所以要再多向后看一个Token，
        //这相当于在局部使用了LL(2)算法。
        if (t.kind == TokenKind.IntegerLiteral || t.kind == TokenKind.DecimalLiteral || t.kind == TokenKind.StringLiteral ||
            t.code == Keyword.Null || t.code == Keyword.True || t.code == Keyword.False){
            exp = this.parseLiteral(); 
        }
        else if (t.kind == TokenKind.Identifier){
            if (this.scanner.peek2().code == Seperator.OpenParen){  //'('
                exp = this.parseFunctionCall();
            }
            else{
                this.scanner.next();
                exp = new Variable(beginPos, this.scanner.getLastPos(), t.text);
            }
        }
        else if (t.code == Seperator.OpenParen){  //'('
            this.scanner.next();
            exp = this.parseExpression();
            let t1 = this.scanner.peek();
            if (t1.code == Seperator.CloseParen){  //')'
                this.scanner.next();
            }
            else{
                this.addError("Expecting a ')' at the end of a primary expresson, while we got a " + t.text, this.scanner.getLastPos());
                this.skip();
            }
        }
        else if (t.code == Keyword.This){
            this.scanner.next();
            exp = new ThisExp(t.pos);
        }
        else if (t.code == Keyword.Super){
            exp = new SuperExp(t);
        }
        else if (t.code == Keyword.Typeof){  //typeof
            this.scanner.next();   //跳过typeof关键字
            let exp1 = this.parsePrimary();
            exp = new TypeOfExp(beginPos, this.scanner.getLastPos(), exp1,t);
        }
        else if (t.code == Keyword.New){
            this.scanner.next();
            let t1 = this.scanner.peek();
            let t2 = this.scanner.peek2();
            if (t1.kind == TokenKind.Identifier && t2.code == Seperator.OpenParen){
                exp = this.parseFunctionCall();
            }
            else{
                this.addError("Invalid syntax to 'New' a object",t1.pos);
                exp = new ErrorExp(t.pos,t1.pos);
                this.skip();
            }
        }
        else if (t.code == Seperator.OpenBracket){ //'['  ArrayLiteral
            this.scanner.next();  //跳过'['
            let t1 = this.scanner.peek();
            let exps:Expression[] = [];
            while(t1.code != Seperator.CloseBracket){  //']'
                let exp1 = this.parseExpression();
                exps.push(exp1);

                t1 = this.scanner.peek();

                //后面要么是逗号，要么是']'
                if (t1.code == Op.Comma){
                    this.scanner.next();        //跳过','
                    t1 = this.scanner.peek();
                }
                else if (t1.code != Seperator.CloseBracket){
                    this.addError("Expecting ',' or ']' when parsing ArrayLiteral, while we got :"  + t.text, this.scanner.getLastPos());
                    this.skip();
                }
            }
            if (t1.code == Seperator.CloseBracket) this.scanner.next();  //跳过最后一个']';
            exp = new ArrayLiteral(beginPos,this.scanner.getLastPos(), exps);
        }
        else{
            //遇到一些不在First集合中的Token。
            this.addError("Can not recognize a primary expression starting with: " + t.text, this.scanner.getLastPos());
            exp = new ErrorExp(beginPos,this.scanner.getLastPos());
        }

        //带有后缀的表达式，比如数组。
        t = this.scanner.peek();

        //解析Array表达式和点符号表达式
        while (t.code == Seperator.OpenBracket || t.code == Op.Dot){
            if (t.code == Seperator.OpenBracket){
                this.scanner.next(); //跳过'['
                let exp1 = this.parseExpression();
                let isErrorNode = (this.scanner.peek().code != Seperator.CloseBracket);
                if (isErrorNode){
                    this.addError("Expecting ']' when parsing ArrayPrimType.", this.scanner.getLastPos());
                    exp.isErrorNode = true;
                    this.skip();
                    break;
                }
                else{
                    this.scanner.next(); //跳过']'
                    exp = new IndexedExp(beginPos, this.scanner.getLastPos(), exp, exp1);
                }
            }
            else{  //t.code == Op.Dot
                this.scanner.next(); //跳过'.'
                let exp1 = this.parsePrimary();
                exp = new DotExp(beginPos, this.scanner.getLastPos(), exp, exp1 as Variable | FunctionCall);
            }
            t = this.scanner.peek();
        }

        return exp;
        
    }

    /**
     * 解析字面量
     */
    parseLiteral():Literal{
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.peek();
        // console.log("parsePrimary: " + t.text);
        
        //知识点：以Identifier开头，可能是函数调用，也可能是一个变量，所以要再多向后看一个Token，
        //这相当于在局部使用了LL(2)算法。
        if (t.kind == TokenKind.IntegerLiteral){
            this.scanner.next();
            return new IntegerLiteral(beginPos,parseInt(t.text));
        }
        else if (t.kind == TokenKind.DecimalLiteral){
            this.scanner.next();
            return new DecimalLiteral(beginPos,parseFloat(t.text));
        }
        else if (t.code == Keyword.Null){
            this.scanner.next();
            return new NullLiteral(beginPos);
        }
        else if (t.code == Keyword.True || t.code == Keyword.False){
            this.scanner.next();
            return new BooleanLiteral(beginPos, t.code == Keyword.True);
        }
        else{ //(t.kind == TokenKind.StringLiteral)
            this.scanner.next();
            return new StringLiteral(beginPos,t.text);
        }
    }


    /**
     * 解析函数调用
     * 语法规则：
     * functionCall : Identifier '(' parameterList? ')' ;
     * parameterList : StringLiteral (',' StringLiteral)* ;
     */
    parseFunctionCall():FunctionCall{
        let beginPos = this.scanner.getNextPos();
        let params:Expression[] = [];
        let name = this.scanner.next().text;
        
        //跳过'('
        this.scanner.next();
        
        //循环，读出所有参数
        let t1 = this.scanner.peek();
        while(t1.code != Seperator.CloseParen && t1.kind != TokenKind.EOF){
            let exp = this.parseExpression();
            params.push(exp);
            
            if (exp?.isErrorNode){
                this.addError("Error parsing parameter for function call "+name, this.scanner.getLastPos());
            }

            t1 = this.scanner.peek();
            if (t1.code != Seperator.CloseParen){ //')'
                if (t1.code == Op.Comma){ //','
                    t1 = this.scanner.next();
                }
                else{
                    this.addError("Expecting a comma at the end of a parameter, while we got a " + t1.text, this.scanner.getLastPos());
                    this.skip();
                    return new FunctionCall(beginPos, this.scanner.getLastPos(), name, params,true);
                }
            }
        }        

        if (t1.code == Seperator.CloseParen){
            //消化掉')'
            this.scanner.next();
        }

        return new FunctionCall(beginPos, this.scanner.getLastPos(), name, params);    
    }

    /**
     * classDecl : Class Identifier classTail ;
     * classTail :  '{' classElement* '}' ;
     * classElement : constructorDecl | propertyMemberDecl ;
     * constructorDecl : Constructor '(' parameterList? ')' '{' functionBody '}' ;
     * propertyMemberDecl : Identifier typeAnnotation? ('=' expression)? ';'                  
     *                     | Identifier callSignature  '{' functionBody '}' ;
     */
    parseClassDecl():ClassDecl{
        let isErrorNode = false;
        let classToken = this.scanner.next(); //跳过class关键字
        
        //类名称
        let tName = this.scanner.peek();
        if (tName.kind == TokenKind.Identifier){
            this.scanner.next(); 
        }
        else{
            this.addError("Expecting class name in ClassDecl, while we got a " + tName.text, this.scanner.getLastPos());
            this.skip();
            isErrorNode = true;
        }

        //extends superClass
        let superClass:string|null = null;
        let tExtends = this.scanner.peek();
        if (tExtends.code == Keyword.Extends){
            this.scanner.next();     //跳过'extends'
            let tSuper = this.scanner.peek();
            if (tSuper.kind == TokenKind.Identifier){
                superClass = tSuper.text;
                this.scanner.next(); //跳过'superClass'
            }
            else{
                this.addError("Expecting super class name after 'extends', while we got a " + tSuper.text, this.scanner.getLastPos());
                this.skip();
                isErrorNode = true;
            }
        }

        //类的Body
        let body:Block;
        let t1 = this.scanner.peek();
        if (t1.code == Seperator.OpenBrace){ //'{'
            body = this.parseClassBody();
        }
        else{
            this.addError("Expecting '{' in ClassDecl, while we got a " + t1.text, this.scanner.getLastPos());
            this.skip();
            body = new Block(t1.pos, t1.pos,[],true);
        }
        
        return new ClassDecl(classToken,this.scanner.getLastPos(),tName.text, body, superClass, isErrorNode);
    }

    parseClassBody():Block{
        let isErrorNode = false;
        let beginPos = this.scanner.getNextPos();

        //跳过'{'
        this.scanner.next();
        
        let stmts:Statement[] = [];

        let t1 = this.scanner.peek();
        while (t1.code == Keyword.Constructor || t1.kind == TokenKind.Identifier){
            if (t1.code == Keyword.Constructor){
                stmts.push(this.parseFunctionDecl());
            }
            else if(t1.kind == TokenKind.Identifier){
                let t2 = this.scanner.peek2();
                if (t2.code == Seperator.OpenParen){  //'(' 函数声明
                    stmts.push(this.parseFunctionDecl());
                }
                else{
                    this.scanner.next(); //变量名称
                    let t3 = this.scanner.peek();

                    let typeExp:TypeExp|null = null;
                    if (t3.code == Seperator.Colon){  //':'
                        typeExp = this.parseTypeAnnotation();
                    }

                    //可选的初始化部分
                    let init:Expression|null = null;
                    t3 = this.scanner.peek();
                    if (t3.code == Op.Assign){  //'='
                        this.scanner.next();
                        init = this.parseExpression();
                    }
                    let varDecl = new VariableDecl(t1.pos, this.scanner.getLastPos(),t1.text,typeExp,init);

                    t3 = this.scanner.peek();
        
                    let errorVarDecl=false
                    if (t3.code == Seperator.SemiColon){
                        this.scanner.next();
                    }
                    else{
                        this.skip();
                        this.addError("Expecting a ';' after property decl, while we got : " + t3.toString,t3.pos);
                    }

                    stmts.push(new VariableStatement(t1.pos,this.scanner.getLastPos(),varDecl,errorVarDecl));
                }
            }
            else{
                this.addError("Unrecognized Token in class body: "+ t1.toString(),t1.pos);
                isErrorNode = true;
                this.skip();
            }

            t1 = this.scanner.peek();
        }

        t1 = this.scanner.peek();
        if (t1.code == Seperator.CloseBrace){  //'}'
            this.scanner.next();
        }
        else{
            this.addError("Expecting '}' while parsing a block, but we got a " + t1.text, this.scanner.getLastPos());
            this.skip();
            isErrorNode = true;
        }

        return new Block(beginPos,this.scanner.getLastPos(),stmts,isErrorNode);
    }

    // parseConstructorDecl():FunctionDecl{
    //     let beginPos = this.scanner.getNextPos();
    //     let isErrorNode = false;

    //     //跳过关键字'function'
    //     // this.scanner.next();

    //     let t = this.scanner.next();   //跳过constructor    

    //     //解析callSignature
    //     let callSignature:CallSignature;
    //     let t1 = this.scanner.peek();
    //     if (t1.code==Seperator.OpenParen){  //'('
    //         callSignature = this.parseCallSignature();   
    //     }
    //     else{
    //         this.addError("Expecting '(' in ConstructorDecl, while we got a " + t.text, this.scanner.getLastPos());
    //         this.skip();
    //         callSignature = new CallSignature(beginPos,this.scanner.getLastPos(),null,null,true);
    //     }      
        
    //     //解析block
    //     let functionBody:Block;
    //     t1 = this.scanner.peek();
    //     if (t1.code == Seperator.OpenBrace){   //'{'
    //         functionBody = this.parseBlock();
    //     }
    //     else{
    //         this.addError("Expecting '{' in ConstructorDecl, while we got a " + t1.text, this.scanner.getLastPos());
    //         this.skip();
    //         functionBody = new Block(beginPos,this.scanner.getLastPos(),[],true);
    //     }

    //     return new FunctionDecl(beginPos,t.text, callSignature, functionBody, isErrorNode);
    // }

    // parseMethodDecl():FunctionDecl{
    //     let beginPos = this.scanner.getNextPos();
    //     let isErrorNode = false;

    //     let t = this.scanner.next();       
    //     if (t.kind != TokenKind.Identifier){
    //         this.addError("Expecting a method name, while we got a " + t.text, this.scanner.getLastPos());
    //         this.skip();
    //         isErrorNode = true;
    //     }

    //     //解析callSignature
    //     let callSignature:CallSignature;
    //     let t1 = this.scanner.peek();
    //     if (t1.code==Seperator.OpenParen){  //'('
    //         callSignature = this.parseCallSignature();            
    //     }
    //     else{
    //         this.addError("Expecting '(' in MechodDecl, while we got a " + t.text, this.scanner.getLastPos());
    //         this.skip();
    //         callSignature = new CallSignature(beginPos,this.scanner.getLastPos(),null,null,true);
    //     }      
        
    //     //解析block
    //     let functionBody:Block;
    //     t1 = this.scanner.peek();
    //     if (t1.code == Seperator.OpenBrace){   //'{'
    //         functionBody = this.parseBlock();
    //     }
    //     else{
    //         this.addError("Expecting '{' in MechodDecl, while we got a " + t1.text, this.scanner.getLastPos());
    //         this.skip();
    //         functionBody = new Block(beginPos,this.scanner.getLastPos(),[],true);
    //     }

    //     return new FunctionDecl(beginPos,t.text, callSignature, functionBody, isErrorNode);
    // }

    // parsePropertyDecl():VariableDecl{
    //     let beginPos = this.scanner.getNextPos();
    //     let t = this.scanner.next();
    //     if (t.kind == TokenKind.Identifier){
    //         let varName:string = t.text;

    //         let typeExp:TypeExp|null = null;
    //         let init:Expression|null = null;
    //         let isErrorNode = false;

    //         let t1 = this.scanner.peek();
    //         //可选的类型注解
    //         if (t1.code == Seperator.Colon){  //':'
    //             typeExp = this.parseTypeAnnotation(); 
    //         }
            
    //         //可选的初始化部分
    //         t1 = this.scanner.peek();
    //         if (t1.code == Op.Assign){  //'='
    //             this.scanner.next();
    //             init = this.parseExpression();
    //         }

    //         t1 = this.scanner.peek();
    //         if (t1.code == Seperator.SemiColon){ //';'
    //             this.scanner.next();
    //         }
    //         else{
    //             this.addError("Expecting ';' after property decl, while we meet " + t.text, this.scanner.getLastPos());
    //             this.skip();
    //             isErrorNode = true;
    //         }
            
    //         return new VariableDecl(beginPos, this.scanner.getLastPos(), varName, typeExp, init, isErrorNode);
    //     }
    //     else{
    //         this.addError("Expecting variable name in PropertyDecl, while we meet " + t.text, this.scanner.getLastPos());
    //         this.skip();
    //         return new VariableDecl(beginPos, this.scanner.getLastPos(), "unknown", null, null, true);
    //     }
    // }

    /**
     * 跳过一些Token，用于错误恢复，以便继续解析后面Token
     * @param seperators 
     */
    private skip(seperators:string[]=[]){
        // console.log("in skip()");
        let t = this.scanner.peek();
        while(t.kind != TokenKind.EOF){
            if (t.kind == TokenKind.Keyword){
                return;
            }
            else if (t.kind == TokenKind.Seperator && 
                     (t.text == ',' || t.text == ';' || 
                      t.text == '{' || t.text == '}' || 
                      t.text == '(' || t.text == ')' || seperators.indexOf(t.text)!=-1)){
                return;
            }
            else{
                this.scanner.next();
                t= this.scanner.peek();
            }
        }
    }

}