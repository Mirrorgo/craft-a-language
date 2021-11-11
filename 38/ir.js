"use strict";
/**
 * 基于图的IR，用于中端的优化算法。
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadCodeElimination = exports.OptimizationPass = exports.GraphPainter = exports.IRGenerator = exports.IRModule = exports.InvokeNode = exports.LoopExit = exports.LoopEnd = exports.LoopBegin = exports.MergeNode = exports.EndNode = exports.BeginNode = exports.IfNode = exports.ReturnNode = exports.StartNode = exports.FunctionNode = exports.AbstractMergeNode = exports.AbstractEndNode = exports.AbstractBeginNode = exports.UniSuccessorNode = exports.FixedNode = exports.CallTargetNode = exports.PhiNode = exports.UnaryOpNode = exports.BinaryOpNode = exports.ConstantNode = exports.ParameterNode = exports.TerminalNode = exports.FloatingNode = exports.IRNode = exports.Graph = void 0;
const symbol_1 = require("./symbol");
const scanner_1 = require("./scanner");
const ast_1 = require("./ast");
const console_1 = require("console");
//IR图
class Graph {
    constructor() {
        //所有节点的列表
        this.nodes = [];
        //笑一个节点的序号
        this.nextIndex = 0;
        //变量跟Node的映射
        this.varProxy2Node = new Map();
    }
    addNode(node) {
        //对于数据流，如果没有同样的节点，就添加进去。否则，就返回原来的节点
        if (node instanceof FloatingNode) {
            for (let node1 of this.nodes) {
                if (node1 instanceof FloatingNode && node1.equals(node)) {
                    return node1;
                }
            }
        }
        this.nodes.push(node);
        node.index = this.nextIndex++;
        return node;
    }
    removeFloatingNode(node) {
        let index = this.nodes.indexOf(node);
        this.nodes.splice(index, 1);
        //从use-def链中删掉节点
        //todo:如果if条件和return引用了该节点呢？
        for (let n of this.nodes) {
            if (n instanceof FloatingNode) {
                //从inputs中删掉
                let i = n.inputs.indexOf(node);
                if (i != -1)
                    n.inputs.splice(i, 1);
                //从uses中删掉
                i = n.uses.indexOf(node);
                if (i != -1)
                    n.uses.splice(i, 1);
            }
        }
    }
    //添加对象的定义，返回一个proxy
    addVarDefinition(varSym, node) {
        let index = 0;
        for (let proxy of this.varProxy2Node.keys()) {
            if (proxy.varSym == varSym) {
                index++;
            }
        }
        let proxy = new VarProxy(varSym, index);
        this.varProxy2Node.set(proxy, node);
        return proxy;
    }
    getParameterNode(name) {
        for (let node of this.nodes) {
            if (node instanceof ParameterNode && node.name_ == name) {
                return node;
            }
        }
        return null;
    }
}
exports.Graph = Graph;
//代表了变量的一次定义。每次变量重新定义，都会生成一个新的Proxy，以便让IR符合SSA格式
class VarProxy {
    constructor(varSym, index) {
        this.varSym = varSym;
        this.index = index; //变量的第几个定义
    }
    get label() {
        return this.varSym.name + this.index;
    }
}
//////////////////////////////////////////////////////////////////////////
//HIR  抽象度比较高的IR，接近高级语言的特性
//基类
class IRNode {
    constructor() {
        //当前节点在图中的序号
        this.index = -1; //未被正式赋值前，为-1
        //使用该节点的节点，形成use-def链,自动维护
        this.uses = [];
    }
}
exports.IRNode = IRNode;
class FloatingNode extends IRNode {
}
exports.FloatingNode = FloatingNode;
//端点，没有successor，比如变量和常量
class TerminalNode extends FloatingNode {
    get inputs() {
        return [];
    }
}
exports.TerminalNode = TerminalNode;
//参数
class ParameterNode extends TerminalNode {
    constructor(name) {
        super();
        this.name_ = name;
    }
    get label() {
        return "P(" + this.name_ + ")";
    }
    toString() {
        return this.label;
    }
    equals(node) {
        if (node instanceof ParameterNode) {
            return node.name_ == this.name_;
        }
        return false;
    }
}
exports.ParameterNode = ParameterNode;
//常量
class ConstantNode extends TerminalNode {
    constructor(value) {
        super();
        this.value = value;
    }
    get label() {
        return "C(" + this.value + ")";
    }
    toString() {
        return this.label;
    }
    equals(node) {
        if (node instanceof ConstantNode) {
            return node.value == this.value;
        }
        return false;
    }
}
exports.ConstantNode = ConstantNode;
//二元运算节点
class BinaryOpNode extends FloatingNode {
    constructor(left, right, op) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
        //自动建立双向的use-def链
        left.uses.push(this);
        right.uses.push(this);
    }
    get label() {
        return scanner_1.Op[this.op];
    }
    toString() {
        return this.label + "(left->" + this.left.label + ",right->" + this.right.label + ")";
    }
    get inputs() {
        return [this.left, this.right];
    }
    equals(node) {
        if (node instanceof BinaryOpNode) {
            return this.op == node.op && this.left.equals(node.left) && this.right.equals(node.right);
        }
        return false;
    }
}
exports.BinaryOpNode = BinaryOpNode;
//一元运算节点
class UnaryOpNode extends FloatingNode {
    constructor(data, op, isPrefix) {
        super();
        this.data = data;
        this.op = op;
        this.isPrefix = isPrefix;
        //自动建立双向的use-def链
        data.uses.push(this);
    }
    get label() {
        return scanner_1.Op[this.op];
    }
    toString() {
        return this.label
            + "(" + (this.isPrefix ? "prefix" : "postfix")
            + ",data->" + this.data.label
            + ")";
    }
    get inputs() {
        return [this.data];
    }
    equals(node) {
        if (node instanceof UnaryOpNode) {
            return this.op == node.op && this.isPrefix == node.isPrefix && this.data.equals(node.data);
        }
        return false;
    }
}
exports.UnaryOpNode = UnaryOpNode;
class PhiNode extends FloatingNode {
    constructor(mergeNode, inputs) {
        super();
        this.mergeNode = mergeNode;
        this.inputs_ = inputs;
        for (let input of inputs) {
            input.uses.push(this);
        }
    }
    get inputs() {
        return this.inputs_;
    }
    get label() {
        return "Phi";
    }
    toString() {
        // let str="inputs:";
        // for (let )
        return this.label; //todo
    }
    equals(node) {
        if (node instanceof PhiNode) {
            if (node.mergeNode == this.mergeNode && node.inputs_.length == this.inputs_.length) {
                for (let input of node.inputs_) {
                    if (this.inputs_.indexOf(input) == -1)
                        return false;
                }
                return true;
            }
        }
        return false;
    }
}
exports.PhiNode = PhiNode;
//函数调用返回的数据
class CallTargetNode extends FloatingNode {
    constructor(functionSym, args) {
        super();
        this.functionSym = functionSym;
        this.args = args;
        for (let input of args) {
            input.uses.push(this);
        }
    }
    get inputs() {
        return this.args;
    }
    get label() {
        return "CallTarget";
    }
    toString() {
        // let str="inputs:";
        // for (let )
        return this.label; //todo
    }
    equals(node) {
        if (node instanceof CallTargetNode) {
            if (node.functionSym == this.functionSym && node.args.length == this.args.length) {
                for (let input of node.args) {
                    if (this.args.indexOf(input) == -1)
                        return false;
                }
                return true;
            }
        }
        return false;
    }
}
exports.CallTargetNode = CallTargetNode;
//-------ControlNodes--------
//控制流节点的基类
class FixedNode extends IRNode {
    constructor() {
        super(...arguments);
        //前序节点列表,被自动维护
        this.predecessor = null;
    }
    //获取这条控制流的开头节点，可以是一个Begin节点，或者是一个AbsctractMerge节点
    get beginNode() {
        if (this instanceof AbstractBeginNode) {
            return this;
        }
        else {
            return this.predecessor.beginNode;
        }
    }
    get inputs() {
        return [];
    }
}
exports.FixedNode = FixedNode;
class UniSuccessorNode extends FixedNode {
    constructor(next) {
        super();
        this.next_ = next;
        this.next_.predecessor = this;
    }
    get next() {
        return this.next_;
    }
    set next(newNode) {
        this.next_ = newNode;
        this.next_.predecessor = this;
    }
    get successors() {
        return [this.next];
    }
}
exports.UniSuccessorNode = UniSuccessorNode;
class AbstractBeginNode extends UniSuccessorNode {
}
exports.AbstractBeginNode = AbstractBeginNode;
class AbstractEndNode extends FixedNode {
    get successors() {
        return [];
    }
    toString() {
        return this.label;
    }
}
exports.AbstractEndNode = AbstractEndNode;
class AbstractMergeNode extends AbstractBeginNode {
    constructor(inputs, next) {
        super(next);
        this.inputs_ = inputs;
    }
    get inputs() {
        return this.inputs_;
    }
    toString() {
        let str = "(";
        for (let i = 0; i < this.inputs.length; i++) {
            let node = this.inputs[i];
            str += node.label;
            if (i < this.inputs.length - 1)
                str += ",";
        }
        str += ")";
        return this.label + str;
    }
}
exports.AbstractMergeNode = AbstractMergeNode;
//函数节点
class FunctionNode extends AbstractBeginNode {
    constructor(name, params, next) {
        super(next);
        this.name_ = name;
        this.params = params;
    }
    get label() {
        return this.name_;
    }
    toString() {
        let paramStr = "(";
        for (let i = 0; i < this.params.length; i++) {
            let param = this.params[i];
            paramStr += param.label;
            if (i < this.params.length - 1)
                paramStr += ",";
        }
        paramStr += ")";
        return this.label + paramStr;
    }
}
exports.FunctionNode = FunctionNode;
//函数开始节点
class StartNode extends AbstractBeginNode {
    get label() {
        return "Start";
    }
    toString() {
        return this.label + "(->" + this.next.label + ")";
    }
}
exports.StartNode = StartNode;
//退出函数的节点
class ReturnNode extends AbstractEndNode {
    constructor(value = null) {
        var _a;
        super();
        this.value_ = null; //返回值
        this.value_ = value;
        (_a = this.value_) === null || _a === void 0 ? void 0 : _a.uses.push(this);
    }
    get value() {
        return this.value_;
    }
    set value(value) {
        this.value_ = value;
        if (value)
            value.uses.push(this);
    }
    get inputs() {
        return [];
    }
    get label() {
        return "Return";
    }
    toString() {
        var _a;
        return this.label + (this.value_ ? "(value->" + ((_a = this.value_) === null || _a === void 0 ? void 0 : _a.label) + ")" : "");
    }
}
exports.ReturnNode = ReturnNode;
//if节点
class IfNode extends FixedNode {
    constructor(condition, thenBranch, elseBranch) {
        super();
        this.condition_ = condition;
        this.trueBranch_ = thenBranch;
        this.falseBranch_ = elseBranch;
        this.condition_.uses.push(this);
        thenBranch.predecessor = this;
        elseBranch.predecessor = this;
    }
    get condition() {
        return this.condition_;
    }
    get trueBranch() {
        return this.trueBranch_;
    }
    get falseBranch() {
        return this.falseBranch_;
    }
    get label() {
        return "If";
    }
    toString() {
        var _a;
        return this.label
            + "(condition->" + this.condition_.label
            + ", then->" + this.trueBranch_.label
            + (this.falseBranch_ ? ", else->" + ((_a = this.falseBranch_) === null || _a === void 0 ? void 0 : _a.label) : "")
            + ")";
    }
    get successors() {
        if (this.falseBranch_)
            return [this.trueBranch_, this.falseBranch_];
        else
            return [this.trueBranch_];
    }
}
exports.IfNode = IfNode;
class BeginNode extends AbstractBeginNode {
    get label() {
        return "Begin";
    }
    toString() {
        return this.label + "(->" + this.next.label + ")";
    }
}
exports.BeginNode = BeginNode;
class EndNode extends AbstractEndNode {
    get label() {
        return "End";
    }
}
exports.EndNode = EndNode;
class MergeNode extends AbstractMergeNode {
    get label() {
        return "Merge";
    }
}
exports.MergeNode = MergeNode;
class LoopBegin extends AbstractMergeNode {
    get label() {
        return "LoopBegin";
    }
}
exports.LoopBegin = LoopBegin;
class LoopEnd extends AbstractEndNode {
    constructor(loopBegin) {
        super();
        this.loopBegin = loopBegin;
    }
    get label() {
        return "LoopEnd";
    }
}
exports.LoopEnd = LoopEnd;
class LoopExit extends UniSuccessorNode {
    constructor(loopBegin, next) {
        super(next);
        this.loopBegin = loopBegin;
    }
    get label() {
        return "LoopExit";
    }
    toString() {
        return this.label; //todo
    }
}
exports.LoopExit = LoopExit;
//函数或方法调用
class InvokeNode extends UniSuccessorNode {
    constructor(functionSym, next, returnValue = null) {
        super(next);
        this.functionSym = functionSym;
        this.returnValue_ = returnValue;
        if (returnValue)
            returnValue.uses.push(this);
    }
    get returnValue() {
        return this.returnValue_;
    }
    set returnValue(rtn) {
        this.returnValue_ = rtn;
        if (rtn)
            rtn.uses.push(this);
    }
    get label() {
        return "Invoke:" + this.functionSym.name;
    }
    toString() {
        var _a;
        return this.label + this.returnValue ? ("(->" + ((_a = this.returnValue) === null || _a === void 0 ? void 0 : _a.label) + ")") : "";
    }
}
exports.InvokeNode = InvokeNode;
//用作占位符，用于创建IR图的过程中
class FakeControlNode extends FixedNode {
    get label() {
        return "Fake";
    }
    toString() {
        return this.label;
    }
    get successors() {
        return [];
    }
}
///////////////////////////////////////////////////////////////////////////
//从AST生成IR
//保存函数和Graph之间的关联关系
class IRModule {
    constructor() {
        this.fun2Graph = new Map();
    }
    //打印输出
    dump() {
    }
}
exports.IRModule = IRModule;
class IRGenerator extends ast_1.AstVisitor {
    constructor(module) {
        super();
        //-------解析过程中的上下文信息----------
        //上下文信息：Graph
        this._graphs = [];
        //上下文信息：当前
        this._funcitonSyms = [];
        //当前的控制流节点
        this.currentFlowNode = null;
        //把每个变量绑定到控制流，从而知道当前代码用到的是变量的哪个定义
        //在同一个控制流里，如果有多个定义，则后面的定义会替换掉前面的。
        this.varProxyMap = new Map();
        this.module = module;
    }
    get graph() {
        return this._graphs[this._graphs.length - 1];
    }
    get functionSym() {
        return this._funcitonSyms[this._funcitonSyms.length - 1];
    }
    setVarProxyForFlow(beginNode, varSym, proxy) {
        if (!this.varProxyMap.has(beginNode)) {
            this.varProxyMap.set(beginNode, new Map());
        }
        let map = this.varProxyMap.get(beginNode);
        map.set(varSym, proxy);
    }
    //从本级以及上级中获取varProxy, 如果遇到merge节点就停下，因为merge节点不能上溯
    getVarProxyFromFlow2(beginNode, varSym) {
        let map = this.varProxyMap.get(beginNode);
        let varProxy = null;
        if (map && map.has(varSym))
            varProxy = map.get(varSym);
        if (!varProxy && beginNode.predecessor) {
            let parentFlow = beginNode.predecessor.beginNode; //如果beginNode是if的一个分支，现在会上到外层的控制流
            varProxy = this.getVarProxyFromFlow(parentFlow, varSym);
        }
        return varProxy;
    }
    getVarProxyFromFlow(beginNode, varSym) {
        let map = this.varProxyMap.get(beginNode);
        let varProxy = null;
        if (map && map.has(varSym))
            varProxy = map.get(varSym);
        if (!varProxy) {
            //往前递归查找
            if (beginNode.predecessor) {
                let parentFlow = beginNode.predecessor.beginNode; //如果beginNode是if的一个分支，现在会上到外层的控制流
                varProxy = this.getVarProxyFromFlow(parentFlow, varSym);
            }
            else { //遇到了AbstractMergeNode
                console_1.assert(beginNode instanceof AbstractMergeNode, "in getVarProxyFromFlow, 期待一个AbstractMergeNode");
                let mergeNode = beginNode;
                let dataInputs = [];
                let varProxys = [];
                for (let input of mergeNode.inputs) {
                    let flow = input.beginNode;
                    let varProxy = this.getVarProxyFromFlow(flow, varSym);
                    varProxys.push(varProxy);
                    console_1.assert(varProxy, "创建PhiNode时，应该能查询到merge的每个输入流对应的变量的varSymbol");
                    let dataNode = this.graph.varProxy2Node.get(varProxy);
                    dataInputs.push(dataNode);
                }
                //如果变量并没有在分支里出现，而是出现在分支之前的语句中，那么多个分支获得的是同一个DataNode
                //比如：
                //a = b + c; if() {} else {} d= a+2;  最后一句中的a，引用的是if语句之前的a。
                if (this.isSameElements(dataInputs)) {
                    return varProxys[0];
                }
                else {
                    //创建phi节点
                    let phiNode = new PhiNode(mergeNode, dataInputs);
                    phiNode = this.graph.addNode(phiNode);
                    //创建新的VarSymbol，并跟当前的Flow绑定。
                    varProxy = this.graph.addVarDefinition(varSym, phiNode);
                    this.setVarProxyForFlow(beginNode, varSym, varProxy);
                    return varProxy;
                }
            }
        }
        return varProxy;
    }
    //-------override vistXXX()----------
    visitProg(prog, additional) {
        //设置上下文
        this._graphs.push(new Graph());
        this._funcitonSyms.push(prog.sym);
        //保存到Module中
        this.module.fun2Graph.set(this.functionSym, this.graph);
        //创建开始节点
        let startNode = new StartNode(new FakeControlNode);
        this.graph.addNode(startNode);
        //继续遍历
        this.currentFlowNode = startNode;
        super.visitProg(prog, additional);
        //创建程序节点
        let functionNode = new FunctionNode("main", [], startNode);
        this.graph.addNode(functionNode);
        //恢复上下文
        this._graphs.pop();
        this._funcitonSyms.pop();
    }
    visitFunctionDecl(functinDecl, additional) {
        //设置上下文
        this._graphs.push(new Graph());
        this._funcitonSyms.push(functinDecl.sym);
        let lastFlowNode = this.currentFlowNode;
        //保存到Module中
        this.module.fun2Graph.set(this.functionSym, this.graph);
        //创建函数节点和开始节点
        let startNode = new StartNode(new FakeControlNode);
        this.graph.addNode(startNode);
        //继续遍历
        this.currentFlowNode = startNode;
        super.visitFunctionDecl(functinDecl, additional);
        //取出参数
        let params = [];
        let paramList = functinDecl.callSignature.paramList;
        if (paramList) {
            for (let paramDecl of paramList.params) {
                let paramNode = this.graph.getParameterNode(paramDecl.name);
                params.push(paramNode);
            }
        }
        //创建函数节点s
        let functionNode = new FunctionNode(functinDecl.name, params, startNode);
        this.graph.addNode(functionNode);
        //恢复上下文
        this._graphs.pop();
        this._funcitonSyms.pop();
        this.currentFlowNode = lastFlowNode;
    }
    visitIfStatement(ifStmt, additional) {
        ////条件
        let conditionNode = this.visit(ifStmt.condition, additional);
        ////创建true分支        
        let begin1 = new BeginNode(new FakeControlNode());
        this.graph.addNode(begin1);
        ////创建false分支        
        let begin2 = new BeginNode(new FakeControlNode());
        this.graph.addNode(begin2);
        ////创建IfNode
        let ifNode = new IfNode(conditionNode, begin1, begin2);
        this.graph.addNode(ifNode);
        console_1.assert(this.currentFlowNode instanceof UniSuccessorNode, "in visitIfStatement, prev node should be UniSuccessorNode");
        if (this.currentFlowNode instanceof UniSuccessorNode)
            this.currentFlowNode.next = ifNode;
        //遍历true分枝
        this.currentFlowNode = begin1;
        this.visit(ifStmt.stmt, additional);
        let end1 = new EndNode();
        this.graph.addNode(end1);
        //接续控制流
        console_1.assert(this.currentFlowNode, "in visitIfStatement, currentFlowNode shoud not be null after visiting true branch");
        if (this.currentFlowNode instanceof UniSuccessorNode && this.currentFlowNode != begin1) {
            this.currentFlowNode.next = end1;
        }
        else {
            begin1.next = end1;
        }
        ////遍历false分支      
        this.currentFlowNode = begin2;
        if (ifStmt.elseStmt) {
            this.visit(ifStmt.elseStmt, additional);
        }
        let end2 = new EndNode();
        this.graph.addNode(end2);
        //接续控制流
        console_1.assert(this.currentFlowNode instanceof UniSuccessorNode, "in visitIfStatement, currentFlowNode shoud be UniSuccessorNode after visiting true branch");
        if (this.currentFlowNode instanceof UniSuccessorNode && this.currentFlowNode != begin2) {
            this.currentFlowNode.next = end2;
        }
        else {
            begin2.next = end2;
        }
        ////创建Merge节点
        let mergeNode = new MergeNode([end1, end2], new FakeControlNode());
        this.graph.addNode(mergeNode);
        this.currentFlowNode = mergeNode; //新开启一个控制流
    }
    visitReturnStatement(rtnStmt, additional) {
        //求返回值
        let value = null;
        if (rtnStmt.exp) {
            value = this.visit(rtnStmt.exp, additional);
        }
        //创建ReturnNode
        let rtnNode = new ReturnNode(value);
        this.graph.addNode(rtnNode);
        //接续控制流
        console_1.assert(this.currentFlowNode instanceof UniSuccessorNode, "in visitReturnStatement, prev node should be UniSuccessorNode");
        if (this.currentFlowNode instanceof UniSuccessorNode)
            this.currentFlowNode.next = rtnNode;
        //return语句之后，控制流应该置成null
        this.currentFlowNode = null;
    }
    visitIntegerLiteral(literal, additional) {
        return this.handleLiteral(literal);
    }
    visitDecimalLiteral(literal, additional) {
        return this.handleLiteral(literal);
    }
    visitStringLiteral(literal, additional) {
        return this.handleLiteral(literal);
    }
    visitBooleanLiteral(literal, additional) {
        return this.handleLiteral(literal);
    }
    visitNullLiteral(literal, additional) {
        return this.handleLiteral(literal);
    }
    handleLiteral(literal) {
        let node = new ConstantNode(literal.value);
        return this.graph.addNode(node);
    }
    visitVariable(v, additional) {
        //左值：返回Symbol就好了
        if (v.isLeftValue) {
            return v.sym;
        }
        //右值：返回DataNode
        else {
            console_1.assert(this.currentFlowNode, "visitVariable中，this.currentFlowNode不应该为null");
            let beginNode = this.currentFlowNode.beginNode;
            let varProxy = this.getVarProxyFromFlow(beginNode, v.sym);
            if (!varProxy) {
                //处理merge节点
                if (beginNode instanceof AbstractMergeNode) {
                    let dataInputs = [];
                    for (let input of beginNode.inputs) {
                        let flow = input.beginNode;
                        let varProxy = this.getVarProxyFromFlow(flow, v.sym);
                        console_1.assert(varProxy, "创建PhiNode时，应该能查询到merge的每个输入流对应的变量的varSymbol");
                        let dataNode = this.graph.varProxy2Node.get(varProxy);
                        dataInputs.push(dataNode);
                    }
                    //如果变量并没有在分支里出现，而是出现在分支之前的语句中，那么多个分支获得的是同一个DataNode
                    //比如：
                    //a = b + c; if() {} else {} d= a+2;  最后一句中的a，引用的是if语句之前的a。
                    if (this.isSameElements(dataInputs)) {
                        return dataInputs[0];
                    }
                    else {
                        //创建phi节点
                        let phiNode = new PhiNode(beginNode, dataInputs);
                        phiNode = this.graph.addNode(phiNode);
                        //创建新的VarSymbol，并跟当前的Flow绑定。
                        varProxy = this.graph.addVarDefinition(v.sym, phiNode);
                        this.setVarProxyForFlow(beginNode, v.sym, varProxy);
                        return phiNode;
                    }
                }
                else {
                    console.log("In visitVariable, cannot find var proxy for '" + v.name + "', and not after a merge node");
                }
            }
            else {
                return this.graph.varProxy2Node.get(varProxy);
            }
        }
    }
    getVariable(varSym) {
        console_1.assert(this.currentFlowNode, "visitVariable中，this.currentFlowNode不应该为null");
        let beginNode = this.currentFlowNode.beginNode;
        let varProxy = this.getVarProxyFromFlow(beginNode, varSym);
        console.log("in getVariable, varProxy=");
        console.log(varProxy);
        if (!varProxy) {
            //处理merge节点
            console_1.assert(beginNode instanceof AbstractMergeNode, "in getVariable，期待一个AbstractMergeNode");
            let mergeNode = beginNode;
            let dataInputs = [];
            for (let input of mergeNode.inputs) {
                let flow = input.beginNode;
                let varProxy = this.getVarProxyFromFlow(flow, varSym);
                console_1.assert(varProxy, "创建PhiNode时，应该能查询到merge的每个输入流对应的变量的varSymbol");
                let dataNode = this.graph.varProxy2Node.get(varProxy);
                dataInputs.push(dataNode);
            }
            //如果变量并没有在分支里出现，而是出现在分支之前的语句中，那么多个分支获得的是同一个DataNode
            //比如：
            //a = b + c; if() {} else {} d= a+2;  最后一句中的a，引用的是if语句之前的a。
            if (this.isSameElements(dataInputs)) {
                return dataInputs[0];
            }
            else {
                //创建phi节点
                let phiNode = new PhiNode(mergeNode, dataInputs);
                phiNode = this.graph.addNode(phiNode);
                //创建新的VarSymbol，并跟当前的Flow绑定。
                varProxy = this.graph.addVarDefinition(varSym, phiNode);
                this.setVarProxyForFlow(beginNode, varSym, varProxy);
                return phiNode;
            }
        }
        else {
            return this.graph.varProxy2Node.get(varProxy);
        }
    }
    isSameElements(nodes) {
        let node = nodes[0];
        for (let i = 1; i < nodes.length; i++) {
            if (!node.equals(nodes[i]))
                return false;
        }
        return true;
    }
    visitVariableDecl(variableDecl, additional) {
        let node = undefined;
        //参数
        if (this.functionSym.vars.indexOf(variableDecl.sym) < this.functionSym.getNumParams()) {
            node = new ParameterNode(variableDecl.name);
            this.graph.addNode(node);
        }
        //本地变量
        else {
            //生成变量的定义
            if (variableDecl.init) {
                node = this.visit(variableDecl.init, additional);
            }
        }
        //添加变量定义
        if (node) {
            //添加定义，返回一个VarProxy
            let varProxy = this.graph.addVarDefinition(variableDecl.sym, node);
            //设置当前流中应该使用哪个Proxy
            console_1.assert(this.currentFlowNode, "visitVariableDecl中，this.currentFlowNode应该不为null");
            let beginNode = this.currentFlowNode.beginNode;
            this.setVarProxyForFlow(beginNode, variableDecl.sym, varProxy);
        }
        return node;
    }
    visitBinary(binary, additional) {
        let node;
        //如果是赋值，那要看看是否需要生成新的变量，以符合SSA
        if (binary.op == scanner_1.Op.Assign) {
            let left = this.visit(binary.exp1, additional);
            node = this.visit(binary.exp2, additional);
            console_1.assert(left instanceof symbol_1.VarSymbol, "在VisitBinary中，=左边应该返回一个VarSymbol");
            console_1.assert(node instanceof FloatingNode, "在VisitBinary中，=左边应该是一个DataNode");
            //添加定义，返回一个VarProxy。如果该变量多次被定义，那么会返回多个不同版本的VarProxy
            let varProxy = this.graph.addVarDefinition(left, node);
            //设置当前流中应该使用哪个Proxy
            console_1.assert(this.currentFlowNode, "visitVariableDecl中，this.currentFlowNode不应该为空");
            let beginNode = this.currentFlowNode.beginNode;
            this.setVarProxyForFlow(beginNode, left, varProxy);
        }
        else {
            let left = this.visit(binary.exp1, additional);
            let right = this.visit(binary.exp2, additional);
            node = new BinaryOpNode(left, right, binary.op);
            node = this.graph.addNode(node);
        }
        return node;
    }
    visitUnary(unary, additional) {
        let value = this.visit(unary.exp);
        if (unary.op == scanner_1.Op.Inc || unary.op == scanner_1.Op.Dec) {
            console_1.assert(value instanceof symbol_1.VarSymbol, "++和--操作应该返回一个左值");
            let varSym = value;
            //添加i=i+1这样的节点
            let op = (unary.op == scanner_1.Op.Inc) ? scanner_1.Op.Plus : scanner_1.Op.Minus;
            let left = this.getVariable(varSym);
            console.log("in visitUnary, left=");
            console.log(left);
            // console.log(this.graph.nodes);
            let right = new ConstantNode(1);
            right = this.graph.addNode(right);
            let binaryNode = new BinaryOpNode(left, right, op);
            return binaryNode;
        }
        else {
            console_1.assert(value instanceof FloatingNode, "in visitUnary，value应该是一个FloatingNode");
            let unaryOpNode = new UnaryOpNode(value, unary.op, unary.isPrefix);
            unaryOpNode = this.graph.addNode(unaryOpNode);
            return unaryOpNode;
        }
    }
    visitForStatement(forStmt, additional) {
        console_1.assert(this.currentFlowNode, "visitForStatement中，this.currentFlowNode应该是UniSuccessorNode");
        let prev = this.currentFlowNode;
        //结束前一个控制流
        let end = new EndNode();
        this.graph.addNode(end);
        prev.next = end;
        //处理init部分
        if (forStmt.init)
            this.visit(forStmt.init, additional);
        //创建LoopBegin
        let loopBegin = new LoopBegin([end], new FakeControlNode());
        this.graph.addNode(loopBegin);
        this.currentFlowNode = loopBegin;
        //循环结束
        let loopEnd = new LoopEnd(loopBegin);
        this.graph.addNode(loopEnd);
        loopBegin.inputs.push(loopEnd); //loopEnd是输入之一
        loopBegin.next = loopEnd;
        let loopExit = new LoopExit(loopBegin, new FakeControlNode());
        this.graph.addNode(loopExit);
        //for循环条件
        //这个时候，访问循环变量，就已经需要形成一个phi节点
        if (forStmt.condition) {
            let condition = this.visit(forStmt.condition, additional);
            this.graph.addNode(condition);
            let begin1 = new BeginNode(new FakeControlNode());
            this.graph.addNode(begin1);
            this.currentFlowNode = begin1;
            begin1.next = loopEnd; //先设置为loopEnd。中间有新的控制流，是可以插进来的。
            //创建if节点
            let ifNode = new IfNode(condition, begin1, loopExit);
            this.graph.addNode(ifNode);
            loopBegin.next = ifNode;
        }
        //处理循环体
        this.visit(forStmt.stmt);
        //处理递增部分
        if (forStmt.increment) {
            this.visit(forStmt.increment);
        }
        console_1.assert(this.currentFlowNode instanceof UniSuccessorNode, "visitForStatement中，LoopEnd之前应该有UniSuccessorNode.");
        this.currentFlowNode.next = loopEnd;
        this.currentFlowNode = loopExit;
    }
    visitFunctionCall(functionCall, additional) {
        let functionSym = functionCall.sym;
        //创建CallTargetNode
        let args = [];
        for (let arg of functionCall.arguments) {
            let node = this.visit(arg, additional);
            args.push(node);
        }
        let callTargetNode = new CallTargetNode(functionSym, args);
        this.graph.addNode(callTargetNode);
        //创建InvokeNode
        let invokeNode = new InvokeNode(functionSym, new FakeControlNode, callTargetNode);
        this.graph.addNode(invokeNode);
        //修改控制链
        console_1.assert(this.currentFlowNode instanceof UniSuccessorNode, "visitFunctionCall中this.currentFlowNode不能为null");
        if (this.currentFlowNode instanceof UniSuccessorNode)
            this.currentFlowNode.next = invokeNode;
        this.currentFlowNode = invokeNode;
    }
}
exports.IRGenerator = IRGenerator;
////////////////////////////////////////////////////////////////////////////////////
//生成.dot图
/**
 * 把Graph生成点图
 */
