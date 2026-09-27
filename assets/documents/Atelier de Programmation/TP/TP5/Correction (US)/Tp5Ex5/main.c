#include <stdio.h>
#include <stdlib.h>

#define length 5

void remplir_t(int* t);
void remplir_s(int* s,int* t1,int* t2);
int max_s(int* s);

int main()
{
    int t1[length],t2[length],s[length];
    int max;
    remplir_t(t1);
    remplir_t(t2);
    remplir_s(s,t1,t2);
    max = max_s(s);
    printf("la valeur maximal dans s est: %d", max);
    return 0;

}

void remplir_t(int* t){
    for(int i = 0; i < length; i++){
        do{
            printf("Donner un entier positive {%d}: ",i);
            scanf("%d",&t[i]);
        }while(t[i] <= 0);
    }
}

void remplir_s(int* s,int* t1,int* t2){
    for(int i = 0;i < length; i++){
        s[i] = abs(t1[i]-t2[i]);
    }
}

int max_s(int* s){
    int max = s[0];
    for(int i = 1; i < length; i++){
        if (max < s[i])
            max=s[i];
    }
    return max;
}
