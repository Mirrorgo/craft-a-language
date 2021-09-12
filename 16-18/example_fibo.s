    .section	__TEXT,__text,regular,pure_instructions

    .global _fibonacci
_fibonacci:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	%edi, -4(%rbp)
    subq	$16, %rsp
    movl	-4(%rbp), %eax
    cmpl	$1, %eax
    jg	LBB0_2
## bb.1
    movl	-4(%rbp), %eax
    jmp	LBB0_3
LBB0_2:
    movl	-4(%rbp), %r10d
    subl	$1, %r10d
    movl	%eax, -8(%rbp)
    movl	%r10d, -12(%rbp)
    movl	%r11d, -16(%rbp)
    movl	%edi, -20(%rbp)
    movl	%esi, -24(%rbp)
    movl	%r10d, %edi
    callq	_fibonacci
    movl	-8(%rbp), %r10d
    movl	-12(%rbp), %r11d
    movl	-16(%rbp), %edi
    movl	-20(%rbp), %esi
    movl	-24(%rbp), %edx
    movl	%eax, %edi
    movl	-4(%rbp), %esi
    subl	$2, %esi
    movl	%r10d, -8(%rbp)
    movl	%r11d, -12(%rbp)
    movl	%edi, -16(%rbp)
    movl	%esi, -20(%rbp)
    movl	%edx, -24(%rbp)
    movl	%esi, %edi
    callq	_fibonacci
    movl	-8(%rbp), %r10d
    movl	-12(%rbp), %r11d
    movl	-16(%rbp), %edi
    movl	-20(%rbp), %esi
    movl	-24(%rbp), %edx
    movl	%eax, %edx
    addl	%edx, %edi
    movl	%edi, %eax
LBB0_3:
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	%eax, -4(%rbp)
    movl	$30, %edi
    callq	_fibonacci
    movl	-4(%rbp), %r10d
    movl	%eax, %r10d
    movl	%r10d, -4(%rbp)
    movl	%r10d, %edi
    callq	_println
    movl	-4(%rbp), %r10d
    popq	%rbp
    retq
    .cfi_endproc
