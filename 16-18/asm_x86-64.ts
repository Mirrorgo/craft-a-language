/**
 * 生成X64机器的指令
 * @version 0.1
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-27
 *  
 */

import {FunctionSymbol, VarSymbol, intrinsics} from './symbol'
import {AstVisitor, AstNode, Block, Prog, VariableDecl, FunctionDecl, FunctionCall, Statement, Expression, ExpressionStatement, Binary, IntegerLiteral, DecimalLiteral, StringLiteral, Variable, ReturnStatement, IfStatement, Unary, ForStatement} from './ast';
import { assert } from 'console';
import { Op } from './scanner';
import { Type, FunctionType, SysTypes } from './types';

/**
 * 指令的编码
 */
enum OpCode{
    //不区分字节宽度的指令
    jmp=0,
    je,
    jne,
    jle,
    jl,
    jge,
    jg,

    sete=20,
    setne,
    setl,
    setle,
    setg,
    setge,

    //8字节指令
    movq=40,
    addq,
    subq,
    mulq,
    imulq,
    divq,
    idivq,
    negq,
    incq,
    decq,
    xorq,
    orq,
    andq,
    notq,
    leaq,
    callq,
    retq,
    pushq,
    popq,
    cmpq,

    //4字节指令
    movl=80,
    addl,
    subl,
    mull,
    imull,
    divl,
    idivl,
    negl,
    incl,
    decl,
    xorl,
    orl,
    andl,
    notl,
    leal,
    calll,
    retl,
    pushl,
    popl,
    cmpl,

    //2字节指令
    movw=120,
    addw,
    subw,
    mulw,
    imulw,
    divw,
    idivw,
    negw,
    incw,
    decw,
    xorw,
    orw,
    andw,
    notw,
    leaw,
    callw,
    retw,
    pushw,
    popw,
    cmpw,

    //单字节指令
    movb=160,
    addb,
    subb,
    mulb,   //无符号乘
    imulb,  //有符号乘
    divb,   //无符号除
    idivb,  //有符号除
    negb,
    incb,
    decb,
    xorb,
    orb,
    andb,
    notb,
    leab,
    callb,
    retb,
    pushb,
    popb,
    cmpb,
}

/**
 * 指令
 */
abstract class Inst{
    op:OpCode;
    constructor(op:OpCode){
        this.op = op;
    }
    abstract toString():string;
}

/**
 * 没有操作数的指令
 */
class Inst_0 extends Inst{
    constructor(op:OpCode){
        super(op);
    }
    toString():string{
        return OpCode[this.op];
    }
}

/**
 * 有一个操作数的指令
 */
class Inst_1 extends Inst{
    oprand:Oprand;
    constructor(op:OpCode,oprand:Oprand){
        super(op);
        this.oprand = oprand;
    }
    toString():string{
        return OpCode[this.op] + "\t" + this.oprand.toString();
    }
    static isInst_1(inst:Inst):boolean{
        return typeof (inst as Inst_1).oprand == 'object';
    }
}

/**
 * 有一个操作数的指令
 */
class Inst_2 extends Inst{
    oprand1:Oprand;
    oprand2:Oprand;
    constructor(op:OpCode,oprand1:Oprand,oprand2:Oprand){
        super(op);
        this.oprand1 = oprand1;
        this.oprand2 = oprand2;
    }
    toString():string{
        return OpCode[this.op] + "\t" + this.oprand1.toString() + ", " + this.oprand2.toString();
    }
    static isInst_2(inst:Inst):boolean{
        return typeof (inst as Inst_2).oprand1 == 'object';
    }
}

/**
 * 操作数
 */
class Oprand{
    kind:OprandKind;
    value:any;
    constructor(kind:OprandKind, value:any){
        this.kind = kind;
        this.value = value;
    }

    isSame(oprand1:Oprand):boolean{
        return this.kind == oprand1.kind && this.value == oprand1.value;
    }

    toString():string{
        if(this.kind == OprandKind.bb){
            return this.value;
        }
        else if (this.kind == OprandKind.immediate){
            return "$"+this.value;
        }
        else if (this.kind == OprandKind.returnSlot){
                return "returnSlot";
        }
        else{
            return OprandKind[this.kind] + "(" + this.value + ")";
        }
        
    }
}

class FunctionOprand extends Oprand{
    args:Oprand[];
    returnType:Type;
    constructor(funtionName:string, args:Oprand[], returnType:Type){
        super(OprandKind.function, funtionName);
        this.returnType = returnType;
        this.args = args;
    }

    toString():string{
        return "_"+this.value;
    }
}

/**
 * 操作数的类型
 */
enum OprandKind{
    //抽象度较高的操作数
    varIndex,       //变量下标
    returnSlot,     //用于存放返回值的位置（通常是一个寄存器）
    bb,             //跳转指令指向的基本块
    function,       //函数调用
    stringConst,    //字符串常量

    //抽象度较低的操作数
    register,       //物理寄存器
    memory,         //内存访问
    immediate,      //立即数

    //cmp指令的结果，是设置寄存器的标志位
    //后面可以根据flag和比较操作符的类型，来确定后续要生成的代码
    flag,
}

/**
 * 基本块
 */
class BasicBlock{
    insts:Inst[] = [];      //基本块内的指令

    funIndex:number = -1;   //函数编号
    bbIndex:number = -1;    //基本块的编号。在Lower的时候才正式编号，去除空块。
    isDestination:boolean = false;  //有其他块跳转到该块。

