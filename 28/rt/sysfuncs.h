/**
 *一些系统自带的函数
 */

#ifndef SYSFUNCS_H
#define SYSFUNCS_H

#include "string.h" 

//打印一个整数
void println(int n);

//打印一个double
void println_d(double n);

//打印一个long
void println_l(long n);

//打印一个C字符串
void println_cs(const char* str);

//打印一个PlayScript字符串
void println_s(PlayString* pstr);

//获得时钟时间
int tick();

double tick_d();

#endif
