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
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0
LBB0_2:
    comisd	LCPI0_1(%rip), %xmm0		#  ucomisd	doubleIndex(1), var0
    jae	LBB0_4
## bb.3
    movsd	%xmm0, %xmm1				#  movsd	var0, var1
    movsd	%xmm0, %xmm2				#  movsd	var0, var2
    addsd	LCPI0_2(%rip), %xmm1		#  addsd	doubleIndex(2), var1
    movsd	%xmm1, %xmm0				#  movsd	var1, var0
    #callq	_println_d
    jmp	LBB0_2
LBB0_4:
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

