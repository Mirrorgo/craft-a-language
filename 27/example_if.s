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
    ucomisd	%xmm1, %xmm0			#  ucomisd	var1, var0
    jge	LBB0_3
## bb.2
    movsd	%xmm0, %xmm2				#  movsd	var0, var2
    addsd	LCPI0_0(%rip), %xmm2		#  addsd	doubleIndex(0), var2
    movsd	%xmm2, %xmm0				#  movsd	var2, returnSlot
    jmp	LBB0_4
LBB0_3:
    movsd	%xmm0, %xmm3				#  movsd	var0, var3
    subsd	LCPI0_0(%rip), %xmm3		#  subsd	doubleIndex(0), var3
    movsd	%xmm3, %xmm0				#  movsd	var3, returnSlot
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
    movsd	%xmm0, %xmm1				#  movsd	returnSlot, var1
    movsd	%xmm1, %xmm0
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

