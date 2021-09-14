"use strict";
/**
 * 生成X64机器的指令
 * @version 0.1
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-27
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileToAsm = exports.AsmGenerator = exports.AsmModule = void 0;
const symbol_1 = require("./symbol");
const ast_1 = require("./ast");
const console_1 = require("console");
const scanner_1 = require("./scanner");
const types_1 = require("./types");
/**
 * 指令的编码
 */
var OpCode;
(function (OpCode) {
    //不区分字节宽度的指令
    OpCode[OpCode["jmp"] = 0] = "jmp";
    OpCode[OpCode["je"] = 1] = "je";
    OpCode[OpCode["jne"] = 2] = "jne";
    OpCode[OpCode["jle"] = 3] = "jle";
    OpCode[OpCode["jl"] = 4] = "jl";
    OpCode[OpCode["jge"] = 5] = "jge";
    OpCode[OpCode["jg"] = 6] = "jg";
    OpCode[OpCode["sete"] = 20] = "sete";
    OpCode[OpCode["setne"] = 21] = "setne";
    OpCode[OpCode["setl"] = 22] = "setl";
    OpCode[OpCode["setle"] = 23] = "setle";
    OpCode[OpCode["setg"] = 24] = "setg";
    OpCode[OpCode["setge"] = 25] = "setge";
    //8字节指令
    OpCode[OpCode["movq"] = 40] = "movq";
    OpCode[OpCode["addq"] = 41] = "addq";
    OpCode[OpCode["subq"] = 42] = "subq";
    OpCode[OpCode["mulq"] = 43] = "mulq";
    OpCode[OpCode["imulq"] = 44] = "imulq";
    OpCode[OpCode["divq"] = 45] = "divq";
    OpCode[OpCode["idivq"] = 46] = "idivq";
    OpCode[OpCode["negq"] = 47] = "negq";
    OpCode[OpCode["incq"] = 48] = "incq";
    OpCode[OpCode["decq"] = 49] = "decq";
    OpCode[OpCode["xorq"] = 50] = "xorq";
    OpCode[OpCode["orq"] = 51] = "orq";
    OpCode[OpCode["andq"] = 52] = "andq";
    OpCode[OpCode["notq"] = 53] = "notq";
    OpCode[OpCode["leaq"] = 54] = "leaq";
    OpCode[OpCode["callq"] = 55] = "callq";
    OpCode[OpCode["retq"] = 56] = "retq";
    OpCode[OpCode["pushq"] = 57] = "pushq";
    OpCode[OpCode["popq"] = 58] = "popq";
    OpCode[OpCode["cmpq"] = 59] = "cmpq";
    //4字节指令
    OpCode[OpCode["movl"] = 80] = "movl";
    OpCode[OpCode["addl"] = 81] = "addl";
    OpCode[OpCode["subl"] = 82] = "subl";
    OpCode[OpCode["mull"] = 83] = "mull";
    OpCode[OpCode["imull"] = 84] = "imull";
    OpCode[OpCode["divl"] = 85] = "divl";
    OpCode[OpCode["idivl"] = 86] = "idivl";
    OpCode[OpCode["negl"] = 87] = "negl";
    OpCode[OpCode["incl"] = 88] = "incl";
    OpCode[OpCode["decl"] = 89] = "decl";
    OpCode[OpCode["xorl"] = 90] = "xorl";
    OpCode[OpCode["orl"] = 91] = "orl";
    OpCode[OpCode["andl"] = 92] = "andl";
    OpCode[OpCode["notl"] = 93] = "notl";
    OpCode[OpCode["leal"] = 94] = "leal";
    OpCode[OpCode["calll"] = 95] = "calll";
    OpCode[OpCode["retl"] = 96] = "retl";
    OpCode[OpCode["pushl"] = 97] = "pushl";
    OpCode[OpCode["popl"] = 98] = "popl";
    OpCode[OpCode["cmpl"] = 99] = "cmpl";
    //2字节指令
    OpCode[OpCode["movw"] = 120] = "movw";
    OpCode[OpCode["addw"] = 121] = "addw";
    OpCode[OpCode["subw"] = 122] = "subw";
    OpCode[OpCode["mulw"] = 123] = "mulw";
    OpCode[OpCode["imulw"] = 124] = "imulw";
    OpCode[OpCode["divw"] = 125] = "divw";
    OpCode[OpCode["idivw"] = 126] = "idivw";
    OpCode[OpCode["negw"] = 127] = "negw";
    OpCode[OpCode["incw"] = 128] = "incw";
    OpCode[OpCode["decw"] = 129] = "decw";
    OpCode[OpCode["xorw"] = 130] = "xorw";
    OpCode[OpCode["orw"] = 131] = "orw";
    OpCode[OpCode["andw"] = 132] = "andw";
    OpCode[OpCode["notw"] = 133] = "notw";
    OpCode[OpCode["leaw"] = 134] = "leaw";
    OpCode[OpCode["callw"] = 135] = "callw";
    OpCode[OpCode["retw"] = 136] = "retw";
    OpCode[OpCode["pushw"] = 137] = "pushw";
    OpCode[OpCode["popw"] = 138] = "popw";
    OpCode[OpCode["cmpw"] = 139] = "cmpw";
    //单字节指令
    OpCode[OpCode["movb"] = 160] = "movb";
    OpCode[OpCode["addb"] = 161] = "addb";
    OpCode[OpCode["subb"] = 162] = "subb";
    OpCode[OpCode["mulb"] = 163] = "mulb";
    OpCode[OpCode["imulb"] = 164] = "imulb";
    OpCode[OpCode["divb"] = 165] = "divb";
    OpCode[OpCode["idivb"] = 166] = "idivb";
    OpCode[OpCode["negb"] = 167] = "negb";
    OpCode[OpCode["incb"] = 168] = "incb";
    OpCode[OpCode["decb"] = 169] = "decb";
    OpCode[OpCode["xorb"] = 170] = "xorb";
    OpCode[OpCode["orb"] = 171] = "orb";
    OpCode[OpCode["andb"] = 172] = "andb";
    OpCode[OpCode["notb"] = 173] = "notb";
    OpCode[OpCode["leab"] = 174] = "leab";
    OpCode[OpCode["callb"] = 175] = "callb";
    OpCode[OpCode["retb"] = 176] = "retb";
    OpCode[OpCode["pushb"] = 177] = "pushb";
    OpCode[OpCode["popb"] = 178] = "popb";
    OpCode[OpCode["cmpb"] = 179] = "cmpb";
})(OpCode || (OpCode = {}));
/**
 * 指令
 */