class GraphPainter {
    static toDot(graph) {
        let str = "digraph{\n";
        //生成每个节点的样式和label
        for (let node of graph.nodes) {
            let fillColor = "lightgray";
            if (node instanceof FixedNode) {
                if (node instanceof FunctionNode) {
                    fillColor = "lightgreen";
                }
                else {
                    fillColor = "lightblue";
                }
            }
            else if (node instanceof FloatingNode) {
                fillColor = "orange";
            }
            let usesStr = (node instanceof FloatingNode) ? " u:" + node.uses.length : "";
            let inputsStr = (node instanceof FloatingNode) ? " i:" + node.inputs.length : "";
            let varsStr = "";
            if (node instanceof FloatingNode) {
                for (let varProxy of graph.varProxy2Node.keys()) {
                    if (graph.varProxy2Node.get(varProxy) == node) {
                        if (varsStr.length > 0)
                            varsStr += ", ";
                        varsStr += varProxy.label;
                    }
                }
            }
            if (varsStr.length > 0)
                varsStr = "(" + varsStr + ")";
            let label = node.index + " " + node.label + varsStr + "\\n" + inputsStr + usesStr;
            str += "\tnode" + node.index + " [ shape=\"box\", style=\"filled\", color=\"black\", label=\"" + label + "\""
                + ", fillcolor=\"" + fillColor + "\""
                + "]\n";
        }
        str += "\n";
        //生成连线
        let dataLineStyle = " [color=\"orange\"]";
        let controlLineStyle = " [color=\"blue\"]";
        for (let node of graph.nodes) {
            let nodeName = "node" + node.index;
            if (node instanceof UniSuccessorNode) {
                str += "\t" + nodeName + " -> node" + node.next.index + controlLineStyle + "\n";
                if (node instanceof AbstractMergeNode) {
                    for (let input of node.inputs) {
                        str += "\t" + nodeName + " -> node" + input.index + "\n";
                    }
                }
                else if (node instanceof InvokeNode && node.returnValue) {
                    str += "\t" + nodeName + " -> node" + node.returnValue.index + "\n";
                }
                else if (node instanceof LoopExit) {
                    str += "\t" + nodeName + " -> node" + node.loopBegin.index + "\n";
                }
            }
            else if (node instanceof ReturnNode && node.value) {
                str += "\t" + nodeName + " -> node" + node.value.index + "\n";
            }
            else if (node instanceof IfNode) {
                str += "\t" + nodeName + " -> node" + node.condition.index + "\n";
                str += "\t" + nodeName + " -> node" + node.trueBranch.index + controlLineStyle + "\n";
                str += "\t" + nodeName + " -> node" + node.falseBranch.index + controlLineStyle + "\n";
            }
            else if (node instanceof LoopEnd) {
                str += "\t" + nodeName + " -> node" + node.loopBegin.index + "\n";
            }
            else if (node instanceof FloatingNode) {
                for (let input of node.inputs) {
                    str += "\t" + nodeName + " -> node" + input.index + dataLineStyle + "\n";
                }
                if (node instanceof PhiNode) {
                    str += "\t" + nodeName + " -> node" + node.mergeNode.index + "\n";
                }
            }
        }
        str += "}\n";
        return str;
    }
}
exports.GraphPainter = GraphPainter;
////////////////////////////////////////////////////////////////////////////////////
//用于优化的pass
class OptimizationPass {
}
exports.OptimizationPass = OptimizationPass;
//死代码删除
class DeadCodeElimination extends OptimizationPass {
    optimize(m) {
        for (let fun of m.fun2Graph.keys()) {
            let graph = m.fun2Graph.get(fun);
            this.handleGraph(graph);
        }
    }
    /**
     * 查找graph中的节点，把uses为空的节点删掉
     * 注意：删除一个节点可以导致另一个节点的uses为空。
     * @param graph
     */
    handleGraph(graph) {
        let shouldContinue = true;
        while (shouldContinue) {
            let deadNodes = [];
            for (let node of graph.nodes) {
                if (node instanceof FloatingNode && node.uses.length == 0) {
                    deadNodes.push(node);
                }
            }
            //是否应该继续循环
            shouldContinue = deadNodes.length > 0;
            //删掉死节点
            for (let node of deadNodes) {
                graph.removeFloatingNode(node);
            }
        }
    }
}
exports.DeadCodeElimination = DeadCodeElimination;