    getName():string{
        if (this.bbIndex != -1 && this.funIndex != -1){
            return "LBB" + this.funIndex+"_"+this.bbIndex;
        } 
        else{
            return "LBB";
        }
    }

    toString():string{
        let str;
        if (this.isDestination){
            str = this.getName()+":\n";
        }
        else{
            str = "## bb."+this.bbIndex+"\n";
        }

        for (let inst of this.insts){
            str += "    "+ inst.toString()+"\n";
        }

        return str;
    }
}

/**
 * 用Asm表示的一个模块。
 * 可以输出成为asm文件。
 */
export class AsmModule{
    //每个函数对应的指令数组
    fun2Code:Map<FunctionSymbol, BasicBlock[]> = new Map();

    //每个函数的变量数，包括参数、本地变量和临时变量
    numTotalVars:Map<FunctionSymbol, number> = new Map();

    //是否是叶子函数
    isLeafFunction:Map<FunctionSymbol, boolean> = new Map();

    //字符串常量
    stringConsts:string[] = [];

    /**
     * 输出代表该模块的asm文件的字符串。
     */
    toString():string{
        let str = "    .section	__TEXT,__text,regular,pure_instructions\n";  //伪指令：一个文本的section
        for (let fun of this.fun2Code.keys()){
            let funName = "_"+fun.name;
            str += "\n    .global "+funName+"\n";  //添加伪指令
            str += funName + ":\n";
            str += "    .cfi_startproc\n"; 
            let bbs = this.fun2Code.get(fun) as BasicBlock[];
            for (let bb of bbs){
                str += bb.toString();
            }
            str += "    .cfi_endproc\n";
        }
        return str;

    }
}

/**
 * AsmGenerator需要用到的状态变量
 */
class TempStates{
    //当前的函数，用于查询本地变量的下标
    functionSym:FunctionSymbol|null = null; 

    //当前函数生成的指令
    bbs:BasicBlock[] = [];

    //下一个临时变量的下标
    nextTempVarIndex:number = 0;

    //已经不再使用的临时变量，可以被复用
    //优先使用返回值寄存器，可以减少寄存器之间的拷贝
    deadTempVars:number[] = [];

    //每个表达式节点对应的临时变量的索引
    tempVarMap:Map<Expression, number> = new Map();

    //主要用于判断当前的Unary是一个表达式的一部分，还是独立的一个语句
    inExpression:boolean = false;

    //保存一元后缀运算符对应的指令。
    postfixUnaryInst:Inst_1|null = null;
}

/**
 * 汇编代码生成程序。
 * 这是一个比较幼稚的算法，使用了幼稚的寄存器分配算法，但已经尽量争取多使用寄存器，对于简单的函数已经能生成性能不错的代码。
 * 算法特点：
 * 1.先是尽力使用寄存器，寄存器用光以后就用栈桢；
 * 2.对于表达式，尽量复用寄存器来表示临时变量。
 */
export class AsmGenerator extends AstVisitor{
    //编译后的结果
    asmModule:AsmModule;

    //用来存放返回值的位置
    returnSlot:Oprand = new Oprand(OprandKind.returnSlot, -1);

    //一些状态变量
    s = new TempStates();

    constructor(){
        super();
        this.asmModule = new AsmModule();
    }

    /**
     * 分配一个临时变量的下标。尽量复用已经死掉的临时变量
     */
    private allocateTempVar():number{
        let varIndex:number;
        if (this.s.deadTempVars.length >0){
            varIndex = this.s.deadTempVars[this.s.deadTempVars.length-1];
            this.s.deadTempVars.pop();
        }
        else{
            varIndex = this.s.nextTempVarIndex++;
        }
        return varIndex;
    }

    private isTempVar(oprand:Oprand){
        if (this.s.functionSym!=null){
            return oprand.kind == OprandKind.varIndex && 
                oprand.value >= this.s.functionSym.vars.length;
        }
        else{
            return false;
        }
    }

    private isParamOrLocalVar(oprand:Oprand){
        if (this.s.functionSym!=null){
            return oprand.kind == OprandKind.varIndex && 
                oprand.value < this.s.functionSym.vars.length;
        }
        else{
            return false;
        }
    }

    /**
     * 如果操作数不同，则生成mov指令；否则，可以减少一次拷贝。
     * @param src 
     * @param dest 
     */
    private movIfNotSame(src:Oprand, dest:Oprand){
        if (!src.isSame(dest)){
            this.getCurrentBB().insts.push(new Inst_2(OpCode.movl,src,dest));
        }
    }

    private getCurrentBB():BasicBlock{
        return this.s.bbs[this.s.bbs.length-1];
    }

    private newBlock():BasicBlock{
        let bb = new BasicBlock();
        this.s.bbs.push(bb);
        
        return bb;
    }

    /**
     * 主函数
     * @param prog 
     */
    visitProg(prog:Prog):any{
        this.s.functionSym = prog.sym  as FunctionSymbol;
        this.s.nextTempVarIndex = this.s.functionSym.vars.length;

        //创建新的基本块
        this.newBlock();

        this.visitBlock(prog); 
        this.asmModule.fun2Code.set(this.s.functionSym, this.s.bbs);
        this.asmModule.numTotalVars.set(this.s.functionSym, this.s.nextTempVarIndex);

        return this.asmModule;
    }

