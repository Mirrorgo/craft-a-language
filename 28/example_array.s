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
    subq	$32, %rsp
## bb.1
    movq	$3, %rdi
    callq	_array_create_by_length
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var4(temp):double
    movsd	%xmm0, 24(%rax)		#  movsd	var4(temp):double, 24(var3)
    movsd	LCPI0_1(%rip), %xmm1		#  movsd	doubleIndex(1), var5(temp):double
    movsd	%xmm1, 32(%rax)		#  movsd	var5(temp):double, 32(var3)
    movsd	LCPI0_2(%rip), %xmm2		#  movsd	doubleIndex(2), var6(temp):double
    movsd	%xmm2, 40(%rax)		#  movsd	var6(temp):double, 40(var3)
    movq	%rax, %r10				#  movq	var3(temp):int64, var0(ages):int64
    movsd	LCPI0_3(%rip), %xmm3		#  movsd	doubleIndex(3), var7(temp):double
    movsd	%xmm3, 40(%r10)		#  movsd	var7(temp):double, 40(var0)
    movsd	LCPI0_4(%rip), %xmm4		#  movsd	doubleIndex(4), var1(sum):double
    movsd	LCPI0_4(%rip), %xmm5		#  movsd	doubleIndex(4), var2(i):double
LBB0_2:
    ucomisd	LCPI0_5(%rip), %xmm5		#  ucomisd	doubleIndex(5), var2(i):double
    jae	LBB0_4
## bb.3
    cvttsd2si	%xmm5, %r11		#  cvttsd2si	var2(i):double, var8(temp):int64
    imulq	$8, %r11				#  imulq	$8, var8(temp):int64
    addq	%r10, %r11				#  addq	var0(ages):int64, var8(temp):int64
    addq	$24, %r11				#  addq	$24, var8(temp):int64
    addsd	(%r11), %xmm4			#  addsd	(var8), var1(sum):double
    cvttsd2si	%xmm5, %rdi		#  cvttsd2si	var2(i):double, var9(temp):int64
    imulq	$8, %rdi				#  imulq	$8, var9(temp):int64
    addq	%r10, %rdi				#  addq	var0(ages):int64, var9(temp):int64
    addq	$24, %rdi				#  addq	$24, var9(temp):int64
    movsd	(%rdi), %xmm0
    movsd	%xmm5, -8(%rbp)		#  spill	var2
    movq	%r10, -16(%rbp)			#  spill	var0
    movsd	%xmm4, -24(%rbp)		#  spill	var1
    callq	_println_d
    movsd	-8(%rbp), %xmm5		#  reload	var2
    movq	-16(%rbp), %r10			#  reload	var0
    movsd	-24(%rbp), %xmm4		#  reload	var1
    movsd	%xmm5, %xmm6				#  movsd	var2(i):double, var10(temp):double
    movsd	%xmm5, %xmm7				#  movsd	var2(i):double, var11(temp):double
    addsd	LCPI0_6(%rip), %xmm6		#  addsd	doubleIndex(6), var10(temp):double
    movsd	%xmm6, %xmm5				#  movsd	var10(temp):double, var2(i):double
    jmp	LBB0_2
LBB0_4:
    movsd	%xmm4, %xmm0
    callq	_println_d
    addq	$32, %rsp
    popq	%rbp
    retq
	.cfi_endproc

