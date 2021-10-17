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
    movl	$3, %edi
    callq	_array_create_by_length
    movq    $1, %rdi 
    movsd	LCPI0_0(%rip), %xmm0
    movsd   %xmm0, 20(%rax)		#  movsd	doubleIndex(0), 20(var1, 8)
    movsd	LCPI0_1(%rip), %xmm1
    movsd   %xmm1, 20(%rax,%rdi,8)		#  movsd	doubleIndex(1), 20(var1, 1, 8)
    # movsd	LCPI0_2(%rip), 20(%rax,2,8)		#  movsd	doubleIndex(2), 20(var1, 2, 8)
    movq	%rax, %r10				#  movq	var1(temp):int64, var0(ages):int64
    popq	%rbp
    retq
	.cfi_endproc

