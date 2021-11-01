	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function main
LCPI0_0:
	.quad	0x4024000000000000              ## double 10
LCPI0_1:
	.quad	0x3ff0000000000000              ## double 1
	.section	__TEXT,__text,regular,pure_instructions
	.globl	_main
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
	movl	$0, -4(%rbp)
	xorps	%xmm0, %xmm0
	movsd	%xmm0, -16(%rbp)
	movsd	%xmm0, -24(%rbp)
LBB0_1:                                 ## =>This Inner Loop Header: Depth=1
	movsd	LCPI0_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	ucomisd	-24(%rbp), %xmm0
	jbe	LBB0_4
## %bb.2:                               ##   in Loop: Header=BB0_1 Depth=1
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	addsd	-24(%rbp), %xmm0
	movsd	%xmm0, -16(%rbp)
## %bb.3:                               ##   in Loop: Header=BB0_1 Depth=1
	movsd	LCPI0_1(%rip), %xmm0            ## xmm0 = mem[0],zero
	addsd	-24(%rbp), %xmm0
	movsd	%xmm0, -24(%rbp)
	jmp	LBB0_1
LBB0_4:
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	callq	_println
	xorl	%eax, %eax
	addq	$32, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
