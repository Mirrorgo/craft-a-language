	.section	__TEXT,__literal8,8byte_literals
LCPI0_0:
	.quad	0x0000000000000000		## double 0
LCPI0_1:
	.quad	0x4024000000000000		## double 10
LCPI0_2:
	.quad	0x3ff0000000000000		## double 1

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0
    movsd	LCPI0_0(%rip), %xmm1		#  movsd	doubleIndex(0), var1
LBB0_2:
    ucomisd	LCPI0_1(%rip), %xmm1		#  ucomisd	doubleIndex(1), var1
    jae	LBB0_4
## bb.3
    movsd	%xmm0, %xmm2				#  movsd	var0, var2
    addsd	%xmm1, %xmm2				#  addsd	var1, var2
    movsd	%xmm2, %xmm0				#  movsd	var2, var0
    movsd	%xmm1, %xmm3				#  movsd	var1, var3
    movsd	%xmm1, %xmm4				#  movsd	var1, var4
    addsd	LCPI0_2(%rip), %xmm3		#  addsd	doubleIndex(2), var3
    movsd	%xmm3, %xmm1				#  movsd	var3, var1
    jmp	LBB0_2
LBB0_4:
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

