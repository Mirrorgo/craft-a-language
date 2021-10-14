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
    cmpl	LCPI0_0(%rip), 16(%rbp)		#  cmpl	doubleIndex(0), var0(double)
    jg	LBB0_3
## bb.2
    movsd	16(%rbp), %xmm0		#  movsd	var0(double), %xmm0
    jmp	LBB0_4
LBB0_3:
    movsd	16(%rbp), %xmm0		#  movsd	var0(double), var1(double)
    subsd	LCPI0_0(%rip), %xmm0		#  subsd	doubleIndex(0), var1(double)
    movsd	%xmm0, (%rsp)
    callq	_fibonacci
    movsd	%xmm0, %xmm1				#  movsd	%xmm0, var2(double)
    movsd	16(%rbp), %xmm2		#  movsd	var0(double), var3(double)
    subsd	LCPI0_1(%rip), %xmm2		#  subsd	doubleIndex(1), var3(double)
    movsd	%xmm2, (%rsp)
    movsd	%xmm1, -8(%rbp)		#  spill	var2
    callq	_fibonacci
    movsd	%xmm0, %xmm3				#  movsd	%xmm0, var4(double)
    movsd	-8(%rbp), %xmm1		#  reload	var2
    addsd	%xmm3, %xmm1				#  addsd	var4(double), var2(double)
    movsd	%xmm1, %xmm0				#  movsd	var2(double), %xmm0
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
    movsd	LCPI1_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0(double)
LBB1_2:
    cmpl	LCPI1_1(%rip), %xmm0		#  cmpl	doubleIndex(1), var0(double)
    jg	LBB1_4
## bb.3
    movl	%xmm0, %rdi
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    callq	_println_d
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    callq	_tick_d
    movsd	%xmm0, %xmm1				#  movsd	%xmm0, var3(double)
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	%xmm1, %xmm2				#  movsd	var3(double), var1(double)
    movsd	%xmm0, (%rsp)
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm2, -16(%rbp)		#  spill	var1
    callq	_fibonacci
    movsd	%xmm0, %xmm3				#  movsd	%xmm0, var4(double)
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	-16(%rbp), %xmm2		#  reload	var1
    movl	%xmm3, %rdi
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm2, -16(%rbp)		#  spill	var1
    callq	_println_d
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	-16(%rbp), %xmm2		#  reload	var1
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm2, -16(%rbp)		#  spill	var1
    callq	_tick_d
    movsd	%xmm0, %xmm4				#  movsd	%xmm0, var5(double)
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	-16(%rbp), %xmm2		#  reload	var1
    movsd	%xmm4, %xmm5				#  movsd	var5(double), var2(double)
    movsd	%xmm5, %xmm6				#  movsd	var2(double), var6(double)
    subsd	%xmm2, %xmm6				#  subsd	var1(double), var6(double)
    movl	%xmm6, %rdi
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    callq	_println_d
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movl	%xmm0, %r10d				#  movl	var0(double), var7(int32)
    movl	%xmm0, %r11d				#  movl	var0(double), var8(int32)
    addl	LCPI1_2(%rip), %r10d		#  addl	doubleIndex(2), var7(int32)
    movl	%r10d, %xmm0				#  movl	var7(int32), var0(double)
    jmp	LBB1_2
LBB1_4:
    addq	$16, %rsp
    popq	%rbp
    retq
	.cfi_endproc

