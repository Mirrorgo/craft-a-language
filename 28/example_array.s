	.section	__TEXT,__literal8,8byte_literals
LCPI0_0:
	.quad	0x4020000000000000		## double 8
LCPI0_1:
	.quad	0x4032000000000000		## double 18
LCPI0_2:
	.quad	0x403c000000000000		## double 28
LCPI0_3:
	.quad	0x4043000000000000		## double 38
LCPI0_4:
	.quad	0x0000000000000000		## double 0
LCPI0_5:
	.quad	0x4008000000000000		## double 3
LCPI0_6:
	.quad	0x3ff0000000000000		## double 1

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
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var4(temp):double
    movl	%xmm0, 20(%rax)			#  movl	var4(temp):double, 20(var3)
    movsd	LCPI0_1(%rip), %xmm1		#  movsd	doubleIndex(1), var5(temp):double
    movl	%xmm1, 28(%rax)			#  movl	var5(temp):double, 28(var3)
    movsd	LCPI0_2(%rip), %xmm2		#  movsd	doubleIndex(2), var6(temp):double
    movl	%xmm2, 36(%rax)			#  movl	var6(temp):double, 36(var3)
    movq	%rax, %r10				#  movq	var3(temp):int64, var0(ages):int64
    movsd	LCPI0_3(%rip), %xmm3		#  movsd	doubleIndex(3), var7(temp):double
    movsd	%xmm3, 36(%r10)		#  movsd	var7(temp):double, 36(var0)
    movsd	LCPI0_4(%rip), %xmm4		#  movsd	doubleIndex(4), var1(sum):double
    movl	LCPI0_4(%rip), %r10d		#  movl	doubleIndex(4), var2(i):int32
LBB0_2:
    ucomisd	LCPI0_5(%rip), %r10d		#  ucomisd	doubleIndex(5), var2(i):double
    jae	LBB0_4
## bb.3
    movq	%r10d, %r11				#  movq	var2(i):double, var8(temp):int64
    mulq	$8, %r11				#  mulq	$8, var8(temp):int64
    addq	%r10, %r11				#  addq	var0(ages):int64, var8(temp):int64
    addsd	(%r11), %xmm4			#  addsd	(var8), var1(sum):double
    movsd	%r10d, %xmm5				#  movsd	var2(i):double, var9(temp):double
    movsd	%r10d, %xmm6				#  movsd	var2(i):double, var10(temp):double
    addsd	LCPI0_6(%rip), %xmm5		#  addsd	doubleIndex(6), var9(temp):double
    movsd	%xmm5, %r10d				#  movsd	var9(temp):double, var2(i):double
    jmp	LBB0_2
LBB0_4:
    movsd	%xmm4, %xmm0
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc

