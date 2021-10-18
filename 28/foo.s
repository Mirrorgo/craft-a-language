	.section	__TEXT,__literal8,8byte_literals
LCPI0_0:
	.quad	0x4020000000000000		## double 8
LCPI0_1:
	.quad	0x4032000000000000		## double 18
LCPI0_2:
	.quad	0x403c000000000000		## double 28

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movq	$3, %rdi
    callq	_array_create_by_length
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var2(temp):double
    movsd	%xmm0, 24(%rax)		#  movsd	var2(temp):double, 24(var1)
    movsd	LCPI0_1(%rip), %xmm1		#  movsd	doubleIndex(1), var3(temp):double
    movsd	%xmm1, 32(%rax)		#  movsd	var3(temp):double, 32(var1)
    movsd	LCPI0_2(%rip), %xmm2		#  movsd	doubleIndex(2), var4(temp):double
    movsd	%xmm2, 40(%rax)		#  movsd	var4(temp):double, 40(var1)
    movq	%rax, %r10				#  movq	var1(temp):int64, var0(ages):int64
    movsd	24(%r10), %xmm0
    callq	_println_d
    movsd	32(%r10), %xmm0
    #callq	_println_d
    movsd	40(%r10), %xmm0
    #callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

