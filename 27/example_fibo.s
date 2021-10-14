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
    ucomisd	LCPI0_0(%rip), %xmm0		#  ucomisd	doubleIndex(0), var0
    ja	LBB0_3
## bb.2
    jmp	LBB0_4
LBB0_3:
    movsd	%xmm0, %xmm1				#  movsd	var0, var1
    subsd	LCPI0_0(%rip), %xmm1		#  subsd	doubleIndex(0), var1
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm1, %xmm0
    callq	_fibonacci
    movsd	%xmm0, %xmm2				#  movsd	returnSlot, var2
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm0, %xmm3				#  movsd	var0, var3
    subsd	LCPI0_1(%rip), %xmm3		#  subsd	doubleIndex(1), var3
    movsd	%xmm3, %xmm0
    movsd	%xmm2, -16(%rbp)		#  spill	var2
    callq	_fibonacci
    movsd	%xmm0, %xmm4				#  movsd	returnSlot, var4
    movsd	-16(%rbp), %xmm2		#  reload	var2
    addsd	%xmm4, %xmm2				#  addsd	var4, var2
    movsd	%xmm2, %xmm0				#  movsd	var2, returnSlot
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
    movsd	LCPI1_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0
LBB1_2:
    ucomisd	LCPI1_1(%rip), %xmm0		#  ucomisd	doubleIndex(1), var0
    ja	LBB1_4
## bb.3
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    callq	_println_d
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    callq	_tick_d
    movsd	%xmm0, %xmm1				#  movsd	returnSlot, var3
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm1, %xmm2				#  movsd	var3, var1
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm2, -16(%rbp)		#  spill	var1
    callq	_fibonacci
    movsd	%xmm0, %xmm3				#  movsd	returnSlot, var4
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
    movsd	%xmm0, %xmm4				#  movsd	returnSlot, var5
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	-16(%rbp), %xmm2		#  reload	var1
    movsd	%xmm4, %xmm5				#  movsd	var5, var2
    movsd	%xmm5, %xmm6				#  movsd	var2, var6
    subsd	%xmm2, %xmm6				#  subsd	var1, var6
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm6, %xmm0
    callq	_println_d
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm0, %xmm7				#  movsd	var0, var7
    movsd	%xmm0, %xmm8				#  movsd	var0, var8
    addsd	LCPI1_2(%rip), %xmm7		#  addsd	doubleIndex(2), var7
    movsd	%xmm7, %xmm0				#  movsd	var7, var0
    jmp	LBB1_2
LBB1_4:
    addq	$16, %rsp
    popq	%rbp
    retq
	.cfi_endproc

