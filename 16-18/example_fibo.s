    .section	__TEXT,__text,regular,pure_instructions

    .global _fibonacci
_fibonacci:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	%edi, -4(%rbp)
    subq	$48, %rsp
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
    addq	$48, %rsp
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$64, %rsp
    movl	$30, %eax
    movl	%eax, -4(%rbp)
LBB1_1:
    movl	-4(%rbp), %r10d
    cmpl	$40, %r10d
    jg	LBB1_3
## bb.2
    movl	%eax, -16(%rbp)
    movl	%r10d, -20(%rbp)
    movl	%r11d, -24(%rbp)
    movl	%edi, -28(%rbp)
    movl	%esi, -32(%rbp)
    movl	%edx, -36(%rbp)
    movl	%ecx, -40(%rbp)
    movl	%r8d, -44(%rbp)
    movl	-4(%rbp), %edi
    callq	_println
    movl	-16(%rbp), %r10d
    movl	-20(%rbp), %r11d
    movl	-24(%rbp), %edi
    movl	-28(%rbp), %esi
    movl	-32(%rbp), %edx
    movl	-36(%rbp), %ecx
    movl	-40(%rbp), %r8d
    movl	-44(%rbp), %r9d
    movl	%r10d, -16(%rbp)
    movl	%r11d, -20(%rbp)
    movl	%edi, -24(%rbp)
    movl	%esi, -28(%rbp)
    movl	%edx, -32(%rbp)
    movl	%ecx, -36(%rbp)
    movl	%r8d, -40(%rbp)
    movl	%r9d, -44(%rbp)
    callq	_tick
    movl	-16(%rbp), %r10d
    movl	-20(%rbp), %r11d
    movl	-24(%rbp), %edi
    movl	-28(%rbp), %esi
    movl	-32(%rbp), %edx
    movl	-36(%rbp), %ecx
    movl	-40(%rbp), %r8d
    movl	-44(%rbp), %r9d
    movl	%eax, %edi
    movl	%edi, -8(%rbp)
    movl	%r10d, -16(%rbp)
    movl	%r11d, -20(%rbp)
    movl	%edi, -24(%rbp)
    movl	%esi, -28(%rbp)
    movl	%edx, -32(%rbp)
    movl	%ecx, -36(%rbp)
    movl	%r8d, -40(%rbp)
    movl	%r9d, -44(%rbp)
    movl	-4(%rbp), %edi
    callq	_fibonacci
    movl	-16(%rbp), %r10d
    movl	-20(%rbp), %r11d
    movl	-24(%rbp), %edi
    movl	-28(%rbp), %esi
    movl	-32(%rbp), %edx
    movl	-36(%rbp), %ecx
    movl	-40(%rbp), %r8d
    movl	-44(%rbp), %r9d
    movl	%eax, %esi
    movl	%r10d, -16(%rbp)
    movl	%r11d, -20(%rbp)
    movl	%edi, -24(%rbp)
    movl	%esi, -28(%rbp)
    movl	%edx, -32(%rbp)
    movl	%ecx, -36(%rbp)
    movl	%r8d, -40(%rbp)
    movl	%r9d, -44(%rbp)
    movl	%esi, %edi
    callq	_println
    movl	-16(%rbp), %r10d
    movl	-20(%rbp), %r11d
    movl	-24(%rbp), %edi
    movl	-28(%rbp), %esi
    movl	-32(%rbp), %edx
    movl	-36(%rbp), %ecx
    movl	-40(%rbp), %r8d
    movl	-44(%rbp), %r9d
    movl	%r10d, -16(%rbp)
    movl	%r11d, -20(%rbp)
    movl	%edi, -24(%rbp)
    movl	%esi, -28(%rbp)
    movl	%edx, -32(%rbp)
    movl	%ecx, -36(%rbp)
    movl	%r8d, -40(%rbp)
    movl	%r9d, -44(%rbp)
    callq	_tick
    movl	-16(%rbp), %r10d
    movl	-20(%rbp), %r11d
    movl	-24(%rbp), %edi
    movl	-28(%rbp), %esi
    movl	-32(%rbp), %edx
    movl	-36(%rbp), %ecx
    movl	-40(%rbp), %r8d
    movl	-44(%rbp), %r9d
    movl	%eax, %edx
    movl	%edx, -12(%rbp)
    movl	-12(%rbp), %ecx
    subl	-8(%rbp), %ecx
    movl	%r10d, -16(%rbp)
    movl	%r11d, -20(%rbp)
    movl	%edi, -24(%rbp)
    movl	%esi, -28(%rbp)
    movl	%edx, -32(%rbp)
    movl	%ecx, -36(%rbp)
    movl	%r8d, -40(%rbp)
    movl	%r9d, -44(%rbp)
    movl	%ecx, %edi
    callq	_println
    movl	-16(%rbp), %r10d
    movl	-20(%rbp), %r11d
    movl	-24(%rbp), %edi
    movl	-28(%rbp), %esi
    movl	-32(%rbp), %edx
    movl	-36(%rbp), %ecx
    movl	-40(%rbp), %r8d
    movl	-44(%rbp), %r9d
    movl	-4(%rbp), %r8d
    movl	-4(%rbp), %r9d
    addl	$1, %r8d
    movl	%r8d, -4(%rbp)
    jmp	LBB1_1
LBB1_3:
    addq	$64, %rsp
    popq	%rbp
    retq
    .cfi_endproc
