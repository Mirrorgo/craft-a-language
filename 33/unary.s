	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
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
	subq	$32, %rsp
	xorl	%eax, %eax
	movl	$0, -4(%rbp)
	movl	$10, -8(%rbp)
	movl	-8(%rbp), %ecx
	movl	%ecx, %edx
	addl	$1, %edx
	movl	%edx, -8(%rbp)
	addl	$1, %ecx
	movl	%ecx, -12(%rbp)
	movl	-8(%rbp), %ecx
	addl	$1, %ecx
	movl	%ecx, -8(%rbp)
	addl	$1, %ecx
	movl	%ecx, -16(%rbp)
	subl	-8(%rbp), %eax
	movl	%eax, -20(%rbp)
	movl	-12(%rbp), %edi
	callq	_println
	movl	-16(%rbp), %edi
	callq	_println
	movl	-20(%rbp), %edi
	callq	_println
	xorl	%eax, %eax
	addq	$32, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
