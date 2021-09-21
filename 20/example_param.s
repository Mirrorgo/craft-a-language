    .section	__TEXT,__text,regular,pure_instructions

    .global _foo
_foo:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	%edi, %eax
    imull	%esi, %eax
    movl	%eax, %edi
    movl	%edx, %esi
    imull	%ecx, %esi
    movl	%esi, %edx
    movl	%edi, %ecx
    addl	%edx, %ecx
    movl	%r8d, %eax
    imull	%r9d, %eax
    addl	%eax, %ecx
    movl	16(%rbp), %r8d
    imull	24(%rbp), %r8d
    addl	%r8d, %ecx
    movl	%ecx, %eax
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$40, %rsp
    pushq	%rbx
    pushq	%r12
    pushq	%r13
    movl	$10, %eax
    movl	$12, %r10d
    movl	%eax, %r11d
    imull	%r10d, %r11d
    movl	%r11d, %ebx
    movl	%r10d, %r12d
    movl	%eax, %r13d
    movl	%r13d, %edi
    movl	%r12d, %esi
    movl	$1, %edx
    movl	$2, %ecx
    movl	$3, %r8d
    movl	$4, %r9d
    movl	$5, (%rsp)
    movl	$6, 8(%rsp)
    callq	_foo
    addl	%eax, %ebx
    movl	%r12d, %edi
    movl	%r13d, %esi
    movl	$7, %edx
    movl	$8, %ecx
    movl	$9, %r8d
    movl	$10, %r9d
    movl	$11, (%rsp)
    movl	$12, 8(%rsp)
    callq	_foo
    movl	%eax, %r13d
    addl	%r13d, %ebx
    movl	%ebx, %r12d
    movl	%r12d, %edi
    callq	_println
    popq	%r13
    popq	%r12
    popq	%rbx
    addq	$40, %rsp
    popq	%rbp
    retq
    .cfi_endproc
