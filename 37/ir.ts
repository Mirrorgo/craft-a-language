/**
 * 基于图的IR，用于中端的优化算法。
 * 
 */

import { Type } from "./types";
import { VarSymbol, FunctionSymbol } from "./symbol";
import { Op } from "./scanner";
import { AstVisitor, Prog, FunctionDecl, IntegerLiteral, DecimalLiteral, StringLiteral, BooleanLiteral, NullLiteral, Variable, Binary, VariableDecl, AstNode, Block, IfStatement, ReturnStatement } from "./ast";
import { assert, timeStamp } from "console";
import { Scope } from "./scope";

//IR图
export class Graph{
    nodes:IRNode[] =[];

    //变量跟Node的映射
    varProxy2Node:Map<VarProxy, DataNode>= new Map();

    // contains(node:DataNode):boolean{
    //     for(let node1 of this.nodes){
    //         if (node1 instanceof DataNode && node1.equals(node)){
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    //如果没有同样的节点，就添加进去。否则，就返回原来的节点
    addDataNode(node:DataNode):DataNode{
        for(let node1 of this.nodes){
            if (node1 instanceof DataNode && node1.equals(node)){
                return node1;
            }
        }
        this.nodes.push(node);
        return node;
    }

    //添加对象的定义，返回一个proxy
    addVarDefinition(varSym:VarSymbol, node:DataNode):VarProxy{
        let index = 0;
        for (let proxy of this.varProxy2Node.keys()){
            if (proxy.varSym == varSym){
                index ++;
            }
        }

        let proxy = new VarProxy(varSym, index);
        this.varProxy2Node.set(proxy, node);
        return proxy;
    }

    getParameterNode(name:string):ParameterNode|null{
        for (let node of this.nodes){
            if (node instanceof ParameterNode && node.name == name){
                return node;
            }
        }
        return null;
    }

}

//代表了变量的一次定义。每次变量重新定义，都会生成一个新的Proxy，以便让IR符合SSA格式
class VarProxy{
    varSym:VarSymbol;
    index:number;
    constructor(varSym:VarSymbol, index:number){
        this.varSym = varSym;
        this.index = index;
    }
}


//////////////////////////////////////////////////////////////////////////
//HIR  抽象度比较高的IR，接近高级语言的特性

//基类
export abstract class IRNode{
    //名称
    abstract get name():string;

    //输出名称和它所指向的节点
    abstract toString():string;
}

//-------DataNodes--------

//数据流节点的基类
export abstract class DataNode extends IRNode{
    //该节点的输入
    abstract get inputs():DataNode[];

    //使用该节点的节点，形成use-def链,自动维护
    uses:DataNode[] = []; 

    //数据类型
    theType:Type;   

    varSyms:VarSymbol[] = []; //这个节点是哪些变量的定义
    constructor(theType:Type){
        super();
        this.theType = theType;
    }

    abstract equals(ndoe:DataNode):boolean;
}

//端点，没有successor，比如变量和常量
export abstract class TerminalNode extends DataNode{
    get inputs():DataNode[]{
        return [];
    }
}

//参数
export class ParameterNode extends TerminalNode{
    name_:string;

    constructor(name:string, theType:Type){
        super(theType);
        this.name_ = name;
    }

    get name():string{
        return this.name_;
    }

    toString():string{
        return this.name;
    }

    equals(node:DataNode):boolean{
        if (node instanceof ParameterNode){
            return node.name == this.name;
        }
        return false;
    }
}

//常量
export class ConstantNode extends TerminalNode{
    value:any;

    constructor(value:any, theType:Type){
        super(theType);
        this.value = value;
    }

    get name():string{
        return "C("+this.value+")";
    }

    toString():string{
        return this.name;
    }

    equals(node:DataNode):boolean{
        if (node instanceof ConstantNode){
            return node.value == this.value;
        }
        return false;
    }
}

//二元运算节点
export class BinaryOpNode extends DataNode{
    left:DataNode;
    right:DataNode;
    op:Op;

