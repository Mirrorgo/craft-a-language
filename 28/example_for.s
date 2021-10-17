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
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0:double
    movsd	LCPI0_0(%rip), %xmm1		#  movsd	doubleIndex(0), var1:double
LBB0_2:
    ucomisd	LCPI0_1(%rip), %xmm1		#  ucomisd	doubleIndex(1), var1:double
    jae	LBB0_4
## bb.3
    addsd	%xmm1, %xmm0				#  addsd	var1:double, var0:double
    movsd	%xmm1, %xmm2				#  movsd	var1:double, var2:double
    movsd	%xmm1, %xmm3				#  movsd	var1:double, var3:double
    addsd	LCPI0_2(%rip), %xmm2		#  addsd	doubleIndex(2), var2:double
    movsd	%xmm2, %xmm1				#  movsd	var2:double, var1:double
    jmp	LBB0_2
LBB0_4:
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