class Inst {
    constructor(op) {
        this.op = op;
    }
}
/**
 * 没有操作数的指令
 */
class Inst_0 extends Inst {
    constructor(op) {
        super(op);
    }
    toString() {
        return OpCode[this.op];
    }
}
/**
 * 有一个操作数的指令
 */
class Inst_1 extends Inst {
    constructor(op, oprand) {
        super(op);
        this.oprand = oprand;
    }
    toString() {
        return OpCode[this.op] + "\t" + this.oprand.toString();
    }
    static isInst_1(inst) {
        return typeof inst.oprand == 'object';
    }
}
/**
 * 有一个操作数的指令
 */
class Inst_2 extends Inst {
    constructor(op, oprand1, oprand2) {
        super(op);
        this.oprand1 = oprand1;
        this.oprand2 = oprand2;
    }
    toString() {
        return OpCode[this.op] + "\t" + this.oprand1.toString() + ", " + this.oprand2.toString();
    }
    static isInst_2(inst) {
        return typeof inst.oprand1 == 'object';
    }
}
/**
 * 操作数
 */
class Oprand {
    constructor(kind, value) {
        this.kind = kind;
        this.value = value;
    }
    isSame(oprand1) {
        return this.kind == oprand1.kind && this.value == oprand1.value;
    }
    toString() {
        if (this.kind == OprandKind.bb) {
            return this.value;
        }
        else if (this.kind == OprandKind.immediate) {
            return "$" + this.value;
        }
        else if (this.kind == OprandKind.returnSlot) {
            return "returnSlot";
        }
        else {
            return OprandKind[this.kind] + "(" + this.value + ")";
        }
    }
}
class FunctionOprand extends Oprand {
    constructor(funtionName, args, returnType) {
        super(OprandKind.function, funtionName);
        this.returnType = returnType;
        this.args = args;
    }
    toString() {
        return "_" + this.value;
    }
}
/**
 * 操作数的类型
 */
var OprandKind;
(function (OprandKind) {
    //抽象度较高的操作数
    OprandKind[OprandKind["varIndex"] = 0] = "varIndex";
    OprandKind[OprandKind["returnSlot"] = 1] = "returnSlot";
    OprandKind[OprandKind["bb"] = 2] = "bb";
    OprandKind[OprandKind["function"] = 3] = "function";
    OprandKind[OprandKind["stringConst"] = 4] = "stringConst";
    //抽象度较低的操作数
    OprandKind[OprandKind["register"] = 5] = "register";
    OprandKind[OprandKind["memory"] = 6] = "memory";
    OprandKind[OprandKind["immediate"] = 7] = "immediate";
    //cmp指令的结果，是设置寄存器的标志位
    //后面可以根据flag和比较操作符的类型，来确定后续要生成的代码
    OprandKind[OprandKind["flag"] = 8] = "flag";
})(OprandKind || (OprandKind = {}));
/**
 * 基本块
 */
class BasicBlock {
    constructor() {
        this.insts = []; //基本块内的指令
        this.funIndex = -1; //函数编号
        this.bbIndex = -1; //基本块的编号。在Lower的时候才正式编号，去除空块。
        this.isDestination = false; //有其他块跳转到该块。
    }
    getName() {
        if (this.bbIndex != -1 && this.funIndex != -1) {
            return "LBB" + this.funIndex + "_" + this.bbIndex;
        }
        else {
            return "LBB";
        }
    }
    toString() {
        let str;
        if (this.isDestination) {
            str = this.getName() + ":\n";
        }
        else {
            str = "## bb." + this.bbIndex + "\n";
        }
        for (let inst of this.insts) {
            str += "    " + inst.toString() + "\n";
        }
        return str;
    }
}
/**
 * 用Asm表示的一个模块。
 * 可以输出成为asm文件。
 */
class AsmModule {
    constructor() {
        //每个函数对应的指令数组
        this.fun2Code = new Map();
        //每个函数的变量数，包括参数、本地变量和临时变量
        this.numTotalVars = new Map();
        //是否是叶子函数
        this.isLeafFunction = new Map();
        //字符串常量
        this.stringConsts = [];
    }
    /**
     * 输出代表该模块的asm文件的字符串。
     */
    toString() {
        let str = "    .section	__TEXT,__text,regular,pure_instructions\n"; //伪指令：一个文本的section
        for (let fun of this.fun2Code.keys()) {
            let funName = "_" + fun.name;
            str += "\n    .global " + funName + "\n"; //添加伪指令
            str += funName + ":\n";
            str += "    .cfi_startproc\n";
            let bbs = this.fun2Code.get(fun);
            for (let bb of bbs) {
                str += bb.toString();
            }
            str += "    .cfi_endproc\n";
        }
        return str;
    }
}
exports.AsmModule = AsmModule;
/**
 * AsmGenerator需要用到的状态变量
 */
class TempStates {
    constructor() {
        //当前的函数，用于查询本地变量的下标
        this.functionSym = null;
        //当前函数生成的指令
        this.bbs = [];
        //下一个临时变量的下标
        this.nextTempVarIndex = 0;
        //已经不再使用的临时变量，可以被复用
        //优先使用返回值寄存器，可以减少寄存器之间的拷贝
        this.deadTempVars = [];
        //每个表达式节点对应的临时变量的索引
        this.tempVarMap = new Map();
        //主要用于判断当前的Unary是一个表达式的一部分，还是独立的一个语句
        this.inExpression = false;
        //保存一元后缀运算符对应的指令。
        this.postfixUnaryInst = null;
    }
}
/**
 * 汇编代码生成程序。
 * 这是一个比较幼稚的算法，使用了幼稚的寄存器分配算法，但已经尽量争取多使用寄存器，对于简单的函数已经能生成性能不错的代码。
 * 算法特点：
 * 1.先是尽力使用寄存器，寄存器用光以后就用栈桢；
 * 2.对于表达式，尽量复用寄存器来表示临时变量。
 */
