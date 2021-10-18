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
    subq	$48, %rsp
## bb.1
    movq	$3, %rdi
    callq	_array_create_by_length
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var6(temp):double
    movsd	%xmm0, 24(%rax)		#  movsd	var6(temp):double, 24(var5)
    movsd	LCPI0_1(%rip), %xmm1		#  movsd	doubleIndex(1), var7(temp):double
    movsd	%xmm1, 32(%rax)		#  movsd	var7(temp):double, 32(var5)
    movsd	LCPI0_2(%rip), %xmm2		#  movsd	doubleIndex(2), var8(temp):double
    movsd	%xmm2, 40(%rax)		#  movsd	var8(temp):double, 40(var5)
    movq	%rax, %r10				#  movq	var5(temp):int64, var0(ages):int64
    movsd	LCPI0_3(%rip), %xmm3		#  movsd	doubleIndex(3), var9(temp):double
    movsd	%xmm3, 40(%r10)		#  movsd	var9(temp):double, 40(var0)
    movsd	LCPI0_4(%rip), %xmm4		#  movsd	doubleIndex(4), var1(sum):double
    movsd	LCPI0_4(%rip), %xmm5		#  movsd	doubleIndex(4), var2(i):double
LBB0_2:
    ucomisd	LCPI0_5(%rip), %xmm5		#  ucomisd	doubleIndex(5), var2(i):double
    jae	LBB0_4
## bb.3
    cvttsd2si	%xmm5, %r11		#  cvttsd2si	var2(i):double, var10(temp):int64
    imulq	$8, %r11				#  imulq	$8, var10(temp):int64
    addq	%r10, %r11				#  addq	var0(ages):int64, var10(temp):int64
    addq	$24, %r11				#  addq	$24, var10(temp):int64
    addsd	(%r11), %xmm4			#  addsd	(var10), var1(sum):double
    cvttsd2si	%xmm5, %rdi		#  cvttsd2si	var2(i):double, var11(temp):int64
    imulq	$8, %rdi				#  imulq	$8, var11(temp):int64
    addq	%r10, %rdi				#  addq	var0(ages):int64, var11(temp):int64
    addq	$24, %rdi				#  addq	$24, var11(temp):int64
    movsd	(%rdi), %xmm0
    movsd	%xmm5, -8(%rbp)		#  spill	var2
    movq	%r10, -16(%rbp)			#  spill	var0
    movsd	%xmm4, -24(%rbp)		#  spill	var1
    callq	_println_d
    movsd	-8(%rbp), %xmm5		#  reload	var2
    movq	-16(%rbp), %r10			#  reload	var0
    movsd	-24(%rbp), %xmm4		#  reload	var1
    movsd	%xmm5, %xmm6				#  movsd	var2(i):double, var12(temp):double
    movsd	%xmm5, %xmm7				#  movsd	var2(i):double, var13(temp):double
    addsd	LCPI0_6(%rip), %xmm6		#  addsd	doubleIndex(6), var12(temp):double
    movsd	%xmm6, %xmm5				#  movsd	var12(temp):double, var2(i):double
    jmp	LBB0_2
LBB0_4:
    movsd	%xmm4, %xmm0
    callq	_println_d
    movq	$3, %rdi
    callq	_array_create_by_length
    movq	%rax, %rsi				#  movq	%rax, var14(temp):int64
    leaq	L_.str(%rip), %rdx		#  leaq	stringConst(0), var15(temp):int64
    movq	%rdx, %rdi
    movq	%rsi, -32(%rbp)			#  spill	var14
    callq	_string_create_by_cstr
    movq	%rax, %rcx				#  movq	%rax, var16(temp):int64
    movq	-32(%rbp), %rsi			#  reload	var14
    movq	%rcx, 24(%rsi)			#  movq	var16(temp):int64, 24(var14)
    leaq	L_.str.1(%rip), %r8		#  leaq	stringConst(1), var17(temp):int64
    movq	%r8, %rdi
    movq	%rsi, -32(%rbp)			#  spill	var14
    callq	_string_create_by_cstr
    movq	%rax, %r9				#  movq	%rax, var18(temp):int64
    movq	-32(%rbp), %rsi			#  reload	var14
    movq	%r9, 32(%rsi)				#  movq	var18(temp):int64, 32(var14)
    leaq	L_.str.2(%rip), %rbx		#  leaq	stringConst(2), var19(temp):int64
    movq	%rbx, %rdi
    movq	%rsi, -32(%rbp)			#  spill	var14
    callq	_string_create_by_cstr
    movq	%rax, %r12				#  movq	%rax, var20(temp):int64
    movq	-32(%rbp), %rsi			#  reload	var14
    movq	%r12, 40(%rsi)			#  movq	var20(temp):int64, 40(var14)
    movq	%rsi, %r13				#  movq	var14(temp):int64, var3(names):int64
    leaq	L_.str.3(%rip), %r14		#  leaq	stringConst(3), var21(temp):int64
    movq	%r14, %rdi
    callq	_string_create_by_cstr
    movq	%rax, %r15				#  movq	%rax, var22(temp):int64
    movq	%rax, -40(%rbp)			#  spill	var5
    movq	%r15, %rax				#  movq	var22(temp):int64, var23(temp):int64
    movq	%rax, 32(%r13)			#  movq	var23(temp):int64, 32(var3)
    movq	32(%r13), %rdi
    callq	_println_s
    movsd	LCPI0_4(%rip), %xmm8		#  movsd	doubleIndex(4), var4(i):double
LBB0_5:
    ucomisd	LCPI0_5(%rip), %xmm8		#  ucomisd	doubleIndex(5), var4(i):double
    jae	LBB0_7
## bb.6
    movq	%r10, -16(%rbp)			#  spill	var0
    cvttsd2si	%xmm8, %r10		#  cvttsd2si	var4(i):double, var24(temp):int64
    imulq	$8, %r10				#  imulq	$8, var24(temp):int64
    addq	%r13, %r10				#  addq	var3(names):int64, var24(temp):int64
    addq	$24, %r10				#  addq	$24, var24(temp):int64
    movq	(%r10), %rdi
    movsd	%xmm8, -48(%rbp)		#  spill	var4
    callq	_println_s
    movsd	-48(%rbp), %xmm8		#  reload	var4
    movsd	%xmm8, %xmm9				#  movsd	var4(i):double, var25(temp):double
    movsd	%xmm8, %xmm10			#  movsd	var4(i):double, var26(temp):double
    addsd	LCPI0_6(%rip), %xmm9		#  addsd	doubleIndex(6), var25(temp):double
    movsd	%xmm9, %xmm8				#  movsd	var25(temp):double, var4(i):double
    jmp	LBB0_5
LBB0_7:
    addq	$48, %rsp
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
