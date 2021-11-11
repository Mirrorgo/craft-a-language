	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function fibonacci
LCPI0_0:
	.quad	0x3ff0000000000000              ## double 1
LCPI0_1:
	.quad	0x4000000000000000              ## double 2
	.section	__TEXT,__text,regular,pure_instructions
	.globl	_fibonacci
	.p2align	4, 0x90
_fibonacci:                             ## @fibonacci
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$32, %rsp
	movsd	LCPI0_0(%rip), %xmm1            ## xmm1 = mem[0],zero
	movsd	%xmm0, -16(%rbp)
	ucomisd	-16(%rbp), %xmm1
	jb	LBB0_2
## %bb.1:
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	movsd	%xmm0, -8(%rbp)
	jmp	LBB0_3
LBB0_2:
	movsd	LCPI0_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	-16(%rbp), %xmm1                ## xmm1 = mem[0],zero
	subsd	%xmm0, %xmm1
	movaps	%xmm1, %xmm0
	callq	_fibonacci
	movsd	LCPI0_1(%rip), %xmm1            ## xmm1 = mem[0],zero
	movsd	-16(%rbp), %xmm2                ## xmm2 = mem[0],zero
	subsd	%xmm1, %xmm2
	movsd	%xmm0, -24(%rbp)                ## 8-byte Spill
	movaps	%xmm2, %xmm0
	callq	_fibonacci
	movsd	-24(%rbp), %xmm1                ## 8-byte Reload
                                        ## xmm1 = mem[0],zero
	addsd	%xmm0, %xmm1
	movsd	%xmm1, -8(%rbp)
LBB0_3:
	movsd	-8(%rbp), %xmm0                 ## xmm0 = mem[0],zero
	addq	$32, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function main
LCPI1_0:
	.quad	0x403e000000000000              ## double 30
LCPI1_1:
	.quad	0x4044000000000000              ## double 40
LCPI1_2:
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
	movsd	LCPI1_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	movl	$0, -4(%rbp)
	movsd	%xmm0, -16(%rbp)
LBB1_1:                                 ## =>This Inner Loop Header: Depth=1
	movsd	LCPI1_1(%rip), %xmm0            ## xmm0 = mem[0],zero
	ucomisd	-16(%rbp), %xmm0
	jb	LBB1_4
## %bb.2:                               ##   in Loop: Header=BB1_1 Depth=1
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	callq	_println_d
	movb	$0, %al
	callq	_tick_d
	movsd	%xmm0, -24(%rbp)
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	callq	_fibonacci
	callq	_println_d
	movb	$0, %al
	callq	_tick_d
	movsd	%xmm0, -32(%rbp)
	movsd	-32(%rbp), %xmm0                ## xmm0 = mem[0],zero
	subsd	-24(%rbp), %xmm0
	callq	_println_d
## %bb.3:                               ##   in Loop: Header=BB1_1 Depth=1
	movsd	LCPI1_2(%rip), %xmm0            ## xmm0 = mem[0],zero
	addsd	-16(%rbp), %xmm0
	movsd	%xmm0, -16(%rbp)
	jmp	LBB1_1
LBB1_4:
	movl	-4(%rbp), %eax
	addq	$32, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
