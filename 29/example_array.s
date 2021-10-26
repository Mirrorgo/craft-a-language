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
LCPI0_7:
	.quad	0x4000000000000000		## double 2
LCPI0_8:
	.quad	0x4010000000000000		## double 4
LCPI0_9:
	.quad	0x4014000000000000		## double 5
LCPI0_10:
	.quad	0x4018000000000000		## double 6
LCPI0_11:
	.quad	0x401c000000000000		## double 7

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$144, %rsp
## bb.1
    movq	$3, %rdi
    callq	_array_create_by_length
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var7(temp):double
    movsd	%xmm0, 24(%rax)		#  movsd	var7(temp):double, 24(var6)
    movsd	LCPI0_1(%rip), %xmm1		#  movsd	doubleIndex(1), var8(temp):double
    movsd	%xmm1, 32(%rax)		#  movsd	var8(temp):double, 32(var6)
    movsd	LCPI0_2(%rip), %xmm2		#  movsd	doubleIndex(2), var9(temp):double
    movsd	%xmm2, 40(%rax)		#  movsd	var9(temp):double, 40(var6)
    movq	%rax, %r10				#  movq	var6(temp):int64, var0(ages):int64
    movsd	LCPI0_3(%rip), %xmm3		#  movsd	doubleIndex(3), var10(temp):double
    movsd	%xmm3, 40(%r10)		#  movsd	var10(temp):double, 40(var0)
    movsd	LCPI0_4(%rip), %xmm4		#  movsd	doubleIndex(4), var1(sum):double
    movsd	LCPI0_4(%rip), %xmm5		#  movsd	doubleIndex(4), var2(i):double
LBB0_2:
    cmpq	LCPI0_5(%rip), %xmm5		#  cmpq	doubleIndex(5), var2(i):double
    jge	LBB0_4
## bb.3
    cvttsd2si	%xmm5, %r11		#  cvttsd2si	var2(i):double, var11(temp):int64
    imulq	$8, %r11				#  imulq	$8, var11(temp):int64
    addq	%r10, %r11				#  addq	var0(ages):int64, var11(temp):int64
    addq	$24, %r11				#  addq	$24, var11(temp):int64
    addsd	(%r11), %xmm4			#  addsd	(var11), var1(sum):double
    cvttsd2si	%xmm5, %rdi		#  cvttsd2si	var2(i):double, var12(temp):int64
    imulq	$8, %rdi				#  imulq	$8, var12(temp):int64
    addq	%r10, %rdi				#  addq	var0(ages):int64, var12(temp):int64
    addq	$24, %rdi				#  addq	$24, var12(temp):int64
    movsd	(%rdi), %xmm0
    movsd	%xmm5, -8(%rbp)		#  spill	var2
    movq	%r10, -16(%rbp)			#  spill	var0
    movsd	%xmm4, -24(%rbp)		#  spill	var1
    callq	_println_d
    movsd	-8(%rbp), %xmm5		#  reload	var2
    movq	-16(%rbp), %r10			#  reload	var0
    movsd	-24(%rbp), %xmm4		#  reload	var1
    movsd	%xmm5, %xmm6				#  movsd	var2(i):double, var13(temp):double
    movsd	%xmm5, %xmm7				#  movsd	var2(i):double, var14(temp):double
    addsd	LCPI0_6(%rip), %xmm6		#  addsd	doubleIndex(6), var13(temp):double
    movsd	%xmm6, %xmm5				#  movsd	var13(temp):double, var2(i):double
    jmp	LBB0_2
LBB0_4:
    movsd	%xmm4, %xmm0
    callq	_println_d
    movq	$3, %rdi
    callq	_array_create_by_length
    movq	%rax, %rsi				#  movq	%rax, var15(temp):int64
    leaq	L_.str(%rip), %rdx		#  leaq	stringConst(0), var16(temp):int64
    movq	%rdx, %rdi
    movq	%rsi, -32(%rbp)			#  spill	var15
    callq	_string_create_by_cstr
    movq	%rax, %rcx				#  movq	%rax, var17(temp):int64
    movq	-32(%rbp), %rsi			#  reload	var15
    movq	%rcx, 24(%rsi)			#  movq	var17(temp):int64, 24(var15)
    leaq	L_.str.1(%rip), %r8		#  leaq	stringConst(1), var18(temp):int64
    movq	%r8, %rdi
    movq	%rsi, -32(%rbp)			#  spill	var15
    callq	_string_create_by_cstr
    movq	%rax, %r9				#  movq	%rax, var19(temp):int64
    movq	-32(%rbp), %rsi			#  reload	var15
    movq	%r9, 32(%rsi)				#  movq	var19(temp):int64, 32(var15)
    leaq	L_.str.2(%rip), %rbx		#  leaq	stringConst(2), var20(temp):int64
    movq	%rbx, %rdi
    movq	%rsi, -32(%rbp)			#  spill	var15
    callq	_string_create_by_cstr
    movq	%rax, %r12				#  movq	%rax, var21(temp):int64
    movq	-32(%rbp), %rsi			#  reload	var15
    movq	%r12, 40(%rsi)			#  movq	var21(temp):int64, 40(var15)
    movq	%rsi, %r13				#  movq	var15(temp):int64, var3(names):int64
    leaq	L_.str.3(%rip), %r14		#  leaq	stringConst(3), var22(temp):int64
    movq	%r14, %rdi
    callq	_string_create_by_cstr
    movq	%rax, %r15				#  movq	%rax, var23(temp):int64
    movq	%rax, -40(%rbp)			#  spill	var6
    movq	%r15, %rax				#  movq	var23(temp):int64, var24(temp):int64
    movq	%rax, 32(%r13)			#  movq	var24(temp):int64, 32(var3)
    movq	32(%r13), %rdi
    callq	_println_s
    movsd	LCPI0_4(%rip), %xmm8		#  movsd	doubleIndex(4), var4(i):double