class AsmGenerator extends ast_1.AstVisitor {
    constructor() {
        super();
        //用来存放返回值的位置
        this.returnSlot = new Oprand(OprandKind.returnSlot, -1);
        //一些状态变量
        this.s = new TempStates();
        this.asmModule = new AsmModule();
    }
    /**
     * 分配一个临时变量的下标。尽量复用已经死掉的临时变量
     */
    allocateTempVar() {
        let varIndex;
        if (this.s.deadTempVars.length > 0) {
            varIndex = this.s.deadTempVars[this.s.deadTempVars.length - 1];
            this.s.deadTempVars.pop();
        }
        else {
            varIndex = this.s.nextTempVarIndex++;
        }
        return varIndex;
    }
    isTempVar(oprand) {
        if (this.s.functionSym != null) {
            return oprand.kind == OprandKind.varIndex &&
                oprand.value >= this.s.functionSym.vars.length;
        }
        else {
            return false;
        }
    }
    isParamOrLocalVar(oprand) {
        if (this.s.functionSym != null) {
            return oprand.kind == OprandKind.varIndex &&
                oprand.value < this.s.functionSym.vars.length;
        }
        else {
            return false;
        }
    }
    /**
     * 如果操作数不同，则生成mov指令；否则，可以减少一次拷贝。
     * @param src
     * @param dest
     */
    movIfNotSame(src, dest) {
        if (!src.isSame(dest)) {
            this.getCurrentBB().insts.push(new Inst_2(OpCode.movl, src, dest));
        }
    }
    getCurrentBB() {
        return this.s.bbs[this.s.bbs.length - 1];
    }
    newBlock() {
        let bb = new BasicBlock();
        this.s.bbs.push(bb);
        return bb;
    }
    /**
     * 主函数
     * @param prog
     */
    visitProg(prog) {
        this.s.functionSym = prog.sym;
        this.s.nextTempVarIndex = this.s.functionSym.vars.length;
        //创建新的基本块
        this.newBlock();
        this.visitBlock(prog);
        this.asmModule.fun2Code.set(this.s.functionSym, this.s.bbs);
        this.asmModule.numTotalVars.set(this.s.functionSym, this.s.nextTempVarIndex);
        return this.asmModule;
    }
    visitFunctionDecl(functionDecl) {
        //保存原来的状态信息
        let s = this.s;
        //新建立状态信息
        this.s = new TempStates();
        this.s.functionSym = functionDecl.sym;
        this.s.nextTempVarIndex = this.s.functionSym.vars.length;
        //计算当前函数是不是叶子函数
        //先设置成叶子变量。如果遇到函数调用，则设置为false。
        this.asmModule.isLeafFunction.set(this.s.functionSym, true);
        //创建新的基本块
        this.newBlock();
        //生成代码
        this.visitBlock(functionDecl.body);
        this.asmModule.fun2Code.set(this.s.functionSym, this.s.bbs);
        this.asmModule.numTotalVars.set(this.s.functionSym, this.s.nextTempVarIndex);
        //恢复原来的状态信息
        this.s = s;
    }
    /**
     * 把返回值mov到指定的寄存器。
     * 这里并不生成ret指令，而是在程序的尾声中处理。
     * @param returnStatement
     */
    visitReturnStatement(returnStatement) {
        if (returnStatement.exp != null) {
            let ret = this.visit(returnStatement.exp);
            //把返回值赋给相应的寄存器
            this.movIfNotSame(ret, this.returnSlot);
        }
        // this.getCurrentBB().insts.push(new Inst_0(OpCode.retl));
    }
    visitIfStatement(ifStmt) {
        //条件
        let bbCondition = this.getCurrentBB();
        let compOprand = this.visit(ifStmt.condition);
        //if块
        let bbIfBlcok = this.newBlock();
        this.visit(ifStmt.stmt);
        //else块
        let bbElseBlock = null;
        if (ifStmt.elseStmt != null) {
            bbElseBlock = this.newBlock();
            this.visit(ifStmt.elseStmt);
        }
        //最后，要新建一个基本块,用于If后面的语句。
        let bbFollowing = this.newBlock();
        //为bbCondition添加跳转语句
        let op = this.getJumpOpCode(compOprand);
        let instConditionJump;
        if (bbElseBlock != null) {
            //跳转到else块
            instConditionJump = new Inst_1(op, new Oprand(OprandKind.bb, bbElseBlock));
        }
        else {
            //跳转到if之后的块
            instConditionJump = new Inst_1(op, new Oprand(OprandKind.bb, bbFollowing));
        }
        bbCondition.insts.push(instConditionJump);
        //为bbIfBlock添加跳转语句
        if (bbElseBlock != null) { //如果没有else块，就不需要添加跳转了。
            let instIfBlockJump = new Inst_1(OpCode.jmp, new Oprand(OprandKind.bb, bbFollowing));
            bbIfBlcok.insts.push(instIfBlockJump);
        }
    }
    /**
     * 根据条件表达式的操作符，确定该采用的跳转指令。用于if语句和for循环等中。
     * @param compOprand
     */
    getJumpOpCode(compOprand) {
        let op = OpCode.jmp;
        if (compOprand.value == scanner_1.Op.G) {
            op = OpCode.jg;
        }
        else if (compOprand.value == scanner_1.Op.GE) {
            op = OpCode.jge;
        }
        else if (compOprand.value == scanner_1.Op.L) {
            op = OpCode.jl;
        }
        else if (compOprand.value == scanner_1.Op.LE) {
            op = OpCode.jle;
        }
        else if (compOprand.value == scanner_1.Op.EQ) {
            op = OpCode.je;
        }
        else if (compOprand.value == scanner_1.Op.NE) {
            op = OpCode.jne;
        }
        else {
            console.log("Unsupported compare operand in conditional expression: " + compOprand.value);
        }
        return op;
    }
    visitForStatement(forStmt) {
        //初始化，放到前一个BasicBlock中
        if (forStmt.init != null) {
            this.visit(forStmt.init);
        }
        //condition
        let bbCondition = this.newBlock();
        let compOprand = null;
        if (forStmt.condition != null) {
            compOprand = this.visit(forStmt.condition);
        }
        //循环体
        let bbBody = this.newBlock();
        this.visit(forStmt.stmt);
        //增长语句，跟循环体在同一个BasicBlock中
        if (forStmt.increment != null) {
            this.visit(forStmt.increment);
        }
        //最后，要新建一个基本块,用于If后面的语句。
        let bbFollowing = this.newBlock();
        //为bbCondition添加跳转语句
        if (compOprand != null) { //如果没有循环条件，就会直接落到循环体中
            let op = this.getJumpOpCode(compOprand);
            let instConditionJump = new Inst_1(op, new Oprand(OprandKind.bb, bbFollowing));
            bbCondition.insts.push(instConditionJump);
        }
        //为循环体添加跳转语句
        let bbDest;
        if (compOprand != null) {
            bbDest = bbCondition; //去执行循环条件
        }
        else { //如果没有循环条件，就直接回到循环体的第一句
            bbDest = bbBody;
        }
        let instBodyJump = new Inst_1(OpCode.jmp, new Oprand(OprandKind.bb, bbDest));
        bbBody.insts.push(instBodyJump);
    }
    visitVariableDecl(variableDecl) {
        if (variableDecl.init != null && this.s.functionSym != null) {
            let right = this.visit(variableDecl.init);
            let left = new Oprand(OprandKind.varIndex, this.s.functionSym.vars.indexOf(variableDecl.sym));
            //不可以两个都是内存变量
            if (this.isParamOrLocalVar(right) || right.kind == OprandKind.immediate) {
                let newRight = new Oprand(OprandKind.varIndex, this.allocateTempVar());
                this.getCurrentBB().insts.push(new Inst_2(OpCode.movl, right, newRight));
                if (this.isTempVar(right)) {
                    this.s.deadTempVars.push(right.value);
                }
                right = newRight;
            }
            this.movIfNotSame(right, left);
            return left;
        }
    }
    /**
     * 二元表达式
     * @param bi
     */
    visitBinary(bi) {
        this.s.inExpression = true;
        let insts = this.getCurrentBB().insts;
        //左子树返回的操作数
        let left = this.visit(bi.exp1);
        //右子树
        let right = this.visit(bi.exp2);
        console_1.assert(typeof left == 'object', "表达式没有返回Oprand。");
        console_1.assert(typeof right == 'object', "表达式没有返回Oprand。");
        //计算出一个目标操作数
        let dest = left;
        if (!this.isTempVar(dest)) {
            dest = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            insts.push(new Inst_2(OpCode.movl, left, dest));
        }
        //释放掉不用的临时变量
        if (this.isTempVar(right)) {
            this.s.deadTempVars.push(right.value);
        }
        //生成指令
        //todo 有问题的地方
        switch (bi.op) {
            case scanner_1.Op.Plus: //'+'
                if (bi.theType === types_1.SysTypes.String) { //字符串加
                    let args = [];
                    args.push(left);
                    args.push(right);
                    this.callIntrinsics("string_concat", args);
                }
                else {
                    // this.movIfNotSame(left,dest);
                    insts.push(new Inst_2(OpCode.addl, right, dest));
                }
                break;
            case scanner_1.Op.Minus: //'-'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCode.subl, right, dest));
                break;
            case scanner_1.Op.Multiply: //'*'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCode.imull, right, dest));
                break;
            case scanner_1.Op.Divide: //'/'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCode.idivl, right, dest));
                break;
            case scanner_1.Op.Assign: //'='
                // this.movIfNotSame(right,left);
                insts.push(new Inst_2(OpCode.movl, right, dest));
                this.movIfNotSame(dest, left); //写到内存里去
                break;
            case scanner_1.Op.G:
            case scanner_1.Op.L:
            case scanner_1.Op.GE:
            case scanner_1.Op.LE:
            case scanner_1.Op.EQ:
            case scanner_1.Op.NE:
                insts.push(new Inst_2(OpCode.cmpl, right, dest));
                dest = new Oprand(OprandKind.flag, this.getOpsiteOp(bi.op));
                break;
            default:
                console.log("Unsupported OpCode in AsmGenerator.visitBinary: " + scanner_1.Op[bi.op]);
        }
        this.s.inExpression = false;
        return dest;
    }
    getOpsiteOp(op) {
        let newOp = op;
        switch (op) {
            case scanner_1.Op.G:
                newOp = scanner_1.Op.LE;
                break;
            case scanner_1.Op.L:
                newOp = scanner_1.Op.GE;
                break;
            case scanner_1.Op.GE:
                newOp = scanner_1.Op.L;
                break;
            case scanner_1.Op.LE:
                newOp = scanner_1.Op.G;
                break;
            case scanner_1.Op.EQ:
                newOp = scanner_1.Op.NE;
                break;
            case scanner_1.Op.NE:
                newOp = scanner_1.Op.EQ;
                break;
            default:
                console.log("Unsupport Op '" + scanner_1.Op[op] + "' in getOpsiteOpCode.");
        }
        return newOp;
    }
    //必要时添加一元后缀表达式的指令
    // private handlePostfixUnaryInst():void{
    //     let insts = this.getCurrentBB().insts;
    //     //添加一元后缀运算符的指令
    //     if(this.s.postfixUnaryInst != null){
    //         insts.push(this.s.postfixUnaryInst);
    //         this.s.postfixUnaryInst = null;
    //     }
    // }
    /**
     * 为一元运算符生成指令
     * 对于++或--这样的一元运算，只能是右值。如果是后缀表达式，需要在前一条指令之后，再把其值改一下。
     * 所以，存个临时状态信息
     * @param u
     */
    visitUnary(u) {
        let insts = this.getCurrentBB().insts;
        let oprand = this.visit(u.exp);
        //用作返回值的Oprand
        let result = oprand;
        //++和--
        if (u.op == scanner_1.Op.Inc || u.op == scanner_1.Op.Dec) {
            let tempVar = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            insts.push(new Inst_2(OpCode.movl, oprand, tempVar));
            if (u.isPrefix) { //前缀运算符
                result = tempVar;
            }
            else { //后缀运算符
                //把当前操作数放入一个临时变量作为返回值
                result = new Oprand(OprandKind.varIndex, this.allocateTempVar());
                insts.push(new Inst_2(OpCode.movl, oprand, result));
                this.s.deadTempVars.push(tempVar.value);
            }
            //做+1或-1的运算
            let opCode = u.op == scanner_1.Op.Inc ? OpCode.addl : OpCode.subl;
            insts.push(new Inst_2(opCode, new Oprand(OprandKind.immediate, 1), tempVar));
            insts.push(new Inst_2(OpCode.movl, tempVar, oprand));
        }
        //+
        else if (u.op == scanner_1.Op.Plus) {
            result = oprand;
        }
        //-
        else if (u.op == scanner_1.Op.Minus) {
            let tempVar = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            //用0减去当前值
            insts.push(new Inst_2(OpCode.movl, new Oprand(OprandKind.immediate, 0), tempVar));
            insts.push(new Inst_2(OpCode.subl, oprand, tempVar));
            result = tempVar;
            if (this.isTempVar(oprand)) {
                this.s.deadTempVars.push(oprand.value);
            }
        }
        return result;
    }
    visitExpressionStatement(stmt) {
        //先去为表达式生成指令
        super.visitExpressionStatement(stmt);
    }
    visitVariable(variable) {
        if (this.s.functionSym != null && variable.sym != null) {
            return new Oprand(OprandKind.varIndex, this.s.functionSym.vars.indexOf(variable.sym));
        }
    }
    visitIntegerLiteral(integerLiteral) {
        return new Oprand(OprandKind.immediate, integerLiteral.value);
    }
    visitStringLiteral(stringLiteral) {
        //加到常数表里
        let strIndex = this.asmModule.stringConsts.indexOf(stringLiteral.value);
        if (strIndex == -1) {
            this.asmModule.stringConsts.push(stringLiteral.value);
            strIndex = this.asmModule.stringConsts.length - 1;
        }
        //调用一个内置函数来创建PlayString
        let args = [];
        args.push(new Oprand(OprandKind.stringConst, strIndex));
        return this.callIntrinsics("string_create_by_str", args);
    }
    callIntrinsics(intrinsic, args) {
        let insts = this.getCurrentBB().insts;
        let functionSym = symbol_1.intrinsics.get("string_create_by_str");
        let functionType = functionSym.theType;
        insts.push(new Inst_1(OpCode.callq, new FunctionOprand("string_create_by_str", args, functionType.returnType)));
        //把结果放到一个新的临时变量里
        if (functionType.returnType != types_1.SysTypes.Void) { //函数有返回值时
            let dest = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            insts.push(new Inst_2(OpCode.movl, this.returnSlot, dest));
            return dest;
        }
    }
    /**
     * 为函数调用生成指令
     * 计算每个参数，并设置参数
     * @param functionCall
     */
    visitFunctionCall(functionCall) {
        //当前函数不是叶子函数
        this.asmModule.isLeafFunction.set(this.s.functionSym, false);
        let insts = this.getCurrentBB().insts;
        let args = [];
        for (let arg of functionCall.arguments) {
            let oprand = this.visit(arg);
            args.push(oprand);
        }
        let functionSym = functionCall.sym;
        let functionType = functionSym.theType;
        insts.push(new Inst_1(OpCode.callq, new FunctionOprand(functionCall.name, args, functionType.returnType)));
        //把结果放到一个新的临时变量里
        if (functionType.returnType != types_1.SysTypes.Void) { //函数有返回值时
            let dest = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            insts.push(new Inst_2(OpCode.movl, this.returnSlot, dest));
            return dest;
        }
    }
}
exports.AsmGenerator = AsmGenerator;
///////////////////////////////////////////////////////////////////////////
//Lower
class Register extends Oprand {
    constructor(registerName, bits = 32) {
        super(OprandKind.register, registerName);
        this.bits = 32; //寄存器的位数
        this.bits = bits;
    }
    toString() {
        return "%" + this.value;
    }
}
//可供分配的寄存器的数量
//16个通用寄存器中，扣除rbp和rsp，然后保留一个寄存器，用来作为与内存变量交换的区域。
Register.numAvailableRegs = 13;
//32位寄存器
//参数用的寄存器，当然也要由caller保护
Register.edi = new Register("edi");
Register.esi = new Register("esi");
Register.edx = new Register("edx");
Register.ecx = new Register("ecx");
Register.r8d = new Register("r8d");
Register.r9d = new Register("r9d");
//通用寄存器:caller（调用者）负责保护
Register.r10d = new Register("r10d");
Register.r11d = new Register("r11d");
//返回值，也由Caller保护
Register.eax = new Register("eax");
//通用寄存器:callee（调用者）负责保护
Register.ebx = new Register("ebx");
Register.r12d = new Register("r12d");
Register.r13d = new Register("r13d");
Register.r14d = new Register("r14d");
Register.r15d = new Register("r15d");
//栈顶和栈底
Register.esp = new Register("esp");
Register.ebp = new Register("ebp");
//32位的可供分配的寄存器
Register.registers32 = [
    Register.eax,
    Register.r10d,
    Register.r11d,
    Register.edi,
    Register.esi,
    Register.edx,
    Register.ecx,
    Register.r8d,
    Register.r9d,
    Register.ebx,
    Register.r12d,
    Register.r13d,
    Register.r14d,
    Register.r15d,
];
//用于传参的寄存器
Register.paramRegisters32 = [
    Register.edi,
    Register.esi,
    Register.edx,
    Register.ecx,
    Register.r8d,
    Register.r9d,
];
//Callee保护的寄存器
Register.calleeProtected32 = [
    Register.ebx,
    Register.r12d,
    Register.r13d,
    Register.r14d,
    Register.r15d,
];
//Caller保护的寄存器
Register.callerProtected32 = [
    Register.edi,
    Register.esi,
    Register.edx,
    Register.ecx,
    Register.r8d,
    Register.r9d,
    Register.r10d,
    Register.r11d,
    Register.eax,
];
//64位寄存器
//参数用的寄存器，当然也要由caller保护
Register.rdi = new Register("rdi", 64);
Register.rsi = new Register("rsi", 64);
Register.rdx = new Register("rdx", 64);
Register.rcx = new Register("rcx", 64);
Register.r8 = new Register("r8", 64);
Register.r9 = new Register("r9", 64);
//通用寄存器:caller（调用者）负责保护
Register.r10 = new Register("r10", 64);
Register.r11 = new Register("r11", 64);
//返回值，也由Caller保护
Register.rax = new Register("rax", 64);
//通用寄存器:callee（调用者）负责保护
Register.rbx = new Register("rbx", 64);
Register.r12 = new Register("r12", 64);
Register.r13 = new Register("r13", 64);
Register.r14 = new Register("r14", 64);
Register.r15 = new Register("r15", 64);
//栈顶和栈底
Register.rsp = new Register("rsp", 64);
Register.rbp = new Register("rbp", 64);
//64位的可供分配的寄存器
Register.registers64 = [
    Register.rax,
    Register.r10,
    Register.r11,
    Register.rdi,
    Register.rsi,
    Register.rdx,
    Register.rcx,
    Register.r8,
    Register.r9,
    Register.rbx,
    Register.r12,
    Register.r13,
    Register.r14,
    Register.r15,
];
//Callee保护的寄存器
Register.calleeProtected64 = [
    Register.rbx,
    Register.r12,
    Register.r13,
    Register.r14,
    Register.r15,
];
//Caller保护的寄存器
Register.callerProtected64 = [
    Register.rdi,
    Register.rsi,
    Register.rdx,
    Register.rcx,
    Register.r8,
    Register.r9,
    Register.r10,
    Register.r11,
    Register.rax,
];
/**
 * 内存寻址
 * 这是个简化的版本，只支持基于寄存器的偏移量
 * 后面根据需要再扩展。
 */
