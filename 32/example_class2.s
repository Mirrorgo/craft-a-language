	.section	__TEXT,__text,regular,pure_instructions

	.global _Mammal.constructor
_Mammal.constructor:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movsd	%xmm0, %xmm1				#  movsd	var1(weight):double, var3(temp):double
    movsd	%xmm1, 16(%rdi)		#  movsd	var3(temp):double, 16(var0(this):int64)
    movq	%rsi, %rax				#  movq	var2(color):int64, var4(temp):int64
    movq	%rax, 24(%rdi)			#  movq	var4(temp):int64, 24(var0(this):int64)
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
    subq	$32, %rsp
## bb.1
    leaq	L_.str(%rip), %rax		#  leaq	stringConst(0), var1(temp):int64
    movq	%rdi, -8(%rbp)			#  spill	var0
    movq	%rax, %rdi
    callq	_string_create_by_cstr
    movq	%rax, %r10				#  movq	%rax, var2(temp):int64
    movq	-8(%rbp), %rdi			#  reload	var0
    movsd	16(%rdi), %xmm0
    movq	%r10, -16(%rbp)			#  spill	var2
    callq	_double_to_string
    movq	%rax, %r11				#  movq	%rax, var3(temp):int64
    movq	-16(%rbp), %r10			#  reload	var2
    movq	%r10, %rdi
    movq	%r11, %rsi
    callq	_string_concat
    movq	%rax, %rsi				#  movq	%rax, var4(temp):int64
    leaq	L_.str.1(%rip), %rdx		#  leaq	stringConst(1), var5(temp):int64
    movq	%rdx, %rdi
    movq	%rsi, -24(%rbp)			#  spill	var4
    callq	_string_create_by_cstr
    movq	%rax, %rcx				#  movq	%rax, var6(temp):int64
    movq	-24(%rbp), %rsi			#  reload	var4
    movq	%rsi, %rdi
    movq	%rcx, %rsi
    callq	_string_concat
    movq	%rax, %r8				#  movq	%rax, var7(temp):int64
    movq	%r8, %rdi
    callq	_println_s
    addq	$32, %rsp
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__text,regular,pure_instructions

	.global _Cat.constructor
_Cat.constructor:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    movq	$2, %rdi
    movsd	%xmm0, -8(%rbp)		#  spill	var1
    movq	%rsi, -16(%rbp)			#  spill	var2
    callq	_object_create_by_length
    movsd	-8(%rbp), %xmm0		#  reload	var1
    movq	-16(%rbp), %rsi			#  reload	var2
    movq	Mammal_vtable@GOTPCREL(%rip), %r10		#  movq	Mammal_vtable@GOTPCREL(%rip), var4(temp):int64
    movq	%r10, (%rax)				#  movq	var4(temp):int64, (var3(temp):int64)
    movq	%rax, %rdi
    callq	_Mammal.constructor
    addq	$16, %rsp
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__text,regular,pure_instructions

	.global _Cat.catchMouse
_Cat.catchMouse:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    leaq	L_.str.2(%rip), %rax		#  leaq	stringConst(2), var1(temp):int64
    movq	%rax, %rdi
    callq	_string_create_by_cstr
    movq	%rax, %r10				#  movq	%rax, var2(temp):int64
    movq	%r10, %rdi
    callq	_println_s
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__text,regular,pure_instructions

	.global _Cat.speak
_Cat.speak:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    leaq	L_.str.3(%rip), %rax		#  leaq	stringConst(3), var1(temp):int64
    movq	%rax, %rdi
    callq	_string_create_by_cstr
    movq	%rax, %r10				#  movq	%rax, var2(temp):int64
    movq	%r10, %rdi
    callq	_println_s
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__literal8,8byte_literals
LCPI5_0:
	.quad	0x0000000000000000		## double 0
LCPI5_1:
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
    movsd	LCPI5_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0(weight):double
    leaq	L_.str.4(%rip), %r11		#  leaq	stringConst(4), var3(temp):int64
    movq	%r11, %rdi
    movq	%r10, -8(%rbp)			#  spill	var2
    callq	_string_create_by_cstr
    movq	%rax, %rdi				#  movq	%rax, var4(temp):int64
    movq	-8(%rbp), %r10			#  reload	var2
    movq	%rdi, -16(%rbp)			#  spill	var4
    movq	$2, %rdi
    movq	%r10, -8(%rbp)			#  spill	var2
    callq	_object_create_by_length
    movq	%rax, %rsi				#  movq	%rax, var5(temp):int64
    movq	-8(%rbp), %r10			#  reload	var2
    movq	-16(%rbp), %rdi			#  reload	var4
    movq	Cat_vtable@GOTPCREL(%rip), %rdx		#  movq	Cat_vtable@GOTPCREL(%rip), var6(temp):int64
    movq	%rdx, (%rsi)				#  movq	var6(temp):int64, (var5(temp):int64)
    movq	%rdi, -16(%rbp)			#  spill	var4
    movq	%rsi, %rdi
    movsd	LCPI5_1(%rip), %xmm0
    movq	%rsi, -24(%rbp)			#  spill	var5
    movq	-16(%rbp), %rsi
    movq	%r10, -8(%rbp)			#  spill	var2
    movq	%rsi, -24(%rbp)			#  spill	var5
    callq	_Cat.constructor
    movq	-8(%rbp), %r10			#  reload	var2
    movq	-24(%rbp), %rsi			#  reload	var5
    movq	-16(%rbp), %rdi			#  reload	var4
    movq	%rsi, %r10				#  movq	var5(temp):int64, var2(mammal1):int64
    movq	(%r10), %rcx				#  movq	(var2(mammal1):int64), var7(temp):int64
    movq	%r10, %rdi
    callq	*(%rcx)
    addq	$32, %rsp
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__cstring,cstring_literals
L_.str:
	.asciz	"Hello, I'm a mammal, and my weight is "
L_.str.1:
	.asciz	"."
L_.str.2:
	.asciz	"I caught a mouse! Yammy!"
L_.str.3:
	.asciz	"Miao~~"
L_.str.4:
	.asciz	"white"
