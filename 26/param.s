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
	movl	24(%rbp), %eax
	movl	16(%rbp), %r10d
	movl	%edi, -4(%rbp)
	movl	%esi, -8(%rbp)
	movl	%edx, -12(%rbp)
	movl	%ecx, -16(%rbp)
	movl	%r8d, -20(%rbp)
	movl	%r9d, -24(%rbp)
	movl	-4(%rbp), %ecx
	imull	-8(%rbp), %ecx
	movl	%ecx, -28(%rbp)
	movl	-12(%rbp), %ecx
	imull	-16(%rbp), %ecx
	movl	%ecx, -32(%rbp)
	movl	-28(%rbp), %ecx
	addl	-32(%rbp), %ecx
	movl	-20(%rbp), %edx
	imull	-24(%rbp), %edx
	addl	%edx, %ecx
	movl	16(%rbp), %edx
	imull	24(%rbp), %edx
	addl	%edx, %ecx
	movl	%eax, -36(%rbp)                 ## 4-byte Spill
	movl	%ecx, %eax
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
	movl	$10, -8(%rbp)
	movl	$12, -12(%rbp)
	movl	-8(%rbp), %eax
	imull	-12(%rbp), %eax
	movl	-8(%rbp), %edi
	movl	-12(%rbp), %esi
	movl	$1, %edx
	movl	$2, %ecx
	movl	$3, %r8d
	movl	$4, %r9d
	movl	$5, (%rsp)
	movl	$6, 8(%rsp)
	movl	%eax, -20(%rbp)                 ## 4-byte Spill
	callq	_foo
	movl	-20(%rbp), %ecx                 ## 4-byte Reload
	addl	%eax, %ecx
	movl	-12(%rbp), %edi
	movl	-8(%rbp), %esi
	movl	$7, %edx
	movl	$8, %eax
	movl	%ecx, -24(%rbp)                 ## 4-byte Spill
	movl	%eax, %ecx
	movl	$9, %r8d
	movl	$10, %r9d
	movl	$11, (%rsp)
	movl	$12, 8(%rsp)
	callq	_foo
	movl	-24(%rbp), %ecx                 ## 4-byte Reload
	addl	%eax, %ecx
	movl	%ecx, -16(%rbp)
	movl	-16(%rbp), %edi
	callq	_println
	xorl	%eax, %eax
	addq	$48, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
