	.section	__TEXT,__text,regular,pure_instructions

	.global _constructor
_constructor:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    movsd	%xmm0, %rsi				#  movsd	var1(weight):double, var2(temp):double
    movsd	%rsi, 16(%rdi)			#  movsd	var2(temp):double, 16(var0)
    movq	%rsi, %rax				#  movq	var2(color):int64, var3(temp):int64
    movq	%rax, 24(%rdi)			#  movq	var3(temp):int64, 24(var0)
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__text,regular,pure_instructions

	.global _speak
_speak:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    leaq	L_.str(%rip), %rdi		#  leaq	stringConst(0), var0(temp):int64
    callq	_string_create_by_cstr
    movq	%rax, %rdi
    callq	_println_s
    movq	24(%rdi), %rdi
    callq	_println_s
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__literal8,8byte_literals
LCPI2_0:
	.quad	0x0000000000000000		## double 0
LCPI2_1:
	.quad	0x4034000000000000		## double 20

	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    movsd	LCPI2_0(%rip), %xmm0		#  movsd	doubleIndex(0), var0(weight):double
    leaq	L_.str.1(%rip), %r10		#  leaq	stringConst(1), var3(temp):int64
    movq	%r10, %rdi
    callq	_string_create_by_cstr
    movq	%rax, %r11				#  movq	%rax, var4(temp):int64
    movq	$2, %rdi
    movq	%r11, -8(%rbp)			#  spill	var4
    callq	_object_create_by_length
    movq	%rax, %rdi				#  movq	%rax, var5(temp):int64
    movq	-8(%rbp), %r11			#  reload	var4
    movsd	LCPI2_1(%rip), %xmm0
    movq	%rdi, -16(%rbp)			#  spill	var5
    movq	%r11, %rdi
    callq	_Mammal
    movq	-16(%rbp), %rdi			#  reload	var5
    movq	%rdi, %rsi				#  movq	var5(temp):int64, var2(mammal):int64
    addq	$16, %rsp
    popq	%rbp
    retq
	.cfi_endproc

	.section	__TEXT,__cstring,cstring_literals
L_.str:
	.asciz	"Hello, my color is:"
L_.str.1:
	.asciz	"white"
