	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function bar
LCPI0_0:
	.quad	0x3ff0000000000000              ## double 1
LCPI0_1:
	.quad	0x4000000000000000              ## double 2
LCPI0_2:
	.quad	0x4008000000000000              ## double 3
LCPI0_3:
	.quad	0x4010000000000000              ## double 4
LCPI0_4:
	.quad	0x4014000000000000              ## double 5
LCPI0_5:
	.quad	0x4018666666666666              ## double 6.0999999999999996
LCPI0_6:
	.quad	0x401ccccccccccccd              ## double 7.2000000000000002
LCPI0_7:
	.quad	0x402099999999999a              ## double 8.3000000000000007
LCPI0_8:
	.quad	0x4022cccccccccccd              ## double 9.4000000000000003
LCPI0_9:
	.quad	0x4025000000000000              ## double 10.5
	.section	__TEXT,__text,regular,pure_instructions
	.globl	_bar
	.p2align	4, 0x90
_bar:                                   ## @bar
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movsd	LCPI0_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	LCPI0_1(%rip), %xmm1            ## xmm1 = mem[0],zero
	movsd	LCPI0_2(%rip), %xmm2            ## xmm2 = mem[0],zero
	movsd	LCPI0_3(%rip), %xmm3            ## xmm3 = mem[0],zero
	movsd	LCPI0_4(%rip), %xmm4            ## xmm4 = mem[0],zero
	movsd	LCPI0_5(%rip), %xmm5            ## xmm5 = mem[0],zero
	movsd	LCPI0_6(%rip), %xmm6            ## xmm6 = mem[0],zero
	movsd	LCPI0_7(%rip), %xmm7            ## xmm7 = mem[0],zero
	movsd	LCPI0_8(%rip), %xmm8            ## xmm8 = mem[0],zero
	movsd	LCPI0_9(%rip), %xmm9            ## xmm9 = mem[0],zero
	movsd	%xmm8, (%rsp)
	movsd	%xmm9, 8(%rsp)
	callq	_foo
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function bar1
LCPI1_0:
	.quad	0x4028000000000000              ## double 12
LCPI1_1:
	.quad	0x4035000000000000              ## double 21
LCPI1_2:
	.quad	0x4037000000000000              ## double 23
LCPI1_3:
	.quad	0x4041000000000000              ## double 34
LCPI1_4:
	.quad	0x4014000000000000              ## double 5
LCPI1_5:
	.quad	0x4018666666666666              ## double 6.0999999999999996
LCPI1_6:
	.quad	0x401ccccccccccccd              ## double 7.2000000000000002
LCPI1_7:
	.quad	0x402099999999999a              ## double 8.3000000000000007
LCPI1_8:
	.quad	0x4022cccccccccccd              ## double 9.4000000000000003
LCPI1_9:
	.quad	0x4025000000000000              ## double 10.5
	.section	__TEXT,__text,regular,pure_instructions
	.globl	_bar1
	.p2align	4, 0x90
_bar1:                                  ## @bar1
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movsd	LCPI1_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	LCPI1_1(%rip), %xmm1            ## xmm1 = mem[0],zero
	movsd	LCPI1_2(%rip), %xmm2            ## xmm2 = mem[0],zero
	movsd	LCPI1_3(%rip), %xmm3            ## xmm3 = mem[0],zero
	movsd	LCPI1_4(%rip), %xmm4            ## xmm4 = mem[0],zero
	movsd	LCPI1_5(%rip), %xmm5            ## xmm5 = mem[0],zero
	movsd	LCPI1_6(%rip), %xmm6            ## xmm6 = mem[0],zero
	movsd	LCPI1_7(%rip), %xmm7            ## xmm7 = mem[0],zero
	movsd	LCPI1_8(%rip), %xmm8            ## xmm8 = mem[0],zero
	movsd	LCPI1_9(%rip), %xmm9            ## xmm9 = mem[0],zero
	movsd	%xmm8, (%rsp)
	movsd	%xmm9, 8(%rsp)
	callq	_foo
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