    constructor(left:DataNode, right:DataNode, op:Op, theType:Type){
        super(theType);
        this.left = left;
        this.right = right;
        this.op = op;

        //自动建立双向的use-def链
        left.uses.push(this);
        right.uses.push(this);
    }

    get name():string{
        return Op[this.op];
    }

    toString():string{
        return this.name+"(left->"+this.left.name+",right->"+this.right.name+")";
    }

    get inputs():DataNode[]{
        return [this.left, this.right];
    }

    equals(node:DataNode):boolean{
        if (node instanceof BinaryOpNode){
            return this.op == node.op && this.left.equals(node.left) && this.right.equals(node.right);
        }
        return false;
    }
}

//一元运算节点
export class UnaryOpNode extends DataNode{
    data:DataNode;
    op:Op;
    isPrefix:boolean;

    constructor(data:DataNode, op:Op, isPrefix:boolean, theType:Type){
        super(theType);
        this.data = data;
        this.op = op;
        this.isPrefix= isPrefix;

        //自动建立双向的use-def链
        data.uses.push(this);
    }

    get name():string{
        return Op[this.op];
    }

    toString():string{
        return this.name
            + "(" + (this.isPrefix? "prefix":"postfix")
            + ",data->" + this.data.name
            + ")";
    }

    get inputs():DataNode[]{
        return [this.data];
    }

    equals(node:DataNode):boolean{
        if (node instanceof UnaryOpNode){
            return this.op == node.op && this.isPrefix == node.isPrefix && this.data.equals(node.data);
        }
        return false;
    }
}

export class PhiNode extends DataNode{
    mergeNode:MergeNode;
    inputs_:DataNode[];
    constructor(mergeNode:MergeNode, inputs:DataNode[], theType:Type){
        super(theType);
        this.mergeNode = mergeNode;
        this.inputs_=inputs;
    }

    get inputs():DataNode[]{
        return this.inputs_;
    }

    get name():string{
        return "PhiNode";
    }

    toString():string{
        // let str="inputs:";
        // for (let )
        return this.name; //todo
    }

    equals(node:DataNode):boolean{
        if (node instanceof PhiNode){
            if(node.mergeNode == this.mergeNode && node.inputs_.length == this.inputs_.length){
                for (let input of node.inputs_){
                    if (this.inputs_.indexOf(input)==-1) return false;
                }
                return true;
            }
        }
        return false;
    }
}

//-------ControlNodes--------

//控制流节点的基类
export abstract class ControlNode extends IRNode{
    //后序节点列表
    abstract get successors():ControlNode[];

    //前序节点列表,被自动维护
    predecessor:ControlNode|null = null;
    

    //获取这条控制流的开头节点，可以是一个Begin节点，或者是一个AbsctractMerge节点
    get beginNode():AbstractBeginNode{
        if (this instanceof AbstractBeginNode){
            return this;
        }
        else{
            return (this.predecessor as UniSuccessorNode).beginNode;  
        }
    }
}

export abstract class UniSuccessorNode extends ControlNode{
   next_:ControlNode;
   get next():ControlNode{
       return this.next_;
   }
   set next(newNode:ControlNode){
       this.next_ = newNode;
       this.next_.predecessor = this;
   }

   constructor(next:ControlNode){
       super();
       this.next_ = next;
       this.next_.predecessor = this;
   }
   get successors():ControlNode[]{
       return [this.next];
   }
}

export abstract class AbstractBeginNode extends UniSuccessorNode{
}


export abstract class AbstractEndNode extends ControlNode{
    get successors():ControlNode[]{
        return [];
    }

    toString():string{
        return this.name;
    }
}

export abstract class AbstractMergeNode extends AbstractBeginNode{
    inputs:ControlNode[];
    constructor(inputs:ControlNode[], next:ControlNode){
        super(next);
        this.inputs = inputs;
    }

