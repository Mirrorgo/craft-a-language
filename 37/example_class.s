	.section	__TEXT,__text,regular,pure_instructions

	.global _Mammal.constructor
_Mammal.constructor:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movsd	%xmm0, %xmm1				#  movsd	var1(weight):double, var3(temp):double
    movsd	%xmm1, 16(%rdi)		#  movsd	var3(temp):double, 16(var0)
    movq	%rsi, %rax				#  movq	var2(color):int64, var4(temp):int64
    movq	%rax, 24(%rdi)			#  movq	var4(temp):int64, 24(var0)
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__text,regular,pure_instructions

	.global _Mammal.speak
_Mammal.speak:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    leaq	L_.str(%rip), %rax		#  leaq	stringConst(0), var1(temp):int64
    movq	%rdi, -8(%rbp)			#  spill	var0
    movq	%rax, %rdi
    callq	_string_create_by_cstr
    movq	%rax, %r10				#  movq	%rax, var2(temp):int64
    movq	-8(%rbp), %rdi			#  reload	var0
    movq	%rdi, -8(%rbp)			#  spill	var0
    movq	%r10, %rdi
    callq	_println_s
    movq	-8(%rbp), %rdi			#  reload	var0
    movq	24(%rdi), %rdi
    callq	_println_s
    addq	$16, %rsp
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__literal8,8byte_literals
LCPI2_0:
	.quad	0x4034000000000000		## double 20

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$32, %rsp
## bb.1
    leaq	L_.str.1(%rip), %r10		#  leaq	stringConst(1), var3(temp):int64
    movq	%r10, %rdi
    callq	_string_create_by_cstr
    movq	%rax, %r11				#  movq	%rax, var4(temp):int64
    movq	$2, %rdi
    movq	%r11, -8(%rbp)			#  spill	var4
    callq	_object_create_by_length
    movq	%rax, %rdi				#  movq	%rax, var5(temp):int64
    movq	-8(%rbp), %r11			#  reload	var4
    movq	%rdi, -16(%rbp)			#  spill	var5
    movsd	LCPI2_0(%rip), %xmm0
    movq	%r11, %rsi
    callq	_Mammal.constructor
    movq	-16(%rbp), %rdi			#  reload	var5
    movq	%rdi, %rsi				#  movq	var5(temp):int64, var2(mammal):int64
    movq	24(%rsi), %rdi
    movq	%rsi, -24(%rbp)			#  spill	var2
    callq	_println_s
    movq	-24(%rbp), %rsi			#  reload	var2
    movsd	16(%rsi), %xmm0
    movq	%rsi, -24(%rbp)			#  spill	var2
    callq	_println_d
    movq	-24(%rbp), %rsi			#  reload	var2
    leaq	L_.str.2(%rip), %rdx		#  leaq	stringConst(2), var6(temp):int64
    movq	%rdx, %rdi
    movq	%rsi, -24(%rbp)			#  spill	var2
    callq	_string_create_by_cstr
    movq	%rax, %rcx				#  movq	%rax, var7(temp):int64
    movq	-24(%rbp), %rsi			#  reload	var2
    movq	%rcx, %r8				#  movq	var7(temp):int64, var8(temp):int64
    movq	%r8, 24(%rsi)				#  movq	var8(temp):int64, 24(var2)
    movq	24(%rsi), %rdi
    movq	%rsi, -24(%rbp)			#  spill	var2
    callq	_println_s
    movq	-24(%rbp), %rsi			#  reload	var2
    movq	%rsi, %rdi
    callq	_Mammal.speak
    addq	$32, %rsp
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__cstring,cstring_literals
L_.str:
	.asciz	"Hello, my color is:"
L_.str.1:
	.asciz	"white"
L_.str.2:
	.asciz	"yellow"
