#include <stdio.h>
#include <stdlib.h>

int main()
{
 int a=5;
 int b=8;
 int c=10;
 c+=++b; //b=b+1; c=c+b
 printf("a=%d, b=%d, c=%d\n",a , b, c);
 a=5;b=8;c=10;
 c%=b-a--; // c=c%(b-a); a=a-1;
 printf("c%=b-a--; a=%d, b=%d, c=%d\n",a , b, c);
 a=5;b=8;c=10;
 c%=b- --a; // a=a-1;c=c%(b-a);
 printf("c%=b- --a; a=%d, b=%d, c=%d\n",a , b, c);
 c-=--b+a++; // b=b-1;c=c-(b+a);a=a+1
 printf("c-=--b+a++; a=%d, b=%d, c=%d\n",a , b, c);
 c=a*b/--a; //a=a-1;c=a*b/a
 printf("c=a*b/--a; a=%d, b=%d, c=%d\n",a , b, c);
 return 0;
}
