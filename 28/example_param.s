	.section	__TEXT,__text,regular,pure_instructions

	.global _foo
_foo:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    mulsd	%xmm1, %xmm0				#  mulsd	var1(p2):double, var0(p1):double
    movsd	%xmm0, %xmm8				#  movsd	var0(p1):double, var8(x1):double
    mulsd	%xmm3, %xmm2				#  mulsd	var3(p4):double, var2(p3):double
    movsd	%xmm2, %xmm9				#  movsd	var2(p3):double, var9(x2):double
    addsd	%xmm9, %xmm8				#  addsd	var9(x2):double, var8(x1):double
    mulsd	%xmm5, %xmm4				#  mulsd	var5(p6):double, var4(p5):double
    addsd	%xmm4, %xmm8				#  addsd	var4(p5):double, var8(x1):double
    mulsd	%xmm7, %xmm6				#  mulsd	var7(p8):double, var6(p7):double
    addsd	%xmm6, %xmm8				#  addsd	var6(p7):double, var8(x1):double
    movsd	%xmm8, %xmm0				#  movsd	var8(x1):double, %xmm0
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__literal8,8byte_literals
LCPI1_0:
	.quad	0x4024666666666666		## double 10.2
LCPI1_1:
	.quad	0x4028333333333333		## double 12.1
LCPI1_2:
	.quad	0x3ff0000000000000		## double 1
LCPI1_3:
	.quad	0x4000000000000000		## double 2
LCPI1_4:
	.quad	0x4008000000000000		## double 3
LCPI1_5:
	.quad	0x4010000000000000		## double 4
LCPI1_6:
	.quad	0x4014000000000000		## double 5
LCPI1_7:
	.quad	0x4018000000000000		## double 6
LCPI1_8:
	.quad	0x401ccccccccccccd		## double 7.2
LCPI1_9:
	.quad	0x402099999999999a		## double 8.3
LCPI1_10:
	.quad	0x4022cccccccccccd		## double 9.4
LCPI1_11:
	.quad	0x4025000000000000		## double 10.5
LCPI1_12:
	.quad	0x4027333333333333		## double 11.6

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    movsd	LCPI1_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0(a):double
    movsd	LCPI1_1(%rip), %xmm1		#  movsd	doubleIndex(1), var1(b):double
    mulsd	%xmm1, %xmm0				#  mulsd	var1(b):double, var0(a):double
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm1, -16(%rbp)		#  spill	var1
    movsd	LCPI1_2(%rip), %xmm2
    movsd	LCPI1_3(%rip), %xmm3
    movsd	LCPI1_4(%rip), %xmm4
    movsd	LCPI1_5(%rip), %xmm5
    movsd	LCPI1_6(%rip), %xmm6
    movsd	LCPI1_7(%rip), %xmm7
    movsd	%xmm1, -16(%rbp)		#  spill	var1
    callq	_foo
    movsd	%xmm0, %xmm2				#  movsd	%xmm0, var3(temp):double
    movsd	-8(%rbp), %xmm0		#  reload	var0
    movsd	-16(%rbp), %xmm1		#  reload	var1
    addsd	%xmm2, %xmm0				#  addsd	var3(temp):double, var0(a):double
    movsd	%xmm0, -8(%rbp)		#  spill	var0
    movsd	%xmm1, %xmm0
    movsd	%xmm0, %xmm1
    movsd	LCPI1_8(%rip), %xmm2
    movsd	LCPI1_9(%rip), %xmm3
    movsd	LCPI1_10(%rip), %xmm4
    movsd	LCPI1_11(%rip), %xmm5
    movsd	LCPI1_12(%rip), %xmm6
    movsd	LCPI1_1(%rip), %xmm7
    callq	_foo
    movsd	%xmm0, %xmm3				#  movsd	%xmm0, var4(temp):double
    movsd	-8(%rbp), %xmm0		#  reload	var0
    addsd	%xmm3, %xmm0				#  addsd	var4(temp):double, var0(a):double
    movsd	%xmm0, %xmm4				#  movsd	var0(a):double, var2(c):double
    movsd	%xmm4, %xmm0
    callq	_println_d
    addq	$16, %rsp
    popq	%rbp
    retq
	.cfi_endproc

