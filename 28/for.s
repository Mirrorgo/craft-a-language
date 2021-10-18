	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.globl	_foo1                           ## -- Begin function foo1
	.p2align	4, 0x90
_foo1:                                  ## @foo1
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movl	%edi, -4(%rbp)
	movl	$0, -8(%rbp)
	movl	$0, -12(%rbp)
LBB0_1:                                 ## =>This Inner Loop Header: Depth=1
	movl	-12(%rbp), %eax
	cmpl	-4(%rbp), %eax
	jge	LBB0_4
## %bb.2:                               ##   in Loop: Header=BB0_1 Depth=1
	movl	-8(%rbp), %eax
	addl	-12(%rbp), %eax
	movl	%eax, -8(%rbp)
## %bb.3:                               ##   in Loop: Header=BB0_1 Depth=1
	movl	-12(%rbp), %eax
	addl	$1, %eax
	movl	%eax, -12(%rbp)
	jmp	LBB0_1
LBB0_4:
	movl	-8(%rbp), %eax
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function foo2
LCPI1_0:
	.quad	0x3ff0000000000000              ## double 1
	.section	__TEXT,__text,regular,pure_instructions
	.globl	_foo2
	.p2align	4, 0x90
_foo2:                                  ## @foo2
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movsd	%xmm0, -8(%rbp)
	movq	$0, -16(%rbp)
	xorps	%xmm0, %xmm0
	movsd	%xmm0, -24(%rbp)
LBB1_1:                                 ## =>This Inner Loop Header: Depth=1
	movsd	-24(%rbp), %xmm0                ## xmm0 = mem[0],zero
	movsd	-8(%rbp), %xmm1                 ## xmm1 = mem[0],zero
	ucomisd	%xmm0, %xmm1
	jbe	LBB1_4
## %bb.2:                               ##   in Loop: Header=BB1_1 Depth=1
	cvtsi2sdq	-16(%rbp), %xmm0
	addsd	-24(%rbp), %xmm0
	cvttsd2si	%xmm0, %rax
	movq	%rax, -16(%rbp)
## %bb.3:                               ##   in Loop: Header=BB1_1 Depth=1
	movsd	LCPI1_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	addsd	-24(%rbp), %xmm0
	movsd	%xmm0, -24(%rbp)
	jmp	LBB1_1
LBB1_4:
	movq	-16(%rbp), %rax
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
	subq	$16, %rsp
	movl	$0, -4(%rbp)
	movl	$10, %edi
	callq	_foo1
	movl	%eax, %edi
	callq	_println
	movl	$10, %edi
	callq	_foo1
	movslq	%eax, %rdi
	callq	_println_l
	xorl	%eax, %eax
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
