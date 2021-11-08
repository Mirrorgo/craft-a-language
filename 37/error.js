"use strict";
/**
 * 编译过程中的错误信息
 * @version 0.1
 * @author 宫文学
 * @license 木兰开源协议
 * @since 2021-06-04
 *
 * 当前特性：
 * 1.树状的符号表
 * 2.简单的引用消解：没有考虑声明的先后顺序，也没有考虑闭包
 * 3.简单的作用域
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerError = void 0;
class CompilerError {
    // endPos:Position;   //在源代码中的最后一个Token的位置
    constructor(msg, beginPos, /* endPos:Position, */ isWarning = false) {
        this.msg = msg;
        this.beginPos = beginPos;
        // this.endPos = endPos;
        this.isWarning = isWarning;
    }
}
exports.CompilerError = CompilerError;
