	.section	__TEXT,__literal8,8byte_literals
LCPI0_0:
	.quad	0x4000000000000000		## double 2
LCPI0_1:
	.quad	0x4002666666666666		## double 2.3

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0:double
    movsd	LCPI0_1(%rip), %xmm1		#  movsd	doubleIndex(1), var1:double
    addsd	%xmm1, %xmm0				#  addsd	var1:double, var0:double
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

