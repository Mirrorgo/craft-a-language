	.section	__TEXT,__text,regular,pure_instructions

	.global _foo
_foo:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movsd	%xmm0, %xmm8				#  movsd	var0, var10
    mulsd	%xmm1, %xmm8				#  mulsd	var1, var10
    movsd	%xmm8, %xmm9				#  movsd	var10, var8
    movsd	%xmm2, %xmm10			#  movsd	var2, var11
    mulsd	%xmm3, %xmm10			#  mulsd	var3, var11
    movsd	%xmm10, %xmm11			#  movsd	var11, var9
    movsd	%xmm9, %xmm12			#  movsd	var8, var12
    addsd	%xmm11, %xmm12			#  addsd	var9, var12
    movsd	%xmm4, %xmm13			#  movsd	var4, var13
    mulsd	%xmm5, %xmm13			#  mulsd	var5, var13
    addsd	%xmm13, %xmm12			#  addsd	var13, var12
    movsd	%xmm6, %xmm14			#  movsd	var6, var14
    mulsd	%xmm7, %xmm14			#  mulsd	var7, var14
    addsd	%xmm14, %xmm12			#  addsd	var14, var12
    movsd	%xmm12, %xmm0			#  movsd	var12, returnSlot
    popq	%rbp
    retq
	.cfi_endproc
	.section	__TEXT,__literal8,8byte_literals
LCPI1_0(%rip):
	.quad	0x4024666666666666		## double 10.2
LCPI1_1(%rip):
	.quad	0x4028333333333333		## double 12.1
LCPI1_2(%rip):
	.quad	0x3ff0000000000000		## double 1
LCPI1_3(%rip):
	.quad	0x4000000000000000		## double 2
LCPI1_4(%rip):
	.quad	0x4008000000000000		## double 3
LCPI1_5(%rip):
	.quad	0x4010000000000000		## double 4
LCPI1_6(%rip):
	.quad	0x4014000000000000		## double 5
LCPI1_7(%rip):
	.quad	0x4018000000000000		## double 6
LCPI1_8(%rip):
	.quad	0x401ccccccccccccd		## double 7.2
LCPI1_9(%rip):
	.quad	0x402099999999999a		## double 8.3
LCPI1_10(%rip):
	.quad	0x4022cccccccccccd		## double 9.4
LCPI1_11(%rip):
	.quad	0x4025000000000000		## double 10.5
LCPI1_12(%rip):
	.quad	0x4027333333333333		## double 11.6
	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movsd	LCPI1_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0
    movsd	LCPI1_1(%rip), %xmm1		#  movsd	doubleIndex(1), var1
    movsd	%xmm0, %xmm2				#  movsd	var0, var3
    mulsd	%xmm1, %xmm2				#  mulsd	var1, var3
    movsd	LCPI1_2(%rip), %xmm2
    movsd	LCPI1_3(%rip), %xmm3
    movsd	LCPI1_4(%rip), %xmm4
    movsd	LCPI1_5(%rip), %xmm5
    movsd	LCPI1_6(%rip), %xmm6
    movsd	LCPI1_7(%rip), %xmm7
    callq	_foo
    movsd	%xmm0, %xmm3				#  movsd	returnSlot, var4
    addsd	%xmm3, %xmm2				#  addsd	var4, var3
    movsd	%xmm1, %xmm0
    movsd	%xmm0, %xmm1
    movsd	LCPI1_8(%rip), %xmm2
    movsd	LCPI1_9(%rip), %xmm3
    movsd	LCPI1_10(%rip), %xmm4
    movsd	LCPI1_11(%rip), %xmm5
    movsd	LCPI1_12(%rip), %xmm6
    movsd	LCPI1_1(%rip), %xmm7
    callq	_foo
    movsd	%xmm0, %xmm4				#  movsd	returnSlot, var5
    addsd	%xmm4, %xmm2				#  addsd	var5, var3
    movsd	%xmm2, %xmm5				#  movsd	var3, var2
    movsd	%xmm5, %xmm0
    callq	_println_d
    popq	%rbp
    retq
	.cfi_endproc