LBB0_5:
    cmpq	LCPI0_5(%rip), %xmm8		#  cmpq	doubleIndex(5), var4(i):double
    jge	LBB0_7
## bb.6
    movq	%r10, -16(%rbp)			#  spill	var0
    cvttsd2si	%xmm8, %r10		#  cvttsd2si	var4(i):double, var25(temp):int64
    imulq	$8, %r10				#  imulq	$8, var25(temp):int64
    addq	%r13, %r10				#  addq	var3(names):int64, var25(temp):int64
    addq	$24, %r10				#  addq	$24, var25(temp):int64
    movq	(%r10), %rdi
    movsd	%xmm8, -48(%rbp)		#  spill	var4
    callq	_println_s
    movsd	-48(%rbp), %xmm8		#  reload	var4
    movsd	%xmm8, %xmm9				#  movsd	var4(i):double, var26(temp):double
    movsd	%xmm8, %xmm10			#  movsd	var4(i):double, var27(temp):double
    addsd	LCPI0_6(%rip), %xmm9		#  addsd	doubleIndex(6), var26(temp):double
    movsd	%xmm9, %xmm8				#  movsd	var26(temp):double, var4(i):double
    jmp	LBB0_5
LBB0_7:
    movq	$2, %rdi
    callq	_array_create_by_length
    movq	%r11, -56(%rbp)			#  spill	var11
    movq	%rax, %r11				#  movq	%rax, var28(temp):int64
    movq	$3, %rdi
    movq	%r11, -64(%rbp)			#  spill	var28
    callq	_array_create_by_length
    movq	%rdi, -72(%rbp)			#  spill	var12
    movq	%rax, %rdi				#  movq	%rax, var29(temp):int64
    movq	-64(%rbp), %r11			#  reload	var28
    movsd	LCPI0_6(%rip), %xmm11		#  movsd	doubleIndex(6), var30(temp):double
    movq	%xmm11, 24(%rdi)		#  movq	var30(temp):double, 24(var29)
    movsd	LCPI0_7(%rip), %xmm12		#  movsd	doubleIndex(7), var31(temp):double
    movq	%xmm12, 32(%rdi)		#  movq	var31(temp):double, 32(var29)
    movsd	LCPI0_5(%rip), %xmm13		#  movsd	doubleIndex(5), var32(temp):double
    movq	%xmm13, 40(%rdi)		#  movq	var32(temp):double, 40(var29)
    movq	%rdi, 24(%r11)			#  movq	var29(temp):int64, 24(var28)
    movq	$2, %rdi
    movq	%r11, -64(%rbp)			#  spill	var28
    callq	_array_create_by_length
    movq	%rsi, -32(%rbp)			#  spill	var15
    movq	%rax, %rsi				#  movq	%rax, var33(temp):int64
    movq	-64(%rbp), %r11			#  reload	var28
    movsd	LCPI0_8(%rip), %xmm14		#  movsd	doubleIndex(8), var34(temp):double
    movq	%xmm14, 24(%rsi)		#  movq	var34(temp):double, 24(var33)
    movsd	LCPI0_9(%rip), %xmm15		#  movsd	doubleIndex(9), var35(temp):double
    movq	%xmm15, 32(%rsi)		#  movq	var35(temp):double, 32(var33)
    movq	%rsi, 32(%r11)			#  movq	var33(temp):int64, 32(var28)
    movq	%rdx, -80(%rbp)			#  spill	var16
    movq	%r11, %rdx				#  movq	var28(temp):int64, var5(a):int64
    movq	$3, %rdi
    movq	%rdx, -88(%rbp)			#  spill	var5
    callq	_array_create_by_length
    movq	%rcx, -96(%rbp)			#  spill	var17
    movq	%rax, %rcx				#  movq	%rax, var36(temp):int64
    movq	-88(%rbp), %rdx			#  reload	var5
    movsd	%xmm0, -104(%rbp)		#  spill	var7
    movsd	LCPI0_8(%rip), %xmm0		#  movsd	doubleIndex(8), var37(temp):double
    movq	%xmm0, 24(%rcx)			#  movq	var37(temp):double, 24(var36)
    movsd	%xmm1, -112(%rbp)		#  spill	var8
    movsd	LCPI0_9(%rip), %xmm1		#  movsd	doubleIndex(9), var38(temp):double
    movq	%xmm1, 32(%rcx)			#  movq	var38(temp):double, 32(var36)
    movsd	%xmm2, -120(%rbp)		#  spill	var9
    movsd	LCPI0_10(%rip), %xmm2		#  movsd	doubleIndex(10), var39(temp):double
    movq	%xmm2, 40(%rcx)			#  movq	var39(temp):double, 40(var36)
    movq	%r8, -128(%rbp)			#  spill	var18
    movq	%rcx, %r8				#  movq	var36(temp):int64, var40(temp):int64
    movq	%r8, 24(%rdx)				#  movq	var40(temp):int64, 24(var5)
    movsd	%xmm3, -136(%rbp)		#  spill	var10
    movsd	24(%rdx), %xmm3		#  movsd	24(var5), var41(temp):double
    movsd	%xmm4, -24(%rbp)		#  spill	var1
    movsd	LCPI0_11(%rip), %xmm4		#  movsd	doubleIndex(11), var42(temp):double
    movsd	%xmm4, 32(%xmm3)		#  movsd	var42(temp):double, 32(var41)
    addq	$144, %rsp
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__cstring,cstring_literals
L_.str:
	.asciz	"richard"
L_.str.1:
	.asciz	"sam"
L_.str.2:
	.asciz	"john"
L_.str.3:
	.asciz	"julia"