    toString():string{
        let str="("
        for (let i = 0; i < this.inputs.length; i++){
            let node = this.inputs[i];
            str+= node.name;
            if (i < this.inputs.length-1) str +=",";
        }
        str += ")";
        return  this.name + str;
    }
}

//函数节点
export class FunctionNode extends AbstractBeginNode{
    name_:string;
    params:ParameterNode[];
    constructor(name:string, params:ParameterNode[], next:ControlNode){
        super(next);
        this.name_ = name;
        this.params = params;
    }

    get name():string{
        return this.name_;
    }

    toString():string{
        let paramStr="("
        for (let i = 0; i < this.params.length; i++){
            let param = this.params[i];
            paramStr+= param.name;
            if (i < this.params.length-1) paramStr +=",";
        }
        paramStr += ")";
        return this.name + paramStr;
    }
}

//函数开始节点
export class StartNode extends AbstractBeginNode{
    get name():string{
        return "Start";
    }

    toString():string{
        return this.name+"(->"+this.next.name+")";
    }
}

//退出函数的节点
export class ReturnNode extends AbstractEndNode{
    value:DataNode|null = null; //返回值

    constructor(value:DataNode|null){
        super();
        this.value = value;
    }

    get name():string{
        return "ReturnNode";
    }

    toString():string{
        return this.name + (this.value? "(value->"+ this.value?.name +")" : "");
    }    
}

//if节点
export class IfNode extends ControlNode{
    trueBranch:BeginNode;
    falseBranch:BeginNode;
    condition:DataNode;  //If条件
    
    constructor(condition:DataNode, thenBranch:BeginNode, elseBranch:BeginNode){
        super();
        this.condition = condition;
        this.trueBranch = thenBranch;
        this.falseBranch = elseBranch;

        thenBranch.predecessor=this;
        elseBranch.predecessor=this;
    }

    get name():string{
        return "If";
    }

    toString():string{
        return this.name
                    + "(condition->" + this.condition.name 
                    + ", then->" + this.trueBranch.name 
                    + (this.falseBranch? ", else->"+this.falseBranch?.name :"")
                    + ")";
    }

    get successors():ControlNode[]{
        if (this.falseBranch)
            return [this.trueBranch, this.falseBranch];
        else
            return [this.trueBranch];
    }
}

export class BeginNode extends AbstractBeginNode{
    get name():string{
        return "Begin";
    }

    toString():string{
        return this.name+"(->"+this.next.name+")";
    }
}

export class EndNode extends AbstractEndNode{
    get name():string{
        return "End";
    }
}

export class MergeNode extends AbstractMergeNode{  
    get name():string{
        return "Merge";
    }
}

export class LoopBegin extends AbstractMergeNode{  
    get name():string{
        return "LoopBegin";
    }
}

export class LoopEnd extends AbstractEndNode{  
    loopBegin:LoopBegin;

    constructor(loopBegin:LoopBegin){
        super();
        this.loopBegin = loopBegin;
    }

    get name():string{
        return "LoopEnd";
    }
}

export class LoopExit extends AbstractEndNode{  
    loopBegin:LoopBegin;

    constructor(loopBegin:LoopBegin){
        super();
        this.loopBegin = loopBegin;
    }

    get name():string{
        return "LoopExit";
    }
}

//用作占位符，用于创建IR图的过程中
class FakeControlNode extends ControlNode{
    get name():string{
        return "Fake";
    }
    toString():string{
        return this.name;
    }
    get successors():ControlNode[]{
        return [];
    }
}


///////////////////////////////////////////////////////////////////////////
//从AST生成IR

//保存函数和Graph之间的关联关系
export class IRModule{
    fun2Graph:Map<FunctionSymbol, Graph> = new Map();

    //打印输出
    dump(){

    }
}

export class IRGenerator extends AstVisitor{
    //保存生成结果
    module: IRModule;

    constructor(module:IRModule){
        super();
        this.module = module;
    }

    //-------解析过程中的上下文信息----------

