	.section	__TEXT,__literal8,8byte_literals
LCPI0_0:
	.quad	0x4014000000000000		## double 5

	.section	__TEXT,__text,regular,pure_instructions

	.global _foo
_foo:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    ucomisd	%xmm1, %xmm0			#  ucomisd	var1:double, var0:double
    jae	LBB0_3
## bb.2
    addsd	LCPI0_0(%rip), %xmm0		#  addsd	doubleIndex(0), var0:double
    jmp	LBB0_4
LBB0_3:
    subsd	LCPI0_0(%rip), %xmm0		#  subsd	doubleIndex(0), var0:double
LBB0_4:
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__literal8,8byte_literals
LCPI1_0:
	.quad	0x402e000000000000		## double 15
LCPI1_1:
	.quad	0x4024000000000000		## double 10
LCPI1_2:
	.quad	0x4022000000000000		## double 9

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movsd	LCPI1_0(%rip), %xmm0
    movsd	LCPI1_1(%rip), %xmm1
    callq	_foo
    callq	_println_d
    movsd	LCPI1_2(%rip), %xmm0
    movsd	LCPI1_1(%rip), %xmm1
    callq	_foo
    movsd	%xmm0, %xmm1				#  movsd	%xmm0, var1:double
    movsd	%xmm1, %xmm0
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

