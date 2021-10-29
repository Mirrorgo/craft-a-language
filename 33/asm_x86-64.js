"use strict";
/**
 * 生成X64机器的指令
 * @version 0.2
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-27
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileToAsm = void 0;
const symbol_1 = require("./symbol");
const ast_1 = require("./ast");
const console_1 = require("console");
const scanner_1 = require("./scanner");
const types_1 = require("./types");
const tail_1 = require("./tail");
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
    OpCode[OpCode["jbe"] = 7] = "jbe";
    OpCode[OpCode["jb"] = 8] = "jb";
    OpCode[OpCode["jae"] = 9] = "jae";
    OpCode[OpCode["ja"] = 10] = "ja";
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
    //SSE指令
    OpCode[OpCode["movsd"] = 200] = "movsd";
    OpCode[OpCode["addsd"] = 201] = "addsd";
    OpCode[OpCode["subsd"] = 202] = "subsd";
    OpCode[OpCode["mulsd"] = 203] = "mulsd";
    OpCode[OpCode["divsd"] = 204] = "divsd";
    OpCode[OpCode["sqrtsd"] = 205] = "sqrtsd";
    OpCode[OpCode["maxsd"] = 206] = "maxsd";
    OpCode[OpCode["minsd"] = 207] = "minsd";
    OpCode[OpCode["cmpsd"] = 208] = "cmpsd";
    OpCode[OpCode["comisd"] = 209] = "comisd";
    OpCode[OpCode["ucomisd"] = 210] = "ucomisd";
    OpCode[OpCode["cvttsd2si"] = 240] = "cvttsd2si";
    OpCode[OpCode["cvtsi2sdq"] = 241] = "cvtsi2sdq";
    //伪指令
    OpCode[OpCode["declVar"] = 300] = "declVar";
    OpCode[OpCode["reload"] = 301] = "reload";
    OpCode[OpCode["tailRecursive"] = 302] = "tailRecursive";
    OpCode[OpCode["tailCall"] = 303] = "tailCall";
    OpCode[OpCode["tailRecursiveJmp"] = 304] = "tailRecursiveJmp";
    OpCode[OpCode["tailCallJmp"] = 305] = "tailCallJmp";
})(OpCode || (OpCode = {}));
//根据数据类型来获取正确的操作码和寄存器
class OpCodeUtil {
    static isReturn(op) {
        return op == OpCode.retb || op == OpCode.retw || op == OpCode.retl || op == OpCode.retq;
    }
    static isJump(op) {
        return op < 20;
    }
    static isMov(op) {
        return OpCodeUtil.movs.indexOf(op) != -1;
    }
    static movOp(dataType) {
        return OpCodeUtil.movs[dataType];
    }
    static addOp(dataType) {
        return OpCodeUtil.adds[dataType];
    }
    static subOp(dataType) {
        return OpCodeUtil.subs[dataType];
    }
    static mulOp(dataType) {
        return OpCodeUtil.muls[dataType];
    }
    static divOp(dataType) {
        return OpCodeUtil.divs[dataType];
    }
    static cmpOp(dataType) {
        return OpCodeUtil.cmps[dataType];
    }
    static jgOp(dataType) {
        return OpCodeUtil.jgs[dataType];
    }
    static jgeOp(dataType) {
        return OpCodeUtil.jges[dataType];
    }
    static jlOp(dataType) {
        return OpCodeUtil.jls[dataType];
    }
    static jleOp(dataType) {
        return OpCodeUtil.jles[dataType];
    }
}
OpCodeUtil.adds = [OpCode.addl, OpCode.addq, OpCode.addsd];
OpCodeUtil.subs = [OpCode.subl, OpCode.subq, OpCode.subsd];
OpCodeUtil.muls = [OpCode.mull, OpCode.imulq, OpCode.mulsd];
OpCodeUtil.divs = [OpCode.divl, OpCode.divq, OpCode.divsd]; //todo：长整型的div指令待定
OpCodeUtil.movs = [OpCode.movl, OpCode.movq, OpCode.movsd];
OpCodeUtil.cmps = [OpCode.ucomisd, OpCode.ucomisd, OpCode.ucomisd]; //todo: 暂时都用ucomisd指令
OpCodeUtil.jgs = [OpCode.jg, OpCode.jg, OpCode.ja];
OpCodeUtil.jges = [OpCode.jge, OpCode.jge, OpCode.jae];
OpCodeUtil.jls = [OpCode.jl, OpCode.jl, OpCode.jb];
OpCodeUtil.jles = [OpCode.jle, OpCode.jle, OpCode.jbe];
/**
 * 指令
 */
class Inst {
    constructor(op, numOprands, comment = null) {
        this.op = op;
        this.numOprands = numOprands;
        this.comment = comment;
    }
    patchComments(str) {
        if (this.comment != null) {
            if (str.length < 11)
                str += "\t\t\t";
            else if (str.length < 19)
                str += "\t\t";
            else if (str.length < 21)
                str += "\t";
            str += (this.comment == null ? "" : "\t\t#  " + this.comment);
        }
        return str;
    }
}
/**
 * 没有操作数的指令
 */
class Inst_0 extends Inst {
    constructor(op, comment = null) {
        super(op, 0, comment);
    }
    toString() {
        let str = OpCode[this.op];
        return this.patchComments(str);
    }
}
/**
 * 有一个操作数的指令
 */
class Inst_1 extends Inst {
    constructor(op, oprand, comment = null) {
        super(op, 1, comment);
        this.oprand = oprand;
    }
    toString() {
        let str = OpCode[this.op] + "\t" + this.oprand.toString();
        return this.patchComments(str);
    }
    static isInst_1(inst) {
        return typeof inst.oprand == 'object';
    }
}
/**
 * 有一个操作数的指令
 */
class Inst_2 extends Inst {
    constructor(op, oprand1, oprand2, comment = null) {
        super(op, 2, comment);
        this.oprand1 = oprand1;
        this.oprand2 = oprand2;
    }
    toString() {
        let str = OpCode[this.op] + "\t" + this.oprand1.toString() + ", " + this.oprand2.toString();
        return this.patchComments(str);
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
            let b = this.value;
            return b.getName();
        }
        else if (this.kind == OprandKind.label) {
            return this.value;
        }
        else if (this.kind == OprandKind.immediate) {
            return "$" + this.value;
        }
        else {
            return OprandKind[this.kind] + "(" + this.value + ")";
        }
    }
}
class VarOprand extends Oprand {
    constructor(index, varName, dataType) {
        super(OprandKind.varIndex, index);
        this.dataType = dataType;
        this.varName = varName;
    }
    get varIndex() {
        return this.value;
    }
    toString() {
        return "var" + this.value + "(" + this.varName + "):" + CpuDataType[this.dataType];
    }
}
class FunctionOprand extends Oprand {
    constructor(functionType, args, functionName = null, functionAddress = null, isConstructorOrMethod = false) {
        super(OprandKind.function, undefined);
        this.args = args;
        this.functionType = functionType;
        this.functionAddress = functionAddress;
        this.functionName = functionName;
        this.isMethodOrConstructor = isConstructorOrMethod;
    }
    // get functionSym():FunctionSymbol|null{
    //     return this.value as FunctionSymbol;
    // }
    // get functionType():FunctionType{
    //     return this.functionSym.theType as FunctionType;
    // }    
    //在lower以后，args就会被清空，toString()会生成正确的函数标签。
    toString() {
        let strArgs = "";
        for (let i = 0; i < this.args.length; i++) {
            if (i == 0)
                strArgs += "(";
            strArgs += this.args[i].toString();
            if (i < this.args.length - 1)
                strArgs += ", ";
            else
                strArgs += ")";
        }
        if (this.functionAddress) {
            return "*" + this.functionAddress.toString();
        }
        else {
            return "_" + this.functionName + strArgs;
        }
    }
}
//条件语句产生的Oprand，里面记录了比较操作符的类型，以及数据类型（用于确定具体的跳转指令）
class CmpOprand extends Oprand {
    constructor(op, dataType) {
        super(OprandKind.cmp, op);
        this.dataType = dataType;
    }
    toString() {
        return "var" + this.value + "(" + CpuDataType[this.dataType] + ")";
    }
}
/**
 * 内存寻址
 * 这是个简化的版本，只支持基于寄存器的偏移量
 * 后面根据需要再扩展。
 */
class MemAddress extends Oprand {
    constructor(oprand, offset, index = 0, bytes = undefined) {
        super(OprandKind.memory, 'undefined');
        this.base = oprand;
        this.offset = offset;
        this.index = index;
        this.bytes = bytes;
    }
    toString() {
        //输出结果类似于：8(%rbp)
        //如果offset为0，那么不显示，即：(%rbp)
        return (this.offset == 0 ? "" : this.offset) + "("
            + this.base.toString()
            + (this.index > 0 ? "," + this.index : "")
            + (this.index > 0 && this.bytes ? "," + this.bytes : "")
            + ")";
    }
}
// class MemAddress extends Oprand{
//     // register:Register;
//     offset:number;
//     index:number;
//     bytes:1|2|4|8|undefined;
//     constructor(register:Register, offset:number, index: number = 0, bytes:1|2|4|8|undefined = undefined){
//         super(OprandKind.memory,'undefined')
//         this.register = register;
//         this.offset = offset;
//         this.index = index;
//         this.bytes = bytes;
//     }
//     toString():string{
//         //输出结果类似于：8(%rbp)
//         //如果offset为0，那么不显示，即：(%rbp)
//         return (this.offset == 0 ? "" : this.offset) + "("
//                 + this.register.toString()
//                 + (this.index > 0 ? "," + this.index : "")
//                 + (this.index > 0 && this.bytes ? "," + this.bytes : "")
//                 + ")";
//     }
// }
// /**
//  * 逻辑上的内存寻址模式，可以Lower成为MemAddress
//  */
// class LogicalMemAddress extends Oprand{
//     varIndex:number;  //相对于哪个变量（后面会Lower成寄存器）做偏移
//     offset:number;    //偏移量
//     index:number;     //数组下标
//     bytes:1|2|4|8|undefined;
//     constructor(varIndex:number, offset:number, index: number = 0, bytes:1|2|4|8|undefined = undefined){
//         super(OprandKind.logicalMemory,'undefined')
//         this.varIndex = varIndex;
//         this.offset = offset;
//         this.index = index;
//         this.bytes = bytes;
//     }
//     toString():string{
//         return (this.offset == 0 ? "" : this.offset) + "("
//                 + "var"+this.varIndex.toString()
//                 + (this.index > 0 ? ", " + this.index : "")
//                 + (this.index > 0 && this.bytes ? ", " + this.bytes : "")
//                 + ")";
//     }
// }
/**
 * 操作数的类型
 */
