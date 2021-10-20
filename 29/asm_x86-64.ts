/**
 * 生成X64机器的指令
 * @version 0.2
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-27
 *  
 */

import {FunctionSymbol, VarSymbol, built_ins} from './symbol'
import {AstVisitor, AstNode, Block, Prog, VariableDecl, FunctionDecl, FunctionCall, Statement, Expression, ExpressionStatement, Binary, IntegerLiteral, DecimalLiteral, StringLiteral, Variable, ReturnStatement, IfStatement, Unary, ForStatement, ArrayLiteral, IndexedExp} from './ast';
import { assert } from 'console';
import { Op } from './scanner';
import { Type, FunctionType, SysTypes, TypeUtil, ArrayType } from './types';
import {TailAnalyzer, TailAnalysisResult} from './tail';

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
    jbe,
    jb,
    jae,
    ja,

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

    //SSE指令
    movsd = 200,
    addsd,
    subsd,
    mulsd,
    divsd,
    sqrtsd,
    maxsd,
    minsd,
    cmpsd,
    comisd,
    ucomisd,

    cvttsd2si = 240,  //double 到long或int都可以，会导致截断, 第一个操作数可以是内存
    cvtsi2sdq,        //从long到double


    //伪指令
    declVar = 300,       //变量声明
    reload,        //重新装载被溢出到内存的变量到寄存器
    tailRecursive, //尾递归的函数调用
    tailCall,      //尾调用
    tailRecursiveJmp, //尾递归产生的jmp指令，操作数是一个基本块，是序曲下的第一个基本块。
    tailCallJmp,      //尾调用产生的jmp指令，操作数是一个字符串（标签）
}

//根据数据类型来获取正确的操作码和寄存器
class OpCodeUtil{
    static isReturn(op:OpCode){
        return op == OpCode.retb || op == OpCode.retw || op == OpCode.retl ||  op == OpCode.retq; 
    }

    static isJump(op:OpCode){
        return op<20;
    }

    static adds:OpCode[] = [OpCode.addl, OpCode.addq, OpCode.addsd];
    static subs:OpCode[] = [OpCode.subl, OpCode.subq, OpCode.subsd];
    static muls:OpCode[] = [OpCode.mull, OpCode.imulq, OpCode.mulsd];
    static divs:OpCode[] = [OpCode.divl, OpCode.divq, OpCode.divsd];  //todo：长整型的div指令待定
    static movs:OpCode[] = [OpCode.movl, OpCode.movq, OpCode.movsd];  
    static cmps:OpCode[] = [OpCode.cmpl, OpCode.cmpq, OpCode.ucomisd];
    static jgs:OpCode[] = [OpCode.jg, OpCode.jg, OpCode.ja];
    static jges:OpCode[] = [OpCode.jge, OpCode.jge, OpCode.jae];
    static jls:OpCode[] = [OpCode.jl, OpCode.jl, OpCode.jb];
    static jles:OpCode[] = [OpCode.jle, OpCode.jle, OpCode.jbe];  

    static isMov(op:OpCode):boolean{
        return OpCodeUtil.movs.indexOf(op) != -1;
    }
    
    static movOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.movs[dataType];
    }

    static addOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.adds[dataType];
    }

    static subOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.subs[dataType];
    }

    static mulOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.muls[dataType];
    }

    static divOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.divs[dataType];
    }

    static cmpOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.cmps[dataType];
    }

    static jgOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.jgs[dataType];
    }

    static jgeOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.jges[dataType];
    }

    static jlOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.jls[dataType];
    }

    static jleOp(dataType:CpuDataType):OpCode{
        return OpCodeUtil.jles[dataType];
    }
}


/**
 * 指令
 */
abstract class Inst{
    op:OpCode;
    numOprands:0|1|2;
    comment:string|null; //这条指令的注释
    constructor(op:OpCode, numOprands:0|1|2, comment:string|null=null){
        this.op = op;
        this.numOprands = numOprands;
        this.comment = comment;
    }
    abstract toString():string;
    patchComments(str:string):string{
        if(this.comment != null){
            if (str.length<11) 
                str+="\t\t\t";
            else if (str.length<19) 
                str+="\t\t";
            else if (str.length<21)
                str+="\t"
            str += (this.comment==null ? "" : "\t\t#  "+this.comment);
        }
        return str;
    }
}

/**
 * 没有操作数的指令
 */
class Inst_0 extends Inst{
    constructor(op:OpCode, comment:string|null=null){
        super(op,0,comment);
    }
    toString():string{
        let str = OpCode[this.op];
        return this.patchComments(str);
    }
}

/**
 * 有一个操作数的指令
 */
class Inst_1 extends Inst{
    oprand:Oprand;
    constructor(op:OpCode,oprand:Oprand,comment:string|null=null){
        super(op,1,comment);
        this.oprand = oprand;
    }
    toString():string{
        let str = OpCode[this.op] + "\t" + this.oprand.toString();
        return this.patchComments(str);
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
    constructor(op:OpCode,oprand1:Oprand,oprand2:Oprand,comment:string|null=null){
        super(op,2,comment);
        this.oprand1 = oprand1;
        this.oprand2 = oprand2;
    }
    toString():string{
        let str = OpCode[this.op] + "\t" + this.oprand1.toString() + ", " + this.oprand2.toString();    
        return this.patchComments(str);
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
            let b = this.value as BasicBlock;
            return b.getName();
        }
        else if (this.kind == OprandKind.label){
            return this.value;
        }
        else if (this.kind == OprandKind.immediate){
            return "$"+this.value;
        }
        else{
            return OprandKind[this.kind] + "(" + this.value + ")";
        }
        
    }
}

class VarOprand extends Oprand{
    dataType:CpuDataType;
    varName:string;
    constructor(index:number,varName:string ,dataType:CpuDataType){
        super(OprandKind.varIndex, index);
        this.dataType = dataType;
        this.varName = varName;
    }

    toString():string{
        return "var"+this.value + "(" + this.varName + "):" + CpuDataType[this.dataType];
    }
}

class FunctionOprand extends Oprand{
    args:Oprand[];
    functionType:FunctionType;
    constructor(funtionName:string, args:Oprand[], functionType:FunctionType){
        super(OprandKind.function, funtionName);
        this.functionType = functionType;
        this.args = args;
    }

    toString():string{
        let strArgs="";
        for (let i = 0; i < this.args.length; i++){
            if (i == 0) strArgs += "(";
            strArgs += this.args[i].toString();
            if (i < this.args.length-1) 
                strArgs += ", ";
            else 
                strArgs += ")";
        }
        return "_"+this.value + strArgs;
    }
}

//条件语句产生的Oprand，里面记录了比较操作符的类型，以及数据类型（用于确定具体的跳转指令）
class CmpOprand extends Oprand{
    dataType:CpuDataType;
    constructor(op:Op, dataType:CpuDataType){
        super(OprandKind.cmp, op);
        this.dataType = dataType;
    }

    toString():string{
        return "var"+this.value+"("+ CpuDataType[this.dataType] +")";
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
    index:number;
    bytes:1|2|4|8|undefined;
    constructor(register:Register, offset:number, index: number = 0, bytes:1|2|4|8|undefined = undefined){
        super(OprandKind.memory,'undefined')
        this.register = register;
        this.offset = offset;
        this.index = index;
        this.bytes = bytes;
    }
    toString():string{
        //输出结果类似于：8(%rbp)
        //如果offset为0，那么不显示，即：(%rbp)
        return (this.offset == 0 ? "" : this.offset) + "("
                + this.register.toString()
                + (this.index > 0 ? "," + this.index : "")
                + (this.index > 0 && this.bytes ? "," + this.bytes : "")
                + ")";
    }
}

/**
 * 逻辑上的内存寻址模式，可以Lower成为MemAddress
 */
class LogicalMemAddress extends Oprand{
    varIndex:number;
    offset:number;
    index:number;
    bytes:1|2|4|8|undefined;
    constructor(varIndex:number, offset:number, index: number = 0, bytes:1|2|4|8|undefined = undefined){
        super(OprandKind.logicalMemory,'undefined')
        this.varIndex = varIndex;
        this.offset = offset;
        this.index = index;
        this.bytes = bytes;
    }
    toString():string{
        //输出结果类似于：8(%rbp)
        //如果offset为0，那么不显示，即：(%rbp)
        return (this.offset == 0 ? "" : this.offset) + "("
                + "var"+this.varIndex.toString()
                + (this.index > 0 ? ", " + this.index : "")
                + (this.index > 0 && this.bytes ? ", " + this.bytes : "")
                + ")";
    }
}


/**
 * 操作数的类型
 */
enum OprandKind{
    //抽象度较高的操作数
    varIndex,       //变量下标
    // returnSlot,     //用于存放返回值的位置（通常是一个寄存器）
    bb,             //跳转指令指向的基本块
    function,       //函数调用
    stringConst,    //字符串常量
    doubleIndex,    //double型常量的下标
    logicalMemory,  //间接寻址模式下的内存地址，基于一个varIndex。后面会被Lower成memory类型。

    //抽象度较低的操作数
    register,       //物理寄存器
    memory,         //内存访问
    immediate,      //立即数
    label,          //标签，从bb类型的操作数Lower而成

    //cmp指令的结果，是设置寄存器的标志位
    //后面可以根据flag和比较操作符的类型，来确定后续要生成的代码
    cmp,
}

//CPU原生支持的数据类型。
//不同的数据类型，使用不同的指令和寄存器。
enum CpuDataType{int32, int64, double};

class Register extends Oprand{
    dataType:CpuDataType = CpuDataType.int32;  //寄存器的位数
    
