	.section	__TEXT,__text,regular,pure_instructions

	.global _main
_main:
	.cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
## bb.1
    leaq	L_.str, %rax				#  leaq	stringConst(0), var3(int64)
    movsd	%rax, %xmm0
    callq	_string_create_by_str
    movsd	%xmm0, %r10				#  movsd	returnSlot, var4(int64)
    movsd	%r10, %r11				#  movsd	var4(int64), var0(int64)
    leaq	L_.str.1, %rsi			#  leaq	stringConst(1), var5(int64)
    movsd	%rsi, %xmm0
    callq	_string_create_by_str
    movsd	%xmm0, %rdx				#  movsd	returnSlot, var6(int64)
    movsd	%rdx, %rdi				#  movsd	var6(int64), var1(int64)
    movsd	%r11, %rcx				#  movsd	var0(int64), var7(int64)
    movsd	%r11, %xmm0
    movsd	%rdi, %xmm1
    callq	_string_concat
    movsd	%xmm0, %r8				#  movsd	returnSlot, var8(int64)
    movsd	%rcx, %r9				#  movsd	var7(int64), var2(int64)
    movsd	%r9, %xmm0
    callq	_println_s
    popq	%rbp
    retq
	.cfi_endproc

