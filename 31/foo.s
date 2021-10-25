	.section	__TEXT,__literal8,8byte_literals
LCPI0_0:
	.quad	0x0000000000000000		## double 0
LCPI0_1:
	.quad	0x4008000000000000		## double 3
LCPI0_2:
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
    leaq	L_.str(%rip), %r10		#  leaq	stringConst(0), var3(temp):int64
    movq	%r10, %rdi
    movq	%rax, -8(%rbp)			#  spill	var2
    callq	_string_create_by_cstr
    movq	%rax, %r11				#  movq	%rax, var4(temp):int64
    movq	-8(%rbp), %rax			#  reload	var2
    movq	%r11, 24(%rax)			#  movq	var4(temp):int64, 24(var2)
    leaq	L_.str.1(%rip), %rdi		#  leaq	stringConst(1), var5(temp):int64
    movq	%rax, -8(%rbp)			#  spill	var2
    callq	_string_create_by_cstr
    movq	%rax, %rsi				#  movq	%rax, var6(temp):int64
    movq	-8(%rbp), %rax			#  reload	var2
    movq	%rsi, 32(%rax)			#  movq	var6(temp):int64, 32(var2)
    leaq	L_.str.2(%rip), %rdx		#  leaq	stringConst(2), var7(temp):int64
    movq	%rdx, %rdi
    movq	%rax, -8(%rbp)			#  spill	var2
    callq	_string_create_by_cstr
    movq	%rax, %rcx				#  movq	%rax, var8(temp):int64
    movq	-8(%rbp), %rax			#  reload	var2
    movq	%rcx, 40(%rax)			#  movq	var8(temp):int64, 40(var2)
    movq	%rax, %r8				#  movq	var2(temp):int64, var0(names):int64
    leaq	L_.str.3(%rip), %r9		#  leaq	stringConst(3), var9(temp):int64
    movq	%r9, %rdi
    movq	%r8, -16(%rbp)			#  spill	var0
    callq	_string_create_by_cstr
    movq	%rax, %rbx				#  movq	%rax, var10(temp):int64
    movq	-16(%rbp), %r8			#  reload	var0
    movq	%rbx, %r12				#  movq	var10(temp):int64, var11(temp):int64
    movq	%r12, 32(%r8)				#  movq	var11(temp):int64, 32(var0)
    movq	32(%r8), %rdi
    movq	%r8, -16(%rbp)			#  spill	var0
    callq	_println_s
    movq	-16(%rbp), %r8			#  reload	var0
    movsd	LCPI0_0(%rip), %xmm0		#  movsd	doubleIndex(0), var1(i):double
LBB0_2:
    ucomisd	LCPI0_1(%rip), %xmm0		#  ucomisd	doubleIndex(1), var1(i):double
    jae	LBB0_4
## bb.3
    cvttsd2si	%xmm0, %r13		#  cvttsd2si	var1(i):double, var12(temp):int64
    imulq	$8, %r13				#  imulq	$8, var12(temp):int64
    addq	%r8, %r13				#  addq	var0(names):int64, var12(temp):int64
    addq	$24, %r13				#  addq	$24, var12(temp):int64
    movq	(%r13), %rdi
    movsd	%xmm0, -24(%rbp)		#  spill	var1
    movq	%r8, -16(%rbp)			#  spill	var0
    callq	_println_s
    movsd	-24(%rbp), %xmm0		#  reload	var1
    movq	-16(%rbp), %r8			#  reload	var0
    movsd	%xmm0, %xmm1				#  movsd	var1(i):double, var13(temp):double
    movsd	%xmm0, %xmm2				#  movsd	var1(i):double, var14(temp):double
    addsd	LCPI0_2(%rip), %xmm1		#  addsd	doubleIndex(2), var13(temp):double
    movsd	%xmm1, %xmm0				#  movsd	var13(temp):double, var1(i):double
    jmp	LBB0_2
LBB0_4:
    addq	$32, %rsp
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