    //上下文信息：Graph
    _graphs:Graph[] = [];
    get graph():Graph{
        return this._graphs[this._graphs.length-1]; 
    }

    //上下文信息：当前
    _funcitonSyms:FunctionSymbol[] = [];
    get functionSym():FunctionSymbol{
        return this._funcitonSyms[this._funcitonSyms.length-1]; 
    }

    //对每个变量维护一个栈，从而知道当前代码用到的是变量的哪个定义
    //存储方式：VarProxy跟作用域绑定。在同一个作用域里，如果有多个定义，则后面的定义会替换掉前面的。
    varProxyMap:Map<AbstractBeginNode,Map<VarSymbol,VarProxy>> = new Map();

    private setVarProxyForFlow(beginNode:AbstractBeginNode, varSym:VarSymbol, proxy:VarProxy){
        if (!this.varProxyMap.has(beginNode)){
            this.varProxyMap.set(beginNode, new Map());
        }

        let map = this.varProxyMap.get(beginNode) as Map<VarSymbol,VarProxy>;
        map.set(varSym,proxy);
    }

    //从本级以及上级中获取varProxy, 如果遇到merge节点就停下，因为merge节点不能上溯
    private getVarProxyFromFlow(beginNode:AbstractBeginNode, varSym:VarSymbol):VarProxy|null{
        let map = this.varProxyMap.get(beginNode) as Map<VarSymbol,VarProxy>;
        let varProxy:VarProxy|null = null;
        if (map && map.has(varSym)) varProxy = map.get(varSym) as VarProxy;
        if (!varProxy && beginNode.predecessor){
            let parentFlow = beginNode.predecessor.beginNode;  //如果beginNode是if的一个分支，现在会上到外层的控制流
            varProxy = this.getVarProxyFromFlow(parentFlow, varSym)
        }
        return varProxy;
    }

    //-------override vistXXX()----------

    visitProg(prog:Prog, additional:any):any{
        //设置上下文
        this._graphs.push(new Graph())
        this._funcitonSyms.push(prog.sym as FunctionSymbol);

        //保存到Module中
        this.module.fun2Graph.set(this.functionSym, this.graph);

        //创建开始节点
        let startNode = new StartNode(new FakeControlNode);
        this.graph.nodes.push(startNode);

        //继续遍历
        super.visitProg(prog, startNode);

        //创建程序节点
        let functionNode = new FunctionNode("main", [], startNode);
        this.graph.nodes.push(functionNode);

        //恢复上下文
        this._graphs.pop();
        this._funcitonSyms.pop();

        return functionNode;
    }

    visitFunctionDecl(functinDecl:FunctionDecl, additional:any):any{
        //设置上下文
        this._graphs.push(new Graph())
        this._funcitonSyms.push(functinDecl.sym as FunctionSymbol);

        //保存到Module中
        this.module.fun2Graph.set(this.functionSym, this.graph);

        //创建函数节点和开始节点
        let startNode = new StartNode(new FakeControlNode);
        this.graph.nodes.push(startNode);

        //继续遍历
        super.visitFunctionDecl(functinDecl, startNode);

        //取出参数
        let params:ParameterNode[] = [];
        let paramList = functinDecl.callSignature.paramList;
        if (paramList){
            for (let paramDecl of paramList.params){
                let paramNode = this.graph.getParameterNode(paramDecl.name) as ParameterNode;
                params.push(paramNode);
            }
        }

        //创建函数节点s
        let functionNode = new FunctionNode(functinDecl.name,params, startNode);
        this.graph.nodes.push(functionNode);

        //恢复上下文
        this._graphs.pop();
        this._funcitonSyms.pop();

        return functionNode;
    }