    private constructor(registerName:string, dataType:CpuDataType=CpuDataType.int32){
        super(OprandKind.register,registerName);
        this.dataType = dataType;
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
    private static registers32:Register[] = [
        Register.r10d,
        Register.r11d,

        Register.edi,
        Register.esi,
        Register.edx,
        Register.ecx,
        Register.r8d,
        Register.r9d,

        Register.eax,
        
        Register.ebx,
        Register.r12d,
        Register.r13d,
        Register.r14d,
        Register.r15d,
    ];

    //用于传参的寄存器
    private static paramRegisters32:Register[] = [
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

    //64位寄存器
    //参数用的寄存器，当然也要由caller保护
    static rdi = new Register("rdi",CpuDataType.int64);
    static rsi = new Register("rsi",CpuDataType.int64);
    static rdx = new Register("rdx",CpuDataType.int64);
    static rcx = new Register("rcx",CpuDataType.int64);
    static r8 = new Register("r8",CpuDataType.int64);
    static r9 = new Register("r9",CpuDataType.int64);

    //通用寄存器:caller（调用者）负责保护
    static r10 = new Register("r10",CpuDataType.int64);
    static r11 = new Register("r11",CpuDataType.int64);

    //返回值，也由Caller保护
    static rax = new Register("rax",CpuDataType.int64);

    //通用寄存器:callee（调用者）负责保护
    static rbx = new Register("rbx",CpuDataType.int64);
    static r12 = new Register("r12",CpuDataType.int64);
    static r13 = new Register("r13",CpuDataType.int64);
    static r14 = new Register("r14",CpuDataType.int64);
    static r15 = new Register("r15",CpuDataType.int64);

    //栈顶和栈底
    static rsp = new Register("rsp",CpuDataType.int64);
    static rbp = new Register("rbp",CpuDataType.int64);

    //64位的可供分配的寄存器
    private static registers64:Register[] = [
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

    private static paramRegisters64:Register[] = [       
        Register.rdi,
        Register.rsi,
        Register.rdx,
        Register.rcx,
        Register.r8,
        Register.r9,
    ]

    //Callee保护的寄存器
    static calleeProtected64:Register[] = [
        Register.rbx,
        Register.r12,
        Register.r13,
        Register.r14,
        Register.r15,
    ];
  
    //xmm寄存器
    static xmm0 = new Register("xmm0",CpuDataType.double);
    static xmm1 = new Register("xmm1",CpuDataType.double);
    static xmm2 = new Register("xmm2",CpuDataType.double);
    static xmm3 = new Register("xmm3",CpuDataType.double);
    static xmm4 = new Register("xmm4",CpuDataType.double);
    static xmm5 = new Register("xmm5",CpuDataType.double);
    static xmm6 = new Register("xmm6",CpuDataType.double);
    static xmm7 = new Register("xmm7",CpuDataType.double);
    static xmm8 = new Register("xmm8",CpuDataType.double);
    static xmm9 = new Register("xmm9",CpuDataType.double);
    static xmm10 = new Register("xmm10",CpuDataType.double);
    static xmm11 = new Register("xmm11",CpuDataType.double);
    static xmm12 = new Register("xmm12",CpuDataType.double);
    static xmm13 = new Register("xmm13",CpuDataType.double);
    static xmm14 = new Register("xmm14",CpuDataType.double);
    static xmm15 = new Register("xmm15",CpuDataType.double);

    private static xmmRegs:Register[] = [
        Register.xmm0,
        Register.xmm1,
        Register.xmm2,
        Register.xmm3,
        Register.xmm4,
        Register.xmm5,
        Register.xmm6,
        Register.xmm7,
        Register.xmm8,
        Register.xmm9,
        Register.xmm10,
        Register.xmm11,
        Register.xmm12,
        Register.xmm13,
        Register.xmm14,
        Register.xmm15,
    ];

    private static paramRegistersXmm:Register[] = [
        Register.xmm0,
        Register.xmm1,
        Register.xmm2,
        Register.xmm3,
        Register.xmm4,
        Register.xmm5,
        Register.xmm6,
        Register.xmm7,
    ];

    static callerProtected:Register[] = [
        //int32
        Register.edi,
        Register.esi,
        Register.edx,
        Register.ecx,
        Register.r8d,
        Register.r9d,

        Register.r10d,
        Register.r11d,

        Register.eax,

        //int64
        Register.rdi,
        Register.rsi,
        Register.rdx,
        Register.rcx,
        Register.r8,
        Register.r9,
        
        Register.r10,
        Register.r11,
        
        Register.rax,

        //xmm
        Register.xmm0,
        Register.xmm1,
        Register.xmm2,
        Register.xmm3,
        Register.xmm4,
        Register.xmm5,
        Register.xmm6,
        Register.xmm7,
        Register.xmm8,
        Register.xmm9,
        Register.xmm10,
        Register.xmm11,
        Register.xmm12,
        Register.xmm13,
        Register.xmm14,
        Register.xmm15,
    ];

    //获取用于参数传递的寄存器数组
    static getParamRegister(dataType:CpuDataType, index:number):Register|null{
        let registers:Register[];
        switch(dataType){
            case CpuDataType.int32:
                registers = Register.paramRegisters32;
                break;          
            case CpuDataType.int64:
                registers = Register.paramRegisters64;
                break;
            case CpuDataType.double:
                registers = Register.paramRegistersXmm;
                break;
        }

        return index < registers.length ? registers[index] : null;
    }

    //用于放返回值的寄存器
    static retRegs:Register[] = [Register.eax, Register.rax, Register.xmm0];

    //根据不同的返回值类型，确定不通过的寄存器
    static returnReg(dataType:CpuDataType):Register{
        return Register.retRegs[dataType];
    }

    static getRegisters(dataType:CpuDataType):Register[]{
        let regs:Register[];
        switch(dataType){
            case CpuDataType.int32:
                regs = Register.registers32;
                break;
            case CpuDataType.int64:
                regs = Register.registers64;
                break;
            case CpuDataType.double:
                regs = Register.xmmRegs;
                break;
        } 
        return regs;
    }  

    toString():string{
        return "%"+this.value;
    }
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
        else if (this.bbIndex != -1){
            return "LBB" +this.bbIndex;
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
class AsmModule{
    //每个函数对应的指令数组
    fun2Code:Map<FunctionSymbol, BasicBlock[]> = new Map();

    //每个函数的变量数，包括参数、本地变量和临时变量
    numTotalVars:Map<FunctionSymbol, number> = new Map();

    //是否是叶子函数
    isLeafFunction:Map<FunctionSymbol, boolean> = new Map();

    //字符串常量
    stringConsts:string[] = [];

    //ieee754格式的double常量
    doubleLiteralMap:Map<FunctionSymbol, number[]> = new Map();

    /**
     * 输出代表该模块的asm文件的字符串。
     */
    toString():string{
        let str = "";
        let funIndex = 0;
        for (let fun of this.fun2Code.keys()){
            //浮点数字面量是以函数为单位的
            str += this.doubleLiteralToSection(fun, funIndex);

            str += "\t.section	__TEXT,__text,regular,pure_instructions\n";  //伪指令：一个文本的section
            let funName = "_"+fun.name;
            str += "\n\t.global "+funName+"\n";  //添加伪指令
            str += funName + ":\n";
            str += "\t.cfi_startproc\n"; 
            let bbs = this.fun2Code.get(fun) as BasicBlock[];
            for (let bb of bbs){
                str += bb.toString();
            }
            str += "\t.cfi_endproc\n";
            str += "\n";

            funIndex++;
        }

        //字符串字面量是以模块为单位的
        str += this.stringLiteralToSection();

        return str;
    }

    doubleLiteralToSection(fun:FunctionSymbol, funIndex:number):string{
        let doubleLiterals = this.doubleLiteralMap.get(fun) as number[];

        let str = "";
        if (doubleLiterals.length > 0){
            str += "\t.section	__TEXT,__literal8,8byte_literals\n";
            
            for (let i = 0; i< doubleLiterals.length; i++){
                let n = doubleLiterals[i];
                let label = genDoubleLiteralLabel(funIndex, i, false);
                str += label + ":\n";
                str += "\t.quad\t" + doubleToIeee754(n) + "\t\t## double " + n +"\n";
            }

            str += "\n";
        }

        return str;
    }

    stringLiteralToSection():string{
        let str = "";
        
        if (this.stringConsts.length>0){
            str += "\t.section	__TEXT,__cstring,cstring_literals\n";
            for (let i = 0; i< this.stringConsts.length; i++){
                let literal = this.stringConsts[i];
                let label = genStringConstLabel(i);
                str += label+":\n";
                str += "\t.asciz\t\"" + literal + "\"\n";
            }
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

    //每个表达式节点对应的临时变量的索引
    tempVarMap:Map<Expression, number> = new Map();

    //主要用于判断当前的Unary是一个表达式的一部分，还是独立的一个语句
    inExpression:boolean = false;

    //保存一元后缀运算符对应的指令。
    postfixUnaryInst:Inst_1|null = null;

    //当前的BasicBlock编号
    blockIndex = 0;

    //当前函数的double字面量
    doubleLiterals:number[] = []; 
}

/**
 * 汇编代码生成程序。
 * 这是一个比较幼稚的算法，使用了幼稚的寄存器分配算法，但已经尽量争取多使用寄存器，对于简单的函数已经能生成性能不错的代码。
 * 算法特点：
 * 1.先是尽力使用寄存器，寄存器用光以后就用栈桢；
 * 2.对于表达式，尽量复用寄存器来表示临时变量。
 */
class AsmGenerator extends AstVisitor{
    //编译后的结果
    private asmModule:AsmModule|null = null;

    //对象头的大小
    private Array_Data_Offset = 24;

    //用来存放返回值的位置
    // private returnSlot:Oprand = new Oprand(OprandKind.returnSlot, -1);

    //一些状态变量
    private s = new TempStates();

    //尾递归和尾调用分析的结果
    private tailAnalysisResult:TailAnalysisResult|null = null;

    /**
     * 分配一个临时变量的下标。尽量复用已经死掉的临时变量
     */
    private allocateTempVar(dataType:CpuDataType):VarOprand{
        let varIndex = this.s.nextTempVarIndex++;
        // let oprand = new Oprand(OprandKind.varIndex, varIndex);
        let oprand = new VarOprand(varIndex, "temp", dataType);
        //临时变量也要添加一个变量声明，以便进行活跃性分析
        this.getCurrentBB().insts.push(new Inst_1(OpCode.declVar,oprand));
        return oprand;
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

    /**
     * 如果操作数不同，则生成mov指令；否则，可以减少一次拷贝。
     * @param src 
     * @param dest 
     */
    private movIfNotSame(dataType: CpuDataType, src:Oprand, dest:Oprand){
        if (!src.isSame(dest)){
            let opCode = OpCodeUtil.movOp(dataType);
            this.getCurrentBB().insts.push(new Inst_2(opCode,src,dest));
        }
    }

    private getCurrentBB():BasicBlock{
        return this.s.bbs[this.s.bbs.length-1];
    }

    private newBlock():BasicBlock{
        let bb = new BasicBlock();
        bb.bbIndex = this.s.blockIndex++;
        this.s.bbs.push(bb);
        
        return bb;
    }

    /**
     * 主函数
     * @param prog 
     */
    visitProg(prog:Prog):any{
        //设置一些状态变量
        this.asmModule = new AsmModule();
        // this.s.functionSym = prog.sym  as FunctionSymbol;
        // this.s.nextTempVarIndex = this.s.functionSym.vars.length;

        //尾递归、尾调用分析
        let tailAnalyzer = new TailAnalyzer();
        this.tailAnalysisResult = tailAnalyzer.visitProg(prog);

        this.handleFunction(prog.sym as FunctionSymbol, prog);

        this.tailAnalysisResult = null;

        return this.asmModule;
    }

    visitFunctionDecl(functionDecl:FunctionDecl):any{          
        this.handleFunction(functionDecl.sym as FunctionSymbol, functionDecl.body);
    }

    private handleFunction(functionSym:FunctionSymbol, block:Block):any{
        //保存原来的状态信息
        let s = this.s;

        //新建立状态信息
        this.s = new TempStates();
        this.s.functionSym = functionSym;  
        this.s.nextTempVarIndex = this.s.functionSym.vars.length;

        //计算当前函数是不是叶子函数
        //先设置成叶子变量。如果遇到函数调用，则设置为false。
        this.asmModule?.isLeafFunction.set(this.s.functionSym as FunctionSymbol, true);

        //创建新的基本块
        this.newBlock();

        //生成代码
        this.visitBlock(block); 

        //保存生成的代码
        this.asmModule?.fun2Code.set(this.s.functionSym, this.s.bbs);
        this.asmModule?.numTotalVars.set(this.s.functionSym, this.s.nextTempVarIndex);
        this.asmModule?.doubleLiteralMap.set(this.s.functionSym, this.s.doubleLiterals);

        //恢复原来的状态信息
        this.s = s;
    }

    /**
     * 把返回值mov到指定的寄存器。
     * 这里并不生成ret指令，而是在程序的尾声中处理。
     * @param rtnStmt 
     */
    visitReturnStatement(rtnStmt:ReturnStatement):any{
        if (rtnStmt.exp!=null){
            let ret = this.visit(rtnStmt.exp) as Oprand;
            //把返回值赋给相应的寄存器
            let dataType = getCpuDataType(rtnStmt.exp.theType as Type);
            this.movIfNotSame(dataType, ret, Register.returnReg(dataType));

            //分叉出一个额外的尾声块。
            if (this.tailAnalysisResult!= null){
                if (this.tailAnalysisResult.tailRecursives.indexOf(rtnStmt.exp as FunctionCall) !=-1){
                    this.getCurrentBB().insts.push(new Inst_1(OpCode.jmp, new Oprand(OprandKind.bb,this.s.bbs[0]),"Tail Recursive Optimazation"));
                }
                else if (this.tailAnalysisResult.tailCalls.indexOf(rtnStmt.exp as FunctionCall) !=-1){
                    let functionName = (rtnStmt.exp as FunctionCall).name;
                    this.getCurrentBB().insts.push(new Inst_1(OpCode.tailCallJmp, new Oprand(OprandKind.label,"_"+functionName),"Tail Call Optimazation"));
                }
            }
        }
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
        let op = this.getJumpOpCode(compOprand as CmpOprand);  //todo: 处理if条件不是比较表达式的情况
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
    private getJumpOpCode(compOprand:CmpOprand):OpCode{
        let op:OpCode = OpCode.jmp;
        if (compOprand.value == Op.G){
            // op = OpCode.jg;
            op = OpCodeUtil.jgOp(compOprand.dataType);
        }
        else if (compOprand.value == Op.GE){
            // op = OpCode.jge;
            op = OpCodeUtil.jgeOp(compOprand.dataType);
        }
        else if (compOprand.value == Op.L){
            // op = OpCode.jl;
            op = OpCodeUtil.jlOp(compOprand.dataType);
        }
        else if (compOprand.value == Op.LE){
            // op = OpCode.jle;
            op = OpCodeUtil.jleOp(compOprand.dataType);
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
            let op = this.getJumpOpCode(compOprand as CmpOprand);
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
            // let left = new Oprand(OprandKind.varIndex,varIndex);
            let dataType = getCpuDataType(variableDecl.theType);
            let left = new VarOprand(varIndex, variableDecl.name, dataType);

            //插入一条抽象指令，代表这里声明了一个变量
            this.getCurrentBB().insts.push(new Inst_1(OpCode.declVar,left));

            //赋值
            if (right) this.movIfNotSame(dataType, right, left);

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

        let dataType = getCpuDataType(bi.theType as Type);

        if (bi.op == Op.Plus || bi.op == Op.Minus || bi.op == Op.Multiply || bi.op == Op.Divide){
            if (!(dest instanceof VarOprand)){
                dest = this.allocateTempVar(dataType);
                insts.push(new Inst_2(OpCodeUtil.movOp(dataType), left, dest));
            }
        }

        //生成指令
        //todo 有问题的地方
        switch(bi.op){
            case Op.Plus: //'+'
                if (bi.theType === SysTypes.String){ //字符串加
                    let args:Oprand[] = [];
                    args.push(left);
                    args.push(right);
                    dest = this.callBuiltIns("string_concat", args);
                }
                else{
                    // this.movIfNotSame(left,dest);
                    insts.push(new Inst_2(OpCodeUtil.addOp(dataType),right, dest));
                }
                break;
            case Op.Minus: //'-'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCodeUtil.subOp(dataType),right, dest));
                break;
            case Op.Multiply: //'*'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCodeUtil.mulOp(dataType),right, dest));
                break;
            case Op.Divide: //'/'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCodeUtil.divOp(dataType),right, dest));
                break;
            case Op.Assign: //'='
                console.log("in binary.....")
                console.log(CpuDataType[dataType]);
                console.log(bi.toString());

                if (dest instanceof VarOprand){
                    this.movIfNotSame(dataType, right,dest);
                }
                else{ //如果目标不是一个虚拟寄存器，那么就通过虚拟寄存器绕一圈。否则，无法直接给内存地址赋值。
                    let tempVar = this.allocateTempVar(dataType);
                    insts.push(new Inst_2(OpCodeUtil.movOp(dataType), right, tempVar));
                    insts.push(new Inst_2(OpCodeUtil.movOp(dataType), tempVar, dest));
                }
                
                break;
            case Op.G:    
            case Op.L:
            case Op.GE:
            case Op.LE:
            case Op.EQ:      
            case Op.NE: 
                insts.push(new Inst_2(OpCodeUtil.cmpOp(dataType), right, dest)); 
                // dest = new Oprand(OprandKind.flag, this.getOpsiteOp(bi.op));
                dest = new CmpOprand(this.getOpsiteOp(bi.op), dataType);
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

    /**
     * 为一元运算符生成指令
     * 对于++或--这样的一元运算，只能是右值。如果是后缀表达式，需要在前一条指令之后，再把其值改一下。
     * 所以，存个临时状态信息
     * @param u 
     */
    visitUnary(u:Unary):any{
        //短路：直接返回constValue
        // if (u.constValue){
        //     if (TypeUtil.LE(u.theType)
        //     return;
        // }


        let insts = this.getCurrentBB().insts;

        let oprand = this.visit(u.exp) as Oprand;

        //用作返回值的Oprand
        let result:Oprand = oprand;  

        let dataType = getCpuDataType(u.theType as Type);

        //++和--
        if(u.op == Op.Inc || u.op == Op.Dec){
            let tempVar = this.allocateTempVar(getCpuDataType(u.theType as Type));
            insts.push(new Inst_2(OpCodeUtil.movOp(dataType), oprand, tempVar));
            if(u.isPrefix){  //前缀运算符
                result = tempVar;
            }
            else{  //后缀运算符
                //把当前操作数放入一个临时变量作为返回值
                result = this.allocateTempVar(getCpuDataType(u.theType as Type));
                insts.push(new Inst_2(OpCodeUtil.movOp(dataType), oprand, result));
            }
            //做+1或-1的运算
            let opCode = u.op == Op.Inc ? OpCodeUtil.addOp(dataType) : OpCodeUtil.subOp(dataType);
            
            //把常量1变成double字面量
            let literalOprand = this.createDoubleIndexOprand(1);
            // insts.push(new Inst_2(opCode, new Oprand(OprandKind.immediate,1), tempVar));
            insts.push(new Inst_2(opCode, literalOprand, tempVar));
            insts.push(new Inst_2(OpCodeUtil.movOp(dataType), tempVar, oprand));
        }
        //+
        else if (u.op == Op.Plus){
            result = oprand;
        }
        //-
        else if (u.op == Op.Minus){
            let tempVar = this.allocateTempVar(getCpuDataType(u.theType as Type));
            //用0减去当前值
            insts.push(new Inst_2(OpCodeUtil.movOp(dataType), new Oprand(OprandKind.immediate,0), tempVar));
            insts.push(new Inst_2(OpCodeUtil.subOp(dataType), oprand, tempVar));
            result = tempVar;
        }

        return result;
    }

    visitExpressionStatement(stmt:ExpressionStatement):any{
        //先去为表达式生成指令
        super.visitExpressionStatement(stmt);  //??
    }

    visitVariable(variable:Variable):any{
        if (this.s.functionSym !=null && variable.sym!=null){
            let varIndex = this.s.functionSym.vars.indexOf(variable.sym);
            return new VarOprand(varIndex, variable.name, getCpuDataType(variable.theType as Type));
        }
    }

    visitIntegerLiteral(integerLiteral:IntegerLiteral):any{      
        //todo 这里做了一个临时的逻辑，后面可以更完美一些
        //如果是作为下标表达式的index值，那么必须转为整型
        if(integerLiteral.parentNode instanceof IndexedExp && integerLiteral.parentNode.indexExp == integerLiteral){
            return new Oprand(OprandKind.immediate, integerLiteral.value);
        }
        else{
            return this.createDoubleIndexOprand(integerLiteral.value as number);
        }
    }

    visitDecimalLiteral(decimalLiteral:DecimalLiteral):any{
        return this.createDoubleIndexOprand(decimalLiteral.value as number);
    }

    /**
     * 处理浮点型字面量
     * 要转成ieee754格式，保存在文本区
     * @param n 
     */
    private createDoubleIndexOprand(n:number):Oprand{
        let index:number;
        index = this.s.doubleLiterals.indexOf(n);
        if( index == -1){
            this.s.doubleLiterals.push(n);
            index = this.s.doubleLiterals.length - 1;
        }
        
        return new Oprand(OprandKind.doubleIndex, index);
    }

    visitStringLiteral(stringLiteral:StringLiteral):any{
        //加到常数表里
        if (this.asmModule != null){
            //把字符串字面量保存到模块中。基于这些字面量可以生成汇编代码中的一个文本段。
            let strIndex = this.asmModule.stringConsts.indexOf(stringLiteral.value as string);
            if( strIndex == -1){
                this.asmModule.stringConsts.push(stringLiteral.value as string);
                strIndex = this.asmModule.stringConsts.length - 1;
            }

            //新申请一个临时变量
            let tempVar = this.allocateTempVar(getCpuDataType(stringLiteral.theType as Type));

            //用leaq指令把字符串字面量加载到一个变量（虚拟寄存器）
            let inst = new Inst_2(OpCode.leaq, new Oprand(OprandKind.stringConst, strIndex), tempVar);
            this.getCurrentBB().insts.push(inst);

            //调用一个内置函数来创建PlayString
            let args:Oprand[] = [];
            args.push(tempVar);

            //调用内置函数，返回值是PlayString对象的地址
            return this.callBuiltIns("string_create_by_cstr", args);
        }
    }

    /**
     * 调用intrinsics，创建数组对象。
     * @param arrayLiteral 
     */
    visitArrayLiteral(literal:ArrayLiteral):any{
        //创建数组对象，返回值是对象的地址，放在一个变量里，会被放在寄存器里
        let args:Oprand[] = [];
        args.push(new Oprand(OprandKind.immediate, literal.exps.length));
        let arrOprand = this.callBuiltIns("array_create_by_length",args);

        //类型要从数组的基础类型来计算，避免数组是number[]，而数组元素是integer的情况
        let dataType = getCpuDataType((literal.theType as ArrayType).baseType);

        if (arrOprand.kind == OprandKind.varIndex){
            let insts = this.getCurrentBB().insts;
            //求每个元素的值，并设置到数组
            for (let i =0; i< literal.exps.length; i++){
                let exp = literal.exps[i];
                let src = this.visit(exp);
                //对于浮点型数据，不能直接写到内存，必须通过寄存器来中转
                if (src.kind == OprandKind.doubleIndex){
                    let tempVar = this.allocateTempVar(CpuDataType.double);
                    insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.double), src, tempVar));
                    src = tempVar;
                }
                let offset = this.Array_Data_Offset + i*8;
                let dest = new LogicalMemAddress(arrOprand.value as number, offset);
                insts.push(new Inst_2(OpCodeUtil.movOp(dataType), src, dest));
            }
        }
        else{
            console.log("Expacting an array reference stored in an temp var in visitArrayLiteral.");
        }
        return arrOprand;
    }

    visitIndexedExp(exp:IndexedExp):any{
        //获取对象引用
        let obj = this.visit(exp.baseExp);

        // this.callBuiltIns("println_l", [obj]);

        //获取下标值
        let indexOprand = this.visit(exp.indexExp);

        let insts = this.getCurrentBB().insts;

        //如果base不是一个变量，就要把它挪到一个变量上
        let objInVar:VarOprand;
        if (obj instanceof VarOprand){
            objInVar = obj;
        }
        else{
            let tempVar = this.allocateTempVar(CpuDataType.double);
            insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.double), obj, tempVar));
            objInVar = tempVar;
        }

        let rtn:Oprand;

        //创建一个内存类型的Oprand
        if(indexOprand.kind == OprandKind.immediate){ //下标是个立即数
            let index = indexOprand.value as number;
            let offset = this.Array_Data_Offset + index*8;
            // if (exp.isLeftValue){ //返回左值，也就是元素地址即可
            //     let offsetOprand = new Oprand(OprandKind.immediate, offset);
            //     let tempVar = this.allocateTempVar(CpuDataType.int64);
            //     insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.int64), obj , tempVar));
            //     insts.push(new Inst_2(OpCodeUtil.addOp(CpuDataType.int64), offsetOprand , tempVar));
            //     rtn = tempVar;
            // }
            // else{  //返回右值，也就是通过间接地址访问内存
                rtn = new LogicalMemAddress(objInVar.value as number,offset);
            // }
        }
        else{ //下标不是立即数，那就加指令计算出元素地址来
            //先用乘法计算出地址偏移量offset
            //1.把下标挪到寄存器
            let tempVar = this.allocateTempVar(CpuDataType.int64);
            if (exp.baseExp.theType == SysTypes.Integer){
                insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.int64), indexOprand, tempVar));
            }
            else{ //如果是浮点数，要进行类型转换
                insts.push(new Inst_2(OpCode.cvttsd2si, indexOprand, tempVar));
            }
            
            //把下标乘以8
            let bytesOprand = new Oprand(OprandKind.immediate, 8);
            insts.push(new Inst_2(OpCodeUtil.mulOp(CpuDataType.int64), bytesOprand, tempVar));

            //再加上对象的地址
            insts.push(new Inst_2(OpCodeUtil.addOp(CpuDataType.int64), obj, tempVar));

            //再加上对象头和length的大小
            let offsetOprand = new Oprand(OprandKind.immediate, this.Array_Data_Offset);
            insts.push(new Inst_2(OpCodeUtil.addOp(CpuDataType.int64), offsetOprand, tempVar));

            //调试：打印地址
            // this.callBuiltIns("println_l", [tempVar]);

            if(exp.isLeftValue){//返回左值，也就是内存地址
                rtn = tempVar; 
            }
            else { //返回右值，也就是内存中的内容
                rtn = new LogicalMemAddress(tempVar.value as number,0);
            }
        }
        
        return rtn;
    }

    private callBuiltIns(funName:string, args:Oprand[], typeHind:Type|null=null):any{
        if (funName == "println"){
            if(typeHind){
                if (typeHind === SysTypes.Integer)
                    funName += "_l";  
                else if (TypeUtil.LE(typeHind, SysTypes.Number))
                    funName += "_d";  
                else if (typeHind === SysTypes.String)
                    funName += "_s";
            }
        }
        else if(funName == "tick"){
            if(typeHind && TypeUtil.LE(typeHind, SysTypes.Number)){
                funName += "_d";
            }
        }

        let insts = this.getCurrentBB().insts;

        let functionSym = built_ins.get(funName) as FunctionSymbol;
        let functionType = functionSym.theType as FunctionType;

        insts.push(new Inst_1(OpCode.callq, new FunctionOprand(funName, args,functionType)));

        return this.postFunctionCall(insts, functionType);
    }

    /**
     * 为函数调用生成指令
     * 计算每个参数，并设置参数
     * @param functionCall 
     */
    visitFunctionCall(functionCall:FunctionCall):any{
        //当前函数不是叶子函数
        this.asmModule?.isLeafFunction.set(this.s.functionSym as FunctionSymbol, false);

        let args:Oprand[] = [];
        for(let arg of functionCall.arguments){
            let oprand = this.visit(arg) as Oprand;
            args.push(oprand);
        }

        //短路，调用内置函数
        if (built_ins.has(functionCall.name)){
            
            return this.callBuiltIns(functionCall.name,args,functionCall.arguments.length > 0 ? functionCall.arguments[0].theType as Type:null);
        }

        let insts = this.getCurrentBB().insts;

        let functionSym = functionCall.sym as FunctionSymbol;
        let functionType = functionSym.theType as FunctionType;

        //看看是不是尾递归或尾调用
        let isTailCall = false;
        let isTailRecursive = false;
        if (this.tailAnalysisResult != null){
            if (this.tailAnalysisResult.tailRecursives.indexOf(functionCall) != -1){
                isTailRecursive = true;
            }
            else if (this.tailAnalysisResult.tailCalls.indexOf(functionCall) != -1){
                isTailCall = true;
            }
        }

        //对于尾递归和尾调用，使用一个伪指令
        let op = OpCode.callq;
        if (isTailRecursive){
            op = OpCode.tailRecursive;
        }
        else if (isTailCall){
            op = OpCode.tailCall;
        }
 
        insts.push(new Inst_1(op, new FunctionOprand(functionCall.name, args,functionType)));

        //把返回值拷贝到一个临时变量，并返回这个临时变量
        //并且要重新装载溢出的变量        
        if (!isTailCall && !isTailRecursive){
            return this.postFunctionCall(insts, functionType);
        }
        //对于尾递归和尾调用，不需要处理返回值，也不需要做变量的溢出和重新装载
        else{
            //对于尾递归和尾调用，最后的计算结果放在返回值寄存器里，其他寄存器都没有用。
            return Register.returnReg(getCpuDataType(functionCall.theType as Type));
        }
    }


    postFunctionCall(insts:Inst[], functionType:FunctionType):any{
        //把结果放到一个新的临时变量里
        let dest:Oprand|undefined = undefined; 
        if(functionType.returnType != SysTypes.Void){ //函数有返回值时
            let dataType = getCpuDataType(functionType.returnType);
            dest = this.allocateTempVar(dataType);  //必须要创建一个变量，因为返回值的寄存器并没有对应一个变量
            insts.push(new Inst_2(OpCodeUtil.movOp(dataType), Register.returnReg(dataType), dest));
        }

        //调用函数完毕以后，要重新装载被Spilled的变量
        //这个动作要在获取返回值之后
        insts.push(new Inst_0(OpCode.reload));

        return dest;
    }


}

///////////////////////////////////////////////////////////////////////////
//Lower
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
    /////////////////////////////////////////////////////
    //一些状态信息

     //前一步生成的LIR模型
    asmModule:AsmModule;

    //当前的FunctionSymbol
    functionSym:FunctionSymbol|null = null;

    //变量活跃性分析的结果
    livenessResult:LivenessResult;
    
    //当前函数使用到的那些Callee保护的寄存器
    usedCalleeProtectedRegs:Register[] = [];

    //当前函数的参数数量
    numParams = 0;

    //保存已经被Lower的Oprand，用于提高效率
    loweredVars:Map<number,Oprand> = new Map();

    //需要在栈里保存的为函数传参（超过6个之后的参数）保留的空间，每个参数占8个字节
    numArgsOnStack = 0;

    //rsp应该移动的量。这个量再加8就是该函数所对应的栈桢的大小，其中8是callq指令所压入的返回地址
    rspOffset = 0;

    //是否使用RedZone，也就是栈顶之外的128个字节
    canUseRedZone = false;

    //预留的寄存器。
    //主要用于在调用函数前，保护起那些马上就要用到的寄存器，不再分配给其他变量。也不会为了给其他变量腾地方而spill到内存。
    regsUsedByFunctionCall:Register[] = [];

    //spill的register在内存中的位置。
    spillOffset:number = 0;

    //被spill的变量
    //key是varIndex，value是内存地址
    spilledVars2Address:Map<number,MemAddress> = new Map();  

    //key是varIndex，value是原来的寄存器
    spilledVars2Reg:Map<number, Register> = new Map();

    //可以通过寄存器传递的参数的最大数量
    MaxXmmRegParams = 8;
    MaxIntRegParams = 6;

    constructor(asmModule:AsmModule, livenessResult:LivenessResult){
        this.asmModule = asmModule;
        this.livenessResult = livenessResult;
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

        //Lower参数
        this.lowerParams();

        //lower每个BasicBlock中的指令
        for (let i = 0; i< bbs.length; i++){
            let bb = bbs[i];
            let newInsts:Inst[] = [];
            this.lowerBB(bb, newInsts);
            bb.insts = newInsts;
        }

        //是否可以使用RedZone
        //需要是叶子函数，并且对栈外空间的使用量小于128个字节，也就是32个整数
        let isLeafFunction = this.asmModule.isLeafFunction.get(functionSym) as boolean;       
        if (isLeafFunction){
            let bytes = this.spillOffset +this.numArgsOnStack*8 +this.usedCalleeProtectedRegs.length*8;
            this.canUseRedZone = bytes < 128;
        }

        this.canUseRedZone = false;  //todo 暂时关闭使用RedZone,因为在28节处理字符串数组时遇到一点问题。

        //添加序曲
        //新增加一个BasicBlock
        let bb = new BasicBlock();
        bb.bbIndex == -1;
        bbs.unshift(bb);

        bbs[0].insts = this.addPrologue(bbs[0].insts);

        //添加尾声
        let lastBB = bbs[bbs.length-1];
        let tailCall = lastBB.insts.length>0 && lastBB.insts[lastBB.insts.length-1].op == OpCode.tailCallJmp;
        if (!tailCall){
            this.addEpilogue(bbs[bbs.length-1].insts);
        }

        //为尾调用添加基本块和尾声代码
        let additionalBBs:BasicBlock[] = [];
        for(let bb of bbs){
            if (bb.insts.length>0){
                let lastInst = bb.insts[bb.insts.length-1];
                if (lastInst.op == OpCode.tailCallJmp){
                    bb.insts.pop();
                    let bbEndPoint = new BasicBlock();
                    additionalBBs.push(bbEndPoint);
                    bb.insts.push(new Inst_1(OpCode.jmp, new Oprand(OprandKind.bb, bbEndPoint),lastInst.comment));
                    lastInst.op = OpCode.jmp;
                    this.addEpilogue(bbEndPoint.insts, lastInst);
                    console.log("bbEndPoint");
                    for (let inst of bbEndPoint.insts){
                        console.log(inst);
                    }
                }
            }
        }
        for (let bb of additionalBBs){
            bbs.push(bb);
        }

        //Lower基本块的标签和跳转指令。
        let newBBs = this.lowerBBLabelAndJumps(bbs,funIndex);

        //Lower浮点数字面量的标签
        this.lowerDoubleIndexs(newBBs, funIndex);

        //把spilledVars中的地址修改一下，加上CalleeProtectedReg所占的空间
        if (this.usedCalleeProtectedRegs.length >0){
            let offset = this.usedCalleeProtectedRegs.length*8;
            for (let address of this.spilledVars2Address.values()){
                let oldValue = address.value as number;
                address.value = oldValue+offset;
            }
        }

        // console.log(this);   //打印一下，看看状态变量是否对。

        return newBBs;
    }

    private lowerParams(){
        let functionType = this.functionSym?.theType as FunctionType;
        let usedIntRegisters = 0;  //使用掉的整数寄存器
        let usedXmmRegisters = 0;  //使用掉的xmm寄存器
        let numArgsOnStack = 0;   //栈上的参数的下标
        for (let i:number = 0; i< this.numParams;i++){
            let dataType = getCpuDataType(functionType.paramTypes[i]);
            
            let regParam:Register|null = null;
            if ((dataType == CpuDataType.int32 || dataType == CpuDataType.int64) && usedIntRegisters < this.MaxIntRegParams ){
                regParam = Register.getParamRegister(dataType, usedIntRegisters);
                usedIntRegisters++;
            }
            else if (dataType == CpuDataType.double && usedXmmRegisters < this.MaxXmmRegParams){
                regParam = Register.getParamRegister(dataType, usedXmmRegisters);
                usedXmmRegisters++;
            }

            //通过寄存器传递的参数
            if(regParam){
                this.assignRegToVar(i, regParam);
            }
            //通过Caller栈桢传递的参数
            else{  
                //参数是倒着排的。
                //比如，对于整数来说，栈顶是参数7，再往上，依次是参数8、参数9...
                //在Callee中，会到Caller的栈桢中去读取参数值
                let offset = numArgsOnStack*8 + 16;  //+16是因为有一个callq压入的返回地址，一个pushq rbp又加了8个字节
                numArgsOnStack++;
                let memParam = new MemAddress(Register.rbp,offset); 
                this.loweredVars.set(i, memParam);
            }

        }

    }

    /**
     * 初始化当前函数的一些状态变量，在算法中会用到它们
     * @param functionSym 
     */
    private initStates(functionSym:FunctionSymbol){
        this.functionSym = functionSym;
        this.usedCalleeProtectedRegs=[];
        this.numParams = functionSym.getNumParams();
        this.numArgsOnStack = 0;
        this.rspOffset = 0;
        this.loweredVars.clear();
        this.spillOffset = 0;
        this.spilledVars2Address.clear();
        this.spilledVars2Reg.clear();
        this.regsUsedByFunctionCall = []; 
        this.canUseRedZone = false;       
    }

    //添加序曲
    private addPrologue(insts:Inst[]):Inst[]{
        let newInsts:Inst[] = [];

        //保存rbp的值
        newInsts.push(new Inst_1(OpCode.pushq, Register.rbp));

        //把原来的栈顶保存到rbp,成为现在的栈底
        newInsts.push(new Inst_2(OpCode.movq, Register.rsp, Register.rbp));

        //计算栈顶指针需要移动多少位置
        //要保证栈桢16字节对齐
        if (!this.canUseRedZone){
            this.rspOffset = this.spillOffset + this.numArgsOnStack*8;
            //当前占用的栈空间，还要加上Callee保护的寄存器占据的空间
            let rem = (this.rspOffset + this.usedCalleeProtectedRegs.length*8)%16;

            if(rem == 8){
                this.rspOffset += 8;
            }
            else if ( rem == 4){
                this.rspOffset += 12;
            }
            else if (rem == 12){
                this.rspOffset += 4;
            }

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
    private addEpilogue(newInsts:Inst[], inst:Inst = new Inst_0(OpCode.retq)){
        //恢复Callee负责保护的寄存器
        this.restoreCalleeProtectedRegs(newInsts);

        //缩小栈桢
        if (!this.canUseRedZone && this.rspOffset > 0){
            newInsts.push(new Inst_2(OpCode.addq, new Oprand(OprandKind.immediate,this.rspOffset), Register.rsp));
        }

        //恢复rbp的值
        newInsts.push(new Inst_1(OpCode.popq, Register.rbp));

        //添加返回指令，或者是由尾调用产生的jump指令。
        newInsts.push(inst);
    }

    //Lower浮点数常量，给标签编号
    //编号时需要用到函数的序号、在一个函数内double常量的序号
    private lowerDoubleIndexs(bbs:BasicBlock[], funIndex:number){
        for (let bb of bbs){
            for (let inst of bb.insts){
                if(inst instanceof Inst_1){
                    this.lowerDoubleIndexOp(inst.oprand, funIndex);
                }
                else if(inst instanceof Inst_2){
                    this.lowerDoubleIndexOp(inst.oprand1, funIndex);
                    this.lowerDoubleIndexOp(inst.oprand2, funIndex);
                }
            } 
        }
    }

    private lowerDoubleIndexOp(oprand:Oprand, funIndex:number){
        if (oprand.kind == OprandKind.doubleIndex){
            oprand.kind = OprandKind.label;
            oprand.value = genDoubleLiteralLabel(funIndex, oprand.value as number, true);
        }
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
                for (let j = 0; j< bbs.length;j++){
                    let lastInst = bbs[j].insts[bbs[j].insts.length-1];
                    if (OpCodeUtil.isJump(lastInst.op)){
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
            if (OpCodeUtil.isJump(lastInst.op) && (lastInst as Inst_1).oprand.kind == OprandKind.bb){ //jump指令
                let jumpInst = lastInst as Inst_1;
                let bbDest = jumpInst.oprand.value as BasicBlock;
                //去除不必要的jmp指令。如果仅仅是跳到下一个基本块，那么不需要这个jmp指令。
                if(lastInst.op == OpCode.jmp && newBBs.indexOf(bbDest) == i+1){
                    insts.pop();
                }
                else{
                    jumpInst.oprand.value = bbDest.getName();
                    jumpInst.oprand.kind = OprandKind.label;
                    bbDest.isDestination = true;  //有其他block跳到这个block
                }
            }
        }

        return newBBs;
    }


    /**
     * Lower指令
     * @param insts 
     * @param newInsts 
     */
    private lowerBB(bb:BasicBlock, newInsts:Inst[]){
        let insts = bb.insts;
        let varsToSpill : number[] =[];
        for(let i = 0; i < insts.length; i++){
            let inst = insts[i];
            let liveVars = this.livenessResult.liveVars.get(inst) as number[];
            //两个操作数
            if (Inst_2.isInst_2(inst)){
                let inst_2 = inst as Inst_2;
                inst_2.comment = inst_2.toString();
                inst_2.oprand1 = this.lowerOprand(liveVars, inst_2.oprand1, newInsts);
                inst_2.oprand2 = this.lowerOprand(liveVars, inst_2.oprand2, newInsts);

                //对mov再做一次优化
                if (!(OpCodeUtil.isMov(inst_2.op) && inst_2.oprand1 == inst_2.oprand2)){
                    newInsts.push(inst_2);
                }
            }
            //1个操作数
            else if (Inst_1.isInst_1(inst)){                
                let inst_1 = inst as Inst_1;
                inst_1.oprand = this.lowerOprand(liveVars, inst_1.oprand, newInsts);

                if (inst.op != OpCode.declVar){ //忽略变量声明的伪指令。
                    //处理函数调用
                    //函数调用前后，要设置参数；
                    if (inst_1.op == OpCode.callq || inst_1.op == OpCode.tailRecursive || inst_1.op == OpCode.tailCall){
                        let liveVarsAfterCall = (i==insts.length-1) 
                                ? (this.livenessResult.initialVars.get(bb) as number[]) 
                                    : (this.livenessResult.liveVars.get(insts[i+1]) as number[]);
                        varsToSpill = this.lowerFunctionCall(inst_1, liveVars, liveVarsAfterCall, newInsts);
                    }
                    else{
                        newInsts.push(inst_1);
                    }
                }
            }
            //没有操作数
            else{
                if(inst.op == OpCode.reload){
                    //如果是最后一条指令，或者下一条指令就是return，那么就不用reload了
                    if (i != insts.length-1 && !OpCodeUtil.isReturn(insts[i+1].op)){
                        for (let i = 0; i < varsToSpill.length; i++){
                            let varIndex = varsToSpill[i];
                            this.reloadVar(varIndex, newInsts);
                        }
                        varsToSpill = [];
                    }
                }
                else{
                    newInsts.push(inst);
                }
            }
        }
    }

    /**
     * 处理函数调用。
     * 需要保存Caller负责保护的寄存器。
     * @param inst_1 
     * @param liveVars          函数调用时的活跃变量
     * @param liveVarsAfterCall 函数调用之后的活跃变量
     * @param newInsts 
     */
    private lowerFunctionCall(inst_1:Inst_1, liveVars:number[], liveVarsAfterCall:number[], newInsts:Inst[]):number[]{
        let functionOprand = inst_1.oprand as FunctionOprand;
        let args = functionOprand.args;

        //先把所有的参数Lower掉，这个顺序不能错
        //其中，参数中可能也有嵌套的函数调用
        let numArgs = args.length;
        for (let j = 0; j < numArgs; j++){
            args[j] = this.lowerOprand(liveVars, args[j], newInsts);
        }

        let saveCallerProtectedRegs = (inst_1.op == OpCode.callq);

        //保存Caller负责保护的寄存器
        let varsToSpill:number[]= [];
        let regsToSpill:Register[] = [];

        //保护那些在函数调用之后，仍然会被使用使用的CallerProtected寄存器
        //将这些位置预留下来
        if (saveCallerProtectedRegs){
            for (let varIndex of liveVarsAfterCall){
                let oprand = this.loweredVars.get(varIndex) as Oprand;
                if (oprand.kind == OprandKind.register && 
                    Register.callerProtected.indexOf(oprand as Register) != -1){
                    varsToSpill.push(varIndex);
                    regsToSpill.push(oprand as Register);
                }
            }
        }

        //把参数设置到寄存器
        //并且把需要覆盖的reg溢出
        let usedIntRegisters = 0;  //使用掉的整数寄存器
        let usedXmmRegisters = 0;  //使用掉的xmm寄存器
        let numArgsOnStack = 0;

        let regsSpilled : Register[] = []; 
        for (let j = 0; j < numArgs; j++){
            let dataType = getCpuDataType(functionOprand.functionType.paramTypes[j]);
           
            let regDest:Register|null = null;
            if ((dataType == CpuDataType.int32 || dataType == CpuDataType.int64) && usedIntRegisters < this.MaxIntRegParams ){
                regDest = Register.getParamRegister(dataType, usedIntRegisters);
                usedIntRegisters++;
            }
            else if (dataType == CpuDataType.double && usedXmmRegisters < this.MaxXmmRegParams){
                regDest = Register.getParamRegister(dataType, usedXmmRegisters);
                usedXmmRegisters++;
            }
           
            let opCode = OpCodeUtil.movOp(dataType);

            //用寄存器传递的参数
            if(regDest){
                //把参数用到的寄存器spill出去
                if(saveCallerProtectedRegs){
                    let argIndex = regsToSpill.indexOf(regDest);
                    
                    if (argIndex !=-1){
                        let varIndex = varsToSpill[argIndex];
                        this.spillVar(varIndex,regDest,newInsts);
                        regsSpilled.push(regDest);
                    }
                    //看看这个寄存器是不是在args的后半截
                    //这些参数寄存器之间可能会互相覆盖，因为它们没有参与数据流分析。
                    //所以这里用一个简化的算法来避免这些冲突。
                    else if (j<args.length-1){                            
                        argIndex = args.indexOf(regDest,j+1);
                        if (argIndex !=- 1 && regsSpilled.indexOf(regDest) == -1){
                            //从寄存器倒查出varIndex
                            let varIndex = this.getVarIndexOfReg(regDest) as number;
                            if (regsToSpill.indexOf(regDest)==-1){
                                regsToSpill.push(regDest);
                                varsToSpill.push(varIndex);
                            }
                            this.spillVar(varIndex,regDest,newInsts);
                            regsSpilled.push(regDest);

                            //换成内存格式的Oprand
                            args[argIndex] = this.loweredVars.get(varIndex) as Oprand;
                        } 
                    }
                }

                if (regDest !== args[j]){
                    newInsts.push(new Inst_2(opCode, args[j], regDest)); 
                }
            }
            //超出寄存器容纳的参数，放到栈里
            else{  
                //参数是倒着排的。
                //比如，对于整数来说，栈顶是参数7，再往上，依次是参数8、参数9...
                //在Callee中，会到Caller的栈桢中去读取参数值
                let offset = numArgsOnStack*8;
                numArgsOnStack++;
                newInsts.push(new Inst_2(opCode, args[j], new MemAddress(Register.rsp, offset)));
            }
        }

        //Spill剩余的寄存器
        if(saveCallerProtectedRegs){
            for (let i:number = 0; i< regsToSpill.length; i++){
                if (regsSpilled.indexOf(regsToSpill[i])){
                    this.spillVar(varsToSpill[i], regsToSpill[i],newInsts);
                }
            }
        }

        //如果函数有返回值，那么要把返回值用到的寄存器腾出来
        if(functionOprand.functionType.returnType !== SysTypes.Void){
            let reg = Register.returnReg(getCpuDataType(functionOprand.functionType.returnType));
            let varIndex = this.getVarIndexOfReg(reg);
            if (varIndex && liveVarsAfterCall.indexOf(varIndex) != -1){ 
                this.spillVar(varIndex,reg, newInsts);
            }
        }

        //对于尾递归和尾调用，不生成call指令。而是去Lower在return语句中，生成的连个特殊的jmp指令。
        if(inst_1.op != OpCode.tailRecursive && inst_1.op != OpCode.tailCall){
            functionOprand.args = []; //把参数清空，方便打印。

            //函数调用的指令
            newInsts.push(inst_1);
            
            //锁定住返回值所需要的寄存器，不被占用，直到Lower ReturnSlot的时候
            if(functionOprand.functionType.returnType != SysTypes.Void){

            }

        }

        // //清除预留的寄存器
        // this.reservedRegisters = [];

        return varsToSpill;  //??
    }

    /**
     * Lower操作数。
     * 主要任务是给变量分配物理寄存器或内存地址。
     * 分配寄存器有几种场景：
     * 1.不要求返回值的类型
     * 如果操作数是源操作数，那么可以是寄存器，也可以是内存地址。优先分配寄存器。如果寄存器不足，则直接溢出到内存。
     * 2.要求返回值不能是内存地址
     * 如果操作数需要一个寄存器（典型的是加减乘除操作的一个操作数已经是内存地址了），那么就要分配一个寄存器给另一个寄存器。
     * 如果之前已经分配过了，并且不是寄存器，那么就溢出到内存。
     * 
     * @param oprand 
     */
    private lowerOprand(liveVars:number[], oprand:Oprand, newInsts:Inst[], noMemory:boolean = false):Oprand{
        let newOprand = oprand;
        
        //变量
        if(oprand instanceof VarOprand){
            let varIndex:number = oprand.value as number;  

            if (this.loweredVars.has(varIndex)){            
                newOprand = this.loweredVars.get(varIndex) as Oprand; 
                if (noMemory && newOprand.kind == OprandKind.memory){
                    newOprand = this.reloadVar(varIndex, newInsts) as Register;
                }
            }
            else{ 
                let reg = this.getFreeRegister(oprand.dataType, liveVars);
                if (reg == null){
                    reg = this.spillARegister(oprand.dataType, newInsts) as Register;
                }
                this.assignRegToVar(varIndex,reg);        
            }
        }
        //逻辑的内存地址
        else if(oprand instanceof LogicalMemAddress){ 
            let base:Oprand|null|undefined = this.loweredVars.get(oprand.varIndex);
            if (!(base instanceof Register)){
                base = this.reloadVar(oprand.varIndex, newInsts);
            }

            if (base instanceof Register){
                newOprand = new MemAddress(base, oprand.offset, oprand.index, oprand.bytes);
            }
            else{
                console.log("Error lowering LogicalMemAddress oprand: " + oprand.toString());
            }
        }
        //字符串字面量
        else if(oprand.kind == OprandKind.stringConst){
            let constIndex = oprand.value as number;
            oprand.kind = OprandKind.label;
            oprand.value = genStringConstLabel(constIndex)+"(%rip)";
        }

        return newOprand;
    }

    /**
     * 将某个变量溢出到内存。
     * @param varIndex 
     * @param reg 
     */
    private spillVar(varIndex:number, reg:Register, newInsts:Inst[]):MemAddress{
        let address:MemAddress;
        if(this.spilledVars2Address.has(varIndex)){
            address = this.spilledVars2Address.get(varIndex) as MemAddress
        }
        else{
            // this.spillOffset += 4;
            this.spillOffset += 8; //浮点数是8个字节
            address = new MemAddress(Register.rbp, -this.spillOffset);
            this.spilledVars2Address.set(varIndex, address);
            this.spilledVars2Reg.set(varIndex, reg);
        }
        let opCode = OpCodeUtil.movOp(reg.dataType);
        newInsts.push(new Inst_2(opCode, reg, address, "spill\tvar"+varIndex));
        this.loweredVars.set(varIndex, address);
        return address;
    }

    private reloadVar(varIndex:number,newInsts:Inst[]):Register|null{
        let oprand = this.loweredVars.get(varIndex) as Oprand;
        if (oprand.kind == OprandKind.memory){
            let address = oprand as MemAddress;
            let reg = this.spilledVars2Reg.get(varIndex) as Register;
            //查看该reg是否正在被其他变量占用
            for (let varIndex1 of this.loweredVars.keys()){
                let oprand1 = this.loweredVars.get(varIndex1);
                if (oprand1 == reg){
                    this.spillVar(varIndex, oprand1 as Register, newInsts);
                    break;
                }
            }
            this.assignRegToVar(varIndex, reg);
            let opCode = OpCodeUtil.movOp(reg.dataType);
            newInsts.push(new Inst_2(opCode, address, reg, "reload\tvar" + varIndex));
            return reg;
        }
        else if (oprand instanceof Register){
            return oprand;
        }
        else{
            //理论上不会到这里
            console.log("Whoops! unsupported oprand type in relaodVar: "+oprand.toString());
            return null;
        }
    }

    /**
     * 选一个寄存器，溢出出去。
     */
    private spillARegister(dataType:CpuDataType, newInsts:Inst[]):Register|null{
          for (let varIndex of this.loweredVars.keys()){
            let oprand = this.loweredVars.get(varIndex) as Oprand;
            // if (oprand.kind == OprandKind.register && this.reservedRegisters.indexOf(oprand as Register)!=-1){
            if (oprand instanceof Register && oprand.dataType == dataType){
                this.spillVar(varIndex, oprand as Register, newInsts);
                return oprand;
            }
        }

        //理论上，不会到达这里。
        return null;
    }

    private assignRegToVar(varIndex:number, reg:Register){
        //更新usedCalleeProtectedRegs
        if(Register.calleeProtected32.indexOf(reg) != -1 && this.usedCalleeProtectedRegs.indexOf(reg) == -1){
            this.usedCalleeProtectedRegs.push(reg);
        }
        //更新loweredVars
        this.loweredVars.set(varIndex,reg);
    }

    //从寄存器倒着查出varIndex
    private getVarIndexOfReg(reg:Register):number|undefined{
        for(let varIndex of this.loweredVars.keys()){
            if (this.loweredVars.get(varIndex) == reg){
                return varIndex;
            }
        }
    }

    /**
     * 获取一个空余的寄存器
     * @param liveVars 
     */
    private getFreeRegister(dataType:CpuDataType,liveVars:number[]):Register|null{
        let result:Register|null = null;

        //1.从空余的寄存器中寻找一个。
        let allocatedRegisters:Register[] = [];

        for (let varIndex of this.loweredVars.keys()){
            let oprand = this.loweredVars.get(varIndex);
            if(oprand instanceof Register){
                allocatedRegisters.push(oprand as Register);
            }
            else if (oprand instanceof MemAddress){
                allocatedRegisters.push(this.spilledVars2Reg.get(varIndex) as Register);
            }
            else{
                console.log("Unknown oprand in getFreeRegister:");
                console.log(oprand);
            }
        }

        // this.loweredVars.forEach((oprand,varIndex)=>{
        //     //已经lower了的每个变量，都会锁定一个寄存器。
        //     if(oprand.kind == OprandKind.register){
        //         allocatedRegisters.push(oprand as Register);
        //     }
        //     else{
        //         allocatedRegisters.push(this.spilledVars2Reg.get(varIndex) as Register);
        //     }
        //     });
        
        //确定寄存器池
        let regs:Register[]=Register.getRegisters(dataType); 

        for (let reg of regs){
            // if (allocatedRegisters.indexOf(reg) == -1 && this.reservedRegisters.indexOf(reg)==-1){
            if (allocatedRegisters.indexOf(reg) == -1){
                result = reg;
                break;
            }
        }

        //2.从已分配的varIndex里面找一个
        // if (result == null){
        //     for (let varIndex of this.loweredVars.keys()){
        //         // todo 下面的逻辑是不安全的，在存在cfg的情况下，不能简单的判断变量是否真的没用了。
        //         if (liveVars.indexOf(varIndex) == -1){
        //             let oprand = this.loweredVars.get(varIndex) as Oprand;
        //             if (oprand.kind == OprandKind.register && this.reservedRegisters.indexOf(oprand as Register)==-1){
        //                 result = oprand as Register;
        //                 this.loweredVars.delete(varIndex);
        //                 break;
        //             }
        //         }
        //     }
        // }
        return result;
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

    //变量活跃性分析
    let livenessAnalyzer = new LivenessAnalyzer(asmModule);
    let result = livenessAnalyzer.execute();
    
    // if(verbose){
        console.log("liveVars");
        for (let fun of asmModule.fun2Code.keys()){
            console.log("\nfunction: " + fun.name)
            let bbs = asmModule.fun2Code.get(fun) as BasicBlock[];
            for (let bb of bbs){
                console.log("\nbb:"+bb.getName());
                for (let inst of bb.insts){
                    let vars = result.liveVars.get(inst);
                    console.log(vars);
                    console.log(inst.toString());
                }
                console.log(result.initialVars.get(bb));
            }
        }
    // }

    // Lower
    let lower = new Lower(asmModule, result);
    lower.lowerModule();

    let asm = asmModule.toString();
    if (verbose){
        console.log("在Lower之后：");
        console.log(asm);
    }

    return asm;
}

/**
 * 变量活跃性分析的结果
 */
class LivenessResult{
    liveVars:Map<Inst, number[]> = new Map();
    initialVars:Map<BasicBlock, number[]> = new Map();
}

/**
 * 控制流图
 */
class CFG{
    //基本块的列表。第一个和最后一个BasicBlock是图的root。
    bbs:BasicBlock[];

    //每个BasicBlock输出的边
    edgesOut:Map<BasicBlock, BasicBlock[]>=new Map();

    //每个BasicBlock输入的边
    edgesIn:Map<BasicBlock,BasicBlock[]> = new Map();

    constructor(bbs:BasicBlock[]){
        this.bbs = bbs;
        this.buildCFG();
    }

    private buildCFG(){
        //构建edgesOut;
        for (let i:number = 0; i < this.bbs.length-1; i++){ //最后一个基本块不用分析
            let bb = this.bbs[i];
            let toBBs:BasicBlock[] = [];
            this.edgesOut.set(bb,toBBs);
            let lastInst = bb.insts[bb.insts.length -1];
            if (OpCodeUtil.isJump(lastInst.op)){
                let jumpInst = lastInst as Inst_1;
                let destBB = jumpInst.oprand.value as BasicBlock;
                toBBs.push(destBB);
                //如果是条件分枝，那么还要加上下面紧挨着的BasicBlock
                if (jumpInst.op != OpCode.jmp){
                    toBBs.push(this.bbs[i+1]);
                }
            }
            else{ //如果最后一条语句不是跳转语句，则连接到下一个BB
                toBBs.push(this.bbs[i+1]);
            }

        }

        //构建反向的边:edgesIn
        for (let bb of this.edgesOut.keys()){
            let toBBs = this.edgesOut.get(bb) as BasicBlock[];
            for (let toBB of toBBs){
                let fromBBs = this.edgesIn.get(toBB);
                if (typeof fromBBs == 'undefined'){
                    fromBBs = [];
                    this.edgesIn.set(toBB, fromBBs);
                }
                fromBBs.push(bb);
            }
        }
    }

    toString():string{
        let str = "";
        str += "bbs:\n";
        for (let bb of this.bbs){
            str += "\t"+bb.getName() + "\n";
        }

        str += "edgesOut:\n";
        for (let bb of this.edgesOut.keys()){
            str += "\t"+bb.getName()+"->\n";
            let toBBs = this.edgesOut.get(bb) as BasicBlock[];
            for (let bb2 of toBBs){
                str += "\t\t"+bb2.getName()+"\n";
            }
        }

        str += "edgesIn:\n";
        for (let bb of this.edgesIn.keys()){
            str += "\t"+bb.getName()+"<-\n";
            let fromBBs = this.edgesIn.get(bb) as BasicBlock[];
            for (let bb2 of fromBBs){
                str += "\t\t"+bb2.getName()+"\n";
            }
        }
        return str;
    }
}

/**
 * 变量活跃性分析。
 */
class LivenessAnalyzer{
    asmModule:AsmModule;
    constructor(asmModule:AsmModule){
        this.asmModule = asmModule;
    }

    execute():LivenessResult{
        let result = new LivenessResult();

        for (let fun of this.asmModule.fun2Code.keys()){
            let bbs = this.asmModule.fun2Code.get(fun) as BasicBlock[];
            this.analyzeFunction(bbs, result);   
        }

        return result;
    }

    /**
     * 给一个函数做变量活跃性分析。
     * 每个函数的CFG是一个有角的图（rooted graph）。
     * 我们多次遍历这个图，每次一个基本块的输出会作为另一个基本块的输入。
     * 只有当遍历的时候，没有活跃变量的集合发生变化，算法才结束。
     * @param fun 
     * @param bbs 
     * @param funIndex 
     * @param result 
     */
    private analyzeFunction(bbs:BasicBlock[], result:LivenessResult){
        let cfg = new CFG(bbs);

        console.log(cfg.toString());

        //做一些初始化工作
        for (let bb of bbs){
            result.initialVars.set(bb,[]);
        }

        //持续遍历图，直到没有BasicBlock的活跃变量需要被更新
        let bbsToDo:BasicBlock[] = bbs.slice(0);
        while (bbsToDo.length>0){
            let bb = bbsToDo.pop() as BasicBlock;
            this.analyzeBasicBlock(bb, result);
            //取出第一行的活跃变量集合，作为对前面的BasicBlock的输入
            let liveVars = bb.insts.length == 0? [] : (result.liveVars.get(bb.insts[0]) as number[]); 
            let fromBBs = cfg.edgesIn.get(bb);
            if (typeof fromBBs != 'undefined'){
                for (let bb2 of fromBBs){
                    let liveVars2 = result.initialVars.get(bb2) as number[];
                    //如果能向上面的BB提供不同的活跃变量，则需要重新分析bb2
                    if (!this.isSubsetOf(liveVars, liveVars2)){
                        if (bbsToDo.indexOf(bb2) == -1)
                            bbsToDo.push(bb2);
                        let unionVars = this.unionOf(liveVars, liveVars2);
                        result.initialVars.set(bb2, unionVars);
                    }
                }
            }
        }

    }

    /**
     * set1是不是set2的子集
     * @param set1 
     * @param set2 
     */
    private isSubsetOf(set1:number[], set2:number[]):boolean{
        if(set1.length <= set2.length){
            for (let n of set1){
                if (set2.indexOf(n)==-1){
                    return false;
                }
            }
            return true;
        }
        else{
            return false;
        }
    }

    /**
     * 返回set1和set2的并集
     * @param set1 
     * @param set2 
     */
    private unionOf(set1:number[], set2:number[]):number[]{
        let set3:number[] = set1.slice(0);
        for (let n of set2){
            if (set3.indexOf(n) == -1){
                set3.push(n);
            }
        }
        return set3;
    }

    /**
     * 给基本块做活跃性分析。
     * 算法：从基本块的最后一条指令倒着做分析。
     * @param bb 
     * @param result 
     */
    private analyzeBasicBlock(bb:BasicBlock, result:LivenessResult):boolean{
        let changed = false;

        //找出BasicBlock初始的集合
        let vars = result.initialVars.get(bb) as number[];
        vars = vars.slice(0); //克隆一份

        //为每一条指令计算活跃变量集合
        for (let i = bb.insts.length - 1; i >=0; i--){
            let inst = bb.insts[i];
            if (inst.numOprands == 1){
                let inst_1 = inst as Inst_1;
                //变量声明伪指令，从liveVars集合中去掉该变量
                if (inst_1.op == OpCode.declVar){
                    let varIndex = inst_1.oprand.value as number;
                    let indexInArray = vars.indexOf(varIndex);
                    if (indexInArray != -1){
                        vars.splice(indexInArray,1);
                    }
                }
                //查看指令中引用了哪个变量，就加到liveVars集合中去
                else{
                    this.updateLiveVars(inst_1, inst_1.oprand, vars);
                }
            }
            else if (inst.numOprands == 2){
                let inst_2 = inst as Inst_2;
                this.updateLiveVars(inst_2, inst_2.oprand1, vars);
                this.updateLiveVars(inst_2, inst_2.oprand2, vars);
            } 
    
            result.liveVars.set(inst, vars);
            vars = vars.slice(0); //克隆一份，用于下一条指令
        }

        return changed;
    }

    /**
     * 把操作数用到的变量增加到当前指令的活跃变量集合里面。
     * @param inst 
     * @param oprand 
     * @param vars 
     */
    private updateLiveVars(inst:Inst, oprand:Oprand, vars:number[]){
        if (oprand.kind == OprandKind.varIndex){
            let varIndex = oprand.value as number;
            if (vars.indexOf(varIndex)== -1){
                vars.push(varIndex);
            }
        }
        else if (oprand.kind == OprandKind.function){
            let functionOprand = oprand as FunctionOprand;
            for (let arg of functionOprand.args){
                this.updateLiveVars(inst, arg, vars);
            }
        }
    }

}

/**
 * 将一个数字转换成Ieee754格式的16进制的字符串
 * @param n 
 */
function doubleToIeee754(n:number):string{
    var ieee754 = require('ieee754')

    const buf = Buffer.alloc(8)

    buf.writeDoubleLE(n, 0)

    let s = buf.toString("hex");

    //原来的输出，是倒着放的。所以要反转过来。
    return "0x" + s[14] + s[15] + s[12] + s[13] + s[10] + s[11] + s[8] + s[9] + s[6] + s[7] + s[4] + s[5] + s[2] + s[3] + s[0] + s[1]; 
}


//根据函数下标和常量的下标生成double字面量的标签
function genDoubleLiteralLabel(funIndex:number, literalIndex:number, withRip:boolean):string{
    return "LCPI"+funIndex+"_"+literalIndex + (withRip? "(%rip)" : "");
}

function genStringConstLabel(index:number){
    return "L_.str" + (index == 0 ? "" : "."+index);
}

//根据数据类型确定寄存器类型
function getCpuDataType(t:Type):CpuDataType{
    let dataType = CpuDataType.double;
    
    if (t === SysTypes.String || t === SysTypes.Object || t instanceof ArrayType){
        dataType = CpuDataType.int64;
    }
    else if (t === SysTypes.Integer){
        // dataType = CpuDataType.int32;
        dataType = CpuDataType.int64;     //暂时都只用long
    }
    else if (t === SysTypes.Number || t === SysTypes.Decimal){
        dataType = CpuDataType.double;
    }
    else{
        console.log("Whoops! Unsupported dataType in getCpuDataType : " + t.toString());
    }
    
    return dataType;
}



