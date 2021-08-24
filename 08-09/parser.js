"use strict";
/**
 * 语法分析器
 * @version 0.4
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
 * prog = statementList? EOF;
 * statementList = (variableDecl | functionDecl | expressionStatement)+ ;
 * statement: block | expressionStatement | returnStatement | ifStatement | forStatement
 *          | emptyStatement | functionDecl | variableDecl ;
 * block : '{' statementList? '}' ;
 * ifStatement : 'if' '(' expression ')' statement ('else' statement)? ;
 * forStatement : 'for' '(' (expression | 'let' variableDecl)? ';' expression? ';' expression? ')' statement ;
 * variableStatement : 'let' variableDecl ';';
 * variableDecl : Identifier typeAnnotation？ ('=' expression)? ;
 * typeAnnotation : ':' typeName;
 * functionDecl: "function" Identifier callSignature  block ;
 * callSignature: '(' parameterList? ')' typeAnnotation? ;
 * returnStatement: 'return' expression? ';' ;
 * emptyStatement: ';' ;
 * expressionStatement: expression ';' ;
 * expression: assignment;
 * assignment: binary (assignmentOp binary)* ;
 * binary: unary (binOp unary)* ;
 * unary: primary | prefixOp unary | primary postfixOp ;
 * primary: StringLiteral | DecimalLiteral | IntegerLiteral | functionCall | '(' expression ')' ;
 * assignmentOp = '=' | '+=' | '-=' | '*=' | '/=' | '>>=' | '<<=' | '>>>=' | '^=' | '|=' ;
 * binOp: '+' | '-' | '*' | '/' | '==' | '!=' | '<=' | '>=' | '<'
 *      | '>' | '&&'| '||'|...;
 * prefixOp = '+' | '-' | '++' | '--' | '!' | '~';
 * postfixOp = '++' | '--';
 * functionCall : Identifier '(' argumentList? ')' ;
 * argumentList : expression (',' expression)* ;
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const scanner_1 = require("./scanner");
const ast_1 = require("./ast");
const types_1 = require("./types");
const error_1 = require("./error");
////////////////////////////////////////////////////////////////////////////////
//Parser
/**
 * 语法解析器。
 * 通常用parseProg()作为入口，解析整个程序。也可以用下级的某个节点作为入口，只解析一部分语法。
 */
