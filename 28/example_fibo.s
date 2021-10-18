	.section	__TEXT,__literal8,8byte_literals
LCPI0_0:
	.quad	0x3ff0000000000000		## double 1
LCPI0_1:
	.quad	0x4000000000000000		## double 2

	.section	__TEXT,__text,regular,pure_instructions

	.global _fibonacci
_fibonacci:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    ucomisd	LCPI0_0(%rip), %xmm0		#  ucomisd	doubleIndex(0), var0(n):double
    ja	LBB0_3
## bb.2
    jmp	LBB0_4
LBB0_3:
    subsd	LCPI0_0(%rip), %xmm0		#  subsd	doubleIndex(0), var0(n):double
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    callq	_fibonacci
    movsd	%xmm0, %xmm1				#  movsd	%xmm0, var1(temp):double
    movsd	-8(%rbp), %xmm0		#  reload	var0
    subsd	LCPI0_1(%rip), %xmm0		#  subsd	doubleIndex(1), var0(n):double
    movsd	%xmm1, -16(%rbp)		#  spill	var1
    callq	_fibonacci
    movsd	%xmm0, %xmm2				#  movsd	%xmm0, var2(temp):double
    movsd	-16(%rbp), %xmm1		#  reload	var1
    addsd	%xmm2, %xmm1				#  addsd	var2(temp):double, var1(temp):double
    movsd	%xmm1, %xmm0				#  movsd	var1(temp):double, %xmm0
LBB0_4:
    addq	$16, %rsp
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__literal8,8byte_literals
LCPI1_0:
	.quad	0x403e000000000000		## double 30
LCPI1_1:
	.quad	0x4044000000000000		## double 40
LCPI1_2:
	.quad	0x3ff0000000000000		## double 1

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    movsd	LCPI1_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0(n):double
LBB1_2:
    ucomisd	LCPI1_1(%rip), %xmm0		#  ucomisd	doubleIndex(1), var0(n):double
    ja	LBB1_4
## bb.3
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    callq	_println_d
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    callq	_tick_d
    movsd	%xmm0, %xmm1				#  movsd	%xmm0, var3(temp):double
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm1, %xmm2				#  movsd	var3(temp):double, var1(t1):double
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm2, -16(%rbp)		#  spill	var1
    callq	_fibonacci
    movsd	%xmm0, %xmm3				#  movsd	%xmm0, var4(temp):double
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	-16(%rbp), %xmm2		#  reload	var1
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm3, %xmm0
    movsd	%xmm2, -16(%rbp)		#  spill	var1
    callq	_println_d
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	-16(%rbp), %xmm2		#  reload	var1
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm2, -16(%rbp)		#  spill	var1
    callq	_tick_d
    movsd	%xmm0, %xmm4				#  movsd	%xmm0, var5(temp):double
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	-16(%rbp), %xmm2		#  reload	var1
    movsd	%xmm4, %xmm5				#  movsd	var5(temp):double, var2(t2):double
    subsd	%xmm2, %xmm5				#  subsd	var1(t1):double, var2(t2):double
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm5, %xmm0
    callq	_println_d
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm0, %xmm6				#  movsd	var0(n):double, var6(temp):double
    movsd	%xmm0, %xmm7				#  movsd	var0(n):double, var7(temp):double
    addsd	LCPI1_2(%rip), %xmm6		#  addsd	doubleIndex(2), var6(temp):double
    movsd	%xmm6, %xmm0				#  movsd	var6(temp):double, var0(n):double
    jmp	LBB1_2
LBB1_4:
    addq	$16, %rsp
    popq	%rbp
    retq
	.cfi_endproc

