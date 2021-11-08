	.section	__TEXT,__text,regular,pure_instructions

	.global _sum
_sum:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    addsd	%xmm1, %xmm0				#  addsd	var1(cur):double, var0(prev):double
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__literal8,8byte_literals
LCPI1_0:
	.quad	0x4024000000000000		## double 10
LCPI1_1:
	.quad	0x4000000000000000		## double 2

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movq	_sum, %rax				#  movq	_sum, var1(temp):int64
    movq	%rax, %r10				#  movq	var1(temp):int64, var0(fun1):int64
    movsd	LCPI1_0(%rip), %xmm0
    movsd	LCPI1_1(%rip), %xmm1
    callq	*(%r10)
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

