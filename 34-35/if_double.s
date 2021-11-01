	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function foo
LCPI0_0:
	.quad	0x4014000000000000              ## double 5
	.section	__TEXT,__text,regular,pure_instructions
	.globl	_foo
	.p2align	4, 0x90
_foo:                                   ## @foo
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movsd	%xmm0, -16(%rbp)
	movsd	%xmm1, -24(%rbp)
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	ucomisd	-24(%rbp), %xmm0
	jbe	LBB0_2
## %bb.1:
	movsd	LCPI0_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	addsd	-16(%rbp), %xmm0
	movsd	%xmm0, -8(%rbp)
	jmp	LBB0_3
LBB0_2:
	movsd	LCPI0_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	-16(%rbp), %xmm1                ## xmm1 = mem[0],zero
	subsd	%xmm0, %xmm1
	movsd	%xmm1, -8(%rbp)
LBB0_3:
	movsd	-8(%rbp), %xmm0                 ## xmm0 = mem[0],zero
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function main
LCPI1_0:
	.quad	0xc018000000000000              ## double -6
LCPI1_1:
	.quad	0xc01c000000000000              ## double -7
LCPI1_2:
	.quad	0xc014cccccccccccd              ## double -5.2000000000000002
LCPI1_3:
	.quad	0x402499999999999a              ## double 10.300000000000001
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
	movsd	LCPI1_2(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	LCPI1_3(%rip), %xmm1            ## xmm1 = mem[0],zero
	callq	_foo
	callq	_println
	movsd	LCPI1_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	LCPI1_1(%rip), %xmm1            ## xmm1 = mem[0],zero
	callq	_foo
	callq	_println
	xorl	%eax, %eax
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