    visitIfStatement(ifStmt:IfStatement, additional:any):any{
        ////条件
        let conditionNode = this.visit(ifStmt.condition, additional) as DataNode;

        ////true分支        
        let begin1 = new BeginNode(new FakeControlNode());
        let next1 = this.visit(ifStmt.stmt, begin1);
        let end1 = new EndNode();
        if(next1 instanceof UniSuccessorNode){
            next1.next = end1;
        }
        else{
            begin1.next = end1;
        }
        
        ////false分支        
        let begin2 = new BeginNode(new FakeControlNode());
        let next2 = this.visit(ifStmt.stmt, begin2);
        let end2 = new EndNode();
        if(next2 instanceof UniSuccessorNode){
            next2.next = end2;
        }
        else{
            begin2.next = end2;
        }
        
        ////创建IfNode
        let ifNode = new IfNode(conditionNode,begin1, begin2);

        assert(additional instanceof UniSuccessorNode, "in visitIfStatement, prev node should be UniSuccessorNode");
        (additional as UniSuccessorNode).next = ifNode;

        ////创建Merge节点
        let mergeNode = new MergeNode([end1,end2],new FakeControlNode());
        return mergeNode;
        
    }

    visitBlock(block:Block, additional:any):any{
        assert(additional instanceof UniSuccessorNode, "in visitBlock, prev node should be UniSuccessorNode");
        let prevNode = additional as UniSuccessorNode;

        for (let stmt of block.stmts){
            let node = this.visit(stmt, prevNode);
            if (node instanceof ControlNode){
                prevNode.next = node;   //替换掉原来的占位符
                //继续往下延伸控制流
                if (node instanceof UniSuccessorNode) prevNode = node;
            }
        }
    }

    visitReturnStatement(rtnStmt:ReturnStatement, additional:any):any{
        assert(additional instanceof UniSuccessorNode, "in visitReturnStatement, prev node should be UniSuccessorNode");
        let value:DataNode|null = null;
        if (rtnStmt.exp){
            value = this.visit(rtnStmt.exp, additional);
        }

        let rtnNode = new ReturnNode(value);

        //接续控制流
        let prevNode = additional as UniSuccessorNode;
        prevNode.next= rtnNode;

        return rtnNode;
    }

    visitIntegerLiteral(literal:IntegerLiteral, additional:any):any{
        return this.handleLiteral(literal);
    }

    visitDecimalLiteral(literal:DecimalLiteral, additional:any):any{
        return this.handleLiteral(literal);
    }

    visitStringLiteral(literal:StringLiteral, additional:any):any{
        return this.handleLiteral(literal);
    }

    visitBooleanLiteral(literal:BooleanLiteral, additional:any):any{
        return this.handleLiteral(literal);
    }

    visitNullLiteral(literal:NullLiteral, additional:any):any{
        return this.handleLiteral(literal);
    }

    private handleLiteral(literal: IntegerLiteral | DecimalLiteral | StringLiteral | BooleanLiteral | NullLiteral):DataNode{
        let node = new ConstantNode(literal.value, literal.theType as Type);
        return this.graph.addDataNode(node);
    }

    visitVariable(v:Variable, additional:any):any{
        //左值：返回Symbol就好了
        if (v.isLeftValue){
            return v.sym;
        }
        //右值：返回DataNode
        else{
            //如果是参数，生成ParameterNode
            if (this.functionSym.vars.indexOf(v.sym as VarSymbol) < this.functionSym.getNumParams()){
                let node = new ParameterNode(v.name,v.theType as Type);
                return this.graph.addDataNode(node);
            }
            //如果是本地变量，那就要找到它的定义
            else{
                assert(additional instanceof ControlNode, "visitVariable的addtional参数应该是控制流");
                let beginNode = (additional as ControlNode).beginNode;
                let varProxy = this.getVarProxyFromFlow(beginNode, v.sym as VarSymbol);

                //为merge节点创建PhiNode
                if (!varProxy){
                    if (beginNode instanceof AbstractMergeNode){
                        let dataInputs:DataNode[] = [];
                        for (let input of beginNode.inputs){
                            let flow = input.beginNode;
                            let varProxy = this.getVarProxyFromFlow(flow, v.sym as VarSymbol);
                            assert(varProxy, "创建PhiNode时，应该能查询到merge的每个输入流对应的变量的varSymbol");
                            let dataNode = this.graph.varProxy2Node.get(varProxy as VarProxy) as DataNode;
                            dataInputs.push(dataNode);
                        }

                        //创建phi节点
                        let phiNode = new PhiNode(beginNode, dataInputs,v.theType as Type);

                        //创建新的VarSymbol，并跟当前的Flow绑定。
                        varProxy = this.graph.addVarDefinition(v.sym as VarSymbol, phiNode);
                        this.setVarProxyForFlow(beginNode,v.sym as VarSymbol,varProxy);

                        return phiNode;
                    }
                    else{
                        console.log("In visitVariable, cannot find var proxy for '"+v.name+"', and not after a merge node");
                    }
                }
                else{                
                    return this.graph.varProxy2Node.get(varProxy);
                }
            }
        }
    }