    visitFunctionDecl(functionDecl:FunctionDecl):any{
        //保存原来的状态信息
        let s = this.s;

        //新建立状态信息
        this.s = new TempStates();
        this.s.functionSym = functionDecl.sym as FunctionSymbol;       
        this.s.nextTempVarIndex = this.s.functionSym.vars.length;

        //计算当前函数是不是叶子函数
        //先设置成叶子变量。如果遇到函数调用，则设置为false。
        this.asmModule.isLeafFunction.set(this.s.functionSym as FunctionSymbol, true);

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
    visitReturnStatement(returnStatement:ReturnStatement):any{
        if (returnStatement.exp!=null){
            let ret = this.visit(returnStatement.exp) as Oprand;
            //把返回值赋给相应的寄存器
            this.movIfNotSame(ret,this.returnSlot);
        }
        // this.getCurrentBB().insts.push(new Inst_0(OpCode.retl));
    }

    visitIfStatement(ifStmt:IfStatement):any{
        //条件
        let bbCondition = this.getCurrentBB();
        let compOprand = this.visit(ifStmt.condition) as Oprand;

        //if块
        let bbIfBlcok = this.newBlock();
        this.visit(ifStmt.stmt);
        
        //else块
        let bbElseBlock:BasicBlock|null = null
        if (ifStmt.elseStmt != null){
            bbElseBlock = this.newBlock();
            this.visit(ifStmt.elseStmt);
        }

        //最后，要新建一个基本块,用于If后面的语句。
        let bbFollowing = this.newBlock();

        //为bbCondition添加跳转语句
        let op = this.getJumpOpCode(compOprand);
        let instConditionJump:Inst_1;
        if (bbElseBlock !=null){
            //跳转到else块
            instConditionJump = new Inst_1(op,new Oprand(OprandKind.bb, bbElseBlock));
        }
        else{
            //跳转到if之后的块
            instConditionJump = new Inst_1(op,new Oprand(OprandKind.bb, bbFollowing));
        }
        bbCondition.insts.push(instConditionJump);

        //为bbIfBlock添加跳转语句
        if (bbElseBlock !=null){  //如果没有else块，就不需要添加跳转了。
            let instIfBlockJump = new Inst_1(OpCode.jmp,new Oprand(OprandKind.bb, bbFollowing));
            bbIfBlcok.insts.push(instIfBlockJump);
        }
    }
    
    /**
     * 根据条件表达式的操作符，确定该采用的跳转指令。用于if语句和for循环等中。
     * @param compOprand 
     */
    private getJumpOpCode(compOprand:Oprand):OpCode{
        let op:OpCode = OpCode.jmp;
        if (compOprand.value == Op.G){
            op = OpCode.jg;
        }
        else if (compOprand.value == Op.GE){
            op = OpCode.jge;
        }
        else if (compOprand.value == Op.L){
            op = OpCode.jl;
        }
        else if (compOprand.value == Op.LE){
            op = OpCode.jle;
        }
        else if (compOprand.value == Op.EQ){
            op = OpCode.je;
        }
        else if (compOprand.value == Op.NE){
            op = OpCode.jne;
        }
        else{
            console.log("Unsupported compare operand in conditional expression: " + compOprand.value);
        }
        return op;
    }

    visitForStatement(forStmt:ForStatement):any{
        //初始化，放到前一个BasicBlock中
        if (forStmt.init != null){
            this.visit(forStmt.init);
        }

        //condition
        let bbCondition = this.newBlock();
        let compOprand:Oprand|null = null;
        if (forStmt.condition != null){
            compOprand = this.visit(forStmt.condition) as Oprand;
        }

        //循环体
        let bbBody = this.newBlock();
        this.visit(forStmt.stmt);

        //增长语句，跟循环体在同一个BasicBlock中
        if(forStmt.increment != null){
            this.visit(forStmt.increment);
        }

        //最后，要新建一个基本块,用于If后面的语句。
        let bbFollowing = this.newBlock();

        //为bbCondition添加跳转语句
        if(compOprand != null){  //如果没有循环条件，就会直接落到循环体中
            let op = this.getJumpOpCode(compOprand);
            let instConditionJump= new Inst_1(op,new Oprand(OprandKind.bb, bbFollowing));
            bbCondition.insts.push(instConditionJump);
        }
 
        //为循环体添加跳转语句
        let bbDest:BasicBlock;
        if (compOprand !=null){  
            bbDest = bbCondition;  //去执行循环条件
        } 
        else{   //如果没有循环条件，就直接回到循环体的第一句
            bbDest = bbBody;
        }
        let instBodyJump = new Inst_1(OpCode.jmp,new Oprand(OprandKind.bb, bbDest));
        bbBody.insts.push(instBodyJump);

    }

    visitVariableDecl(variableDecl:VariableDecl):any{
        if(this.s.functionSym !=null){
            let right:Oprand|null = null;
            if (variableDecl.init != null){
                right = this.visit(variableDecl.init) as Oprand;
            }
            let varIndex = this.s.functionSym.vars.indexOf(variableDecl.sym as VarSymbol);
            let left = new Oprand(OprandKind.varIndex,varIndex);

            //插入一条抽象指令，代表这里声明了一个变量
            this.getCurrentBB().insts.push(new Inst_1(OpCode.declVar,left));

            //赋值
            if (right) this.movIfNotSame(right, left);

            return left;
        }
    }

    /**
     * 二元表达式
     * @param bi 
     */
    visitBinary(bi:Binary):any{
        this.s.inExpression = true;

        let insts = this.getCurrentBB().insts;

        //左子树返回的操作数
        let left = this.visit(bi.exp1) as Oprand;

        //右子树
        let right = this.visit(bi.exp2) as Oprand;

        assert(typeof left == 'object', "表达式没有返回Oprand。");
        assert(typeof right == 'object', "表达式没有返回Oprand。");

        //计算出一个目标操作数
        let dest: Oprand = left;

        if (!this.isTempVar(dest)){
            dest = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            insts.push(new Inst_2(OpCode.movl, left, dest));
        }

        //释放掉不用的临时变量
        if (this.isTempVar(right)){
            this.s.deadTempVars.push(right.value);
        }

        //生成指令
        //todo 有问题的地方
        switch(bi.op){
            case Op.Plus: //'+'
                if (bi.theType === SysTypes.String){ //字符串加
                    let args:Oprand[] = [];
                    args.push(left);
                    args.push(right);
                    this.callIntrinsics("string_concat", args);
                }
                else{
                    // this.movIfNotSame(left,dest);
                    insts.push(new Inst_2(OpCode.addl,right, dest));
                }
                break;
            case Op.Minus: //'-'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCode.subl,right, dest));
                break;
            case Op.Multiply: //'*'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCode.imull,right, dest));
                break;
            case Op.Divide: //'/'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCode.idivl,right, dest));
                break;
            case Op.Assign: //'='
                // this.movIfNotSame(right,left);
                insts.push(new Inst_2(OpCode.movl,right, dest));
                this.movIfNotSame(dest,left);    //写到内存里去
                break;
            case Op.G:    
            case Op.L:
            case Op.GE:
            case Op.LE:
            case Op.EQ:      
            case Op.NE: 
                insts.push(new Inst_2(OpCode.cmpl, right, dest)); 
                dest = new Oprand(OprandKind.flag, this.getOpsiteOp(bi.op));
                break;      
            default:
                console.log("Unsupported OpCode in AsmGenerator.visitBinary: "+Op[bi.op]);
        }

        this.s.inExpression = false;

        return dest;
    }

    private getOpsiteOp(op:Op):Op{
        let newOp:Op = op;
        switch(op){
            case Op.G:    
                newOp = Op.LE;
                break;
            case Op.L:
                newOp = Op.GE;
                break;
            case Op.GE:
                newOp = Op.L;
                break;
            case Op.LE:
                newOp = Op.G;
                break;
            case Op.EQ:      
                newOp = Op.NE;
                break;
            case Op.NE: 
                newOp = Op.EQ;
                break;
            default:
                console.log("Unsupport Op '"+ Op[op] + "' in getOpsiteOpCode.");
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
    visitUnary(u:Unary):any{
        let insts = this.getCurrentBB().insts;

        let oprand = this.visit(u.exp) as Oprand;

        //用作返回值的Oprand
        let result:Oprand = oprand;  

        //++和--
        if(u.op == Op.Inc || u.op == Op.Dec){
            let tempVar = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            insts.push(new Inst_2(OpCode.movl, oprand, tempVar));
            if(u.isPrefix){  //前缀运算符
                result = tempVar;
            }
            else{  //后缀运算符
                //把当前操作数放入一个临时变量作为返回值
                result = new Oprand(OprandKind.varIndex, this.allocateTempVar());
                insts.push(new Inst_2(OpCode.movl, oprand, result));
                this.s.deadTempVars.push(tempVar.value);
            }
            //做+1或-1的运算
            let opCode = u.op == Op.Inc ? OpCode.addl : OpCode.subl;
            insts.push(new Inst_2(opCode, new Oprand(OprandKind.immediate,1), tempVar));
            insts.push(new Inst_2(OpCode.movl, tempVar, oprand));
        }
        //+
        else if (u.op == Op.Plus){
            result = oprand;
        }
        //-
        else if (u.op == Op.Minus){
            let tempVar = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            //用0减去当前值
            insts.push(new Inst_2(OpCode.movl, new Oprand(OprandKind.immediate,0), tempVar));
            insts.push(new Inst_2(OpCode.subl, oprand, tempVar));
            result = tempVar;
            if (this.isTempVar(oprand)){
                this.s.deadTempVars.push(oprand.value);
            }
        }

        return result;
    }

    visitExpressionStatement(stmt:ExpressionStatement):any{
        //先去为表达式生成指令
        super.visitExpressionStatement(stmt);
    }

    visitVariable(variable:Variable):any{
        if (this.s.functionSym !=null && variable.sym!=null){
            return new Oprand(OprandKind.varIndex, this.s.functionSym.vars.indexOf(variable.sym));
        }
    }

    visitIntegerLiteral(integerLiteral:IntegerLiteral):any{
        return new Oprand(OprandKind.immediate, integerLiteral.value);
    }

    visitStringLiteral(stringLiteral:StringLiteral):any{
        //加到常数表里
        let strIndex = this.asmModule.stringConsts.indexOf(stringLiteral.value);
        if( strIndex == -1){
            this.asmModule.stringConsts.push(stringLiteral.value);
            strIndex = this.asmModule.stringConsts.length - 1;
        }

        //调用一个内置函数来创建PlayString
        let args:Oprand[] = [];
        args.push(new Oprand(OprandKind.stringConst, strIndex));
        return this.callIntrinsics("string_create_by_str", args);
    }

    private callIntrinsics(intrinsic:string, args:Oprand[]):any{
        let insts = this.getCurrentBB().insts;

        let functionSym = intrinsics.get("string_create_by_str") as FunctionSymbol;
        let functionType = functionSym.theType as FunctionType;

        insts.push(new Inst_1(OpCode.callq, new FunctionOprand("string_create_by_str", args,functionType.returnType)));

        //把结果放到一个新的临时变量里
        if(functionType.returnType != SysTypes.Void){ //函数有返回值时
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
    visitFunctionCall(functionCall:FunctionCall):any{
        //当前函数不是叶子函数
        this.asmModule.isLeafFunction.set(this.s.functionSym as FunctionSymbol, false);

        let insts = this.getCurrentBB().insts;

        let args:Oprand[] = [];
        for(let arg of functionCall.arguments){
            let oprand = this.visit(arg) as Oprand;
            args.push(oprand);
        }

        let functionSym = functionCall.sym as FunctionSymbol;
        let functionType = functionSym.theType as FunctionType;

        insts.push(new Inst_1(OpCode.callq, new FunctionOprand(functionCall.name, args,functionType.returnType)));

        //把结果放到一个新的临时变量里
        if(functionType.returnType != SysTypes.Void){ //函数有返回值时
            let dest = new Oprand(OprandKind.varIndex, this.allocateTempVar());
            insts.push(new Inst_2(OpCode.movl, this.returnSlot, dest));
            return dest;
        }
    }
}

///////////////////////////////////////////////////////////////////////////
//Lower
class Register extends Oprand{
    bits:32|64 = 32;  //寄存器的位数
    
    private constructor(registerName:string, bits:32|64=32){
        super(OprandKind.register,registerName);
        this.bits = bits;
    }

    //可供分配的寄存器的数量
    //16个通用寄存器中，扣除rbp和rsp，然后保留一个寄存器，用来作为与内存变量交换的区域。
    static numAvailableRegs = 13;

    //32位寄存器
    //参数用的寄存器，当然也要由caller保护
    static edi = new Register("edi");
    static esi = new Register("esi");
    static edx = new Register("edx");
    static ecx = new Register("ecx");
    static r8d = new Register("r8d");
    static r9d = new Register("r9d");
    
    //通用寄存器:caller（调用者）负责保护
    static r10d = new Register("r10d");
    static r11d = new Register("r11d");

    //返回值，也由Caller保护
    static eax = new Register("eax");

    //通用寄存器:callee（调用者）负责保护
    static ebx = new Register("ebx");
    static r12d = new Register("r12d");
    static r13d = new Register("r13d");
    static r14d = new Register("r14d");
    static r15d = new Register("r15d");   

    //栈顶和栈底
    static esp = new Register("esp");
    static ebp = new Register("ebp");

    //32位的可供分配的寄存器
    static registers32:Register[] = [
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
    static paramRegisters32:Register[] = [
        Register.edi,
        Register.esi,
        Register.edx,
        Register.ecx,
        Register.r8d,
        Register.r9d,
    ];

    //Callee保护的寄存器
    static calleeProtected32:Register[] = [
        Register.ebx,
        Register.r12d,
        Register.r13d,
        Register.r14d,
        Register.r15d,
    ];

    //Caller保护的寄存器
    static callerProtected32:Register[] = [
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
    static rdi = new Register("rdi",64);
    static rsi = new Register("rsi",64);
    static rdx = new Register("rdx",64);
    static rcx = new Register("rcx",64);
    static r8 = new Register("r8",64);
    static r9 = new Register("r9",64);

    //通用寄存器:caller（调用者）负责保护
    static r10 = new Register("r10",64);
    static r11 = new Register("r11",64);

    //返回值，也由Caller保护
    static rax = new Register("rax",64);

    //通用寄存器:callee（调用者）负责保护
    static rbx = new Register("rbx",64);
    static r12 = new Register("r12",64);
    static r13 = new Register("r13",64);
    static r14 = new Register("r14",64);
    static r15 = new Register("r15",64);

    //栈顶和栈底
    static rsp = new Register("rsp",64);
    static rbp = new Register("rbp",64);

    //64位的可供分配的寄存器
    static registers64:Register[] = [
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
    static calleeProtected64:Register[] = [
        Register.rbx,
        Register.r12,
        Register.r13,
        Register.r14,
        Register.r15,
    ];

    //Caller保护的寄存器
    static callerProtected64:Register[] = [
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
  
    toString():string{
        return "%"+this.value;
    }
}

/**
 * 内存寻址
 * 这是个简化的版本，只支持基于寄存器的偏移量
 * 后面根据需要再扩展。
 */
class MemAddress extends Oprand{
    register:Register;
    offset:number;
    constructor(register:Register, offset:number){
        super(OprandKind.memory,'undefined')
        this.register = register;
        this.offset = offset;
    }
    toString():string{
        //输出结果类似于：8(%rbp)
        //如果offset为0，那么不显示，即：(%rbp)
        return (this.offset == 0 ? "" : this.offset) + "("+this.register.toString()+")";
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

 class Lower{
     //前一步生成的LIR模型
    asmModule:AsmModule;

    //当前函数使用到的那些Caller保护的寄存器
    usedCallerProtectedRegs:Register[] = [];
    
    //当前函数使用到的那些Callee保护的寄存器
    usedCalleeProtectedRegs:Register[] = [];

    //所有变量的总数，包括参数、本地变量和临时变量
    numTotalVars = 0;

    //当前函数的参数数量
    numParams = 0;

    //当前函数的本地变量数量
    numLocalVars = 0;

    //临时变量的数量
    numTempVars = 0;

    //保存已经被Lower的Oprand，用于提高效率
    lowedVars:Map<number,Oprand> = new Map();

    //需要在栈里保存的为函数传参（超过6个之后的参数）保留的空间，每个参数占8个字节
    numArgsOnStack = 0;

    //rsp应该移动的量。这个量再加8就是该函数所对应的栈桢的大小，其中8是callq指令所压入的返回地址
    rspOffset = 0;

    //是否使用RedZone，也就是栈顶之外的128个字节
    canUseRedZone = false;

    //已被分配的寄存器
    allocatedRegisters:Map<Register,number> = new Map();

    constructor(asmModule:AsmModule){
        this.asmModule = asmModule;
    }

    lowerModule() {
        let newFun2Code:Map<FunctionSymbol, BasicBlock[]> = new Map();
        let funIndex = 0;
        for (let fun of this.asmModule.fun2Code.keys()){
            let bbs = this.asmModule.fun2Code.get(fun) as BasicBlock[];
            let newBBs = this.lowerFunction(fun, bbs, funIndex++);
            newFun2Code.set(fun,newBBs);
        }
        this.asmModule.fun2Code = newFun2Code;
    }

    private lowerFunction(functionSym:FunctionSymbol, bbs:BasicBlock[], funIndex:number):BasicBlock[]{
        //初始化一些状态变量
        this.initStates(functionSym);

        //分配寄存器
        this.lowerVars();

        // console.log(this);   //打印一下，看看状态变量是否对。

        //lower每个BasicBlock中的指令
        for (let i = 0; i< bbs.length; i++){
            let bb = bbs[i];
            let newInsts:Inst[] = [];
            this.lowerInsts(bb.insts, newInsts);
            bb.insts = newInsts;
        }

        //添加序曲
        bbs[0].insts = this.addPrologue(bbs[0].insts);

        //添加尾声
        this.addEpilogue(bbs[bbs.length-1].insts);

        //基本块的标签和跳转指令。
        let newBBs = this.lowerBBLabelAndJumps(bbs,funIndex);

        return newBBs;
    }

    /**
     * 初始化当前函数的一些状态变量，在算法中会用到它们
     * @param functionSym 
     */
    private initStates(functionSym:FunctionSymbol){
        this.usedCalleeProtectedRegs=[];
        this.usedCallerProtectedRegs=[];
        this.numTotalVars = this.asmModule.numTotalVars.get(functionSym) as number;
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
        let isLeafFunction = this.asmModule.isLeafFunction.get(functionSym) as boolean;       
        if (isLeafFunction){
            let paramsToSave = this.numParams>6? 6: this.numParams;
            let bytes = paramsToSave*4 + this.numLocalVars*4 + this.saveCalleeProtectedRegs.length*8;
            this.canUseRedZone = bytes < 128;
        }
        
    }

    /**
     * 把变量下标转换成内存地址或寄存器
     * @param functionSym 
     */
    private lowerVars(){
        let paramsToSave = this.numParams>6? 6: this.numParams;

        //处理参数
        for (let varIndex:number = 0; varIndex<this.numTotalVars; varIndex++){
            let newOprand:Oprand;
            if (varIndex < this.numParams){
                if (varIndex < 6){
                    //从自己的栈桢里访问。在程序的序曲里，就把这些变量拷贝到栈里了。
                    let offset = -(varIndex + 1) *4; 
                    newOprand = new MemAddress(Register.rbp,offset); 
                }
                else{
                    //从Caller的栈里访问参数
                    let offset = (varIndex - 6)*8 + 16;  //+16是因为有一个callq压入的返回地址，一个pushq rbp又加了8个字节
                    newOprand = new MemAddress(Register.rbp,offset);        
                }   
            }
            //本地变量，在栈桢里。
            else if (varIndex < this.numParams + this.numLocalVars) {
                let offset = -(varIndex - this.numParams + paramsToSave + 1)*4;
                newOprand = new MemAddress(Register.rbp,offset);
            }
            //临时变量，分配寄存器
            else{
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
    private allocateRegister(varIndex:number):Register{
        for (let reg of Register.registers32){
            if (!this.allocatedRegisters.has(reg)){
                this.allocatedRegisters.set(reg, varIndex);

                //更新usedCalleeProtectedRegs
                if(Register.calleeProtected32.indexOf(reg) != -1){
                    this.usedCalleeProtectedRegs.push(reg);
                }
                //更新usedCallerProtectedRegs
                else if (Register.callerProtected32.indexOf(reg) != -1){
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
    private reserveReturnSlot(){
        this.allocatedRegisters.set(Register.eax, -1);  //给予一个特殊的变量下标，-1
    }

    /**
     * 归还已经分配的寄存器
     * @param reg 
     */
    private freeRegister(reg:Register){
        if (this.allocatedRegisters.has(reg))
            this.allocatedRegisters.delete(reg);

        let index = this.usedCalleeProtectedRegs.indexOf(reg);
        if (index != -1)
            this.usedCalleeProtectedRegs.splice(index,1);
    
        index = this.usedCallerProtectedRegs.indexOf(reg);
        if (index != -1)
            this.usedCallerProtectedRegs.splice(index,1);
    }


    //添加序曲
    private addPrologue(insts:Inst[]):Inst[]{
        let newInsts:Inst[] = [];

        //保存rbp的值
        newInsts.push(new Inst_1(OpCode.pushq, Register.rbp));

        //把原来的栈顶保存到rbp,成为现在的栈底
        newInsts.push(new Inst_2(OpCode.movq, Register.rsp, Register.rbp));

        //把前6个参数存到栈桢里
        let paramsToSave = this.numParams>6? 6: this.numParams;
        for (let i = 0; i<paramsToSave; i++){
            let offset = -(i+1) * 4;
            newInsts.push(new Inst_2(OpCode.movl, Register.paramRegisters32[i], new MemAddress(Register.rbp, offset)));
        }

        //计算栈顶指针需要移动多少位置
        //要保证栈桢16字节对齐
        if (!this.canUseRedZone){
            this.rspOffset = paramsToSave*4 + this.numLocalVars*4 + this.usedCallerProtectedRegs.length*4 + this.numArgsOnStack*8 + 16;
            //当前占用的栈空间，还要加上Callee保护的寄存器占据的空间
            let rem = (this.rspOffset + this.usedCalleeProtectedRegs.length*8)%16;
            // console.log("this.rspOffset="+this.rspOffset);
            // console.log("rem="+rem);

            if(rem == 8){
                this.rspOffset += 8;
            }
            else if ( rem == 4){
                this.rspOffset += 12;
            }
            else if (rem == 12){
                this.rspOffset += 4;
            }
            // console.log("this.rspOffset="+this.rspOffset);

            if(this.rspOffset > 0)
                newInsts.push(new Inst_2(OpCode.subq, new Oprand(OprandKind.immediate,this.rspOffset), Register.rsp));
        }

        //保存Callee负责保护的寄存器
        this.saveCalleeProtectedRegs(newInsts);

        //合并原来的指令
        newInsts = newInsts.concat(insts);

        return newInsts;
    }

    //添加尾声
    private addEpilogue(newInsts:Inst[]){
        //恢复Callee负责保护的寄存器
        this.restoreCalleeProtectedRegs(newInsts);

        //缩小栈桢
        if (!this.canUseRedZone && this.rspOffset > 0){
            newInsts.push(new Inst_2(OpCode.addq, new Oprand(OprandKind.immediate,this.rspOffset), Register.rsp));
        }

        //恢复rbp的值
        newInsts.push(new Inst_1(OpCode.popq, Register.rbp));

        //返回
        newInsts.push(new Inst_0(OpCode.retq));
    }
    
     //去除空的BasicBlock，给BasicBlock编号，把jump指令也lower
     private lowerBBLabelAndJumps(bbs:BasicBlock[], funIndex:number):BasicBlock[]{
        let newBBs:BasicBlock[] = [];
        let bbIndex = 0;
        //去除空的BasicBlock，并给BasicBlock编号
        for (let i = 0; i< bbs.length; i++){
            let bb = bbs[i];
            //如果是空的BasicBlock，就跳过
            if (bb.insts.length>0){
                bb.funIndex = funIndex;
                bb.bbIndex = bbIndex++;
                newBBs.push(bb);
            }
            else{
                //如果有一个BasicBlock指向该block，那么就指向下一个block;
                for (let j = 0; j< newBBs.length;j++){
                    let lastInst = newBBs[j].insts[newBBs[j].insts.length-1];
                    if (lastInst.op<20){
                        let jumpInst = lastInst as Inst_1;
                        let destBB = jumpInst.oprand.value as BasicBlock;
                        if (destBB == bb){
                            jumpInst.oprand.value = bbs[i+1];
                        }
                    }
                }
            }
        }

        //把jump指令的操作数lower一下,从BasicBlock变到标签
        for (let i = 0; i<newBBs.length;i++){
            let insts = newBBs[i].insts;
            let lastInst = insts[insts.length-1];
            if (lastInst.op<20){ //jump指令
                let jumpInst = lastInst as Inst_1;
                let bbDest = jumpInst.oprand.value as BasicBlock;
                jumpInst.oprand.value = bbDest.getName();
                bbDest.isDestination = true;  //有其他block跳到这个block
            }
        }

        return newBBs;
    }


    /**
     * Lower指令
     * @param insts 
     * @param newInsts 
     */
    private lowerInsts(insts:Inst[], newInsts:Inst[]){
        for(let i = 0; i < insts.length; i++){
            let inst = insts[i];
            //两个操作数
            if (Inst_2.isInst_2(inst)){
                let inst_2 = inst as Inst_2;
                inst_2.oprand1 = this.lowerOprand(inst_2.oprand1);
                inst_2.oprand2 = this.lowerOprand(inst_2.oprand2);

                //对mov再做一次优化
                if (!(inst_2.op == OpCode.movl && inst_2.oprand1 == inst_2.oprand2)){
                    newInsts.push(inst_2);
                }
            }
            //1个操作数
            else if (Inst_1.isInst_1(inst)){
                let inst_1 = inst as Inst_1;
                inst_1.oprand = this.lowerOprand(inst_1.oprand);

                //处理函数调用
                //函数调用前后，要设置参数；
                if (inst_1.op == OpCode.callq){
                    this.lowerFunctionCall(inst_1, newInsts);
                }
                else{
                    newInsts.push(inst_1);
                }
            }
            //没有操作数
            else{
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
    private lowerFunctionCall(inst_1:Inst_1, newInsts:Inst[]){
        let functionOprand = inst_1.oprand as FunctionOprand;
        let args = functionOprand.args;

        //需要在栈桢里为传参保留的空间
        let numArgs = args.length;
        if(numArgs > 6 && numArgs-6> this.numArgsOnStack){
            this.numArgsOnStack = numArgs-6;
        }

        //保存Caller负责保护的寄存器
        let paramsToSave = this.numParams>6? 6: this.numParams;
        let offset = -(paramsToSave + this.numLocalVars + 1) * 4;
        let spilledTempVars:number[]= [];
        let spilledRegs:Register[] = [];
        for (let i = 0; i< this.usedCallerProtectedRegs.length; i++){
            let reg = this.usedCallerProtectedRegs[i];
            newInsts.push(new Inst_2(OpCode.movl, reg, new MemAddress(Register.rbp, offset-i*4)));
            let varIndex = this.allocatedRegisters.get(reg) as number;
            spilledRegs.push(reg);
            spilledTempVars.push(varIndex);
        }
        for (let reg of spilledRegs){  //这个一定要单起一个循环
            this.freeRegister(reg);
        }

        //把前6个参数设置到寄存器
        for (let j = 0; j < numArgs && j<6; j++){
            let regSrc = this.lowerOprand(args[j]);
            let regDest = Register.paramRegisters32[j];  
            if (regDest !== regSrc)
                newInsts.push(new Inst_2(OpCode.movl, regSrc, regDest));
        }

        //超过6个之后的参数是放在栈桢里的，并要移动栈顶指针
        if(args.length > 6){
            //参数是倒着排的。
            //栈顶是参数7，再往上，依次是参数8、参数9...
            //在Callee中，会到Caller的栈桢中去读取参数值
            for(let j = 6; j < numArgs; j++){
                let offset = (j-6)*8; 
                newInsts.push(new Inst_2(OpCode.movl, functionOprand.args[j], new MemAddress(Register.rsp, offset)));
            }
        }

        //调用函数，修改操作数为functionName
        newInsts.push(inst_1);

        //为返回值预留eax寄存器
        this.reserveReturnSlot();

        //恢复Caller负责保护的寄存器
        for (let i = 0; i < spilledTempVars.length; i++){
            let varIndex = spilledTempVars[i];
            let reg = this.allocateRegister(varIndex);
            newInsts.push(new Inst_2(OpCode.movl, new MemAddress(Register.rbp, offset-i*4), reg));
            this.lowedVars.set(varIndex,reg);
        }
    }

    /**
     * Lower操作数
     * 主要任务是做物理寄存器的分配。
     * @param oprand 
     */
    private lowerOprand(oprand:Oprand):Oprand{
        let newOprand = oprand;
        if(oprand.kind == OprandKind.varIndex){
            let varIndex:number = oprand.value as number;  
            return this.lowedVars.get(varIndex) as Oprand; 
        }
        else if (oprand.kind == OprandKind.returnSlot){
            newOprand = Register.eax;
        }

        return newOprand;
    }

    private saveCalleeProtectedRegs(newInsts:Inst[]){
        for (let i = 0; i< this.usedCalleeProtectedRegs.length; i++){
            let regIndex = Register.calleeProtected32.indexOf(this.usedCalleeProtectedRegs[i]);
            let reg64 = Register.calleeProtected64[regIndex];
            newInsts.push(new Inst_1(OpCode.pushq, reg64));
        }
    }

    private restoreCalleeProtectedRegs(newInsts:Inst[]){
        for (let i=this.usedCalleeProtectedRegs.length-1; i>=0; i--){
            let regIndex = Register.calleeProtected32.indexOf(this.usedCalleeProtectedRegs[i]);
            let reg64 = Register.calleeProtected64[regIndex];
            newInsts.push(new Inst_1(OpCode.popq, reg64));
        }
    }

}

export function compileToAsm(prog:Prog, verbose:boolean):string{
    let asmGenerator = new AsmGenerator();

    //生成LIR
    let asmModule = asmGenerator.visit(prog) as AsmModule;

    if (verbose){
        console.log("在Lower之前：");
        console.log(asmModule.toString());
    }

    //Lower
    let lower = new Lower(asmModule);
    lower.lowerModule();

    let asm = asmModule.toString();
    if (verbose){
        console.log("在Lower之后：");
        console.log(asm);
    }

    return asm;
}

/**
 * 变量活跃性分析
 */
class LivenessAnalyzer{
    asmModule:AsmModule;
    constructor(asmModule:AsmModule){
        this.asmModule = asmModule;
    }

    execute():Map<Inst, number[]>{
        let result:Map<Inst, number[]> = new Map();

        let funIndex = 0;
        for (let fun of this.asmModule.fun2Code.keys()){
            let bbs = this.asmModule.fun2Code.get(fun) as BasicBlock[];
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
    private analyzeFunction(fun:FunctionSymbol, bbs:BasicBlock[], funIndex:number, result:Map<Inst, number[]>){

    }

    private analyzeBasicBlock(fun:FunctionSymbol, insts:Inst[], funIndex:number, result:Map<Inst, number[]>):boolean{
        let changed = false;

        for (let i = insts.length - 1; i >=0; i--){
            let inst = insts[i];
            switch(inst.op){
                // case
            }
        }

        return changed;
    }

}

