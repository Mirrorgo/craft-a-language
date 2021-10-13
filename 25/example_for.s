    .section	__TEXT,__text,regular,pure_instructions

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movl	$0, %r10d				#  movl	$0, var0
    movl	$0, %r11d				#  movl	$0, var1
LBB0_2:
    cmpl	$10, %r11d				#  cmpl	$10, var1
    jge	LBB0_4
## bb.3
    movl	%r10d, %edi				#  movl	var0, var2
    addl	%r11d, %edi				#  addl	var1, var2
    movl	%edi, %r10d				#  movl	var2, var0
    movl	%r11d, %esi				#  movl	var1, var3
    movl	%r11d, %edx				#  movl	var1, var4
    addl	$1, %esi				#  addl	$1, var3
    movl	%esi, %r11d				#  movl	var3, var1
    jmp	LBB0_2
LBB0_4:
    movl	%r10d, %edi
    callq	_println
    popq	%rbp
    retq
    .cfi_endproc