    visitVariableDecl(variableDecl:VariableDecl, additional:any):any{
        //生成变量的定义
        if (variableDecl.init){
            let node = this.visit(variableDecl.init, additional) as DataNode;
            node = this.graph.addDataNode(node);
            
            //添加定义，返回一个VarProxy
            let varProxy = this.graph.addVarDefinition(variableDecl.sym as VarSymbol, node);
            
            //设置当前流中应该使用哪个Proxy
            assert(additional instanceof ControlNode, "visitVariableDecl的addtional参数应该是控制流");
            let beginNode = (additional as ControlNode).beginNode;
            this.setVarProxyForFlow(beginNode,variableDecl.sym as VarSymbol,varProxy);

            return node;
        }
    }

    visitBinary(binary:Binary, additional:any):any{
        let node:DataNode;

        //如果是赋值，那要看看是否需要生成新的变量，以符合SSA
        if(binary.op == Op.Assign){
            let left = this.visit(binary.exp1, additional) as VarSymbol;
            let right = this.visit(binary.exp2, additional) as DataNode;
            assert(left instanceof VarSymbol, "在VisitBinary中，=左边应该返回一个VarSymbol");
            assert(right instanceof DataNode, "在VisitBinary中，=左边应该是一个DataNode");

            node = this.graph.addDataNode(right);

            //添加定义，返回一个VarProxy。如果该变量多次被定义，那么会返回多个不同版本的VarProxy
            let varProxy = this.graph.addVarDefinition(left, node);

            //设置当前流中应该使用哪个Proxy
            assert(additional instanceof ControlNode, "visitVariableDecl的addtional参数应该是控制流");
            let beginNode = (additional as ControlNode).beginNode;
            this.setVarProxyForFlow(beginNode, left,varProxy);
        }
        else{
            let left = this.visit(binary.exp1, additional) as DataNode;
            let right = this.visit(binary.exp2, additional) as DataNode;
            
            node = new BinaryOpNode(left,right,binary.op,binary.theType as Type);
            node = this.graph.addDataNode(node);
        }

        return node;
    }

}

/**
 * 把Graph生成点图
 */
export class GraphPainter{
    static toDot(graph:Graph):string{
        let str = "digraph{\n";
        for (let node of graph.nodes){
            if (node instanceof UniSuccessorNode){
                str += "\t" + node.name + " -> " + node.next.name+"\n";
                if (node instanceof MergeNode){
                    for (let input of node.inputs){
                        str += "\t" + node.name + " -> " + input.name+"\n";
                    }
                }
            }
            else if (node instanceof IfNode){
                str += "\t" + node.name + " -> " + node.condition.name+"\n";
                str += "\t" + node.name + " -> " + node.trueBranch.name+"\n";
                str += "\t" + node.name + " -> " + node.falseBranch.name+"\n";
            }
            else if (node instanceof DataNode){
                for (let input of node.inputs){
                    str += "\t" + node.name + " -> " + input.name+"\n";
                }
            }
        }
        str +="}\n";
        return str;
    }
}