var OprandKind;
(function (OprandKind) {
    //抽象度较高的操作数
    OprandKind[OprandKind["varIndex"] = 0] = "varIndex";
    // returnSlot,     //用于存放返回值的位置（通常是一个寄存器）
    OprandKind[OprandKind["bb"] = 1] = "bb";
    OprandKind[OprandKind["function"] = 2] = "function";
    OprandKind[OprandKind["stringConst"] = 3] = "stringConst";
    OprandKind[OprandKind["doubleIndex"] = 4] = "doubleIndex";
    OprandKind[OprandKind["logicalMemory"] = 5] = "logicalMemory";
    //抽象度较低的操作数
    OprandKind[OprandKind["register"] = 6] = "register";
    OprandKind[OprandKind["memory"] = 7] = "memory";
    OprandKind[OprandKind["immediate"] = 8] = "immediate";
    OprandKind[OprandKind["label"] = 9] = "label";
    //cmp指令的结果，是设置寄存器的标志位
    //后面可以根据flag和比较操作符的类型，来确定后续要生成的代码
    OprandKind[OprandKind["cmp"] = 10] = "cmp";
})(OprandKind || (OprandKind = {}));
//CPU原生支持的数据类型。
//不同的数据类型，使用不同的指令和寄存器。
var CpuDataType;
(function (CpuDataType) {
    CpuDataType[CpuDataType["int32"] = 0] = "int32";
    CpuDataType[CpuDataType["int64"] = 1] = "int64";
    CpuDataType[CpuDataType["double"] = 2] = "double";
})(CpuDataType || (CpuDataType = {}));
;
class Register extends Oprand {
    constructor(registerName, dataType = CpuDataType.int32) {
        super(OprandKind.register, registerName);
        this.dataType = CpuDataType.int32; //寄存器的位数
        this.dataType = dataType;
    }
    //获取用于参数传递的寄存器数组
    static getParamRegister(dataType, index) {
        let registers;
        switch (dataType) {
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
    //根据不同的返回值类型，确定不通过的寄存器
    static returnReg(dataType) {
        return Register.retRegs[dataType];
    }
    static getRegisters(dataType) {
        let regs;
        switch (dataType) {
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
//64位寄存器
//参数用的寄存器，当然也要由caller保护
Register.rdi = new Register("rdi", CpuDataType.int64);
Register.rsi = new Register("rsi", CpuDataType.int64);
Register.rdx = new Register("rdx", CpuDataType.int64);
Register.rcx = new Register("rcx", CpuDataType.int64);
Register.r8 = new Register("r8", CpuDataType.int64);
Register.r9 = new Register("r9", CpuDataType.int64);
//通用寄存器:caller（调用者）负责保护
Register.r10 = new Register("r10", CpuDataType.int64);
Register.r11 = new Register("r11", CpuDataType.int64);
//返回值，也由Caller保护
Register.rax = new Register("rax", CpuDataType.int64);
//通用寄存器:callee（调用者）负责保护
Register.rbx = new Register("rbx", CpuDataType.int64);
Register.r12 = new Register("r12", CpuDataType.int64);
Register.r13 = new Register("r13", CpuDataType.int64);
Register.r14 = new Register("r14", CpuDataType.int64);
Register.r15 = new Register("r15", CpuDataType.int64);
//栈顶和栈底
Register.rsp = new Register("rsp", CpuDataType.int64);
Register.rbp = new Register("rbp", CpuDataType.int64);
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
Register.paramRegisters64 = [
    Register.rdi,
    Register.rsi,
    Register.rdx,
    Register.rcx,
    Register.r8,
    Register.r9,
];
//Callee保护的寄存器
Register.calleeProtected64 = [
    Register.rbx,
    Register.r12,
    Register.r13,
    Register.r14,
    Register.r15,
];
//xmm寄存器
Register.xmm0 = new Register("xmm0", CpuDataType.double);
Register.xmm1 = new Register("xmm1", CpuDataType.double);
Register.xmm2 = new Register("xmm2", CpuDataType.double);
Register.xmm3 = new Register("xmm3", CpuDataType.double);
Register.xmm4 = new Register("xmm4", CpuDataType.double);
Register.xmm5 = new Register("xmm5", CpuDataType.double);
Register.xmm6 = new Register("xmm6", CpuDataType.double);
Register.xmm7 = new Register("xmm7", CpuDataType.double);
Register.xmm8 = new Register("xmm8", CpuDataType.double);
Register.xmm9 = new Register("xmm9", CpuDataType.double);
Register.xmm10 = new Register("xmm10", CpuDataType.double);
Register.xmm11 = new Register("xmm11", CpuDataType.double);
Register.xmm12 = new Register("xmm12", CpuDataType.double);
Register.xmm13 = new Register("xmm13", CpuDataType.double);
Register.xmm14 = new Register("xmm14", CpuDataType.double);
Register.xmm15 = new Register("xmm15", CpuDataType.double);
Register.xmmRegs = [
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
Register.paramRegistersXmm = [
    Register.xmm0,
    Register.xmm1,
    Register.xmm2,
    Register.xmm3,
    Register.xmm4,
    Register.xmm5,
    Register.xmm6,
    Register.xmm7,
];
Register.callerProtected = [
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
//用于放返回值的寄存器
Register.retRegs = [Register.eax, Register.rax, Register.xmm0];
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
        else if (this.bbIndex != -1) {
            return "LBB" + this.bbIndex;
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
        //ieee754格式的double常量
        this.doubleLiteralMap = new Map();
    }
    /**
     * 输出代表该模块的asm文件的字符串。
     */
    toString() {
        let str = "";
        let funIndex = 0;
        for (let fun of this.fun2Code.keys()) {
            //浮点数字面量是以函数为单位的
            str += this.doubleLiteralToSection(fun, funIndex);
            str += "\t.section	__TEXT,__text,regular,pure_instructions\n"; //伪指令：一个文本的section
            let funName = "_" + fun.fullName;
            str += "\n\t.global " + funName + "\n"; //添加伪指令
            str += funName + ":\n";
            str += "\t.cfi_startproc\n";
            let bbs = this.fun2Code.get(fun);
            for (let bb of bbs) {
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
    doubleLiteralToSection(fun, funIndex) {
        let doubleLiterals = this.doubleLiteralMap.get(fun);
        let str = "";
        if (doubleLiterals.length > 0) {
            str += "\t.section	__TEXT,__literal8,8byte_literals\n";
            for (let i = 0; i < doubleLiterals.length; i++) {
                let n = doubleLiterals[i];
                let label = genDoubleLiteralLabel(funIndex, i, false);
                str += label + ":\n";
                str += "\t.quad\t" + doubleToIeee754(n) + "\t\t## double " + n + "\n";
            }
            str += "\n";
        }
        return str;
    }
    stringLiteralToSection() {
        let str = "";
        if (this.stringConsts.length > 0) {
            str += "\t.section	__TEXT,__cstring,cstring_literals\n";
            for (let i = 0; i < this.stringConsts.length; i++) {
                let literal = this.stringConsts[i];
                let label = genStringConstLabel(i);
                str += label + ":\n";
                str += "\t.asciz\t\"" + literal + "\"\n";
            }
        }
        return str;
    }
}
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
        //每个表达式节点对应的临时变量的索引
        this.tempVarMap = new Map();
        //主要用于判断当前的Unary是一个表达式的一部分，还是独立的一个语句
        this.inExpression = false;
        //保存一元后缀运算符对应的指令。
        this.postfixUnaryInst = null;
        //当前的BasicBlock编号
        this.blockIndex = 0;
        //当前函数的double字面量
        this.doubleLiterals = [];
        //当前函数是否是一个方法
        this.isMethod = false;
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
        super(...arguments);
        //编译后的结果
        this.asmModule = null;
        //对象头的大小
        this.Object_Header_Size = 16;
        //数组数据的偏移量
        this.Array_Data_Offset = 24;
        //用来存放返回值的位置
        // private returnSlot:Oprand = new Oprand(OprandKind.returnSlot, -1);
        //一些状态变量
        this.s = new TempStates();
        //This表达式总是返回变量0
        this.ThisOprand = new VarOprand(0, "this", CpuDataType.int64);
        //尾递归和尾调用分析的结果
        this.tailAnalysisResult = null;
    }
    /**
     * 分配一个临时变量的下标。尽量复用已经死掉的临时变量
     */
    allocateTempVar(dataType) {
        let varIndex = this.s.nextTempVarIndex++;
        // let oprand = new Oprand(OprandKind.varIndex, varIndex);
        let oprand = new VarOprand(varIndex, "temp", dataType);
        //临时变量也要添加一个变量声明，以便进行活跃性分析
        this.getCurrentBB().insts.push(new Inst_1(OpCode.declVar, oprand));
        return oprand;
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
    /**
     * 如果操作数不同，则生成mov指令；否则，可以减少一次拷贝。
     * @param src
     * @param dest
     */
    movIfNotSame(dataType, src, dest) {
        if (!src.isSame(dest)) {
            let opCode = OpCodeUtil.movOp(dataType);
            this.getCurrentBB().insts.push(new Inst_2(opCode, src, dest));
        }
    }
    getCurrentBB() {
        return this.s.bbs[this.s.bbs.length - 1];
    }
    newBlock() {
        let bb = new BasicBlock();
        bb.bbIndex = this.s.blockIndex++;
        this.s.bbs.push(bb);
        return bb;
    }
    /**
     * 主函数
     * @param prog
     */
    visitProg(prog) {
        //设置一些状态变量
        this.asmModule = new AsmModule();
        // this.s.functionSym = prog.sym  as FunctionSymbol;
        // this.s.nextTempVarIndex = this.s.functionSym.vars.length;
        //尾递归、尾调用分析
        let tailAnalyzer = new tail_1.TailAnalyzer();
        this.tailAnalysisResult = tailAnalyzer.visitProg(prog);
        this.handleFunction(prog.sym, prog);
        this.tailAnalysisResult = null;
        return this.asmModule;
    }
    visitFunctionDecl(functionDecl) {
        this.handleFunction(functionDecl.sym, functionDecl.body);
    }
    handleFunction(functionSym, block) {
        var _a, _b, _c, _d;
        //保存原来的状态信息
        let s = this.s;
        //新建立状态信息
        this.s = new TempStates();
        this.s.functionSym = functionSym;
        this.s.isMethod = functionSym.classSym != null;
        this.s.nextTempVarIndex = this.s.functionSym.vars.length;
        if (this.s.isMethod)
            this.s.nextTempVarIndex += 1; //对象引用要占一个位置
        //计算当前函数是不是叶子函数
        //先设置成叶子变量。如果遇到函数调用，则设置为false。
        (_a = this.asmModule) === null || _a === void 0 ? void 0 : _a.isLeafFunction.set(this.s.functionSym, true);
        //创建新的基本块
        this.newBlock();
        //生成代码
        this.visitBlock(block);
        //保存生成的代码
        (_b = this.asmModule) === null || _b === void 0 ? void 0 : _b.fun2Code.set(this.s.functionSym, this.s.bbs);
        (_c = this.asmModule) === null || _c === void 0 ? void 0 : _c.numTotalVars.set(this.s.functionSym, this.s.nextTempVarIndex);
        (_d = this.asmModule) === null || _d === void 0 ? void 0 : _d.doubleLiteralMap.set(this.s.functionSym, this.s.doubleLiterals);
        //恢复原来的状态信息
        this.s = s;
    }
    /**
     * 把返回值mov到指定的寄存器。
     * 这里并不生成ret指令，而是在程序的尾声中处理。
     * @param rtnStmt
     */
    visitReturnStatement(rtnStmt) {
        if (rtnStmt.exp != null) {
            let ret = this.visit(rtnStmt.exp);
            //把返回值赋给相应的寄存器
            let dataType = getCpuDataType(rtnStmt.exp.theType);
            this.movIfNotSame(dataType, ret, Register.returnReg(dataType));
            //分叉出一个额外的尾声块。
            if (this.tailAnalysisResult != null) {
                if (this.tailAnalysisResult.tailRecursives.indexOf(rtnStmt.exp) != -1) {
                    this.getCurrentBB().insts.push(new Inst_1(OpCode.jmp, new Oprand(OprandKind.bb, this.s.bbs[0]), "Tail Recursive Optimazation"));
                }
                else if (this.tailAnalysisResult.tailCalls.indexOf(rtnStmt.exp) != -1) {
                    let functionName = rtnStmt.exp.sym.fullName;
                    this.getCurrentBB().insts.push(new Inst_1(OpCode.tailCallJmp, new Oprand(OprandKind.label, "_" + functionName), "Tail Call Optimazation"));
                }
            }
        }
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
        let op = this.getJumpOpCode(compOprand); //todo: 处理if条件不是比较表达式的情况
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
            // op = OpCode.jg;
            op = OpCodeUtil.jgOp(compOprand.dataType);
        }
        else if (compOprand.value == scanner_1.Op.GE) {
            // op = OpCode.jge;
            op = OpCodeUtil.jgeOp(compOprand.dataType);
        }
        else if (compOprand.value == scanner_1.Op.L) {
            // op = OpCode.jl;
            op = OpCodeUtil.jlOp(compOprand.dataType);
        }
        else if (compOprand.value == scanner_1.Op.LE) {
            // op = OpCode.jle;
            op = OpCodeUtil.jleOp(compOprand.dataType);
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
        if (this.s.functionSym != null) {
            let right = null;
            if (variableDecl.init != null) {
                right = this.visit(variableDecl.init);
            }
            let varIndex = this.s.functionSym.vars.indexOf(variableDecl.sym);
            // let left = new Oprand(OprandKind.varIndex,varIndex);
            let dataType = getCpuDataType(variableDecl.theType);
            let left = new VarOprand(varIndex, variableDecl.name, dataType);
            //插入一条抽象指令，代表这里声明了一个变量
            this.getCurrentBB().insts.push(new Inst_1(OpCode.declVar, left));
            //赋值
            if (right)
                this.movIfNotSame(dataType, right, left);
            // if (right) this.getCurrentBB().insts.push(new Inst_2(OpCodeUtil.movOp(dataType), right, left));
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
        console_1.assert(typeof left == 'object', "binary左边表达式没有返回Oprand。");
        console_1.assert(typeof right == 'object', "binary右边表达式没有返回Oprand。");
        //计算出一个目标操作数
        let dest = left;
        let dataType = getCpuDataType(bi.theType);
        if (bi.op == scanner_1.Op.Plus || bi.op == scanner_1.Op.Minus || bi.op == scanner_1.Op.Multiply || bi.op == scanner_1.Op.Divide) {
            if (!(dest instanceof VarOprand)) {
                dest = this.allocateTempVar(dataType);
                insts.push(new Inst_2(OpCodeUtil.movOp(dataType), left, dest));
            }
        }
        //生成指令
        //todo 有问题的地方
        switch (bi.op) {
            case scanner_1.Op.Plus: //'+'
                if (bi.theType === types_1.SysTypes.String) { //字符串加
                    if (types_1.TypeUtil.LE(bi.exp1.theType, types_1.SysTypes.Number)) {
                        left = this.callBuiltIns("double_to_string", [left]);
                    }
                    if (types_1.TypeUtil.LE(bi.exp2.theType, types_1.SysTypes.Number)) {
                        right = this.callBuiltIns("double_to_string", [right]);
                    }
                    let args = [];
                    args.push(left);
                    args.push(right);
                    dest = this.callBuiltIns("string_concat", args);
                }
                else {
                    // this.movIfNotSame(left,dest);
                    insts.push(new Inst_2(OpCodeUtil.addOp(dataType), right, dest));
                }
                break;
            case scanner_1.Op.Minus: //'-'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCodeUtil.subOp(dataType), right, dest));
                break;
            case scanner_1.Op.Multiply: //'*'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCodeUtil.mulOp(dataType), right, dest));
                break;
            case scanner_1.Op.Divide: //'/'
                // this.movIfNotSame(left,dest);
                insts.push(new Inst_2(OpCodeUtil.divOp(dataType), right, dest));
                break;
            case scanner_1.Op.Assign: //'='
                // console.log("in binary.....")
                // console.log(CpuDataType[dataType]);
                // console.log(bi.toString());
                if (dest instanceof VarOprand) {
                    this.movIfNotSame(dataType, right, dest);
                }
                else { //如果目标不是一个虚拟寄存器，那么就通过虚拟寄存器绕一圈。否则，无法直接给内存地址赋值。
                    let tempVar = this.allocateTempVar(dataType);
                    insts.push(new Inst_2(OpCodeUtil.movOp(dataType), right, tempVar));
                    insts.push(new Inst_2(OpCodeUtil.movOp(dataType), tempVar, dest));
                }
                break;
            case scanner_1.Op.G:
            case scanner_1.Op.L:
            case scanner_1.Op.GE:
            case scanner_1.Op.LE:
            case scanner_1.Op.EQ:
            case scanner_1.Op.NE:
                insts.push(new Inst_2(OpCodeUtil.cmpOp(dataType), right, dest));
                // dest = new Oprand(OprandKind.flag, this.getOpsiteOp(bi.op));
                dest = new CmpOprand(this.getOpsiteOp(bi.op), dataType);
                break;
            default:
                console.log("Unsupported OpCode in AsmGenerator.visitBinary: " + scanner_1.Op[bi.op]);
        }
        this.s.inExpression = false;
        return dest;
    }
    // private double_to_string(num:Oprand){
    //     let functionOprand = new FunctionOprand()
    // }
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
    /**
     * 为一元运算符生成指令
     * 对于++或--这样的一元运算，只能是右值。如果是后缀表达式，需要在前一条指令之后，再把其值改一下。
     * 所以，存个临时状态信息
     * @param u
     */
    visitUnary(u) {
        //短路：直接返回constValue
        // if (u.constValue){
        //     if (TypeUtil.LE(u.theType)
        //     return;
        // }
        let insts = this.getCurrentBB().insts;
        let oprand = this.visit(u.exp);
        //用作返回值的Oprand
        let result = oprand;
        let dataType = getCpuDataType(u.theType);
        //++和--
        if (u.op == scanner_1.Op.Inc || u.op == scanner_1.Op.Dec) {
            let tempVar = this.allocateTempVar(getCpuDataType(u.theType));
            insts.push(new Inst_2(OpCodeUtil.movOp(dataType), oprand, tempVar));
            if (u.isPrefix) { //前缀运算符
                result = tempVar;
            }
            else { //后缀运算符
                //把当前操作数放入一个临时变量作为返回值
                result = this.allocateTempVar(getCpuDataType(u.theType));
                insts.push(new Inst_2(OpCodeUtil.movOp(dataType), oprand, result));
            }
            //做+1或-1的运算
            let opCode = u.op == scanner_1.Op.Inc ? OpCodeUtil.addOp(dataType) : OpCodeUtil.subOp(dataType);
            //把常量1变成double字面量
            let literalOprand = this.createDoubleIndexOprand(1);
            // insts.push(new Inst_2(opCode, new Oprand(OprandKind.immediate,1), tempVar));
            insts.push(new Inst_2(opCode, literalOprand, tempVar));
            insts.push(new Inst_2(OpCodeUtil.movOp(dataType), tempVar, oprand));
        }
        //+
        else if (u.op == scanner_1.Op.Plus) {
            result = oprand;
        }
        //-
        else if (u.op == scanner_1.Op.Minus) {
            let tempVar = this.allocateTempVar(getCpuDataType(u.theType));
            //用0减去当前值
            insts.push(new Inst_2(OpCodeUtil.movOp(dataType), new Oprand(OprandKind.immediate, 0), tempVar));
            insts.push(new Inst_2(OpCodeUtil.subOp(dataType), oprand, tempVar));
            result = tempVar;
        }
        return result;
    }
    // visitExpressionStatement(stmt:ExpressionStatement):any{
    //     //先去为表达式生成指令
    //     super.visitExpressionStatement(stmt);  //??
    // }
    visitVariable(variable) {
        if (this.s.functionSym != null && variable.sym != null) {
            if (variable.sym instanceof symbol_1.VarSymbol) {
                let varIndex = this.s.functionSym.vars.indexOf(variable.sym);
                //如果是对象内部的方法或构造方法，要把0号变量给对象引用
                if (this.s.functionSym.classSym) {
                    varIndex += 1;
                }
                return new VarOprand(varIndex, variable.name, getCpuDataType(variable.theType));
            }
            /*
             * 处理变量是一个函数名称的情况。
             * 场景：
             *
             * function sum(prev:number, cur:number):number{
             *   return prev + cur;
             * }
             * let fun:(prev:number,cur:number)=>number = sum;
             *
             * 这个时候，变量sum的Symbol就是FunctionSymbol.
             *
             * 算法：基于FunctionSymbol，获取函数的标签，并加载到一个临时变量中。
             */
            else if (variable.sym instanceof symbol_1.FunctionSymbol) {
                let label = "_" + variable.sym.fullName;
                let tempVar = this.allocateTempVar(CpuDataType.int64);
                this.getCurrentBB().insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.int64), new Oprand(OprandKind.label, label), tempVar));
                return tempVar;
            }
        }
    }
    visitIntegerLiteral(integerLiteral) {
        //todo 这里做了一个临时的逻辑，后面可以更完美一些
        //如果是作为下标表达式的index值，那么必须转为整型
        if (integerLiteral.parentNode instanceof ast_1.IndexedExp && integerLiteral.parentNode.indexExp == integerLiteral) {
            return new Oprand(OprandKind.immediate, integerLiteral.value);
        }
        else {
            return this.createDoubleIndexOprand(integerLiteral.value);
        }
    }
    visitDecimalLiteral(decimalLiteral) {
        return this.createDoubleIndexOprand(decimalLiteral.value);
    }
    /**
     * 处理浮点型字面量
     * 要转成ieee754格式，保存在文本区
     * @param n
     */
    createDoubleIndexOprand(n) {
        let index;
        index = this.s.doubleLiterals.indexOf(n);
        if (index == -1) {
            this.s.doubleLiterals.push(n);
            index = this.s.doubleLiterals.length - 1;
        }
        return new Oprand(OprandKind.doubleIndex, index);
    }
    visitStringLiteral(stringLiteral) {
        //加到常数表里
        if (this.asmModule != null) {
            //把字符串字面量保存到模块中。基于这些字面量可以生成汇编代码中的一个文本段。
            let strIndex = this.asmModule.stringConsts.indexOf(stringLiteral.value);
            if (strIndex == -1) {
                this.asmModule.stringConsts.push(stringLiteral.value);
                strIndex = this.asmModule.stringConsts.length - 1;
            }
            //新申请一个临时变量
            let tempVar = this.allocateTempVar(getCpuDataType(stringLiteral.theType));
            //用leaq指令把字符串字面量加载到一个变量（虚拟寄存器）
            let inst = new Inst_2(OpCode.leaq, new Oprand(OprandKind.stringConst, strIndex), tempVar);
            this.getCurrentBB().insts.push(inst);
            //调用一个内置函数来创建PlayString
            let args = [];
            args.push(tempVar);
            //调用内置函数，返回值是PlayString对象的地址
            return this.callBuiltIns("string_create_by_cstr", args);
        }
    }
    /**
     * 调用intrinsics，创建数组对象。
     * @param arrayLiteral
     */
    visitArrayLiteral(literal) {
        //创建数组对象，返回值是对象的地址，放在一个变量里，会被放在寄存器里
        let args = [];
        args.push(new Oprand(OprandKind.immediate, literal.exps.length));
        let arrOprand = this.callBuiltIns("array_create_by_length", args);
        //类型要从数组的基础类型来计算，避免数组是number[]，而数组元素是integer的情况
        let dataType = getCpuDataType(literal.theType.baseType);
        if (arrOprand.kind == OprandKind.varIndex) {
            let insts = this.getCurrentBB().insts;
            //求每个元素的值，并设置到数组
            for (let i = 0; i < literal.exps.length; i++) {
                let exp = literal.exps[i];
                let src = this.visit(exp);
                //对于浮点型数据，不能直接写到内存，必须通过寄存器来中转
                if (src.kind == OprandKind.doubleIndex) {
                    let tempVar = this.allocateTempVar(CpuDataType.double);
                    insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.double), src, tempVar));
                    src = tempVar;
                }
                let offset = this.Array_Data_Offset + i * 8;
                let dest = new MemAddress(arrOprand, offset);
                insts.push(new Inst_2(OpCodeUtil.movOp(dataType), src, dest));
            }
        }
        else {
            console.log("Expacting an array reference stored in an temp var in visitArrayLiteral.");
        }
        return arrOprand;
    }
    visitIndexedExp(exp) {
        //获取对象引用
        let obj = this.visit(exp.baseExp);
        // this.callBuiltIns("println_l", [obj]);
        //获取下标值
        let indexOprand = this.visit(exp.indexExp);
        let insts = this.getCurrentBB().insts;
        //如果base不是一个变量，就要把它挪到一个变量上
        let objInVar;
        if (obj instanceof VarOprand) {
            objInVar = obj;
        }
        else {
            let tempVar = this.allocateTempVar(CpuDataType.double);
            insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.double), obj, tempVar));
            objInVar = tempVar;
        }
        let rtn;
        //创建一个内存类型的Oprand
        if (indexOprand.kind == OprandKind.immediate) { //下标是个立即数
            let index = indexOprand.value;
            let offset = this.Array_Data_Offset + index * 8;
            //返回右值，也就是通过间接地址访问内存
            rtn = new MemAddress(objInVar, offset);
        }
        else { //下标不是立即数，那就加指令计算出元素地址来
            //先用乘法计算出地址偏移量offset
            //1.把下标挪到寄存器
            let tempVar = this.allocateTempVar(CpuDataType.int64);
            if (exp.baseExp.theType == types_1.SysTypes.Integer) {
                insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.int64), indexOprand, tempVar));
            }
            else { //如果是浮点数，要进行类型转换
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
            if (exp.isLeftValue) { //返回左值，也就是内存地址
                rtn = tempVar;
            }
            else { //返回右值，也就是内存中的内容
                rtn = new MemAddress(tempVar, 0);
            }
        }
        return rtn;
    }
    callBuiltIns(funName, args, typeHind = null) {
        let functionSym = this.getBuiltInFunctionSym(funName, typeHind);
        return this.processFunctionCall(functionSym, args, false, false, undefined);
    }
    getBuiltInFunctionSym(funName, typeHind = null) {
        if (funName == "println") {
            if (typeHind) {
                if (typeHind === types_1.SysTypes.Integer)
                    funName += "_l";
                else if (types_1.TypeUtil.LE(typeHind, types_1.SysTypes.Number))
                    funName += "_d";
                else if (typeHind === types_1.SysTypes.String)
                    funName += "_s";
            }
        }
        else if (funName == "tick") {
            if (typeHind && types_1.TypeUtil.LE(typeHind, types_1.SysTypes.Number)) {
                funName += "_d";
            }
        }
        let functionSym = symbol_1.built_ins.get(funName);
        return functionSym;
    }
    /**
     * 为函数调用生成指令
     * 计算每个参数，并设置参数
     * @param functionCall
     */
    visitFunctionCall(functionCall, obj) {
        var _a;
        //当前函数不是叶子函数
        (_a = this.asmModule) === null || _a === void 0 ? void 0 : _a.isLeafFunction.set(this.s.functionSym, false);
        let args = [];
        for (let arg of functionCall.arguments) {
            let oprand = this.visit(arg);
            args.push(oprand);
        }
        let isTailCall = false;
        let isTailRecursive = false;
        let functionSym = null;
        if (functionCall.sym instanceof symbol_1.FunctionSymbol) {
            functionSym = functionCall.sym;
            //内置函数
            if (symbol_1.built_ins.has(functionCall.name)) {
                functionSym = this.getBuiltInFunctionSym(functionCall.name, functionCall.arguments.length > 0 ? functionCall.arguments[0].theType : null);
            }
            //看看是不是尾递归或尾调用
            if (this.tailAnalysisResult != null) {
                if (this.tailAnalysisResult.tailRecursives.indexOf(functionCall) != -1) {
                    isTailRecursive = true;
                }
                else if (this.tailAnalysisResult.tailCalls.indexOf(functionCall) != -1) {
                    isTailCall = true;
                }
            }
        }
        //函数变量
        else if (functionCall.sym instanceof symbol_1.VarSymbol && this.s.functionSym) {
            let varSym = functionCall.sym;
            //获取变量的值，该值应该是一个函数的地址
            let varIndex = this.s.functionSym.vars.indexOf(varSym);
            //如果是对象内部的方法或构造方法，要把0号变量给对象引用
            if (this.s.functionSym.classSym) {
                varIndex += 1;
            }
            let functionAddressVar = new VarOprand(varIndex, varSym.name, getCpuDataType(varSym.theType));
            let functionAddress = new MemAddress(functionAddressVar, 0);
            let insts = this.getCurrentBB().insts;
            console_1.assert(varSym.theType instanceof types_1.FunctionType, "函数变量的类型应该是FunctionType");
            let functionType = varSym.theType;
            insts.push(new Inst_1(OpCode.callq, new FunctionOprand(functionType, args, null, functionAddress)));
            return this.getFuncitonCallResult(functionType);
        }
        if (functionSym) {
            return this.processFunctionCall(functionSym, args, isTailCall, isTailRecursive, obj);
        }
        else {
            //理论上不会发生
            console.log("Runtime error: FunctionCall '" + functionCall.name + "' can not find it's definition.");
            return undefined;
        }
    }
    processFunctionCall(functionSym, args, isTailCall, isTailRecursive, obj) {
        var _a, _b;
        let insts = this.getCurrentBB().insts;
        let functionAddress = null;
        //调用Constructor
        let newObject = null;
        if (functionSym.functionKind == symbol_1.FunctionKind.Constructor) {
            if (functionSym.name == "super") {
            }
            //创建新对象
            else {
                let length = (_a = functionSym.classSym) === null || _a === void 0 ? void 0 : _a.numTotalProps;
                let oprandLength = new Oprand(OprandKind.immediate, length);
                newObject = this.callBuiltIns("object_create_by_length", [oprandLength]);
                //给对象头设置vtable的地址
                let vtable = new Oprand(OprandKind.label, ((_b = functionSym.classSym) === null || _b === void 0 ? void 0 : _b.name) + "_vtable@GOTPCREL(%rip)"); //todo:理论上标签有重名的风险
                let objHeader = new MemAddress(newObject, 0);
                let tempVar = this.allocateTempVar(CpuDataType.int64);
                insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.int64), vtable, tempVar));
                insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.int64), tempVar, objHeader));
                //把对象作为第一个参数传给构造方法
                // console.log("\n~~~@####newObject");
                // console.log(newObject);
                args.unshift(newObject);
            }
        }
        //对象方法
        //要把对象地址作为第一个参数传进去
        else if (functionSym.functionKind == symbol_1.FunctionKind.Method) {
            console_1.assert(obj instanceof VarOprand, "方法调用缺少对象引用，FunctionCall: " + functionSym.name + "。");
            args.unshift(obj);
            //对于方法调用，通过vtable来获取函数地址
            let classSym = functionSym.classSym;
            let methodIndex = classSym.getMethodIndex(functionSym.name);
            let vtableAddressInMem = new MemAddress(obj, 0);
            let vtableAddress = this.allocateTempVar(CpuDataType.int64);
            functionAddress = new MemAddress(vtableAddress, methodIndex * 8);
            insts.push(new Inst_2(OpCodeUtil.movOp(CpuDataType.int64), vtableAddressInMem, vtableAddress));
        }
        //对于尾递归和尾调用，使用一个伪指令
        let op = OpCode.callq;
        if (isTailRecursive) {
            op = OpCode.tailRecursive;
        }
        else if (isTailCall) {
            op = OpCode.tailCall;
        }
        insts.push(new Inst_1(op, new FunctionOprand(functionSym.theType, args, functionSym.name, functionAddress, functionSym.isMethodOrConstructor)));
        //把返回值拷贝到一个临时变量，并返回这个临时变量
        //并且要重新装载溢出的变量        
        let rtn;
        if (!isTailCall && !isTailRecursive) {
            rtn = this.getFuncitonCallResult(functionSym.theType);
        }
        //对于尾递归和尾调用，不需要处理返回值，也不需要做变量的溢出和重新装载
        else {
            //对于尾递归和尾调用，最后的计算结果放在返回值寄存器里，其他寄存器都没有用。
            rtn = Register.returnReg(getCpuDataType(functionSym.theType));
        }
        //返回Oprand
        if (newObject) {
            return newObject; //当new一个对象时。
        }
        else {
            return rtn;
        }
    }
    getFuncitonCallResult(functionType) {
        let insts = this.getCurrentBB().insts;
        //把结果放到一个新的临时变量里
        let dest = undefined;
        if (functionType.returnType != types_1.SysTypes.Void) { //函数有返回值时
            let dataType = getCpuDataType(functionType.returnType);
            dest = this.allocateTempVar(dataType); //必须要创建一个变量，因为返回值的寄存器并没有对应一个变量
            insts.push(new Inst_2(OpCodeUtil.movOp(dataType), Register.returnReg(dataType), dest));
        }
        //调用函数完毕以后，要重新装载被Spilled的变量
        //这个动作要在获取返回值之后
        insts.push(new Inst_0(OpCode.reload));
        return dest;
    }
    // postFunctionCall(insts:Inst[], functionType:FunctionType):any{
    //     //把结果放到一个新的临时变量里
    //     let dest:Oprand|undefined = undefined; 
    //     if(functionType.returnType != SysTypes.Void){ //函数有返回值时
    //         let dataType = getCpuDataType(functionType.returnType);
    //         dest = this.allocateTempVar(dataType);  //必须要创建一个变量，因为返回值的寄存器并没有对应一个变量
    //         insts.push(new Inst_2(OpCodeUtil.movOp(dataType), Register.returnReg(dataType), dest));
    //     }
    //     //调用函数完毕以后，要重新装载被Spilled的变量
    //     //这个动作要在获取返回值之后
    //     insts.push(new Inst_0(OpCode.reload));
    //     return dest;
    // }
    visitThisExp(thisExp) {
        return this.ThisOprand;
    }
    visitDotExp(dotExp) {
        let object = this.visit(dotExp.baseExp);
        console_1.assert(object, "DotExp左边应该返回一个对象引用");
        let rtn;
        if (dotExp.property instanceof ast_1.Variable) { //属性
            //计算属性在内存中的偏移量
            let varSym = dotExp.property.sym;
            let classSym = varSym.classSym;
            let propIndex = classSym.getPropIndex(varSym);
            console_1.assert(propIndex != -1, "在类中找不到属性" + dotExp.property.name + "。");
            let offset = this.Object_Header_Size + propIndex * 8;
            //返回间接内存寻址，不管左值还是右值
            rtn = new MemAddress(object, offset); //object.value是变量下标
            // if (dotExp.isLeftValue)  
        }
        else { //functionCall
            //把对象引用作为额外的参数，设置到方法的栈桢中。
            rtn = this.visit(dotExp.property, object);
        }
        return rtn;
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
class Lower {
    constructor(asmModule, livenessResult) {
        //当前的FunctionSymbol
        this.functionSym = null;
        //当前函数使用到的那些Callee保护的寄存器
        this.usedCalleeProtectedRegs = [];
        //当前函数的参数数量
        this.numParams = 0;
        //保存已经被Lower的Oprand，用于提高效率
        this.loweredVars = new Map();
        //需要在栈里保存的为函数传参（超过6个之后的参数）保留的空间，每个参数占8个字节
        this.numArgsOnStack = 0;
        //rsp应该移动的量。这个量再加8就是该函数所对应的栈桢的大小，其中8是callq指令所压入的返回地址
        this.rspOffset = 0;
        //是否使用RedZone，也就是栈顶之外的128个字节
        this.canUseRedZone = false;
        //预留的寄存器。
        //主要用于在调用函数前，保护起那些马上就要用到的寄存器，不再分配给其他变量。也不会为了给其他变量腾地方而spill到内存。
        this.regsUsedByFunctionCall = [];
        //spill的register在内存中的位置。
        this.spillOffset = 0;
        //被spill的变量
        //key是varIndex，value是内存地址
        this.spilledVars2Address = new Map();
        //key是varIndex，value是原来的寄存器
        this.spilledVars2Reg = new Map();
        //可以通过寄存器传递的参数的最大数量
        this.MaxXmmRegParams = 8;
        this.MaxIntRegParams = 6;
        this.asmModule = asmModule;
        this.livenessResult = livenessResult;
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
        //Lower参数
        this.lowerParams();
        //lower每个BasicBlock中的指令
        for (let i = 0; i < bbs.length; i++) {
            let bb = bbs[i];
            let newInsts = [];
            this.lowerBB(bb, newInsts);
            bb.insts = newInsts;
        }
        //是否可以使用RedZone
        //需要是叶子函数，并且对栈外空间的使用量小于128个字节，也就是32个整数
        //todo：是否是叶子函数，还要看有没有调用intrinsics
        let isLeafFunction = this.asmModule.isLeafFunction.get(functionSym);
        if (isLeafFunction) {
            let bytes = this.spillOffset + this.numArgsOnStack * 8 + this.usedCalleeProtectedRegs.length * 8;
            this.canUseRedZone = bytes < 128;
        }
        this.canUseRedZone = false; //todo 暂时关闭使用RedZone,因为在28节处理字符串数组时遇到一点问题。
        //添加序曲
        //新增加一个BasicBlock
        let bb = new BasicBlock();
        bb.bbIndex == -1;
        bbs.unshift(bb);
        bbs[0].insts = this.addPrologue(bbs[0].insts);
        //添加尾声
        let lastBB = bbs[bbs.length - 1];
        let tailCall = lastBB.insts.length > 0 && lastBB.insts[lastBB.insts.length - 1].op == OpCode.tailCallJmp;
        if (!tailCall) {
            this.addEpilogue(bbs[bbs.length - 1].insts);
        }
        //为尾调用添加基本块和尾声代码
        let additionalBBs = [];
        for (let bb of bbs) {
            if (bb.insts.length > 0) {
                let lastInst = bb.insts[bb.insts.length - 1];
                if (lastInst.op == OpCode.tailCallJmp) {
                    bb.insts.pop();
                    let bbEndPoint = new BasicBlock();
                    additionalBBs.push(bbEndPoint);
                    bb.insts.push(new Inst_1(OpCode.jmp, new Oprand(OprandKind.bb, bbEndPoint), lastInst.comment));
                    lastInst.op = OpCode.jmp;
                    this.addEpilogue(bbEndPoint.insts, lastInst);
                    // console.log("bbEndPoint");
                    // for (let inst of bbEndPoint.insts){
                    //     console.log(inst);
                    // }
                }
            }
        }
        for (let bb of additionalBBs) {
            bbs.push(bb);
        }
        //Lower基本块的标签和跳转指令。
        let newBBs = this.lowerBBLabelAndJumps(bbs, funIndex);
        //Lower浮点数字面量的标签
        this.lowerDoubleIndexs(newBBs, funIndex);
        //把spilledVars中的地址修改一下，加上CalleeProtectedReg所占的空间
        if (this.usedCalleeProtectedRegs.length > 0) {
            let offset = this.usedCalleeProtectedRegs.length * 8;
            for (let address of this.spilledVars2Address.values()) {
                let oldValue = address.value;
                address.value = oldValue + offset;
            }
        }
        // console.log(this);   //打印一下，看看状态变量是否对。
        return newBBs;
    }
    lowerParams() {
        var _a;
        let functionType = (_a = this.functionSym) === null || _a === void 0 ? void 0 : _a.theType;
        let usedIntRegisters = 0; //使用掉的整数寄存器
        let usedXmmRegisters = 0; //使用掉的xmm寄存器
        let numArgsOnStack = 0; //栈上的参数的下标
        //如果是方法，参数数量加1
        let isMethod = this.functionSym.classSym != null;
        let numParams = isMethod ? this.numParams + 1 : this.numParams;
        for (let i = 0; i < numParams; i++) {
            let paramIndex = isMethod ? i - 1 : i;
            let dataType;
            if (isMethod && i == 0) {
                dataType = CpuDataType.int64;
            }
            else {
                dataType = getCpuDataType(functionType.paramTypes[paramIndex]);
            }
            let regParam = null;
            if ((dataType == CpuDataType.int32 || dataType == CpuDataType.int64) && usedIntRegisters < this.MaxIntRegParams) {
                regParam = Register.getParamRegister(dataType, usedIntRegisters);
                usedIntRegisters++;
            }
            else if (dataType == CpuDataType.double && usedXmmRegisters < this.MaxXmmRegParams) {
                regParam = Register.getParamRegister(dataType, usedXmmRegisters);
                usedXmmRegisters++;
            }
            //通过寄存器传递的参数
            if (regParam) {
                this.assignRegToVar(i, regParam);
            }
            //通过Caller栈桢传递的参数
            else {
                //参数是倒着排的。
                //比如，对于整数来说，栈顶是参数7，再往上，依次是参数8、参数9...
                //在Callee中，会到Caller的栈桢中去读取参数值
                let offset = numArgsOnStack * 8 + 16; //+16是因为有一个callq压入的返回地址，一个pushq rbp又加了8个字节
                numArgsOnStack++;
                let memParam = new MemAddress(Register.rbp, offset);
                this.loweredVars.set(i, memParam);
            }
        }
    }
    /**
     * 初始化当前函数的一些状态变量，在算法中会用到它们
     * @param functionSym
     */
    initStates(functionSym) {
        this.functionSym = functionSym;
        this.usedCalleeProtectedRegs = [];
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
    addPrologue(insts) {
        let newInsts = [];
        //保存rbp的值
        newInsts.push(new Inst_1(OpCode.pushq, Register.rbp));
        //把原来的栈顶保存到rbp,成为现在的栈底
        newInsts.push(new Inst_2(OpCode.movq, Register.rsp, Register.rbp));
        //计算栈顶指针需要移动多少位置
        //要保证栈桢16字节对齐
        if (!this.canUseRedZone) {
            this.rspOffset = this.spillOffset + this.numArgsOnStack * 8;
            //当前占用的栈空间，还要加上Callee保护的寄存器占据的空间
            let rem = (this.rspOffset + this.usedCalleeProtectedRegs.length * 8) % 16;
            if (rem == 8) {
                this.rspOffset += 8;
            }
            else if (rem == 4) {
                this.rspOffset += 12;
            }
            else if (rem == 12) {
                this.rspOffset += 4;
            }
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
    addEpilogue(newInsts, inst = new Inst_0(OpCode.retq)) {
        //恢复Callee负责保护的寄存器
        this.restoreCalleeProtectedRegs(newInsts);
        //缩小栈桢
        if (!this.canUseRedZone && this.rspOffset > 0) {
            newInsts.push(new Inst_2(OpCode.addq, new Oprand(OprandKind.immediate, this.rspOffset), Register.rsp));
        }
        //恢复rbp的值
        newInsts.push(new Inst_1(OpCode.popq, Register.rbp));
        //添加返回指令，或者是由尾调用产生的jump指令。
        newInsts.push(inst);
    }
    //Lower浮点数常量，给标签编号
    //编号时需要用到函数的序号、在一个函数内double常量的序号
    lowerDoubleIndexs(bbs, funIndex) {
        for (let bb of bbs) {
            for (let inst of bb.insts) {
                if (inst instanceof Inst_1) {
                    this.lowerDoubleIndexOp(inst.oprand, funIndex);
                }
                else if (inst instanceof Inst_2) {
                    this.lowerDoubleIndexOp(inst.oprand1, funIndex);
                    this.lowerDoubleIndexOp(inst.oprand2, funIndex);
                }
            }
        }
    }
    lowerDoubleIndexOp(oprand, funIndex) {
        if (oprand.kind == OprandKind.doubleIndex) {
            oprand.kind = OprandKind.label;
            oprand.value = genDoubleLiteralLabel(funIndex, oprand.value, true);
        }
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
                for (let j = 0; j < bbs.length; j++) {
                    let lastInst = bbs[j].insts[bbs[j].insts.length - 1];
                    if (OpCodeUtil.isJump(lastInst.op)) {
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
            if (OpCodeUtil.isJump(lastInst.op) && lastInst.oprand.kind == OprandKind.bb) { //jump指令
                let jumpInst = lastInst;
                let bbDest = jumpInst.oprand.value;
                //去除不必要的jmp指令。如果仅仅是跳到下一个基本块，那么不需要这个jmp指令。
                if (lastInst.op == OpCode.jmp && newBBs.indexOf(bbDest) == i + 1) {
                    insts.pop();
                }
                else {
                    jumpInst.oprand.value = bbDest.getName();
                    jumpInst.oprand.kind = OprandKind.label;
                    bbDest.isDestination = true; //有其他block跳到这个block
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
    lowerBB(bb, newInsts) {
        let insts = bb.insts;
        let varsToSpill = [];
        for (let i = 0; i < insts.length; i++) {
            let inst = insts[i];
            let liveVars = this.livenessResult.liveVars.get(inst);
            //两个操作数
            if (Inst_2.isInst_2(inst)) {
                let inst_2 = inst;
                inst_2.comment = inst_2.toString();
                inst_2.oprand1 = this.lowerOprand(liveVars, inst_2.oprand1, newInsts);
                inst_2.oprand2 = this.lowerOprand(liveVars, inst_2.oprand2, newInsts);
                //对mov再做一次优化
                if (!(OpCodeUtil.isMov(inst_2.op) && inst_2.oprand1 == inst_2.oprand2)) {
                    newInsts.push(inst_2);
                }
            }
            //1个操作数
            else if (Inst_1.isInst_1(inst)) {
                let inst_1 = inst;
                inst_1.oprand = this.lowerOprand(liveVars, inst_1.oprand, newInsts);
                if (inst.op != OpCode.declVar) { //忽略变量声明的伪指令。
                    //处理函数调用
                    //函数调用前后，要设置参数；
                    if (inst_1.op == OpCode.callq || inst_1.op == OpCode.tailRecursive || inst_1.op == OpCode.tailCall) {
                        let liveVarsAfterCall = (i == insts.length - 1)
                            ? this.livenessResult.initialVars.get(bb)
                            : this.livenessResult.liveVars.get(insts[i + 1]);
                        varsToSpill = this.lowerFunctionCall(inst_1, liveVars, liveVarsAfterCall, newInsts);
                    }
                    else {
                        newInsts.push(inst_1);
                    }
                }
            }
            //没有操作数
            else {
                if (inst.op == OpCode.reload) {
                    //如果是最后一条指令，或者下一条指令就是return，那么就不用reload了
                    if (i != insts.length - 1 && !OpCodeUtil.isReturn(insts[i + 1].op)) {
                        for (let i = 0; i < varsToSpill.length; i++) {
                            let varIndex = varsToSpill[i];
                            this.reloadVar(varIndex, newInsts);
                        }
                        varsToSpill = [];
                    }
                }
                else {
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
    lowerFunctionCall(inst_1, liveVars, liveVarsAfterCall, newInsts) {
        let functionOprand = inst_1.oprand;
        let args = functionOprand.args;
        //先把所有的参数Lower掉，这个顺序不能错
        //其中，参数中可能也有嵌套的函数调用
        let numArgs = args.length;
        for (let j = 0; j < numArgs; j++) {
            args[j] = this.lowerOprand(liveVars, args[j], newInsts);
        }
        let saveCallerProtectedRegs = (inst_1.op == OpCode.callq);
        //保存Caller负责保护的寄存器
        let varsToSpill = [];
        let regsToSpill = [];
        //保护那些在函数调用之后，仍然会被使用使用的CallerProtected寄存器
        //将这些位置预留下来
        if (saveCallerProtectedRegs) {
            for (let varIndex of liveVarsAfterCall) {
                let oprand = this.loweredVars.get(varIndex);
                if (oprand.kind == OprandKind.register &&
                    Register.callerProtected.indexOf(oprand) != -1) {
                    varsToSpill.push(varIndex);
                    regsToSpill.push(oprand);
                }
            }
        }
        //把参数设置到寄存器
        //并且把需要覆盖的reg溢出
        let usedIntRegisters = 0; //使用掉的整数寄存器
        let usedXmmRegisters = 0; //使用掉的xmm寄存器
        let numArgsOnStack = 0;
        let regsSpilled = [];
        for (let j = 0; j < numArgs; j++) {
            let paramIndex = j;
            if (functionOprand.isMethodOrConstructor)
                paramIndex -= 1;
            let dataType;
            if (functionOprand.isMethodOrConstructor && j == 0) {
                dataType = CpuDataType.int64; //对象地址
            }
            else {
                dataType = getCpuDataType(functionOprand.functionType.paramTypes[paramIndex]);
            }
            let regDest = null;
            if ((dataType == CpuDataType.int32 || dataType == CpuDataType.int64) && usedIntRegisters < this.MaxIntRegParams) {
                regDest = Register.getParamRegister(dataType, usedIntRegisters);
                usedIntRegisters++;
            }
            else if (dataType == CpuDataType.double && usedXmmRegisters < this.MaxXmmRegParams) {
                regDest = Register.getParamRegister(dataType, usedXmmRegisters);
                usedXmmRegisters++;
            }
            let opCode = OpCodeUtil.movOp(dataType);
            //用寄存器传递的参数
            if (regDest) {
                //把参数用到的寄存器spill出去
                if (saveCallerProtectedRegs) {
                    let argIndex = regsToSpill.indexOf(regDest);
                    if (argIndex != -1) {
                        let varIndex = varsToSpill[argIndex];
                        this.spillVar(varIndex, regDest, newInsts);
                        regsSpilled.push(regDest);
                    }
                    //看看这个寄存器是不是在args的后半截
                    //这些参数寄存器之间可能会互相覆盖，因为它们没有参与数据流分析。
                    //所以这里用一个简化的算法来避免这些冲突。
                    else if (j < args.length - 1) {
                        argIndex = args.indexOf(regDest, j + 1);
                        if (argIndex != -1 && regsSpilled.indexOf(regDest) == -1) {
                            //从寄存器倒查出varIndex
                            let varIndex = this.getVarIndexOfReg(regDest);
                            if (regsToSpill.indexOf(regDest) == -1) {
                                regsToSpill.push(regDest);
                                varsToSpill.push(varIndex);
                            }
                            this.spillVar(varIndex, regDest, newInsts);
                            regsSpilled.push(regDest);
                            //换成内存格式的Oprand
                            args[argIndex] = this.loweredVars.get(varIndex);
                        }
                    }
                }
                if (regDest !== args[j]) {
                    newInsts.push(new Inst_2(opCode, args[j], regDest));
                }
            }
            //超出寄存器容纳的参数，放到栈里
            else {
                //参数是倒着排的。
                //比如，对于整数来说，栈顶是参数7，再往上，依次是参数8、参数9...
                //在Callee中，会到Caller的栈桢中去读取参数值
                let offset = numArgsOnStack * 8;
                numArgsOnStack++;
                newInsts.push(new Inst_2(opCode, args[j], new MemAddress(Register.rsp, offset)));
            }
        }
        //Spill剩余的寄存器
        if (saveCallerProtectedRegs) {
            for (let i = 0; i < regsToSpill.length; i++) {
                if (regsSpilled.indexOf(regsToSpill[i])) {
                    this.spillVar(varsToSpill[i], regsToSpill[i], newInsts);
                }
            }
        }
        //如果函数有返回值，那么要把返回值用到的寄存器腾出来
        if (functionOprand.functionType.returnType !== types_1.SysTypes.Void) {
            let reg = Register.returnReg(getCpuDataType(functionOprand.functionType.returnType));
            let varIndex = this.getVarIndexOfReg(reg);
            if (varIndex && liveVarsAfterCall.indexOf(varIndex) != -1) {
                this.spillVar(varIndex, reg, newInsts);
            }
        }
        //对于尾递归和尾调用，不生成call指令。而是去Lower在return语句中，生成的连个特殊的jmp指令。
        if (inst_1.op != OpCode.tailRecursive && inst_1.op != OpCode.tailCall) {
            functionOprand.args = []; //把参数清空，方便打印。
            //函数调用的指令
            newInsts.push(inst_1);
            //锁定住返回值所需要的寄存器，不被占用，直到Lower ReturnSlot的时候
            if (functionOprand.functionType.returnType != types_1.SysTypes.Void) {
            }
        }
        // //清除预留的寄存器
        // this.reservedRegisters = [];
        return varsToSpill; //??
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
    lowerOprand(liveVars, oprand, newInsts, noMemory = false) {
        let newOprand = oprand;
        //变量
        if (oprand instanceof VarOprand) {
            let varIndex = oprand.value;
            if (this.loweredVars.has(varIndex)) {
                newOprand = this.loweredVars.get(varIndex);
                if (noMemory && newOprand.kind == OprandKind.memory) {
                    newOprand = this.reloadVar(varIndex, newInsts);
                }
            }
            else {
                let reg = this.getFreeRegister(oprand.dataType, liveVars);
                if (reg == null) {
                    reg = this.spillARegister(oprand.dataType, newInsts);
                }
                this.assignRegToVar(varIndex, reg);
                newOprand = reg;
            }
        }
        //逻辑的内存地址
        else if (oprand instanceof MemAddress) {
            if (oprand.base instanceof VarOprand) {
                let varIndex = oprand.base.varIndex;
                let base = this.loweredVars.get(varIndex);
                if (!(base instanceof Register)) {
                    base = this.reloadVar(varIndex, newInsts);
                }
                if (base instanceof Register) {
                    newOprand = new MemAddress(base, oprand.offset, oprand.index, oprand.bytes);
                }
                else {
                    console.log("Error lowering LogicalMemAddress oprand: " + oprand.toString());
                }
            }
        }
        //把FunctionCall的functionAddress给Lower掉
        else if (oprand instanceof FunctionOprand) {
            if (oprand.functionAddress) {
                oprand.functionAddress = this.lowerOprand(liveVars, oprand.functionAddress, newInsts);
            }
        }
        //字符串字面量
        else if (oprand.kind == OprandKind.stringConst) {
            let constIndex = oprand.value;
            oprand.kind = OprandKind.label;
            oprand.value = genStringConstLabel(constIndex) + "(%rip)";
        }
        return newOprand;
    }
    /**
     * 将某个变量溢出到内存。
     * @param varIndex
     * @param reg
     */
    spillVar(varIndex, reg, newInsts) {
        let address;
        if (this.spilledVars2Address.has(varIndex)) {
            address = this.spilledVars2Address.get(varIndex);
        }
        else {
            // this.spillOffset += 4;
            this.spillOffset += 8; //浮点数是8个字节
            address = new MemAddress(Register.rbp, -this.spillOffset);
            this.spilledVars2Address.set(varIndex, address);
            this.spilledVars2Reg.set(varIndex, reg);
        }
        let opCode = OpCodeUtil.movOp(reg.dataType);
        newInsts.push(new Inst_2(opCode, reg, address, "spill\tvar" + varIndex));
        this.loweredVars.set(varIndex, address);
        return address;
    }
    reloadVar(varIndex, newInsts) {
        let oprand = this.loweredVars.get(varIndex);
        if (oprand.kind == OprandKind.memory) {
            let address = oprand;
            let reg = this.spilledVars2Reg.get(varIndex);
            //查看该reg是否正在被其他变量占用
            for (let varIndex1 of this.loweredVars.keys()) {
                let oprand1 = this.loweredVars.get(varIndex1);
                if (oprand1 == reg) {
                    this.spillVar(varIndex, oprand1, newInsts);
                    break;
                }
            }
            this.assignRegToVar(varIndex, reg);
            let opCode = OpCodeUtil.movOp(reg.dataType);
            newInsts.push(new Inst_2(opCode, address, reg, "reload\tvar" + varIndex));
            return reg;
        }
        else if (oprand instanceof Register) {
            return oprand;
        }
        else {
            //理论上不会到这里
            console.log("Whoops! unsupported oprand type in relaodVar: " + oprand.toString());
            return null;
        }
    }
    /**
     * 选一个寄存器，溢出出去。
     */
    spillARegister(dataType, newInsts) {
        for (let varIndex of this.loweredVars.keys()) {
            let oprand = this.loweredVars.get(varIndex);
            // if (oprand.kind == OprandKind.register && this.reservedRegisters.indexOf(oprand as Register)!=-1){
            if (oprand instanceof Register && oprand.dataType == dataType) {
                this.spillVar(varIndex, oprand, newInsts);
                return oprand;
            }
        }
        //理论上，不会到达这里。
        return null;
    }
    assignRegToVar(varIndex, reg) {
        //更新usedCalleeProtectedRegs
        if (Register.calleeProtected32.indexOf(reg) != -1 && this.usedCalleeProtectedRegs.indexOf(reg) == -1) {
            this.usedCalleeProtectedRegs.push(reg);
        }
        //更新loweredVars
        this.loweredVars.set(varIndex, reg);
    }
    //从寄存器倒着查出varIndex
    getVarIndexOfReg(reg) {
        for (let varIndex of this.loweredVars.keys()) {
            if (this.loweredVars.get(varIndex) == reg) {
                return varIndex;
            }
        }
    }
    /**
     * 获取一个空余的寄存器
     * @param liveVars
     */
    getFreeRegister(dataType, liveVars) {
        let result = null;
        //1.从空余的寄存器中寻找一个。
        let allocatedRegisters = [];
        for (let varIndex of this.loweredVars.keys()) {
            let oprand = this.loweredVars.get(varIndex);
            if (oprand instanceof Register) {
                allocatedRegisters.push(oprand);
            }
            else if (oprand instanceof MemAddress) {
                allocatedRegisters.push(this.spilledVars2Reg.get(varIndex));
            }
            else {
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
        let regs = Register.getRegisters(dataType);
        for (let reg of regs) {
            // if (allocatedRegisters.indexOf(reg) == -1 && this.reservedRegisters.indexOf(reg)==-1){
            if (allocatedRegisters.indexOf(reg) == -1) {
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
    //变量活跃性分析
    let livenessAnalyzer = new LivenessAnalyzer(asmModule);
    let result = livenessAnalyzer.execute();
    // if(verbose){
    console.log("liveVars");
    for (let fun of asmModule.fun2Code.keys()) {
        console.log("\nfunction: " + fun.name);
        let bbs = asmModule.fun2Code.get(fun);
        for (let bb of bbs) {
            console.log("\nbb:" + bb.getName());
            for (let inst of bb.insts) {
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
    if (verbose) {
        console.log("在Lower之后：");
        console.log(asm);
    }
    return asm;
}
exports.compileToAsm = compileToAsm;
/**
 * 变量活跃性分析的结果
 */
class LivenessResult {
    constructor() {
        this.liveVars = new Map();
        this.initialVars = new Map();
    }
}
/**
 * 控制流图
 */
class CFG {
    constructor(bbs) {
        //每个BasicBlock输出的边
        this.edgesOut = new Map();
        //每个BasicBlock输入的边
        this.edgesIn = new Map();
        this.bbs = bbs;
        this.buildCFG();
    }
    buildCFG() {
        //构建edgesOut;
        for (let i = 0; i < this.bbs.length - 1; i++) { //最后一个基本块不用分析
            let bb = this.bbs[i];
            let toBBs = [];
            this.edgesOut.set(bb, toBBs);
            let lastInst = bb.insts[bb.insts.length - 1];
            if (OpCodeUtil.isJump(lastInst.op)) {
                let jumpInst = lastInst;
                let destBB = jumpInst.oprand.value;
                toBBs.push(destBB);
                //如果是条件分枝，那么还要加上下面紧挨着的BasicBlock
                if (jumpInst.op != OpCode.jmp) {
                    toBBs.push(this.bbs[i + 1]);
                }
            }
            else { //如果最后一条语句不是跳转语句，则连接到下一个BB
                toBBs.push(this.bbs[i + 1]);
            }
        }
        //构建反向的边:edgesIn
        for (let bb of this.edgesOut.keys()) {
            let toBBs = this.edgesOut.get(bb);
            for (let toBB of toBBs) {
                let fromBBs = this.edgesIn.get(toBB);
                if (typeof fromBBs == 'undefined') {
                    fromBBs = [];
                    this.edgesIn.set(toBB, fromBBs);
                }
                fromBBs.push(bb);
            }
        }
    }
    toString() {
        let str = "";
        str += "bbs:\n";
        for (let bb of this.bbs) {
            str += "\t" + bb.getName() + "\n";
        }
        str += "edgesOut:\n";
        for (let bb of this.edgesOut.keys()) {
            str += "\t" + bb.getName() + "->\n";
            let toBBs = this.edgesOut.get(bb);
            for (let bb2 of toBBs) {
                str += "\t\t" + bb2.getName() + "\n";
            }
        }
        str += "edgesIn:\n";
        for (let bb of this.edgesIn.keys()) {
            str += "\t" + bb.getName() + "<-\n";
            let fromBBs = this.edgesIn.get(bb);
            for (let bb2 of fromBBs) {
                str += "\t\t" + bb2.getName() + "\n";
            }
        }
        return str;
    }
}
/**
 * 变量活跃性分析。
 */
class LivenessAnalyzer {
    constructor(asmModule) {
        this.asmModule = asmModule;
    }
    execute() {
        let result = new LivenessResult();
        for (let fun of this.asmModule.fun2Code.keys()) {
            let bbs = this.asmModule.fun2Code.get(fun);
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
    analyzeFunction(bbs, result) {
        let cfg = new CFG(bbs);
        console.log(cfg.toString());
        //做一些初始化工作
        for (let bb of bbs) {
            result.initialVars.set(bb, []);
        }
        //持续遍历图，直到没有BasicBlock的活跃变量需要被更新
        let bbsToDo = bbs.slice(0);
        while (bbsToDo.length > 0) {
            let bb = bbsToDo.pop();
            this.analyzeBasicBlock(bb, result);
            //取出第一行的活跃变量集合，作为对前面的BasicBlock的输入
            let liveVars = bb.insts.length == 0 ? [] : result.liveVars.get(bb.insts[0]);
            let fromBBs = cfg.edgesIn.get(bb);
            if (typeof fromBBs != 'undefined') {
                for (let bb2 of fromBBs) {
                    let liveVars2 = result.initialVars.get(bb2);
                    //如果能向上面的BB提供不同的活跃变量，则需要重新分析bb2
                    if (!this.isSubsetOf(liveVars, liveVars2)) {
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
    isSubsetOf(set1, set2) {
        if (set1.length <= set2.length) {
            for (let n of set1) {
                if (set2.indexOf(n) == -1) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * 返回set1和set2的并集
     * @param set1
     * @param set2
     */
    unionOf(set1, set2) {
        let set3 = set1.slice(0);
        for (let n of set2) {
            if (set3.indexOf(n) == -1) {
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
    analyzeBasicBlock(bb, result) {
        let changed = false;
        //找出BasicBlock初始的集合
        let vars = result.initialVars.get(bb);
        vars = vars.slice(0); //克隆一份
        //为每一条指令计算活跃变量集合
        for (let i = bb.insts.length - 1; i >= 0; i--) {
            let inst = bb.insts[i];
            if (inst.numOprands == 1) {
                let inst_1 = inst;
                //变量声明伪指令，从liveVars集合中去掉该变量
                if (inst_1.op == OpCode.declVar) {
                    let varIndex = inst_1.oprand.value;
                    let indexInArray = vars.indexOf(varIndex);
                    if (indexInArray != -1) {
                        vars.splice(indexInArray, 1);
                    }
                }
                //查看指令中引用了哪个变量，就加到liveVars集合中去
                else {
                    this.updateLiveVars(inst_1, inst_1.oprand, vars);
                }
            }
            else if (inst.numOprands == 2) {
                let inst_2 = inst;
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
    updateLiveVars(inst, oprand, vars) {
        if (oprand instanceof VarOprand) {
            let varIndex = oprand.value;
            if (vars.indexOf(varIndex) == -1) {
                vars.push(varIndex);
            }
        }
        else if (oprand instanceof MemAddress) {
            if (oprand.base instanceof VarOprand) {
                let varIndex = oprand.base.varIndex;
                if (vars.indexOf(varIndex) == -1) {
                    vars.push(varIndex);
                }
            }
        }
        else if (oprand instanceof FunctionOprand) {
            for (let arg of oprand.args) {
                this.updateLiveVars(inst, arg, vars);
            }
        }
    }
}
/**
 * 将一个数字转换成Ieee754格式的16进制的字符串
 * @param n
 */
function doubleToIeee754(n) {
    var ieee754 = require('ieee754');
    const buf = Buffer.alloc(8);
    buf.writeDoubleLE(n, 0);
    let s = buf.toString("hex");
    //原来的输出，是倒着放的。所以要反转过来。
    return "0x" + s[14] + s[15] + s[12] + s[13] + s[10] + s[11] + s[8] + s[9] + s[6] + s[7] + s[4] + s[5] + s[2] + s[3] + s[0] + s[1];
}
//根据函数下标和常量的下标生成double字面量的标签
function genDoubleLiteralLabel(funIndex, literalIndex, withRip) {
    return "LCPI" + funIndex + "_" + literalIndex + (withRip ? "(%rip)" : "");
}
function genStringConstLabel(index) {
    return "L_.str" + (index == 0 ? "" : "." + index);
}
//根据数据类型确定寄存器类型
function getCpuDataType(t) {
    let dataType = CpuDataType.double;
    if (t === types_1.SysTypes.String || t === types_1.SysTypes.Object || t instanceof types_1.ArrayType) {
        dataType = CpuDataType.int64;
    }
    else if (t === types_1.SysTypes.Integer) {
        // dataType = CpuDataType.int32;
        dataType = CpuDataType.int64; //暂时都只用long
    }
    else if (t === types_1.SysTypes.Number || t === types_1.SysTypes.Decimal) {
        dataType = CpuDataType.double;
    }
    else if (t instanceof types_1.NamedType) { //自定义对象
        dataType = CpuDataType.int64;
    }
    else if (t instanceof types_1.FunctionType) {
        dataType = CpuDataType.int64;
    }
    else {
        console.log("Whoops! Unsupported dataType in getCpuDataType : " + t.toString());
    }
    return dataType;
}
