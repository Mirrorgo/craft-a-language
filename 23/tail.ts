/**
 * 进行尾递归和尾调用的分析
 * @version 0.2
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-27
 *  
 */

import {FunctionSymbol, VarSymbol, intrinsics} from './symbol'
import {AstVisitor, AstNode, Block, Prog, VariableDecl, FunctionDecl, FunctionCall, Statement, Expression, ExpressionStatement, Binary, IntegerLiteral, DecimalLiteral, StringLiteral, Variable, ReturnStatement, IfStatement, Unary, ForStatement} from './ast';

export class TailAnalyzer extends AstVisitor{
    currentFunction:FunctionSymbol|null = null;
    result:TailAnalysisResult|null = null;
    inBranch:boolean = false;

    visitProg(prog:Prog){
        //初始化内部成员
        this.currentFunction = prog.sym as FunctionSymbol;
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
    visitFunctionDecl(functionDecl:FunctionDecl){
        //修改当前函数
        let oldFunction = this.currentFunction;
        this.currentFunction = functionDecl.sym as FunctionSymbol;

        //遍历函数声明
        super.visitFunctionDecl(functionDecl);

        //恢复当前函数
        this.currentFunction = oldFunction;
    }

    //只需要把自己这个节点本身返回给上一级节点就行。
    //在visitReturnStatement中如果接到这个节点，就可以进一步去处理。
    visitFunctionCall(functionCall:FunctionCall){
        return {type:"functionCall", node:functionCall};
    }

    //访问下级节点，看看它是不是一个函数调用表达式
    visitReturnStatement(returnStmt:ReturnStatement){
        if (returnStmt.exp != null){
            let rtn = this.visit(returnStmt.exp);
            if (typeof rtn == 'object' && rtn.type == "functionCall"){
                let functionCall = rtn.node as FunctionCall;
                if (functionCall.sym == this.currentFunction){
                    this.result?.tailRecursives.push(functionCall);
                }
                else if(functionCall.arguments.length<=6){  //参数小于6个才能做尾调用的优化
                    console.log("functionCall.arguments.length");
                    console.log(functionCall.arguments.length);
                    this.result?.tailCalls.push(functionCall);  
                }
            }
        }
    }

    visitIfStatement(ifStmt:IfStatement){
        let oldInBranch = this.inBranch;
        super.visitIfStatement(ifStmt);
        this.inBranch = oldInBranch;
    }

    visitForStatement(forStmt:ForStatement){
        let oldInBranch = this.inBranch;
        super.visitForStatement(forStmt);
        this.inBranch = oldInBranch;
    }
}

/**
 * 保存TailAnalysis的结果。
 */
export class TailAnalysisResult{
    tailRecursives:FunctionCall[] = [];               //尾递归的函数调用
    tailCalls:FunctionCall[] = [];                    //尾调用
}