class MemAddress extends Oprand {
    constructor(register, offset) {
        super(OprandKind.memory, 'undefined');
        this.register = register;
        this.offset = offset;
    }
    toString() {
        //输出结果类似于：8(%rbp)
        //如果offset为0，那么不显示，即：(%rbp)
        return (this.offset == 0 ? "" : this.offset) + "(" + this.register.toString() + ")";
    }
}
/**
 * 对AsmModule做Lower处理。
 * 1.把寄存器改成具体的物理寄存器
 * 2.把本地变量也换算成具体的内存地址
 * 3.把抽象的指令转换成具体的指令
 * 4.计算标签名称
 * 5.添加序曲和尾声
 * 6.内存对齐
 * @param asmModule
 */
class Lower {
    constructor(asmModule) {
        //当前函数使用到的那些Caller保护的寄存器
        this.usedCallerProtectedRegs = [];
        //当前函数使用到的那些Callee保护的寄存器
        this.usedCalleeProtectedRegs = [];
        //所有变量的总数，包括参数、本地变量和临时变量
        this.numTotalVars = 0;
        //当前函数的参数数量
        this.numParams = 0;
        //当前函数的本地变量数量
        this.numLocalVars = 0;
        //临时变量的数量
        this.numTempVars = 0;
        //保存已经被Lower的Oprand，用于提高效率
        this.lowedVars = new Map();
        //需要在栈里保存的为函数传参（超过6个之后的参数）保留的空间，每个参数占8个字节
        this.numArgsOnStack = 0;
        //rsp应该移动的量。这个量再加8就是该函数所对应的栈桢的大小，其中8是callq指令所压入的返回地址
        this.rspOffset = 0;
        //是否使用RedZone，也就是栈顶之外的128个字节
        this.canUseRedZone = false;
        //已被分配的寄存器
        this.allocatedRegisters = new Map();
        this.asmModule = asmModule;
    }
    lowerModule() {
        let newFun2Code = new Map();
        let funIndex = 0;
        for (let fun of this.asmModule.fun2Code.keys()) {
            let bbs = this.asmModule.fun2Code.get(fun);
            let newBBs = this.lowerFunction(fun, bbs, funIndex++);
            newFun2Code.set(fun, newBBs);
        }
        this.asmModule.fun2Code = newFun2Code;
    }
    lowerFunction(functionSym, bbs, funIndex) {
        //初始化一些状态变量
        this.initStates(functionSym);
        //分配寄存器
        this.lowerVars();
        // console.log(this);   //打印一下，看看状态变量是否对。
        //lower每个BasicBlock中的指令
        for (let i = 0; i < bbs.length; i++) {
            let bb = bbs[i];
            let newInsts = [];
            this.lowerInsts(bb.insts, newInsts);
            bb.insts = newInsts;
        }
        //添加序曲
        bbs[0].insts = this.addPrologue(bbs[0].insts);
        //添加尾声
        this.addEpilogue(bbs[bbs.length - 1].insts);
        //基本块的标签和跳转指令。
        let newBBs = this.lowerBBLabelAndJumps(bbs, funIndex);
        return newBBs;
    }
    /**
     * 初始化当前函数的一些状态变量，在算法中会用到它们
     * @param functionSym
     */
    initStates(functionSym) {
        this.usedCalleeProtectedRegs = [];
        this.usedCallerProtectedRegs = [];
        this.numTotalVars = this.asmModule.numTotalVars.get(functionSym);
        this.numParams = functionSym.getNumParams();
        this.numLocalVars = functionSym.vars.length - this.numParams;
        this.numTempVars = this.numTotalVars - functionSym.vars.length;
        this.numArgsOnStack = 0;
        this.rspOffset = 0;
        this.lowedVars.clear();
        this.allocatedRegisters.clear();
        //是否可以使用RedZone
        //需要是叶子函数，并且对栈外空间的使用量小于128个字节，也就是32个整数
        this.canUseRedZone = false;
        let isLeafFunction = this.asmModule.isLeafFunction.get(functionSym);
        if (isLeafFunction) {
            let paramsToSave = this.numParams > 6 ? 6 : this.numParams;
            let bytes = paramsToSave * 4 + this.numLocalVars * 4 + this.saveCalleeProtectedRegs.length * 8;
            this.canUseRedZone = bytes < 128;
        }
    }
    /**
     * 把变量下标转换成内存地址或寄存器
     * @param functionSym
     */
    lowerVars() {
        let paramsToSave = this.numParams > 6 ? 6 : this.numParams;
        //处理参数
        for (let varIndex = 0; varIndex < this.numTotalVars; varIndex++) {
            let newOprand;
            if (varIndex < this.numParams) {
                if (varIndex < 6) {
                    //从自己的栈桢里访问。在程序的序曲里，就把这些变量拷贝到栈里了。
                    let offset = -(varIndex + 1) * 4;
                    newOprand = new MemAddress(Register.rbp, offset);
                }
                else {
                    //从Caller的栈里访问参数
                    let offset = (varIndex - 6) * 8 + 16; //+16是因为有一个callq压入的返回地址，一个pushq rbp又加了8个字节
                    newOprand = new MemAddress(Register.rbp, offset);
                }
            }
            //本地变量，在栈桢里。
            else if (varIndex < this.numParams + this.numLocalVars) {
                let offset = -(varIndex - this.numParams + paramsToSave + 1) * 4;
                newOprand = new MemAddress(Register.rbp, offset);
            }
            //临时变量，分配寄存器
            else {
                newOprand = this.allocateRegister(varIndex);
            }
            //缓存起来
            this.lowedVars.set(varIndex, newOprand);
        }
    }
    /**
     * 获取寄存器，并更新usedCalleeProtectedRegs和usedCallerProtectedRegs
     * @param index
     */
    allocateRegister(varIndex) {
        for (let reg of Register.registers32) {
            if (!this.allocatedRegisters.has(reg)) {
                this.allocatedRegisters.set(reg, varIndex);
                //更新usedCalleeProtectedRegs
                if (Register.calleeProtected32.indexOf(reg) != -1) {
                    this.usedCalleeProtectedRegs.push(reg);
                }
                //更新usedCallerProtectedRegs
                else if (Register.callerProtected32.indexOf(reg) != -1) {
                    this.usedCallerProtectedRegs.push(reg);
                }
                return reg;
            }
        }
        //不应该执行到这里，执行到这里应该报错
        console.log("Unable to allocate a Register, the generated asm is not reliable");
        return Register.registers32[0];
    }
    /**
     * 预留eax寄存器，不参与分配
     */
    reserveReturnSlot() {
        this.allocatedRegisters.set(Register.eax, -1); //给予一个特殊的变量下标，-1
    }
    /**
     * 归还已经分配的寄存器
     * @param reg
     */
    freeRegister(reg) {
        if (this.allocatedRegisters.has(reg))
            this.allocatedRegisters.delete(reg);
        let index = this.usedCalleeProtectedRegs.indexOf(reg);
        if (index != -1)
            this.usedCalleeProtectedRegs.splice(index, 1);
        index = this.usedCallerProtectedRegs.indexOf(reg);
        if (index != -1)
            this.usedCallerProtectedRegs.splice(index, 1);
    }
    //添加序曲
    addPrologue(insts) {
        let newInsts = [];
        //保存rbp的值
        newInsts.push(new Inst_1(OpCode.pushq, Register.rbp));
        //把原来的栈顶保存到rbp,成为现在的栈底
        newInsts.push(new Inst_2(OpCode.movq, Register.rsp, Register.rbp));
        //把前6个参数存到栈桢里
        let paramsToSave = this.numParams > 6 ? 6 : this.numParams;
        for (let i = 0; i < paramsToSave; i++) {
            let offset = -(i + 1) * 4;
            newInsts.push(new Inst_2(OpCode.movl, Register.paramRegisters32[i], new MemAddress(Register.rbp, offset)));
        }
        //计算栈顶指针需要移动多少位置
        //要保证栈桢16字节对齐
        if (!this.canUseRedZone) {
            this.rspOffset = paramsToSave * 4 + this.numLocalVars * 4 + this.usedCallerProtectedRegs.length * 4 + this.numArgsOnStack * 8 + 16;
            //当前占用的栈空间，还要加上Callee保护的寄存器占据的空间
            let rem = (this.rspOffset + this.usedCalleeProtectedRegs.length * 8) % 16;
            // console.log("this.rspOffset="+this.rspOffset);
            // console.log("rem="+rem);
            if (rem == 8) {
                this.rspOffset += 8;
            }
            else if (rem == 4) {
                this.rspOffset += 12;
            }
            else if (rem == 12) {
                this.rspOffset += 4;
            }
            // console.log("this.rspOffset="+this.rspOffset);
            if (this.rspOffset > 0)
                newInsts.push(new Inst_2(OpCode.subq, new Oprand(OprandKind.immediate, this.rspOffset), Register.rsp));
        }
        //保存Callee负责保护的寄存器
        this.saveCalleeProtectedRegs(newInsts);
        //合并原来的指令
        newInsts = newInsts.concat(insts);
        return newInsts;
    }
    //添加尾声
    addEpilogue(newInsts) {
        //恢复Callee负责保护的寄存器
        this.restoreCalleeProtectedRegs(newInsts);
        //缩小栈桢
        if (!this.canUseRedZone && this.rspOffset > 0) {
            newInsts.push(new Inst_2(OpCode.addq, new Oprand(OprandKind.immediate, this.rspOffset), Register.rsp));
        }
        //恢复rbp的值
        newInsts.push(new Inst_1(OpCode.popq, Register.rbp));
        //返回
        newInsts.push(new Inst_0(OpCode.retq));
    }
    //去除空的BasicBlock，给BasicBlock编号，把jump指令也lower
    lowerBBLabelAndJumps(bbs, funIndex) {
        let newBBs = [];
        let bbIndex = 0;
        //去除空的BasicBlock，并给BasicBlock编号
        for (let i = 0; i < bbs.length; i++) {
            let bb = bbs[i];
            //如果是空的BasicBlock，就跳过
            if (bb.insts.length > 0) {
                bb.funIndex = funIndex;
                bb.bbIndex = bbIndex++;
                newBBs.push(bb);
            }
            else {
                //如果有一个BasicBlock指向该block，那么就指向下一个block;
                for (let j = 0; j < newBBs.length; j++) {
                    let lastInst = newBBs[j].insts[newBBs[j].insts.length - 1];
                    if (lastInst.op < 20) {
                        let jumpInst = lastInst;
                        let destBB = jumpInst.oprand.value;
                        if (destBB == bb) {
                            jumpInst.oprand.value = bbs[i + 1];
                        }
                    }
                }
            }
        }
        //把jump指令的操作数lower一下,从BasicBlock变到标签
        for (let i = 0; i < newBBs.length; i++) {
            let insts = newBBs[i].insts;
            let lastInst = insts[insts.length - 1];
            if (lastInst.op < 20) { //jump指令
                let jumpInst = lastInst;
                let bbDest = jumpInst.oprand.value;
                jumpInst.oprand.value = bbDest.getName();
                bbDest.isDestination = true; //有其他block跳到这个block
            }
        }
        return newBBs;
    }
    /**
     * Lower指令
     * @param insts
     * @param newInsts
     */
    lowerInsts(insts, newInsts) {
        for (let i = 0; i < insts.length; i++) {
            let inst = insts[i];
            //两个操作数
            if (Inst_2.isInst_2(inst)) {
                let inst_2 = inst;
                inst_2.oprand1 = this.lowerOprand(inst_2.oprand1);
                inst_2.oprand2 = this.lowerOprand(inst_2.oprand2);
                //对mov再做一次优化
                if (!(inst_2.op == OpCode.movl && inst_2.oprand1 == inst_2.oprand2)) {
                    newInsts.push(inst_2);
                }
            }
            //1个操作数
            else if (Inst_1.isInst_1(inst)) {
                let inst_1 = inst;
                inst_1.oprand = this.lowerOprand(inst_1.oprand);
                //处理函数调用
                //函数调用前后，要设置参数；
                if (inst_1.op == OpCode.callq) {
                    this.lowerFunctionCall(inst_1, newInsts);
                }
                else {
                    newInsts.push(inst_1);
                }
            }
            //没有操作数
            else {
                newInsts.push(inst);
            }
        }
    }
    /**
     * 处理函数调用。
     * 调用前，设置参数。并根据需要增加栈桢尺寸。
     * 调用后，缩小栈桢尺寸。
     * @param inst_1
     * @param newInsts
     */
    lowerFunctionCall(inst_1, newInsts) {
        let functionOprand = inst_1.oprand;
        let args = functionOprand.args;
        //需要在栈桢里为传参保留的空间
        let numArgs = args.length;
        if (numArgs > 6 && numArgs - 6 > this.numArgsOnStack) {
            this.numArgsOnStack = numArgs - 6;
        }
        //保存Caller负责保护的寄存器
        let paramsToSave = this.numParams > 6 ? 6 : this.numParams;
        let offset = -(paramsToSave + this.numLocalVars + 1) * 4;
        let spilledTempVars = [];
        let spilledRegs = [];
        for (let i = 0; i < this.usedCallerProtectedRegs.length; i++) {
            let reg = this.usedCallerProtectedRegs[i];
            newInsts.push(new Inst_2(OpCode.movl, reg, new MemAddress(Register.rbp, offset - i * 4)));
            let varIndex = this.allocatedRegisters.get(reg);
            spilledRegs.push(reg);
            spilledTempVars.push(varIndex);
        }
        for (let reg of spilledRegs) { //这个一定要单起一个循环
            this.freeRegister(reg);
        }
        //把前6个参数设置到寄存器
        for (let j = 0; j < numArgs && j < 6; j++) {
            let regSrc = this.lowerOprand(args[j]);
            let regDest = Register.paramRegisters32[j];
            if (regDest !== regSrc)
                newInsts.push(new Inst_2(OpCode.movl, regSrc, regDest));
        }
        //超过6个之后的参数是放在栈桢里的，并要移动栈顶指针
        if (args.length > 6) {
            //参数是倒着排的。
            //栈顶是参数7，再往上，依次是参数8、参数9...
            //在Callee中，会到Caller的栈桢中去读取参数值
            for (let j = 6; j < numArgs; j++) {
                let offset = (j - 6) * 8;
                newInsts.push(new Inst_2(OpCode.movl, functionOprand.args[j], new MemAddress(Register.rsp, offset)));
            }
        }
        //调用函数，修改操作数为functionName
        newInsts.push(inst_1);
        //为返回值预留eax寄存器
        this.reserveReturnSlot();
        //恢复Caller负责保护的寄存器
        for (let i = 0; i < spilledTempVars.length; i++) {
            let varIndex = spilledTempVars[i];
            let reg = this.allocateRegister(varIndex);
            newInsts.push(new Inst_2(OpCode.movl, new MemAddress(Register.rbp, offset - i * 4), reg));
            this.lowedVars.set(varIndex, reg);
        }
    }
    /**
     * Lower操作数
     * 主要任务是做物理寄存器的分配。
     * @param oprand
     */
    lowerOprand(oprand) {
        let newOprand = oprand;
        if (oprand.kind == OprandKind.varIndex) {
            let varIndex = oprand.value;
            return this.lowedVars.get(varIndex);
        }
        else if (oprand.kind == OprandKind.returnSlot) {
            newOprand = Register.eax;
        }
        return newOprand;
    }
    saveCalleeProtectedRegs(newInsts) {
        for (let i = 0; i < this.usedCalleeProtectedRegs.length; i++) {
            let regIndex = Register.calleeProtected32.indexOf(this.usedCalleeProtectedRegs[i]);
            let reg64 = Register.calleeProtected64[regIndex];
            newInsts.push(new Inst_1(OpCode.pushq, reg64));
        }
    }
    restoreCalleeProtectedRegs(newInsts) {
        for (let i = this.usedCalleeProtectedRegs.length - 1; i >= 0; i--) {
            let regIndex = Register.calleeProtected32.indexOf(this.usedCalleeProtectedRegs[i]);
            let reg64 = Register.calleeProtected64[regIndex];
            newInsts.push(new Inst_1(OpCode.popq, reg64));
        }
    }
}
function compileToAsm(prog, verbose) {
    let asmGenerator = new AsmGenerator();
    //生成LIR
    let asmModule = asmGenerator.visit(prog);
    if (verbose) {
        console.log("在Lower之前：");
        console.log(asmModule.toString());
    }
    //Lower
    let lower = new Lower(asmModule);
    lower.lowerModule();
    let asm = asmModule.toString();
    if (verbose) {
        console.log("在Lower之后：");
        console.log(asm);
    }
    return asm;
}
exports.compileToAsm = compileToAsm;
/**
 * 变量活跃性分析
 */
class LivenessAnalyzer {
    constructor(asmModule) {
        this.asmModule = asmModule;
    }
    execute() {
        let result = new Map();
        let funIndex = 0;
        for (let fun of this.asmModule.fun2Code.keys()) {
            let bbs = this.asmModule.fun2Code.get(fun);
            this.analyzeFunction(fun, bbs, funIndex++, result);
        }
        return result;
    }
    /**
     * 给一个函数做变量活跃性分析。
     * 算法思路：
     * 每个函数的CFG是一个有角的图（rooted graph）。第一个
     * @param fun
     * @param bbs
     * @param funIndex
     * @param result
     */
    analyzeFunction(fun, bbs, funIndex, result) {
    }
    analyzeBasicBlock(fun, insts, funIndex, result) {
        let changed = false;
        for (let i = insts.length - 1; i >= 0; i--) {
            let inst = insts[i];
            switch (inst.op) {
                // case
            }
        }
        return changed;
    }
}
