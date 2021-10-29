	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.globl	_foo                            ## -- Begin function foo
	.p2align	4, 0x90
_foo:                                   ## @foo
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movq	24(%rbp), %rax
	movq	16(%rbp), %r10
	movq	%rdi, -8(%rbp)
	movq	%rsi, -16(%rbp)
	movq	%rdx, -24(%rbp)
	movq	%rcx, -32(%rbp)
	movq	%r8, -40(%rbp)
	movq	%r9, -48(%rbp)
	movq	-8(%rbp), %rcx
	imulq	-16(%rbp), %rcx
	movq	%rcx, -56(%rbp)
	movq	-24(%rbp), %rcx
	imulq	-32(%rbp), %rcx
	movq	%rcx, -64(%rbp)
	movq	-56(%rbp), %rcx
	addq	-64(%rbp), %rcx
	movq	-40(%rbp), %rdx
	imulq	-48(%rbp), %rdx
	addq	%rdx, %rcx
	movq	16(%rbp), %rdx
	imulq	24(%rbp), %rdx
	addq	%rdx, %rcx
	movq	%rax, -72(%rbp)                 ## 8-byte Spill
	movq	%rcx, %rax
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_main                           ## -- Begin function main
	.p2align	4, 0x90
_main:                                  ## @main
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$48, %rsp
	movl	$0, -4(%rbp)
	movq	$10, -16(%rbp)
	movq	$12, -24(%rbp)
	movq	-24(%rbp), %rdi
	movq	-16(%rbp), %rsi
	movl	$3, %edx
	movl	$4, %ecx
	movl	$5, %r8d
	movl	$6, %r9d
	movq	$7, (%rsp)
	movq	$8, 8(%rsp)
	callq	_foo
	movq	%rax, %rdi
	callq	_prlongln
	xorl	%eax, %eax
	addq	$48, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