class Parser {
    constructor(scanner) {
        this.errors = []; //语法错误
        this.warnings = []; //语法报警
        /**
         * 二元运算符的优先级。
         */
        this.opPrec = new Map([
            [scanner_1.Op.Assign, 2],
            [scanner_1.Op.PlusAssign, 2],
            [scanner_1.Op.MinusAssign, 2],
            [scanner_1.Op.MultiplyAssign, 2],
            [scanner_1.Op.DivideAssign, 2],
            [scanner_1.Op.ModulusAssign, 2],
            [scanner_1.Op.BitAndAssign, 2],
            [scanner_1.Op.BitOrAssign, 2],
            [scanner_1.Op.BitXorAssign, 2],
            [scanner_1.Op.LeftShiftArithmeticAssign, 2],
            [scanner_1.Op.RightShiftArithmeticAssign, 2],
            [scanner_1.Op.RightShiftLogicalAssign, 2],
            [scanner_1.Op.Or, 4],
            [scanner_1.Op.And, 5],
            [scanner_1.Op.BitOr, 6],
            [scanner_1.Op.BitXOr, 7],
            [scanner_1.Op.BitAnd, 8],
            [scanner_1.Op.EQ, 9],
            [scanner_1.Op.IdentityEquals, 9],
            [scanner_1.Op.NE, 9],
            [scanner_1.Op.IdentityNotEquals, 9],
            [scanner_1.Op.G, 10],
            [scanner_1.Op.GE, 10],
            [scanner_1.Op.L, 10],
            [scanner_1.Op.LE, 10],
            [scanner_1.Op.LeftShiftArithmetic, 11],
            [scanner_1.Op.RightShiftArithmetic, 11],
            [scanner_1.Op.RightShiftLogical, 11],
            [scanner_1.Op.Plus, 12],
            [scanner_1.Op.Minus, 12],
            [scanner_1.Op.Divide, 13],
            [scanner_1.Op.Multiply, 13],
            [scanner_1.Op.Modulus, 13],
        ]);
        this.scanner = scanner;
    }
    addError(msg, pos) {
        this.errors.push(new error_1.CompilerError(msg, pos, false));
        console.log("@" + pos.toString() + " : " + msg);
    }
    addWarning(msg, pos) {
        this.warnings.push(new error_1.CompilerError(msg, pos, true));
        console.log("@" + pos.toString() + " : " + msg);
    }
    /**
     * 解析Prog
     * 语法规则：
     * prog = (functionDecl | functionCall)* ;
     */
    parseProg() {
        let beginPos = this.scanner.peek().pos;
        let stmts = this.parseStatementList();
        return new ast_1.Prog(beginPos, this.scanner.getLastPos(), stmts);
    }
    parseStatementList() {
        let stmts = [];
        let t = this.scanner.peek();
        //statementList的Follow集合里有EOF和'}'这两个元素，分别用于prog和Block等场景。
        while (t.kind != scanner_1.TokenKind.EOF && t.code != scanner_1.Seperator.CloseBrace) { //'}'
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
    parseStatement() {
        let t = this.scanner.peek();
        //根据'function'关键字，去解析函数声明
        if (t.code == scanner_1.Keyword.Function) {
            return this.parseFunctionDecl();
        }
        else if (t.code == scanner_1.Keyword.Let) {
            return this.parseVariableStatement();
        }
        //根据'return'关键字，解析return语句
        else if (t.code == scanner_1.Keyword.Return) {
            return this.parseReturnStatement();
        }
        else if (t.code == scanner_1.Keyword.If) {
            return this.parseIfStatement();
        }
        else if (t.code == scanner_1.Keyword.For) {
            return this.parseForStatement();
        }
        else if (t.code == scanner_1.Seperator.OpenBrace) { //'{'
            return this.parseBlock();
        }
        else if (t.kind == scanner_1.TokenKind.Identifier ||
            t.kind == scanner_1.TokenKind.DecimalLiteral ||
            t.kind == scanner_1.TokenKind.IntegerLiteral ||
            t.kind == scanner_1.TokenKind.StringLiteral ||
            t.code == scanner_1.Seperator.OpenParen) { //'('
            return this.parseExpressionStatement();
        }
        else {
            this.addError("Can not recognize a statement starting with: " + this.scanner.peek().text, this.scanner.getLastPos());
            let beginPos = this.scanner.getNextPos();
            this.skip();
            return new ast_1.ErrorStmt(beginPos, this.scanner.getLastPos());
        }
    }
    /**
     * Return语句
     * 无论是否出错都会返回一个ReturnStatement。
     */
    parseReturnStatement() {
        let beginPos = this.scanner.getNextPos();
        let exp = null;
        //跳过'return'
        this.scanner.next();
        // console.log(this.scanner.peek().toString());
        //解析后面的表达式
        let t = this.scanner.peek();
        if (t.code != scanner_1.Seperator.SemiColon) { //';'
            exp = this.parseExpression();
        }
        //跳过';'
        t = this.scanner.peek();
        if (t.code == scanner_1.Seperator.SemiColon) { //';'
            this.scanner.next();
        }
        else {
            this.addError("Expecting ';' after return statement.", this.scanner.getLastPos());
        }
        return new ast_1.ReturnStatement(beginPos, this.scanner.getLastPos(), exp);
    }
    /**
     * 解析If语句
     * ifStatement : 'if' '(' expression ')' statement ('else' statement)? ;
     */
    parseIfStatement() {
        let beginPos = this.scanner.getNextPos();
        //跳过if
        this.scanner.next();
        let isErrorNode = false;
        //解析if条件
        let condition;
        if (this.scanner.peek().code == scanner_1.Seperator.OpenParen) { //'('
            //跳过'('
            this.scanner.next();
            //解析if的条件
            condition = this.parseExpression();
            if (this.scanner.peek().code == scanner_1.Seperator.CloseParen) { //')'
                //跳过')'
                this.scanner.next();
            }
            else {
                this.addError("Expecting ')' after if condition.", this.scanner.getLastPos());
                this.skip();
                isErrorNode = true;
            }
        }
        else {
            this.addError("Expecting '(' after 'if'.", this.scanner.getLastPos());
            this.skip();
            condition = new ast_1.ErrorExp(beginPos, this.scanner.getLastPos());
        }
        //解析then语句
        let stmt = this.parseStatement();
        //解析else语句
        let elseStmt = null;
        if (this.scanner.peek().code == scanner_1.Keyword.Else) {
            //跳过'else'
            this.scanner.next();
            elseStmt = this.parseStatement();
        }
        return new ast_1.IfStatement(beginPos, this.scanner.getLastPos(), condition, stmt, elseStmt, isErrorNode);
    }
    /**
     * 解析For语句
     * forStatement : 'for' '(' expression? ';' expression? ';' expression? ')' statement ;
     */
    parseForStatement() {
        let beginPos = this.scanner.getNextPos();
        //跳过'for'
        this.scanner.next();
        let isErrorNode = false;
        let init = null;
        let terminate = null;
        let increment = null;
        if (this.scanner.peek().code == scanner_1.Seperator.OpenParen) { //'('
            //跳过'('
            this.scanner.next();
            //init
            if (this.scanner.peek().code != scanner_1.Seperator.SemiColon) { //';'
                if (this.scanner.peek().code == scanner_1.Keyword.Let) {
                    this.scanner.next(); //跳过'let'
                    init = this.parseVariableDecl();
                }
                else {
                    init = this.parseExpression();
                }
            }
            if (this.scanner.peek().code == scanner_1.Seperator.SemiColon) { //';'
                //跳过';'
                this.scanner.next();
            }
            else {
                this.addError("Expecting ';' after init part of for statement.", this.scanner.getLastPos());
                this.skip();
                //跳过后面的';'
                if (this.scanner.peek().code == scanner_1.Seperator.SemiColon) { //';'
                    this.scanner.next();
                }
                isErrorNode = true;
            }
            //terminate
            if (this.scanner.peek().code != scanner_1.Seperator.SemiColon) { //';'
                terminate = this.parseExpression();
            }
            if (this.scanner.peek().code == scanner_1.Seperator.SemiColon) { //';'
                //跳过';'
                this.scanner.next();
            }
            else {
                this.addError("Expecting ';' after terminate part of for statement.", this.scanner.getLastPos());
                this.skip();
                //跳过后面的';'
                if (this.scanner.peek().code == scanner_1.Seperator.SemiColon) { //';'
                    this.scanner.next();
                }
                isErrorNode = true;
            }
            //increment
            if (this.scanner.peek().code != scanner_1.Seperator.CloseParen) { //')'
                increment = this.parseExpression();
            }
            if (this.scanner.peek().code == scanner_1.Seperator.CloseParen) { //')'
                //跳过')'
                this.scanner.next();
            }
            else {
                this.addError("Expecting ')' after increment part of for statement.", this.scanner.getLastPos());
                this.skip();
                //跳过后面的')'
                if (this.scanner.peek().code == scanner_1.Seperator.CloseParen) { //')'
                    this.scanner.next();
                }
                isErrorNode = true;
            }
        }
        else {
            this.addError("Expecting '(' after 'for'.", this.scanner.getLastPos());
            this.skip();
            isErrorNode = true;
        }
        //stmt
        let stmt = this.parseStatement();
        return new ast_1.ForStatement(beginPos, this.scanner.getLastPos(), init, terminate, increment, stmt, isErrorNode);
    }
    /**
     * 解析变量声明语句
     * variableStatement : 'let' variableDecl ';';
     */
    parseVariableStatement() {
        let beginPos = this.scanner.getNextPos();
        let isErrorNode = false;
        //跳过'let'    
        this.scanner.next();
        let variableDecl = this.parseVariableDecl();
        //分号，结束变量声明
        let t = this.scanner.peek();
        if (t.code == scanner_1.Seperator.SemiColon) { //';'
            this.scanner.next();
        }
        else {
            this.skip();
            isErrorNode = true;
        }
        return new ast_1.VariableStatement(beginPos, this.scanner.getLastPos(), variableDecl, isErrorNode);
    }
    /**
     * 解析变量声明
     * 语法规则：
     * variableDecl : Identifier typeAnnotation？ ('=' sigleExpression)?;
     */
    parseVariableDecl() {
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.next();
        if (t.kind == scanner_1.TokenKind.Identifier) {
            let varName = t.text;
            let varType = 'any';
            let init = null;
            let isErrorNode = false;
            let t1 = this.scanner.peek();
            //可选的类型注解
            if (t1.code == scanner_1.Seperator.Colon) { //':'
                this.scanner.next();
                t1 = this.scanner.peek();
                if (t1.kind == scanner_1.TokenKind.Identifier) {
                    this.scanner.next();
                    varType = t1.text;
                }
                else {
                    this.addError("Error parsing type annotation in VariableDecl", this.scanner.getLastPos());
                    //找到下一个等号
                    this.skip(['=']);
                    isErrorNode = true;
                }
            }
            //可选的初始化部分
            t1 = this.scanner.peek();
            if (t1.code == scanner_1.Op.Assign) { //'='
                this.scanner.next();
                init = this.parseExpression();
            }
            return new ast_1.VariableDecl(beginPos, this.scanner.getLastPos(), varName, this.parseType(varType), init, isErrorNode);
        }
        else {
            this.addError("Expecting variable name in VariableDecl, while we meet " + t.text, this.scanner.getLastPos());
            this.skip();
            return new ast_1.VariableDecl(beginPos, this.scanner.getLastPos(), "unknown", types_1.SysTypes.Any, null, true);
        }
    }
    parseType(typeName) {
        switch (typeName) {
            case 'any':
                return types_1.SysTypes.Any;
            case 'number':
                return types_1.SysTypes.Number;
            case 'boolean':
                return types_1.SysTypes.Boolean;
            case 'string':
                return types_1.SysTypes.String;
            case 'undefined':
                return types_1.SysTypes.Undefined;
            case 'null':
                return types_1.SysTypes.Null;
            case 'void':
                return types_1.SysTypes.Undefined;
            default:
                this.addError("Unrecognized type: " + typeName, this.scanner.getLastPos());
                return types_1.SysTypes.Any;
        }
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
    parseFunctionDecl() {
        let beginPos = this.scanner.getNextPos();
        let isErrorNode = false;
        //跳过关键字'function'
        this.scanner.next();
        let t = this.scanner.next();
        if (t.kind != scanner_1.TokenKind.Identifier) {
            this.addError("Expecting a function name, while we got a " + t.text, this.scanner.getLastPos());
            this.skip();
            isErrorNode = true;
        }
        //解析callSignature
        let callSignature;
        let t1 = this.scanner.peek();
        if (t1.code == scanner_1.Seperator.OpenParen) { //'('
            callSignature = this.parseCallSignature();
        }
        else {
            this.addError("Expecting '(' in FunctionDecl, while we got a " + t.text, this.scanner.getLastPos());
            this.skip();
            callSignature = new ast_1.CallSignature(beginPos, this.scanner.getLastPos(), null, types_1.SysTypes.Any, true);
        }
        //解析block
        let functionBody;
        t1 = this.scanner.peek();
        if (t1.code == scanner_1.Seperator.OpenBrace) { //'{'
            functionBody = this.parseBlock();
        }
        else {
            this.addError("Expecting '{' in FunctionDecl, while we got a " + t1.text, this.scanner.getLastPos());
            this.skip();
            functionBody = new ast_1.Block(beginPos, this.scanner.getLastPos(), [], true);
        }
        return new ast_1.FunctionDecl(beginPos, t.text, callSignature, functionBody, isErrorNode);
    }
    /**
     * 解析函数签名
     * callSignature: '(' parameterList? ')' typeAnnotation? ;
     */
    parseCallSignature() {
        let beginPos = this.scanner.getNextPos();
        //跳过'('
        let t = this.scanner.next();
        let paramList = null;
        if (this.scanner.peek().code != scanner_1.Seperator.CloseParen) { //')'
            paramList = this.parseParameterList();
        }
        //看看后面是不是')'
        t = this.scanner.peek();
        if (t.code == scanner_1.Seperator.CloseParen) { //')'
            //跳过')'
            this.scanner.next();
            //解析typeAnnotation
            let theType = 'any';
            if (this.scanner.peek().code == scanner_1.Seperator.Colon) { //':'
                theType = this.parseTypeAnnotation();
            }
            return new ast_1.CallSignature(beginPos, this.scanner.getLastPos(), paramList, this.parseType(theType));
        }
        else {
            this.addError("Expecting a ')' after for a call signature", this.scanner.getLastPos());
            return new ast_1.CallSignature(beginPos, this.scanner.getLastPos(), paramList, types_1.SysTypes.Any, true);
        }
    }
    /**
     * 解析参数列表
     * parameterList : parameter (',' parameter)* ;
     */
    parseParameterList() {
        let params = [];
        let beginPos = this.scanner.getNextPos();
        let isErrorNode = false;
        let t = this.scanner.peek();
        while (t.code != scanner_1.Seperator.CloseParen && t.kind != scanner_1.TokenKind.EOF) { //')'
            if (t.kind == scanner_1.TokenKind.Identifier) {
                this.scanner.next();
                let t1 = this.scanner.peek();
                let theType = 'any';
                if (t1.code == scanner_1.Seperator.Colon) { //':'
                    theType = this.parseTypeAnnotation();
                }
                params.push(new ast_1.VariableDecl(beginPos, this.scanner.getLastPos(), t.text, this.parseType(theType), null));
                //处理','
                t = this.scanner.peek();
                if (t.code != scanner_1.Seperator.CloseParen) { //')'
                    if (t.code == scanner_1.Op.Comma) { //','
                        this.scanner.next(); //跳过','
                        // console.log("meet a comma in parseParameterList");
                        t = this.scanner.peek();
                    }
                    else {
                        this.addError("Expecting a ',' or '）' after a parameter", this.scanner.getLastPos());
                        this.skip();
                        isErrorNode = true;
                        let t2 = this.scanner.peek();
                        if (t2.code == scanner_1.Op.Comma) { //','
                            this.scanner.next(); //跳过','
                            t = this.scanner.peek();
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            else {
                this.addError("Expecting an identifier as name of a Parameter", this.scanner.getLastPos());
                this.skip();
                isErrorNode = true;
                if (t.code == scanner_1.Op.Comma) { //','
                    this.scanner.next(); //跳过','
                    t = this.scanner.peek();
                }
                else {
                    break;
                }
            }
        }
        return new ast_1.ParameterList(beginPos, this.scanner.getLastPos(), params, isErrorNode);
    }
    /**
     * 解析类型注解。
     * 无论是否出错，都会返回一个类型。缺省类型是'any'。
     */
    parseTypeAnnotation() {
        let theType = 'any';
        //跳过:
        this.scanner.next();
        let t = this.scanner.peek();
        if (t.kind == scanner_1.TokenKind.Identifier) {
            this.scanner.next();
            theType = t.text;
        }
        else {
            this.addError("Expecting a type name in type annotation", this.scanner.getLastPos());
        }
        return theType;
    }
    /**
   * 解析函数体
   * 语法规则：
   * block : '{' statementList? '}' ;
   */
    parseBlock() {
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.peek();
        //跳过'{'
        this.scanner.next();
        let stmts = this.parseStatementList();
        t = this.scanner.peek();
        if (t.code == scanner_1.Seperator.CloseBrace) { //'}'
            this.scanner.next();
            return new ast_1.Block(beginPos, this.scanner.getLastPos(), stmts);
        }
        else {
            this.addError("Expecting '}' while parsing a block, but we got a " + t.text, this.scanner.getLastPos());
            this.skip();
            return new ast_1.Block(beginPos, this.scanner.getLastPos(), stmts, true);
        }
    }
    /**
     * 解析表达式语句
     */
    parseExpressionStatement() {
        let exp = this.parseExpression();
        let t = this.scanner.peek();
        let stmt = new ast_1.ExpressionStatement(this.scanner.getLastPos(), exp);
        if (t.code == scanner_1.Seperator.SemiColon) { //';'
            this.scanner.next();
        }
        else {
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
    parseExpression() {
        return this.parseAssignment();
    }
    getPrec(op) {
        let ret = this.opPrec.get(op);
        if (typeof ret == 'undefined') {
            return -1;
        }
        else {
            return ret;
        }
    }
    /**
     * 解析赋值表达式。
     * 注意：赋值表达式是右结合的。
     */
    parseAssignment() {
        let assignPrec = this.getPrec(scanner_1.Op.Assign);
        //先解析一个优先级更高的表达式
        let exp1 = this.parseBinary(assignPrec);
        let t = this.scanner.peek();
        let tprec = this.getPrec(t.code);
        //存放赋值运算符两边的表达式
        let expStack = [];
        expStack.push(exp1);
        //存放赋值运算符
        let opStack = [];
        //解析赋值表达式
        while (t.kind == scanner_1.TokenKind.Operator && tprec == assignPrec) {
            opStack.push(t.code);
            this.scanner.next(); //跳过运算符
            //获取运算符优先级高于assignment的二元表达式
            exp1 = this.parseBinary(assignPrec);
            expStack.push(exp1);
            t = this.scanner.peek();
            tprec = this.getPrec(t.code);
        }
        //组装成右结合的AST
        exp1 = expStack[expStack.length - 1];
        if (opStack.length > 0) {
            for (let i = expStack.length - 2; i >= 0; i--) {
                exp1 = new ast_1.Binary(opStack[i], expStack[i], exp1);
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
    parseBinary(prec) {
        // console.log("parseBinary : " + prec);
        let exp1 = this.parseUnary();
        let t = this.scanner.peek();
        let tprec = this.getPrec(t.code);
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
        while (t.kind == scanner_1.TokenKind.Operator && tprec > prec) {
            this.scanner.next(); //跳过运算符
            let exp2 = this.parseBinary(tprec);
            let exp = new ast_1.Binary(t.code, exp1, exp2);
            exp1 = exp;
            t = this.scanner.peek();
            tprec = this.getPrec(t.code);
        }
        return exp1;
    }
    /**
     * 解析一元运算
     * unary: primary | prefixOp unary | primary postfixOp ;
     */
    parseUnary() {
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.peek();
        //前缀的一元表达式
        if (t.kind == scanner_1.TokenKind.Operator) {
            this.scanner.next(); //跳过运算符
            let exp = this.parseUnary();
            return new ast_1.Unary(beginPos, this.scanner.getLastPos(), t.code, exp, true);
        }
        //后缀只能是++或--
        else {
            //首先解析一个primary
            let exp = this.parsePrimary();
            let t1 = this.scanner.peek();
            if (t1.kind == scanner_1.TokenKind.Operator && (t1.code == scanner_1.Op.Inc || t1.code == scanner_1.Op.Dec)) {
                this.scanner.next(); //跳过运算符
                return new ast_1.Unary(beginPos, this.scanner.getLastPos(), t1.code, exp, false);
            }
            else {
                return exp;
            }
        }
    }
    /**
     * 解析基础表达式。
     */
    parsePrimary() {
        let beginPos = this.scanner.getNextPos();
        let t = this.scanner.peek();
        // console.log("parsePrimary: " + t.text);
        //知识点：以Identifier开头，可能是函数调用，也可能是一个变量，所以要再多向后看一个Token，
        //这相当于在局部使用了LL(2)算法。
        if (t.kind == scanner_1.TokenKind.Identifier) {
            if (this.scanner.peek2().code == scanner_1.Seperator.OpenParen) { //'('
                return this.parseFunctionCall();
            }
            else {
                this.scanner.next();
                return new ast_1.Variable(beginPos, this.scanner.getLastPos(), t.text);
            }
        }
        else if (t.kind == scanner_1.TokenKind.IntegerLiteral) {
            this.scanner.next();
            return new ast_1.IntegerLiteral(beginPos, parseInt(t.text));
        }
        else if (t.kind == scanner_1.TokenKind.DecimalLiteral) {
            this.scanner.next();
            return new ast_1.DecimalLiteral(beginPos, parseFloat(t.text));
        }
        else if (t.kind == scanner_1.TokenKind.StringLiteral) {
            this.scanner.next();
            return new ast_1.StringLiteral(beginPos, t.text);
        }
        else if (t.code == scanner_1.Seperator.OpenParen) { //'('
            this.scanner.next();
            let exp = this.parseExpression();
            let t1 = this.scanner.peek();
            if (t1.code == scanner_1.Seperator.CloseParen) { //')'
                this.scanner.next();
            }
            else {
                this.addError("Expecting a ')' at the end of a primary expresson, while we got a " + t.text, this.scanner.getLastPos());
                this.skip();
            }
            return exp;
        }
        else {
            //理论上永远不会到达这里
            this.addError("Can not recognize a primary expression starting with: " + t.text, this.scanner.getLastPos());
            let exp = new ast_1.ErrorExp(beginPos, this.scanner.getLastPos());
            return exp;
        }
    }
    /**
     * 解析函数调用
     * 语法规则：
     * functionCall : Identifier '(' parameterList? ')' ;
     * parameterList : StringLiteral (',' StringLiteral)* ;
     */
    parseFunctionCall() {
        let beginPos = this.scanner.getNextPos();
        let params = [];
        let name = this.scanner.next().text;
        //跳过'('
        this.scanner.next();
        //循环，读出所有参数
        let t1 = this.scanner.peek();
        while (t1.code != scanner_1.Seperator.CloseParen && t1.kind != scanner_1.TokenKind.EOF) {
            let exp = this.parseExpression();
            params.push(exp);
            if (exp === null || exp === void 0 ? void 0 : exp.isErrorNode) {
                this.addError("Error parsing parameter for function call " + name, this.scanner.getLastPos());
            }
            t1 = this.scanner.peek();
            if (t1.code != scanner_1.Seperator.CloseParen) { //')'
                if (t1.code == scanner_1.Op.Comma) { //','
                    t1 = this.scanner.next();
                }
                else {
                    this.addError("Expecting a comma at the end of a parameter, while we got a " + t1.text, this.scanner.getLastPos());
                    this.skip();
                    return new ast_1.FunctionCall(beginPos, this.scanner.getLastPos(), name, params, true);
                }
            }
        }
        if (t1.code == scanner_1.Seperator.CloseParen) {
            //消化掉')'
            this.scanner.next();
        }
        return new ast_1.FunctionCall(beginPos, this.scanner.getLastPos(), name, params);
    }
    /**
     * 跳过一些Token，用于错误恢复，以便继续解析后面Token
     * @param seperators
     */
    skip(seperators = []) {
        // console.log("in skip()");
        let t = this.scanner.peek();
        while (t.kind != scanner_1.TokenKind.EOF) {
            if (t.kind == scanner_1.TokenKind.Keyword) {
                return;
            }
            else if (t.kind == scanner_1.TokenKind.Seperator &&
                (t.text == ',' || t.text == ';' ||
                    t.text == '{' || t.text == '}' ||
                    t.text == '(' || t.text == ')' || seperators.indexOf(t.text) != -1)) {
                return;
            }
            else {
                this.scanner.next();
                t = this.scanner.peek();
            }
        }
    }
}
exports.Parser = Parser;
