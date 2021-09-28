    .section	__TEXT,__text,regular,pure_instructions

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$32, %rsp
    movl	$0, %eax
    movl	$0, %r10d
LBB0_1:
    movl	%r10d, %r11d
    cmpl	$10, %r11d
    jge	LBB0_3
## bb.2
    movl	%eax, %r11d
    addl	%r10d, %r11d
    movl	%r11d, %eax
    movl	%r10d, %r11d
    movl	%r10d, %edi
    addl	$1, %r11d
    movl	%r11d, %r10d
    jmp	LBB0_1
LBB0_3:
    movl	%eax, -4(%rbp)
    movl	-4(%rbp), %edi
    callq	_println
    movl	-4(%rbp), %eax
    addq	$32, %rsp
    popq	%rbp
    retq
    .cfi_endproc
